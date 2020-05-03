const route = require('express-promise-router')();

const { resetRollsByIdVote } = require('../db/tables/clients_guilds/clients_guilds_table');

route.patch('/users/:userID/guilds/:guildID', async (req, res) => {
  const { userID, guildID } = req.params;

  await resetRollsByIdVote(userID, guildID);
  return res.status(204).send();
});

module.exports = route;
