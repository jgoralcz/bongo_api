const route = require('express-promise-router')();

const { initializeGetNewGuild } = require('../util/functions/guild');
const { updateClaimsRollsPatronsWaiting, clearStaleQueue, getGuild } = require('../db/tables/guild_data/guild_data');
const { clearLastPlayed } = require('../db/tables/guild_lastplayed_queue/guild_lastplayed_queue');

route.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ error: 'Guild id not provided. Expected id in body.' });

  const { status, send } = await initializeGetNewGuild(id);
  return res.status(status).send(send);
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id' });

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  return res.status(200).send(guilds[0]);
});

route.patch('/roll-claim-minute', async (_, res) => {
  await updateClaimsRollsPatronsWaiting();
  return res.status(204).send();
});

route.delete('/lastplayed', async (_, res) => {
  await clearLastPlayed();
  return res.status(204).send();
});

route.delete('/queue', async (_, res) => {
  await clearStaleQueue();
  return res.status(204).send();
});

module.exports = route;
