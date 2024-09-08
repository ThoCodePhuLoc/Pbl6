const express = require('express');
const router = express.Router();

router.use('/', require('./access/index'));
router.use('/user', require('./user/index'));

module.exports = router;
