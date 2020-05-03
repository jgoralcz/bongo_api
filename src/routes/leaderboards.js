const route = require('express-promise-router')();

const { refreshLeaderBoards } = require('../db/tables/leaderboards/leaderboards');

route.put('/refresh', async (_, res) => {
  await refreshLeaderBoards();
  return res.status(204).send();
});

module.exports = route;
