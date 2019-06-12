/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();


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
      if(existingAssignment) {
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