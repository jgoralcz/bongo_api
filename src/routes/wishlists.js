const route = require('express-promise-router')();

const {
  addWishlistWaifuUserGuild,
  getWishlistWaifuUserGuild,
  removeWishlistWaifuUserGuild,
  getAllWaifusByNameWishlist,
  removeAllCharactersWishlist,
  removeCharactersWishlistInArray,
  getUniqueUserCharacterWishlist,
} = require('../db/tables/cg_wishlist_waifu/cg_wishlist_waifu_table');

const {
  addWishlistSeriesUserGuild,
  getWishlistSeriesUserGuild,
  removeWishlistSeriesUserGuild,
  getAllSeriesByNameWishlist,
  removeAllSeriesWishlist,
  removeSeriesWishlistInArray,
  getUniqueUserSeriesWishlist,
} = require('../db/tables/cg_wishlist_series/cg_wishlist_series_table');

const {
  updateWishListVisibility,
} = require('../db/tables/clients_guilds/clients_guilds_table');

route.get('/users/:userID/guilds/:guildID/characters', async (req, res) => {
  const { userID, guildID } = req.params;

  const query = await getWishlistWaifuUserGuild(userID, guildID);

  return res.status(200).send(query || []);
});

route.get('/users/:userID/guilds/:guildID/characters/search', async (req, res) => {
  const { userID, guildID } = req.params;
  const { name } = req.query;

  const query = await getAllWaifusByNameWishlist(userID, guildID, name);

  return res.status(200).send(query || []);
});

route.post('/users/guilds/characters', async (req, res) => {
  const { userID, guildID, characterID } = req.body;

  await addWishlistWaifuUserGuild(userID, guildID, characterID);

  return res.status(204).send();
});

route.get('/users/:userID/guilds/:guildID/series/search', async (req, res) => {
  const { userID, guildID } = req.params;
  const { name } = req.query;

  const query = await getAllSeriesByNameWishlist(userID, guildID, name);

  return res.status(200).send(query || []);
});

route.post('/users/guilds/series', async (req, res) => {
  const { userID, guildID, seriesID } = req.body;

  await addWishlistSeriesUserGuild(userID, guildID, seriesID);

  return res.status(204).send();
});

route.get('/users/:userID/guilds/:guildID/series', async (req, res) => {
  const { userID, guildID } = req.params;

  const query = await getWishlistSeriesUserGuild(userID, guildID);

  return res.status(200).send(query || []);
});

route.delete('/users/:userID/guilds/:guildID/series/:seriesID', async (req, res) => {
  const { userID, guildID, seriesID } = req.params;

  await removeWishlistSeriesUserGuild(userID, guildID, seriesID);

  return res.status(204).send();
});

route.delete('/users/:userID/guilds/:guildID/characters/:characterID', async (req, res) => {
  const { userID, guildID, characterID } = req.params;

  await removeWishlistWaifuUserGuild(userID, guildID, characterID);

  return res.status(204).send();
});

route.delete('/users/:userID/guilds/:guildID/characters', async (req, res) => {
  const { userID, guildID } = req.params;

  await removeAllCharactersWishlist(userID, guildID);

  return res.status(204).send();
});

route.delete('/users/:userID/guilds/:guildID/series', async (req, res) => {
  const { userID, guildID } = req.params;

  await removeAllSeriesWishlist(userID, guildID);

  return res.status(204).send();
});

route.delete('/guilds/:guildID/characters', async (req, res) => {
  const { guildID } = req.params;
  const { users } = req.query;

  const usersArray = Array.isArray(users) ? users : [users];
  const query = await removeCharactersWishlistInArray(guildID, usersArray);

  return res.status(200).send(query[0].count);
});

route.delete('/guilds/:guildID/series', async (req, res) => {
  const { guildID } = req.params;
  const { users } = req.query;

  const usersArray = Array.isArray(users) ? users : [users];
  const query = await removeSeriesWishlistInArray(guildID, usersArray);

  return res.status(200).send(query[0].count);
});

route.get('/guilds/:guildID/users/unique/characters', async (req, res) => {
  const { guildID } = req.params;

  const query = await getUniqueUserCharacterWishlist(guildID);

  return res.status(200).send(query);
});

route.get('/guilds/:guildID/users/unique/series', async (req, res) => {
  const { guildID } = req.params;

  const query = await getUniqueUserSeriesWishlist(guildID);

  return res.status(200).send(query);
});

route.patch('/users/:userID/guilds/:guildID/visibility', async (req, res) => {
  const { userID, guildID } = req.params;
  const { isPublic } = req.body;

  await updateWishListVisibility(userID, guildID, isPublic);

  return res.status(204).send();
});

module.exports = route;
