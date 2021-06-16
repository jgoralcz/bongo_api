const router = require('express-promise-router')();

const images = require('./characters/images/images');
const characters = require('./characters/characters');
const series = require('./characters/series');
const seriesNicknames = require('./characters/seriesNicknames');
const nicknames = require('./characters/nicknames');
const validate = require('./validate');
const patrons = require('./patrons');
const users = require('./users');
const leaderboards = require('./leaderboards');
const rolls = require('./rolls');
const claims = require('./claims');
const guilds = require('./guilds');
const mims = require('./mims');
const prefixes = require('./prefixes');
const states = require('./states');
const userGuilds = require('./userGuilds');
const achievements = require('./achievements');
const wishlists = require('./wishlists');
const messages = require('./messages');
const blacklists = require('./blacklists');
const whitelists = require('./whitelists');
const refresh = require('./refresh');
const bots = require('./bots');
const music = require('./music');
const dbl = require('./dbl');
const appearsIn = require('./appearsIn');

router.use('/series/nicknames', seriesNicknames);
router.use('/series', series);
router.use('/characters/nicknames', nicknames);
router.use('/characters', characters);
router.use('/images', images);
router.use('/validate', validate);
router.use('/patrons', patrons);
router.use('/users', users);
router.use('/leaderboards', leaderboards);
router.use('/rolls', rolls);
router.use('/claims', claims);
router.use('/guilds', guilds);
router.use('/mims', mims);
router.use('/prefixes', prefixes);
router.use('/states', states);
router.use('/user-guilds', userGuilds);
router.use('/achievements', achievements);
router.use('/wishlists', wishlists);
router.use('/messages', messages);
router.use('/blacklists', blacklists);
router.use('/whitelists', whitelists);
router.use('/refresh', refresh);
router.use('/bots', bots);
router.use('/music', music);
router.use('/dbl', dbl);
router.use('/appears-in', appearsIn);

module.exports = router;
