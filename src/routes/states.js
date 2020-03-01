const route = require('express-promise-router')();

const { getNowDatabase } = require('../db/tables/state/state_table');

route.get('/now', async (_, res) => {
  const query = await getNowDatabase();
  if (!query || query.length <= 0 || !query[0] || !query[0].now) return res.status(500).send();

  return res.status(200).send({ now: query[0].now });
});

module.exports = route;
