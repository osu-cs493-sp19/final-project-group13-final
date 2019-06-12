/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const multer = require('multer');
const crypto = require('crypto');
const fs = require('file-system');

const { userSchema, insertNewUser, getUserById, validateUser } = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuth, checkAdmin } = require('../lib/auth');
const {
  AssignmentSchema,
  insertNewAssignment,
  getAssignmentById,
  updateAssignmentById,
  deleteAssignmentById
} = require('../models/assignment');

const { getCourseDetailsById, getCoursesByStudentId } = require('../models/course');
const { getUserByEmail } = require('../models/user');


const { saveSubmission, submissionSchema, getSubmissionsByAssignmentID, getSubmissionsByAssignmentAndStudentID } = require('../models/submission');

const fileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = fileTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!fileTypes[file.mimetype])
  }
});

function removeUploadedFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

router.post('/:id/submissions', requireAuth, upload.single('file'), async (req, res) => {
  const user = await getUserByEmail(req.userEmail, false);
  let userIsAdmin = false;
  let userEnrolledInCourse = false;
  if (user.role == "admin") {
    userIsAdmin = true;
  } else if (user.role == "student") {
    const assignment = await getAssignmentById(req.params.id);
    const courseid = assignment.courseid;
    const courses = await getCoursesByStudentId(user.id);

    courses.forEach(course => {
      if (course.id == courseid) {
        userEnrolledInCourse = true;
      }
    });
  }

  if (!userIsAdmin && !userEnrolledInCourse) {
    res.status(403).send({
      error: "The request was not made by an authenticated User. The user must be a student who is enrolled in this class or an administrator."
    });
  }
  else {

    if (validateAgainstSchema(req.body, submissionSchema) && req.file) {
      try {
        const submission = {
          studentid: req.body.studentid,
          assignmentid: req.params.id,
          file: req.file
        }
        const id = await saveSubmission(submission);
        await removeUploadedFile(req.file);

        res.status(201).send({
          id: id,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting submission into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid submission object"
      });
    }
  }
});

router.get('/:id/submissions', requireAuth, async (req, res) => {
  const user = await getUserByEmail(req.userEmail, false);
  console.log(user);
  let userIsAdmin = false;
  let userOwnsAssignment = false;
  if (user.role == "admin") {
    userIsAdmin = true;
  } else if (user.role == "instructor") {
    const assignment = await getAssignmentById(req.params.id);
    const course = await getCourseDetailsById(assignment.courseid);
    if (course.instructorid == user.id) {
      userOwnsAssignment = true;
    }
  }

  if (!userIsAdmin && !userOwnsAssignment) {
    res.status(403).send({
      error: "The request was not made by an authenticated User. The user must be an instructor who owns this assignment or an administrator."
    });
  }

  else {
    try {
      let submissions = {};
      if (req.query.studentid) {
        submissions = await getSubmissionsByAssignmentAndStudentID(req.params.id, req.query.studentid);
      } else {
        submissions = await getSubmissionsByAssignmentID(req.params.id);
      }
      if (submissions) {
        let results = [];
        submissions.forEach(submission => {
          submission.url = "/media/submissions/" + submission.id;
          delete submission.id;
          delete submission.file;
          results.push(submission);
        });
        res.status(201).send({
          submissions
        });
      } else {
        res.status(404).send({
          error: "Specified Assignment id not found."
        });
      }
    }
    catch (err) {
      res.status(500).send({
        error: "Error getting submission into DB.  Please try again later."
      });
    }
  }
});

/*
 * Route to create a new assignment.
 */
router.post('/', requireAuth, async (req, res) => {
  //if(req.params.id == req.user || await checkAdmin(req.user)) {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body);
      res.status(201).send({
        id: id,
        links: {
          assignment: `/assignments/${id}`,
          course: `/courses/${req.body.courseid}`
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting assignment into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain a valid Assignment object."
    });
  }
  //} else {
  //res.status(403).send({
  //error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
  //});
  //}
});

/*
 * Route to fetch info about a specific assignment.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(parseInt(req.params.id));
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    });
  }
});

/*
 * Route to update a assignment.
 */
router.patch('/:id', async (req, res, next) => {
  if (req.body.courseid && (req.body.title || req.body.due || req.body.points)) {
    try {
      /*
       * Make sure the courseid on the updated assigment is the same as
       * the existing assignment. If it doesn't, respond with a 403 error.  If the
       * assignment doesn't already exist, respond with a 404 error.
       */
      const id = parseInt(req.params.id);
      const existingAssignment = await getAssignmentById(id);
      if (existingAssignment) {
        //make sure courseid exists for existing assignment
        if (req.body.courseid === existingAssignment.courseid) {
          const updateSuccessful = await replaceAssignmentById(id, req.body);
          if (updateSuccessful) {
            res.status(200).send({
              links: {
                course: `/courses/${req.body.courseid}`,
                assignment: `/assignments/${id}`
              }
            });
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "The request to this courseid is either unauthorized or does not exist."
          })
        }
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update assignment.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain any fields related to Assignment objects."
    });
  }
});

/*
 * Route to delete a assignment.
 */
router.delete('/:id', async (req, res, next) => {
  //if (req.params.id == req.user || await checkAdmin(req.user)) {
  try {
    const deleteSuccessful = await deleteAssignmentById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete assignment.  Please try again later."
    });
  }
  //} else {
  //res.status(403).send({
  //error: "Request unauthorized."
  //});
  //}
});

module.exports = router;