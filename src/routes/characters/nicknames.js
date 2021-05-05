const route = require('express-promise-router')();

const {
  insertNicknameByID,
  updateNicknameByID,
  deleteNicknameByID,
  getNicknames,
} = require('../../db/waifu_schema/character_nicknames/character_nicknames');

route.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) return res.status(404).send(JSON.stringify({ error: `id ${id} not found.`, message: `Could not find id ${id} to delete` }));

  const rows = await deleteNicknameByID(id);
  if (!rows || rows.length <= 0) return res.status(404).send({ error: `id ${id} not found.`, message: `Could not find id ${id} to delete` });

  return res.status(204).send(rows[0]);
});

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.nickname || !body.characterID) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: nickname, character_id', body });

  const { characterID, nickname } = body;

  const rows = await insertNicknameByID(characterID, nickname);
  if (!rows || rows.length <= 0) return res.status(500).send({ error: 'Problem inserting nickname.', message: 'Could not insert character nickname', body });

  return res.status(201).send(rows[0]);
});

route.put('/:id', async (req, res) => {
  const { body } = req;

  if (!body.nickname || !body.characterID) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: nickname, character_id', body });

  const { characterID, nickname } = body;
  const rows = await updateNicknameByID(characterID, nickname);
  if (!rows || rows.length <= 0) return res.status(500).send({ error: 'Problem inserting nickname.', message: 'Could not insert character nickname', body });

  return res.status(201).send(rows[0]);
});

route.get('/', async (req, res) => {
  const { query } = req;

  if (!query || !query.name) return res.status(400).send({ error: 'Missing name query.', message: 'Required query: name', query });

  const { name } = query;
  const rows = await getNicknames(name);

  return res.status(200).send(rows);
});

module.exports = route;
