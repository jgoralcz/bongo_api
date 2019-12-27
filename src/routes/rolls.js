const route = require('express-promise-router')();

const { resetRollsPatronsTwo, resetRolls } = require('../db/tables/clients_guilds/clients_guilds_table');

route.patch('/patron-two/reset', async (req, res) => {
  const { minutes } = req.body;

  await resetRollsPatronsTwo(minutes);
  return res.status(204).send();
});

route.patch('/reset', async (req, res) => {
  await resetRolls();
  return res.status(204).send();
});

module.exports = route;
