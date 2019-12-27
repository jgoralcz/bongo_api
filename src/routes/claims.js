const route = require('express-promise-router')();

const { resetClaimsPatronsTwo, resetClaimsPatronsOne, resetClaimsPlebs } = require('../db/tables/clients_guilds/clients_guilds_table');

route.patch('/patron-two/reset', async (req, res) => {
  const { minutes } = req.body;

  await resetClaimsPatronsTwo(minutes);
  return res.status(204).send();
});

route.patch('/patron-one/reset', async (_, res) => {
  await resetClaimsPatronsOne();
  return res.status(204).send();
});

route.patch('/plebs/reset', async (_, res) => {
  await resetClaimsPlebs;
  return res.status(204).send();
});

module.exports = route;
