const router = require('express').Router();

const multer = require('multer');
const crypto = require('crypto');
const fs = require('file-system');

const { extractValidFields, validateAgainstSchema } = require('../lib/validation');
const { saveSubmission, submissionSchema, getDownloadStream, getSubmissionsByAssignmentID, getSubmissionsByAssignmentAndStudentID } = require('../models/submission');

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

router.post('/:id/submissions', upload.single('file'), async (req, res) => {
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
});

router.get('/:id/submissions', async (req, res) => {
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
        console.log(submissions);
        res.status(201).send({
          submissions
        });
      } else {
        res.status(404).send({
          error:"Specified Assignment id not found."
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error getting submission into DB.  Please try again later."
      });
    }
});

module.exports = router;