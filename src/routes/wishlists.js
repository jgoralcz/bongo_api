const route = require('express-promise-router')();

const { addWishlistWaifuUserGuild, getWishlistWaifuUserGuild } = require('../db/tables/cg_wishlist_waifu/cg_wishlist_waifu_table');
const { addWishlistSeriesUserGuild, getWishlistSeriesUserGuild } = require('../db/tables/cg_wishlist_series/cg_wishlist_series_table');


route.get('/users/:userID/guilds/:guildID/characters', async (req, res) => {
  const { userID, guildID } = req.params;

  const query = await getWishlistWaifuUserGuild(userID, guildID);

  return res.status(200).send(query || []);
});

route.post('/users/guilds/characters', async (req, res) => {
  const { userID, guildID, characterID } = req.body;

  await addWishlistWaifuUserGuild(userID, guildID, characterID);

  return res.status(204).send();
});

route.get('/users/:userID/guilds/:guildID/series', async (req, res) => {
  const { userID, guildID } = req.params;

  const query = await getWishlistSeriesUserGuild(userID, guildID);

  return res.status(200).send(query || []);
});

route.post('/users/guilds/series', async (req, res) => {
  const { userID, guildID, seriesID } = req.body;

  await addWishlistSeriesUserGuild(userID, guildID, seriesID);

  return res.status(204).send();
});

module.exports = route;
