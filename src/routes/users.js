const route = require('express-promise-router')();

const { clearStreaks } = require('../db/tables/clients_guilds/clients_guilds_table');
const {
  updateUserBankPointsVote,
  getClientInfo,
  setClientInfo,
  resetAllClientDaily,
  clearVoteStreaks,
  updateClientPlayFirst,
  updateClientAnimeReactions,
  updateClientWesternRolls,
  updateClientGameRolls,
  updateClientCroppedImages,
  updateClientRollClaimed,
  updateUniversalCustomCommandsUsage,
  updateGuildCustomCommandUsage,
} = require('../db/tables/clients/clients_table');


const invalidBoolSetting = (req) => {
  const { updatedBool } = req.body;
  if (updatedBool == null || (updatedBool !== false && updatedBool !== true)) return undefined;
  return updatedBool;
};

const updateSettings = async (req, res, updateFunction) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id for updating user settings.' });
  const updatedBool = invalidBoolSetting(req);
  if (updatedBool == null) return res.status(400).send({ error: 'updatedBool value needed as a boolean (true or false).' });

  const updated = await updateFunction(id, updatedBool);
  if (!updated || updated.length <= 0 || !updated[0] || updated[0].updatedBool == null) return res.status(404).send({ error: `User ${id} not found.` });

  return res.status(204).send({ id, updatedBool: updated[0].updatedBool });
};

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

route.patch('/:id/settings/play-first', async (req, res) => updateSettings(req, res, updateClientPlayFirst));
route.patch('/:id/settings/anime-reactions', async (req, res) => updateSettings(req, res, updateClientAnimeReactions));
route.patch('/:id/settings/western-rolls', async (req, res) => updateSettings(req, res, updateClientWesternRolls));
route.patch('/:id/settings/game-rolls', async (req, res) => updateSettings(req, res, updateClientGameRolls));
route.patch('/:id/settings/cropped-images', async (req, res) => updateSettings(req, res, updateClientCroppedImages));
route.patch('/:id/settings/roll-claimed', async (req, res) => updateSettings(req, res, updateClientRollClaimed));
route.patch('/:id/settings/custom-commands', async (req, res) => updateSettings(req, res, updateUniversalCustomCommandsUsage));
route.patch('/:id/settings/guilds/:guildID/custom-commands', async (req, res) => {
  const { id, guildID } = req.params;
  if (!id || !guildID) return res.status(400).send({ error: 'Expected id and guildID for updating custom commands for guild settings.' });
  const updatedBool = invalidBoolSetting(req);
  if (updatedBool == null) return res.status(400).send({ error: 'updatedBool value needed as a boolean (true or false).' });

  const updated = await updateGuildCustomCommandUsage(id, guildID, updatedBool);
  if (!updated || updated.length <= 0 || !updated[0] || updated[0].updatedBool == null) return res.status(404).send({ error: `User ${id} not found.` });

  return res.status(204).send({ id, updatedBool });
});

module.exports = route;
