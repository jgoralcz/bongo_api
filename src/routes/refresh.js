const route = require('express-promise-router')();

const { refreshCount } = require('../db/tables/guild_data/guild_data');
const { deleteGuildRolledMinute } = require('../db/tables/guild_rolled/guild_rolled');


route.put('/count/minute', async (_, res) => {
  await refreshCount();
  return res.status(204).send();
});

route.delete('/guilds/rolls/minute', async (_, res) => {
  await deleteGuildRolledMinute();
  return res.status(204).send();
});

module.exports = route;
