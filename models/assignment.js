/*
 * Assignment schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a assignment object.
 */
const AssignmentSchema = {
  courseid: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;


/*
 * Executes a MySQL query to insert a new assignment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created assignment entry.
 */
function insertNewAssignment(assignment) {
  return new Promise((resolve, reject) => {
    assignment = extractValidFields(assignment, AssignmentSchema);
    assignment.id = null;
    mysqlPool.query(
      'INSERT INTO assignments SET ?',
      assignment,
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
exports.insertNewAssignment = insertNewAssignment;

/*
 * Executes a MySQL query to fetch a single specified assignment based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * assignment.  If no assignment with the specified ID exists, the returned Promise
 * will resolve to null.
 */
function getAssignmentById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments WHERE id = ?',
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
exports.getAssignmentById = getAssignmentById;

/*
 * Executes a MySQL query to update a specified assignment with new data.
 * Returns a Promise that resolves to true if the assignment specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
function updateAssignmentById(id, assignment) {
  return new Promise((resolve, reject) => {
    assignment = extractValidFields(assignment, AssignmentSchema);
    mysqlPool.query(
      'UPDATE assignments SET ? WHERE id = ?',
      [ assignment, id ],
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
exports.updateAssignmentById = updateAssignmentById;

/*
 * Executes a MySQL query to delete a assignment specified by its ID.  Returns
 * a Promise that resolves to true if the assignment specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
function deleteAssignmentById(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM assignments WHERE id = ?',
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
exports.deleteAssignmentById = deleteAssignmentById;

/*
 * Executes a MySQL query to fetch all assignments for a specified course, based
 * on the course's ID.  Returns a Promise that resolves to an array
 * containing the requested assignments.  This array could be empty if the
 * specified course does not have any assignments.  This function does not verify
 * that the specified course ID corresponds to a valid course.
 */
function getAssignmentsByCourseId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments WHERE courseid = ?',
      [ id ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
exports.getAssignmentsByCourseId = getAssignmentsByCourseId;

/*
 * Executes a MySQL query to fetch all assignments by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested assignments.  This array could be empty if the specified user
 * does not have any assignments.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
function getAssignmentsByUserId(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM assignments WHERE userid = ?',
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
exports.getAssignmentsByUserId = getAssignmentsByUserId;