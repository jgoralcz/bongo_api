const route = require('express-promise-router')();

const { updateClaimsRollsPatronsWaiting, clearStaleQueue } = require('../db/tables/guild_data/guild_data');
const { clearLastPlayed } = require('../db/tables/guild_lastplayed_queue/guild_lastplayed_queue');

route.patch('/roll-claim-minute', async (req, res) => {
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
