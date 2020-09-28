const route = require('express-promise-router')();

const {
  getWhitelists,
  upsertWhitelist,
} = require('../db/tables/whitelist/whitelist_table');

route.get('/id/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send({ error: `id expected. Received id=${id}` });

  const query = await getWhitelists(id);
  const whitelist = query && query[0] && query[0].whitelist ? query[0].whitelist : [];

  return res.status(200).send(whitelist);
});

route.put('/id/:id/type/:type', async (req, res) => {
  const { id, type } = req.params;
  const whitelistArray = req.body;

  if (!id || !type || !whitelistArray) return res.status(400).send({ error: `id, type expected in params and whitelistArray expected in body. Received id=${id}, type=${type}, whitelistArray=${whitelistArray}` });

  await upsertWhitelist(id, type, whitelistArray);

  return res.status(204).send();
});

module.exports = route;
