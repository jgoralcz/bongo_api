const router = require('express-promise-router')();
const images = require('./images/images');

router.use('/waifus/images', images);

module.exports = router;