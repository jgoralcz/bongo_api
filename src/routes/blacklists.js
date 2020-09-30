const route = require('express-promise-router')();

const {
  getCommandBlacklists,
  getBlacklists,
  upsertBlacklist,
  getAllBlacklists,
} = require('../db/tables/blacklist/blacklist_table');

route.get('/all', async (req, res) => {
  const {
    guildID,
    channelID,
    userID,
    roleID,
  } = req.query;

  const query = await getAllBlacklists(userID, guildID, channelID, roleID);

  return res.status(200).send(query);
});

route.get('/users/:userID/guilds/:guildID/channels/:channelID/command/:commandName', async (req, res) => {
  const {
    userID,
    guildID,
    channelID,
    commandName,
  } = req.params;

  if (!userID || !guildID || !channelID || !commandName) return res.status(400).send({ error: `userID, guildID, channelID, commandName expected. Received userID=${userID}, guildID=${guildID}, channelID=${channelID}, commandName=${commandName}` });

  const query = await getCommandBlacklists(userID, guildID, channelID, commandName);
  if (!query || query.length <= 0) return res.status(200).send(false);

  const commandIsBlacklisted = query[0] && query[0].bool != null ? query[0].bool : false;

  return res.status(200).send(commandIsBlacklisted);
});

route.get('/id/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send({ error: `id expected. Received id=${id}` });

  const query = await getBlacklists(id);
  const blacklist = query && query[0] && query[0].blacklisted ? query[0].blacklisted : [];

  return res.status(200).send(blacklist);
});

route.put('/id/:id/type/:type', async (req, res) => {
  const { id, type } = req.params;
  const blacklistArray = req.body;

  if (!id || !type || !blacklistArray) return res.status(400).send({ error: `id, type expected in params and blacklistArray expected in body. Received id=${id}, type=${type}, blacklistArray=${blacklistArray}` });

  await upsertBlacklist(id, type, blacklistArray);

  return res.status(204).send();
});

module.exports = route;
