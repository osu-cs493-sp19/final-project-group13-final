/*
 * Submission schema and data accessor methods.
 */
const fs = require('file-system');

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');
const streamBuffers = require('stream-buffers');

/*
 * Schema describing required/optional fields of a submission object.
 */
const submissionSchema = {
  studentid: {required: true },
  assignmentid: { required: false },
  file: { required: false }
};

function saveSubmission(submission) {
  return new Promise((resolve, reject) => {
    let data = extractValidFields(submission, submissionSchema);
    let timestamp = new Date();
    data.timestamp = timestamp.toISOString();
    data.id = null;
    data.file = readImageFile(data.file.path)

    mysqlPool.query(
      "INSERT INTO submissions SET ?", 
      data,  
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

function getSubmissionsByAssignmentID(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query("SELECT * FROM submissions WHERE assignmentid = ?",
    [id],
    (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    })
  });
}

function getSubmissionsByAssignmentAndStudentID(assignmentid, studentid) {
  return new Promise((resolve, reject) => {
    mysqlPool.query("SELECT * FROM submissions WHERE assignmentid = ? AND studentid = ?",
    [assignmentid, studentid],
    (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    })
  });
}

function getFileBuffer(submissionID) {
  return new Promise((resolve, reject) => {
   mysqlPool.query("SELECT * FROM submissions WHERE id = ?",
    [submissionID],
    (err, result) => {
      if (err) {
        reject(err);
      } else {
        const data = result[0].file;
        const buf = new Buffer.from(data);
        resolve(buf);
        //const readableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
          //frequency: 10,
          //chunkSize: 512000    
        //})
        //kreadableStreamBuffer.put(buf);
        //resolve(readableStreamBuffer);
      }
    });
  })
}


function readImageFile(file) {
  const bitmap = fs.readFileSync(file);
  const buf = new Buffer.from(bitmap);
  return buf;
}


module.exports = { saveSubmission, submissionSchema, getFileBuffer, getSubmissionsByAssignmentAndStudentID, getSubmissionsByAssignmentID };