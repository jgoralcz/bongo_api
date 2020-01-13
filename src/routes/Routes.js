const router = require('express-promise-router')();

const images = require('./characters/images/images');
const characters = require('./characters/characters');
const series = require('./characters/series');
const validate = require('./validate');
const patrons = require('./patrons');
const users = require('./users');
const leaderboards = require('./leaderboards');
const rolls = require('./rolls');
const claims = require('./claims');
const guilds = require('./guilds');
const fix = require('./fix');


router.use('/series', series);
router.use('/characters', characters);
router.use('/images', images);
router.use('/validate', validate);
router.use('/patrons', patrons);
router.use('/users', users);
router.use('/leaderboards', leaderboards);
router.use('/rolls', rolls);
router.use('/claims', claims);
router.use('/guilds', guilds);
router.use('/fix', fix);

module.exports = router;
