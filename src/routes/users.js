const logger = require('log4js').getLogger();
const route = require('express-promise-router')();

const {
  updateClientDaily,
  updateUserBankPointsVote,
  getClientInfo,
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
  addGameAndBankPoints,
  removeRandomStone,
  updateClientAnimeRolls,
  updateUserEmbedColor,
  updateUserUnlockEmbedColor,
} = require('../db/tables/clients/clients_table');

const { banSubmissionUser, unbanSubmissionUser } = require('../db/tables/bans_submissions/bans_submissions.js');

const {
  checkWaifuOwner,
  claimClientWaifuID,
  getClaimWaifuList,
} = require('../db/tables/cg_claim_waifu/cg_claim_waifu');
const { claimClientCustomWaifuID } = require('../db/tables/cg_custom_waifu/cg_custom_waifu');

const {
  getBuyWaifuList,
} = require('../db/tables/cg_buy_waifu/cg_buy_waifu_table');

const {
  getRandomWaifuOwnerNotClaimed,
  getRandomWaifuOwnerWishlistClaimed,
  getRandomWaifuOwnerClaimed,
  getRandomWaifuOwnerWishlistNotClaimed,
  findClaimWaifuByIdJoinURL,
  findClaimWaifuByIdJoinURLFavorites,
} = require('../db/tables/cg_claim_waifu/cg_claim_waifu');

const {
  incrementClaimWaifuRoll,
  clearStreaks,
  getClientsGuildsInfo,
  addClaimWaifuTrue,
  addClaimWaifuFail,
} = require('../db/tables/clients_guilds/clients_guilds_table');

const { insertGuildRolled } = require('../db/tables/guild_rolled/guild_rolled');

const { initializeGetNewUser } = require('../util/functions/user');
const { invalidBoolSetting } = require('../util/functions/validators');

const { rollCharacter } = require('../handlers/rolls');

const rollRequest = async (req, res, rollFunction) => {
  const { userID, guildID } = req.params;
  if (!userID || !guildID) return res.status(400).send({ error: 'Missing userID or guildID' });

  const {
    nsfw,
    limitMultiplier,
    rollWestern,
    rollGame,
    croppedDiscordImage = true,
    rollAnime,
    isHusbando,
  } = req.query;

  const rows = await rollFunction(
    userID,
    guildID,
    invalidBoolSetting(nsfw, false),
    invalidBoolSetting(rollWestern, true),
    invalidBoolSetting(rollGame, true),
    invalidBoolSetting(croppedDiscordImage, false),
    limitMultiplier || 1,
    !invalidBoolSetting(rollAnime, true),
    isHusbando,
  );
  return res.status(200).send(rows || []);
};

const updateSettings = async (req, res, updateFunction) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id for updating user settings.' });

  if (req.body.updatedBool == null) return res.status(400).send({ error: `updatedBool value needed as a boolean (true or false), received: ${req.body.updatedBool}` });
  const updatedBool = invalidBoolSetting(req.body.updatedBool);
  if (updatedBool == null) return res.status(400).send({ error: `updatedBool value needed as a boolean (true or false), received: ${req.body.updatedBool}` });

  const updated = await updateFunction(id, updatedBool);
  if (!updated || updated.length <= 0 || !updated[0] || updated[0].updatedBool == null) return res.status(404).send({ error: `User ${id} not found or unsuccesfully updated.` });

  return res.status(200).send({ id, updatedBool: updated[0].updatedBool });
};

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id' });

  const userQuery = await getClientInfo(id);
  if (!userQuery || userQuery.length <= 0 || !userQuery[0]) return res.status(404).send({ error: `User not found with id ${id}.` });

  return res.status(200).send(userQuery[0]);
});

route.patch('/:id/vote/points', async (req, res) => {
  const { id } = req.params;
  const { points: tempPoints } = req.body;

  const points = !tempPoints || tempPoints < 0 || isNaN(tempPoints) ? 0 : tempPoints;

  if (!id) return res.status(400).send({ error: `id expected. Received: id=${id}` });

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
route.patch('/:id/settings/anime-rolls', async (req, res) => updateSettings(req, res, updateClientAnimeRolls));
route.patch('/:id/settings/game-rolls', async (req, res) => updateSettings(req, res, updateClientGameRolls));
route.patch('/:id/settings/cropped-images', async (req, res) => updateSettings(req, res, updateClientCroppedImages));
route.patch('/:id/settings/roll-claimed', async (req, res) => updateSettings(req, res, updateClientRollClaimed));
route.patch('/:id/settings/custom-commands', async (req, res) => updateSettings(req, res, updateUniversalCustomCommandsUsage));
route.patch('/:id/settings/unlock-embed-color', async (req, res) => updateSettings(req, res, updateUserUnlockEmbedColor));

route.patch('/:id/settings/embed-color', async (req, res) => {
  const { id } = req.params;
  const { color } = req.body;

  if (!id || !color) return res.status(400).send({ error: 'Expected param id and body color' });

  const hexColor = color.startsWith('#') ? color.substring(1, color.length) : color;
  const valid = /[0-9A-F]{6}$/i.test(hexColor);

  if (!valid) return res.status(400).send({ error: `color must be a valid hex color. Received color=${hexColor}` });

  await updateUserEmbedColor(id, color);

  return res.status(204).send({ id, color });
});

route.patch('/:id/settings/guilds/:guildID/custom-commands', async (req, res) => {
  const { id, guildID } = req.params;

  if (!req.body.updatedBool) return res.status(400).send({ error: 'updatedBool value needed as a boolean (true or false).' });
  const updatedBool = invalidBoolSetting(req.body.updatedBool);
  if (updatedBool == null) return res.status(400).send({ error: 'updatedBool value needed as a boolean (true or false).' });

  const updated = await updateGuildCustomCommandUsage(guildID, id, updatedBool);
  if (!updated || updated.length <= 0 || !updated[0] || updated[0].updatedBool == null) return res.status(404).send({ error: `User ${id} not found.` });

  return res.status(200).send({ id, updatedBool });
});

route.get('/:userID/guilds/:guildID/rolls/random-owner-not-claimed', async (req, res) => rollRequest(req, res, getRandomWaifuOwnerNotClaimed));
route.get('/:userID/guilds/:guildID/rolls/random-owner-claimed', async (req, res) => rollRequest(req, res, getRandomWaifuOwnerClaimed));
route.get('/:userID/guilds/:guildID/rolls/random-owner-wishlist-not-claimed', async (req, res) => rollRequest(req, res, getRandomWaifuOwnerWishlistNotClaimed));
route.get('/:userID/guilds/:guildID/rolls/random-owner-wishlist-claimed', async (req, res) => rollRequest(req, res, getRandomWaifuOwnerWishlistClaimed));

// all in one to reduce latency and clean it up; this route is used very, very often
route.get('/:userID/guilds/:guildID/rolls/random', async (req, res) => {
  const { userID, guildID } = req.params;
  if (!userID || !guildID) return res.status(400).send({ error: 'Missing userID or guildID' });

  const {
    nsfw,
    limitMultiplier,
    rollWestern,
    rollGame,
    croppedDiscordImage = true,
    rollAnime,
    isHusbando,
    userRollClaimed,
    rarityPercentage,
    rollCustomCharacterOnly,
    unlimitedClaims,
  } = req.query;

  const characters = await rollCharacter(
    userID,
    guildID,
    invalidBoolSetting(nsfw, false),
    invalidBoolSetting(userRollClaimed, false),
    invalidBoolSetting(rollWestern, true),
    !invalidBoolSetting(rollAnime, true),
    invalidBoolSetting(rollGame, true),
    rarityPercentage,
    limitMultiplier || 1,
    invalidBoolSetting(rollCustomCharacterOnly, false),
    invalidBoolSetting(unlimitedClaims, false),
    invalidBoolSetting(croppedDiscordImage, false),
    isHusbando,
  );

  // guild can't roll this character again for 10 min
  if (characters && characters[0] && characters[0].id) {
    await insertGuildRolled(guildID, characters[0].id).catch((error) => logger.error(error));
  }

  return res.status(200).send(characters);
});

route.patch('/:userID/guilds/:guildID/rolls/increment', async (req, res) => {
  const { userID, guildID } = req.params;

  await incrementClaimWaifuRoll(userID, guildID);

  res.status(204).send();
});

route.patch('/:userID/daily', async (req, res) => {
  const { userID } = req.params;

  const { used, updatedTime, extraPoints } = req.body;
  if (!used || updatedTime == null || extraPoints == null) return res.status(400).send({ error: `Expected used, updatedTime, and extraPoints. Received used=${used}, updatedTime=${updatedTime}, extraPoints=${extraPoints}` });

  const query = await updateClientDaily(userID, used, updatedTime, extraPoints);
  if (!query || query.length <= 0 || !query[0]) return res.status(404).send({ error: `User ${userID} could not update their daily.`, query: JSON.stringify(query) });

  return res.status(200).send(query[0]);
});

route.get('/:userID/guilds/:guildID', async (req, res) => {
  const { userID, guildID } = req.params;

  const query = await getClientsGuildsInfo(userID, guildID);
  if (!query || query.length <= 0 || !query[0]) return res.status(404).send({ error: `User ${userID} with guild ${guildID} does not exist.` });

  return res.status(200).send(query[0]);
});

route.get('/:userID/guilds/:guildID/characters/claims', async (req, res) => {
  const { userID, guildID } = req.params;
  const { offset, limit } = req.query;

  const query = await getClaimWaifuList(userID, guildID, offset || 0, limit || 1000000);
  if (!query || query.length <= 0 || !query[0]) {
    return res.status(404).send({ error: `User ${userID} with guild ${guildID} does not have a character list` });
  }

  return res.status(200).send(query);
});

route.get('/:userID/guilds/:guildID/characters/:characterID', async (req, res) => {
  const { userID, guildID, characterID } = req.params;

  const query = await checkWaifuOwner(userID, guildID, characterID);
  if (!query || query.length <= 0 || !query[0]) return res.status(404).send({ error: `User ${userID} with guild ${guildID} does not have character ${characterID}.` });

  return res.status(200).send(query[0]);
});

route.delete('/:userID/stones/random', async (req, res) => {
  const { userID } = req.params;

  const rows = await removeRandomStone(userID);
  if (!rows || !rows[0] || !rows[0].stones) return res.status(400).send();

  const { stones } = rows[0];

  return res.status(204).send({ stones });
});

route.get('/:userID/guilds/:guildID/claims/favorites', async (req, res) => {
  const { userID, guildID } = req.params;
  const { name, favorite } = req.query;

  if (!name || (favorite != null && favorite !== 'true' && favorite !== 'false')) return res.status(400).send({ error: 'Name query parameter expected and favorite parameter expected as a booelan.' });

  const query = await findClaimWaifuByIdJoinURLFavorites(userID, guildID, name, favorite);
  return res.status(200).send(query || []);
});

route.get('/:userID/guilds/:guildID/claims', async (req, res) => {
  const { userID, guildID } = req.params;
  const { name } = req.query;

  if (!name) return res.status(400).send({ error: 'Name query parameter expected.' });

  const query = await findClaimWaifuByIdJoinURL(userID, guildID, name);
  return res.status(200).send(query || []);
});

route.post('/:userID/guilds/:guildID/characters/:customID/custom', async (req, res) => {
  const { userID, guildID, customID } = req.params;

  await addClaimWaifuTrue(userID, guildID);
  const query = await claimClientCustomWaifuID(userID, guildID, customID, new Date());
  if (!query || query.length <= 0 || !query[0]) {
    await addClaimWaifuFail(userID, guildID);
    return res.status(500).send({ error: `User ${userID} with guild ${guildID} cannot claim custom character ${customID}.` });
  }

  return res.status(201).send(query[0]);
});

route.post('/:userID/guilds/:guildID/characters/:characterID/claim', async (req, res) => {
  const { userID, guildID, characterID } = req.params;

  await addClaimWaifuTrue(userID, guildID);
  const query = await claimClientWaifuID(userID, guildID, characterID, new Date()).catch((error) => logger.error(error));
  if (!query || query.length <= 0 || !query[0]) {
    await addClaimWaifuFail(userID, guildID);
    return res.status(500).send({ error: `User ${userID} with guild ${guildID} cannot claim character ${characterID}.` });
  }

  return res.status(201).send(query[0]);
});

route.patch('/:userID/guilds/:guildID/claim', async (req, res) => {
  const { userID, guildID } = req.params;

  await addClaimWaifuTrue(userID, guildID);

  return res.status(204).send();
});

route.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ error: 'User id not provided. Expected id.' });

  const { status, send } = await initializeGetNewUser(id);
  return res.status(status).send(send);
});

route.patch('/:userID/games/points', async (req, res) => {
  const { userID } = req.params;
  const { points } = req.body;

  if (!points) return res.status(400).send({ error: `Points given not a valid number for changing: ${points}` });

  const queryPoints = await addGameAndBankPoints(userID, points);
  if (!queryPoints || !queryPoints[0] || !queryPoints[0].points) return res.status(500).send({ error: 'A problem occurred when updating the bank points.' });

  return res.status(200).send({ points: queryPoints[0].points });
});

route.post('/bans/submission', async (req, res) => {
  const { userID } = req.body;
  if (!userID) return res.status(400).send({ error: `expected userID in body. Received ${JSON.stringify(req.body)}` });

  await banSubmissionUser(userID);

  return res.status(201).send();
});

route.delete('/:userID/bans/submission', async (req, res) => {
  const { userID } = req.params;

  await unbanSubmissionUser(userID);

  return res.status(204).send();
});

route.get('/:userID/characters/bought', async (req, res) => {
  const { userID } = req.params;
  const { offset, limit } = req.query;

  const query = await getBuyWaifuList(userID, offset || 0, limit || 100000);
  if (!query || query.length <= 0 || !query[0]) {
    return res.status(404).send({ error: `User ${userID} does not have a bought character list` });
  }

  return res.status(200).send(query);
});

module.exports = route;
