const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/assignments', require('./assignments'));
router.use('/media', require('./media'));

module.exports = router;