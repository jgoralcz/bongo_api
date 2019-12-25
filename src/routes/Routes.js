const router = require('express-promise-router')();

const images = require('./characters/images/images');
const characters = require('./characters/characters');
const series = require('./characters/series');
const validate = require('./validate');

router.use('/series', series);
router.use('/characters', characters);
router.use('/images', images);
router.use('/validate', validate);

module.exports = router;
