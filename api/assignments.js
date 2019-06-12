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
  if(req.params.id == req.user || await checkAdmin(req.user)) {
    if (validateAgainstSchema(req.body, AssignmentSchema)) {
      try {
        /*
         * Make sure the user is not trying to assignment the same business twice.
         * If they're not, then insert their assignment into the DB.
         */
        const alreadyAssignmented = await hasUserAssignmentedBusiness(req.body.userid, req.body.businessid);
        if (alreadyAssignmented) {
          res.status(403).send({
            error: "User has already posted a assignment of this business"
          });
        } else {
          const id = await insertNewAssignment(req.body);
          res.status(201).send({
            id: id,
            links: {
              assignment: `/assignments/${id}`,
              business: `/businesses/${req.body.businessid}`
            }
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting assignment into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid assignment object."
      });
    }
  } else {
    res.status(403).send({
      error: "Request unauthorized."
    });
  }
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
  if (req.params.id == req.user || await checkAdmin(req.user)) {
    if (validateAgainstSchema(req.body, AssignmentSchema)) {
      try {
        /*
         * Make sure the updated assignment has the same courseID and instructorID as
         * the existing assignment.  If it doesn't, respond with a 403 error.  If the
         * assignment doesn't already exist, respond with a 404 error.
         */
        const id = parseInt(req.params.id);
        const existingAssignment = await getAssignmentById(id);
        if (existingAssignment) {
          if (req.body.courseid === existingAssignment.courseid && req.body.instrid === existingAssignment.userid) {
            const updateSuccessful = await replaceAssignmentById(id, req.body);
            if (updateSuccessful) {
              res.status(200).send({
                links: {
                  business: `/businesses/${req.body.businessid}`,
                  assignment: `/assignments/${id}`
                }
              });
            } else {
              next();
            }
          } else {
            res.status(403).send({
              error: "Updated assignment must have the same businessID and userID"
            });
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
        error: "Request body is not a valid assignment object."
      });
    }
  } else {
    res.status(403).send({
      error: "Request unauthorized."
    });
  }
});

/*
 * Route to delete a assignment.
 */
router.delete('/:id', async (req, res, next) => {
  if (req.params.id == req.user || await checkAdmin(req.user)) {
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
  } else {
    res.status(403).send({
      error: "Request unauthorized."
    });
  }
});

module.exports = router;