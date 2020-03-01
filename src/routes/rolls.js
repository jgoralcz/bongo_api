const route = require('express-promise-router')();

const { resetRolls, resetRollsByIdVote } = require('../db/tables/clients_guilds/clients_guilds_table');

route.patch('/reset', async (req, res) => {
  const { minute } = req.body;

  await resetRolls(minute);
  return res.status(204).send();
});

route.patch('/users', async (req, res) => {
  const { userID, guildID } = req.params;

  await resetRollsByIdVote(userID, guildID);
  return res.status(204).send();
});

module.exports = route;
