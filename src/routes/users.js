const route = require('express-promise-router')();

const { updateUserBankPointsVote, getClientInfo, setClientInfo, resetAllClientDaily, clearVoteStreaks } = require('../db/tables/clients/clients_table');
const { clearStreaks } = require('../db/tables/clients_guilds/clients_guilds_table');

route.post('/', async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).send({ error: 'user id not provided. Expected id.' });

  const userQuery = await getClientInfo(id);
  if (userQuery && userQuery.length > 0 && userQuery[0]) return res.status(409).send(userQuery[0]);

  const setUserQuery = await setClientInfo(id);
  if (!setUserQuery || setUserQuery <= 0 || !setUserQuery[0]) return res.status(500).send({ error: `Could not make a user with id: ${id}` });

  return res.status(201).send(setUserQuery[0]);
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userQuery = await getClientInfo(id);
  if (!userQuery || userQuery.length <= 0 || !userQuery[0]) return res.status(404).send({ error: 'User not found.' });

  return res.status(200).send(userQuery[0]);
});

route.patch('/:id/points', async (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  if (!id || !points) return res.status(404).send({ error: `id or points expected. Received: id=${id}, points=${points}` });

  await updateUserBankPointsVote(id, points);

  return res.status(204).send();
});

route.patch('/guilds/streaks/reset', async (_, res) => {
  await clearStreaks();
  return res.status(204).send();
});

route.patch('/guilds/streaks/votes/reset', async (_, res) => {
  await clearVoteStreaks();
  return res.status(204).send();
});

route.patch('/dailies/reset', async (_, res) => {
  await resetAllClientDaily();
  return res.status(204).send();
});

module.exports = route;
