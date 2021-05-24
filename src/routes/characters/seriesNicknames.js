const route = require('express-promise-router')();

const {
  insertSeriesNicknameByID,
  updateSeriesNicknameByID,
  deleteSeriesNicknameByID,
  getSeriesNicknames,
} = require('../../db/waifu_schema/series_nicknames/series_nicknames');

route.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) return res.status(404).send(JSON.stringify({ error: `id ${id} not found.`, message: `Could not find id ${id} to delete` }));

  const rows = await deleteSeriesNicknameByID(id);
  if (!rows || rows.length <= 0) return res.status(404).send({ error: `id ${id} not found.`, message: `Could not find id ${id} to delete` });

  return res.status(204).send(rows[0]);
});

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.nickname || !body.seriesID) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: nickname, seriesID', body });

  const { seriesID, nickname } = body;

  const rows = await insertSeriesNicknameByID(seriesID, nickname);
  if (!rows || rows.length <= 0) return res.status(500).send({ error: 'Problem inserting nickname.', message: 'Could not insert series nickname', body });

  return res.status(201).send(rows[0]);
});

route.put('/:id', async (req, res) => {
  const { body } = req;

  if (!body.nickname || !body.seriesID) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: nickname, seriesID', body });

  const { seriesID, nickname } = body;
  const rows = await updateSeriesNicknameByID(seriesID, nickname);
  if (!rows || rows.length <= 0) return res.status(500).send({ error: 'Problem inserting nickname.', message: 'Could not insert series nickname', body });

  return res.status(201).send(rows[0]);
});

route.get('/', async (req, res) => {
  const { query } = req;

  if (!query || !query.name) return res.status(400).send({ error: 'Missing name query.', message: 'Required query: name', query });

  const { name } = query;
  const rows = await getSeriesNicknames(name);

  return res.status(200).send(rows);
});

module.exports = route;
