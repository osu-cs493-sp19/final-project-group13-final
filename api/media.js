const router = require('express').Router();

const fs = require('file-system');

const { getFileBuffer } = require('../models/submission');

function removeTempFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

router.get('/submissions/:id',  async (req, res, next) => {
  const buf = await getFileBuffer(req.params.id)
  fs.writeFileSync(req.params.id, buf);
  const src = fs.createReadStream(req.params.id);
  src.pipe(res);
  removeTempFile(req.params.id);
});

module.exports = router;