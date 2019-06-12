/*
 * Course schema and data accessor methods;
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');
const { getAssignmentsByCourseId } = require('./assignment');

/*
 * Schema describing required/optional fields of a course object.
 */
const CourseSchema = {
  subject: { required : true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorid: { required: true }
};
exports.CourseSchema = CourseSchema;


/*
 * Executes a MySQL query to fetch the total number of courses.  Returns
 * a Promise that resolves to this count.
 */
function getCoursesCount() {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT COUNT(*) AS count FROM courses',
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      }
    );
  });
}

/*
 * Executes a MySQL query to return a single page of courses.  Returns a
 * Promise that resolves to an array containing the fetched page of courses.
 */
function getCoursesPage(page) {
  return new Promise(async (resolve, reject) => {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
     const count = await getCoursesCount();
     const pageSize = 10;
     const lastPage = Math.ceil(count / pageSize);
     page = page > lastPage ? lastPage : page;
     page = page < 1 ? 1 : page;
     const offset = (page - 1) * pageSize;

    mysqlPool.query(
      'SELECT * FROM courses ORDER BY id LIMIT ?,?',
      [ offset, pageSize ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            courses: results,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
          });
        }
      }
    );
  });
}
exports.getCoursesPage = getCoursesPage;

/*
 * Executes a MySQL query to insert a new course into the database.  Returns
 * a Promise that resolves to the ID of the newly-created course entry.
 */
function insertNewCourse(course) {
  return new Promise((resolve, reject) => {
    course = extractValidFields(course, CourseSchema);
    course.id = null;
    mysqlPool.query(
      'INSERT INTO courses SET ?',
      course,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}
exports.insertNewCourse = insertNewCourse;

/*
 * Executes a MySQL query to fetch information about a single specified
 * course based on its ID.  Does not fetch photo and review data for the
 * course.  Returns a Promise that resolves to an object containing
 * information about the requested course.  If no course with the
 * specified ID exists, the returned Promise will resolve to null.
 */
function getCourseById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM courses WHERE id = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}

/*
 * Executes a MySQL query to fetch detailed information about a single
 * specified course based on its ID, including photo and review data for
 * the course.  Returns a Promise that resolves to an object containing
 * information about the requested course.  If no course with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getCourseDetailsById(id) {
  /*
   * Execute three sequential queries to get all of the info about the
   * specified course, including its reviews and photos.
   */
  const course = await getCourseById(id);
  if (course) {
    course.assigments = await getAssignmentsByCourseId(id);
  }
  return course;
}
exports.getCourseDetailsById = getCourseDetailsById;

/*
 * Executes a MySQL query to replace a specified course with new data.
 * Returns a Promise that resolves to true if the course specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function replaceCourseById(id, course) {
  return new Promise((resolve, reject) => {
    course = extractValidFields(course, CourseSchema);
    mysqlPool.query(
      'UPDATE courses SET ? WHERE id = ?',
      [ course, id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.replaceCourseById = replaceCourseById;

/*
 * Executes a MySQL query to delete a course specified by its ID.  Returns
 * a Promise that resolves to true if the course specified by `id` existed
 * and was successfully deleted or to false otherwise.
 */
function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM courses WHERE id = ?',
      [ id ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteCourseById = deleteCourseById;

/*
 * Executes a MySQL query to fetch all courses owned by a specified user,
 * based on on the user's ID.  Returns a Promise that resolves to an array
 * containing the requested courses.  This array could be empty if the
 * specified user does not own any courses.  This function does not verify
 * that the specified user ID corresponds to a valid user.
 */
function getCoursesByOwnerId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM courses WHERE instructorid = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
exports.getCoursesByOwnerId = getCoursesByOwnerId;

/*
 * Gets a list of courses that a student is in
 *
 */
function getCoursesByStudentId(id) {
  return new Promise((resolve,reject) => {
    mysqlPool.query(
      'SELECT * FROM courses INNER JOIN enrollment ON courses.id = enrollment.courseid WHERE enrollment.studentid = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        } 
      } 
    );
  });
}
exports.getCoursesByStudentId = getCoursesByStudentId;

function getStudentsByCourseId(id) {
  return new Promise((resolve,reject) => {
    mysqlPool.query(
      'SELECT * FROM users INNER JOIN enrollment ON users.id = enrollment.studentid WHERE enrollment.courseid = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length > 0) {
              var i;
              for(i = 0; i < results.length; i++)
              {
                results[i].password = "";
                delete results[i].id;
              }
          }
          resolve(results);
        } 
      } 
    );
  });
}
exports.getStudentsByCourseId = getStudentsByCourseId;

/*
 * Gets students by course ID with data good for CSV
 */
function getStudentsByCourseIdCsv(id) {
  return new Promise((resolve,reject) => {
    mysqlPool.query(
      'SELECT * FROM users INNER JOIN enrollment ON users.id = enrollment.studentid WHERE enrollment.courseid = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length > 0) {
              var i;
              for(i = 0; i < results.length; i++)
              {
                delete results[i].id;
                delete results[i].password;
                delete results[i].courseid;
                delete results[i].role;              
              }
          }
          resolve(results);
        } 
      } 
    );
  });
}
exports.getStudentsByCourseIdCsv = getStudentsByCourseIdCsv;

/*
 * Adds user to course roster.
 */
 function addToCourseRoster(id,sid) {
  return new Promise((resolve,reject) => {
    mysqlPool.query(
      `INSERT INTO enrollment (courseid, studentid) VALUES (?, ?)`,
      [id, sid],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
      );

  });
 }
 exports.addToCourseRoster = addToCourseRoster;

 /*
 * Deletes user from course roster.
 */
 function removeFromCourseRoster(id) {
  return new Promise((resolve,reject) => {
    mysqlPool.query(
      `DELETE FROM enrollment WHERE studentid = ?`,
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
      );

  });
 }
 exports.removeFromCourseRoster = removeFromCourseRoster;