
const bcrypt = require('bcryptjs');
const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a business object.
 */
const userSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: { required: true }
};
exports.userSchema = userSchema;

/*
 * Executes a MySQL query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
function insertNewUser(user) {
  return new Promise((resolve, reject) => {
    user = extractValidFields(user, userSchema);
    user.id = null;
    mysqlPool.query(
      'INSERT INTO users SET ?',
      user,
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
exports.insertNewUser = insertNewUser;

function getUserByEmail(email, withPassword) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM users WHERE email = ?',
      [ email ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (withPassword) {
            resolve(results[0]);
          }
          else {
            results[0].password = "";
            resolve(results[0]);
          }
        }
      }
    );
  })
};
exports.getUserByEmail = getUserByEmail;

function getUserByID(id, withPassword) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM users WHERE id = ?',
      [ id ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (withPassword) {
            resolve(results[0]);
          }
          else {
            results[0].password = "";
            resolve(results[0]);
          }
        }
      }
    );
  })
};
exports.getUserByID = getUserByID;

exports.validateUser = async function (email, password) {
  const user = await getUserByEmail(email, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  return authenticated;
};