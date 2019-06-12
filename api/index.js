const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/assignments', require('./assignments'));
router.use('/media', require('./media'));
router.use('/courses', require('./courses'));

module.exports = router;