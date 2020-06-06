const route = require('express-promise-router')();

const { updateUserPrefix } = require('../util/functions/user');
const { updateGuildPrefix } = require('../util/functions/guild');
const { getGuild } = require('../db/tables/guild_data/guild_data');
const { getClientInfo } = require('../db/tables/clients/clients_table');

route.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'id is needed in params.' });

  const foundClient = await getClientInfo(id);
  if (!foundClient || !foundClient[0] || !foundClient[0].prefix || !foundClient[0].prefix) {
    return res.status(404).send({ error: `user not found with id: ${id}.` });
  }

  const { userId, prefix } = foundClient[0];

  return res.status(200).send({ id: userId, prefix });
});

route.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { prefix } = req.body;

  if (!id) return res.status(400).send({ error: 'id is needed in params.' });
  if (!prefix) return res.status(400).send({ error: 'prefix is needed in body.' });

  const foundClient = await getClientInfo(id);
  if (!foundClient || foundClient.length <= 0 || !foundClient[0]) return res.status(404).send({ error: `user not found with id: ${id}.` });

  const { status, send } = await updateUserPrefix(id, prefix);
  return res.status(status).send(send);
});

route.get('/guilds/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'id is needed in params.' });

  const foundGuild = await getGuild(id);
  if (!foundGuild || !foundGuild[0] || !foundGuild[0].guildId || !foundGuild[0].guildPrefix) {
    return res.status(404).send({ error: `guild not found with id: ${id}.` });
  }

  const { guildId, guildPrefix, prefixForAllEnable } = foundGuild[0];

  return res.status(status).send({ id: guildId, prefix: guildPrefix, prefixForAllEnable });
});

route.patch('/guilds/:id', async (req, res) => {
  const { id } = req.params;
  const { prefix, prefixForAllEnable } = req.body;

  if (!id) return res.status(400).send({ error: 'id is needed in params.' });
  if (prefix == null || prefixForAllEnable == null) return res.status(400).send({ error: 'prefix and prefixForAllEnable is needed in body.' });

  const foundGuild = await getGuild(id);
  if (!foundGuild || foundGuild.length <= 0 || !foundGuild[0]) return res.status(404).send({ error: `guild not found with id: ${id}.` });

  const { status, send } = await updateGuildPrefix(id, req.body);
  await updateGuildPrefix(id, { prefix, prefixForAllEnable });
  return res.status(status).send(send);
});

route.get('/guilds/:guildID/users/:userID', async (req, res) => {
  const { guildID, userID } = req.params;
  if (!guildID || !userID) return res.status(400).send({ error: 'guildID, userID is needed in params.' });

  const foundClient = await getClientInfo(userID);
  if (!foundClient || !foundClient[0] || !foundClient[0].prefix || !foundClient[0].prefix) {
    return res.status(404).send({ error: `user not found with id: ${userID}.` });
  }

  const foundGuild = await getGuild(guildID);
  if (!foundGuild || !foundGuild[0] || !foundGuild[0].guildPrefix) {
    return res.status(404).send({ error: `guild not found with id: ${guildID}.` });
  }

  return res.status(200).send({
    guildID,
    userID,
    guildPrefix: foundGuild[0].guildPrefix,
    prefixForAllEnable: foundGuild[0].prefixForAllEnable,
    userPrefix: foundClient[0].prefix,
  });
});

module.exports = route;
