/*
 * API sub-router for courses collection endpoints.
 */

const router = require('express').Router();

const { userSchema, insertNewUser, getUserById, validateUser } = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuth, checkAdmin } = require('../lib/auth');
const {
  CourseSchema,
  getCoursesPage,
  insertNewCourse,
  getCourseDetailsById,
  replaceCourseById,
  deleteCourseById,
  getCoursesByOwnerdId
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