const route = require('express-promise-router')();

const { updateCurrentServerQueueTrackSeek } = require('../db/tables/guild_data/guild_data');

route.patch('/guilds/:id/time', async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  await updateCurrentServerQueueTrackSeek(id, position);

  return res.status(204).send();
});

module.exports = route;
