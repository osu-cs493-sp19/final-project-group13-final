/*
 * API sub-router for courses collection endpoints.
 */

const router = require('express').Router();

const fs = require('fs');
const { userSchema, insertNewUser, getUserById, validateUser } = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuth, checkAdmin } = require('../lib/auth');
const { getAssignmentsByCourseId } = require('../models/assignment');
const {
  CourseSchema,
  getCoursesPage,
  insertNewCourse,
  getCourseDetailsById,
  replaceCourseById,
  deleteCourseById,
  getCoursesByOwnerId,
  getStudentsByCourseId,
  addToCourseRoster,
  removeFromCourseRoster
} = require('../models/course');

/*
 * Route to return a paginated list of courses.
 */
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const coursePage = await getCoursesPage(parseInt(req.query.page) || 1);
    coursePage.links = {};
    if (coursePage.page < coursePage.totalPages) {
      coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
      coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
    }
    if (coursePage.page > 1) {
      coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
      coursePage.links.firstPage = '/courses?page=1';
    }
    var i;
    if (req.query.subject) {
      for(i=0;i<coursePage.courses.length;i++)
      {
        console.log("yeet");
        if(coursePage.courses[i].subject != req.query.subject) 
        {
          delete coursePage.courses[i];
        }
      }
    }
    if (req.query.number) {
      for(i=0;i<coursePage.courses.length;i++)
      {
        if(coursePage.courses[i].number != req.query.number) 
        {
          delete coursePage.courses[i];
        }
      }
    }
    if (req.query.term) {
      for(i=0;i<coursePage.courses.length;i++)
      {
        if(coursePage.courses[i].term != req.query.term) 
        {
          delete coursePage.courses[i];
        }
      }
    }
    res.status(200).send(coursePage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses list.  Please try again later."
    });
  }
});

/*
 * Route to create a new course.
 */
router.post('/', requireAuth, async (req, res) => {
  if(req.params.id == req.user || await checkAdmin(req.user)) {
    if (validateAgainstSchema(req.body, CourseSchema)) {
      try {
        const id = await insertNewCourse(req.body);
        res.status(201).send({
          id: id,
          links: {
            course: `/courses/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting course into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid course object."
      });
    }
  } else {
    res.status(403).send({
      error: "Request unauthorized."
    });
  }
});

/*
 * Route to fetch info about a specific course.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const course = await getCourseDetailsById(parseInt(req.params.id));
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to fetch all assignments for a specific course
 */
router.get('/:id/assignments', async (req, res, next) => {
  try {
    const assignments = await getAssignmentsByCourseId(parseInt(req.params.id));
    if (assignments) {
      res.status(200).send(assignments);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to fetch all students for a specific course
 */
router.get('/:id/students', async (req, res, next) => {
  try {
    const students = await getStudentsByCourseId(parseInt(req.params.id));
    if (students) {
      res.status(200).send(students);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to fetch all students for a specific course, send as csv
 */
router.get('/:id/roster', async (req, res, next) => {
  try {
    const students = await getStudentsByCourseId(parseInt(req.params.id));
    if (students) {
      var i;
      var str = "";
      //create csv
      for(i=0;i<students.length;i++) {
        for(var k in students[i]) {
          str += students[i][k] + ",";
        }
        str += "\n";
      }
      //strip off newline and comma
      str = str.substring(0, str.length - 2);

      //write file
      fs.writeFile('roster.csv', str, (err) => {
        if(err) console.log(err);
      });
      //res.status(200).send(str);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});


/*
 * Route to update course roster.
 * Will add and remove.
 */
router.post('/:id/students', async (req, res, next) => {
  try {
    const adds = req.body.add;
    const rems = req.body.remove;
    const id = req.params.id;
    if(adds) {
      var i;
      for (i=0;i<adds.length;i++) {
        await addToCourseRoster(parseInt(id),parseInt(adds[i]));
      }
    }
    if(rems) {
      var i;
      for(i=0;i<rems.length;i++) {
        await removeFromCourseRoster(parseInt(rems[i]));
      }
    }
    if(!rems && !adds) {
      res.status(400).send("The request body was either not present or did not contain the fields described above.");
    } else {
      res.status(201).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    })
  }
});

/*
 * Route to update data for a course.
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  if(req.params.id == req.user || await checkAdmin(req.user)) {
    if (req.body.instructorid && (req.body.subject || req.body.title || req.body.number || req.body.term)){
      try {
        const id = parseInt(req.params.id)
        const updateSuccessful = await replaceCourseById(id, req.body);
        if (updateSuccessful) {
          res.status(200).send({
            links: {
              course: `/courses/${id}`
            }
          });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update specified course.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain any fields related to Course objects."
      });
    }
  } else {
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }
});

/*
 * Route to delete a course.
 */
router.delete('/:id', async (req, res, next) => {
  if (req.params.id == req.user || await checkAdmin(req.user)) {
    try {
      const deleteSuccessful = await deleteCourseById(parseInt(req.params.id));
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete course.  Please try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Request unauthorized."
    });
  }
});

module.exports = router;