const router = require('express-promise-router')();
const images = require('./waifus/images/images');
const waifus = require('./waifus/waifus');

router.use('/waifus', waifus);
router.use('/waifus/images', images);

module.exports = router;
