const route = require('express-promise-router')();

const { getRedisGuildPrefix, getRedisUserPrefix } = require('../db/redis/prefix');
const { updateRedisUserPrefix } = require('../util/functions/user');
const { updateRedisGuildPrefix } = require('../util/functions/guild');
const { getGuild } = require('../db/tables/guild_data/guild_data');
const { getClientInfo } = require('../db/tables/clients/clients_table');

route.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'id is needed in params.' });

  const customPrefix = await getRedisUserPrefix(id);
  if (customPrefix != null) return res.status(200).send({ id, prefix: customPrefix });

  const foundClient = await getClientInfo(id);
  if (!foundClient || foundClient.length <= 0 || !foundClient[0]) return res.status(404).send({ error: `user not found with id: ${id}.` });

  const { userId, prefix } = foundClient[0];
  const { status, send } = await updateRedisUserPrefix(userId, prefix);

  return res.status(status).send(send);
});

route.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { prefix } = req.body;

  if (!id) return res.status(400).send({ error: 'id is needed in params.' });
  if (!prefix) return res.status(400).send({ error: 'prefix is needed in body.' });

  const foundClient = await getClientInfo(id);
  if (!foundClient || foundClient.length <= 0 || !foundClient[0]) return res.status(404).send({ error: `user not found with id: ${id}.` });

  const { status, send } = await updateRedisUserPrefix(id, prefix);
  return res.status(status).send(send);
});

route.get('/guilds/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'id is needed in params.' });

  const guild = await getRedisGuildPrefix(id);
  if (guild != null && guild.guildPrefix != null) return res.status(200).send({ id, prefix: guild.guildPrefix, prefixForAllEnable: guild.prefixForAllEnable });

  const foundGuild = await getGuild(id);
  if (!foundGuild || foundGuild.length <= 0 || !foundGuild[0]) return res.status(404).send({ error: `guild not found with id: ${id}.` });

  const { guildId, guildPrefix, prefixForAllEnable } = foundGuild[0];
  const { status, send } = await updateRedisGuildPrefix(guildId, { prefix: guildPrefix, prefixForAllEnable });

  return res.status(status).send(send);
});

route.patch('/guilds/:id', async (req, res) => {
  const { id } = req.params;
  const { prefix, prefixForAllEnable } = req.body;

  if (!id) return res.status(400).send({ error: 'id is needed in params.' });
  if (prefix == null || prefixForAllEnable == null) return res.status(400).send({ error: 'prefix and prefixForAllEnable is needed in body.' });

  const foundGuild = await getGuild(id);
  if (!foundGuild || foundGuild.length <= 0 || !foundGuild[0]) return res.status(404).send({ error: `guild not found with id: ${id}.` });

  const { status, send } = await updateRedisGuildPrefix(id, req.body);
  await updateRedisGuildPrefix(id, { prefix, prefixForAllEnable });
  return res.status(status).send(send);
});

route.get('/guilds/:guildID/users/:userID', async (req, res) => {
  const { guildID, userID } = req.params;
  if (!guildID || !userID) return res.status(400).send({ error: 'guildID, userID is needed in params.' });

  const customPrefix = await getRedisUserPrefix(userID);
  if (customPrefix == null) return res.status(404).send({ error: `user not found with id: ${guildID}.` });

  const guild = await getRedisGuildPrefix(guildID);
  if (!guild || guild.guildPrefix == null) return res.status(404).send({ error: `guild not found with id: ${guildID}.` });

  return res.status(200).send({
    guildID,
    userID,
    guildPrefix: guild.guildPrefix,
    prefixForAllEnable: guild.prefixForAllEnable,
    userPrefix: customPrefix,
  });
});

module.exports = route;
