const logger = require('log4js').getLogger();
const route = require('express-promise-router')();

const {
  updateClientDaily,
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
  addBankPoints,
  removeRandomStone,
  updateClientAnimeRolls,
  updateUserEmbedColor,
  updateUserUnlockEmbedColor,
  updateUserUseMyImage,
  updateBankRollsByUserID,
  updateUserCharacterLimit,
  subtractClientPoints,
  upgradeUserDisableSeries,
  upgradeUserDisableCharacters,
  upgradeUserWishlistSeries,
  upgradeUserWishlistCharacter,
  upgradeUserRollsPerReset,
  upgradeUserWishlistChance,
  upgradeUserRollRankGreaterThan,
  upgradeUserDiscount,
  upgradeUserBotImages,
  updateUserBotNSFWImage,
  updateUserBotSFWImage,
  setWaifuListTitle,
} = require('../db/tables/clients/clients_table');

const { banSubmissionUser, unbanSubmissionUser } = require('../db/tables/bans_submissions/bans_submissions.js');

const {
  checkWaifuOwner,
  claimClientWaifuID,
  getClaimWaifuList,
  moveAllClaimedWaifu,
  moveSeries,
  moveBuySeries,
  updateFavoriteClaimWaifuBySeriesID,
  updateFavoriteClaimCharacter,
} = require('../db/tables/cg_claim_waifu/cg_claim_waifu');

const {
  selectImageByURL,
} = require('../db/waifu_schema/waifu_images/waifu_table_images');

const {
  claimClientCustomWaifuID,
  moveAllCustomWaifu,
  updateFavoriteCustomCharacter,
} = require('../db/tables/cg_custom_waifu/cg_custom_waifu');

const {
  getBuyWaifuList,
  getUniqueWaifu,
  buyWaifu,
  removeBuyWaifu,
  moveAllBuyWaifu,
  updateFavoriteBuyWaifuBySeriesID,
  updateFavoriteBuyCharacter,
} = require('../db/tables/cg_buy_waifu/cg_buy_waifu_table');

const {
  addBlacklistCharacterUser,
  removeBlacklistCharacterUser,
  getBlacklistCharacterUserCount,
  getBlacklistCharactersUserPage,
} = require('../db/tables/clients_disable_characters/clients_disable_characters');

const {
  addBlacklistSeriesUser,
  removeBlacklistSeriesUser,
  getBlacklistSeriesUserCount,
  getBlacklistSeriesUserPage,
} = require('../db/tables/clients_disable_series/clients_disable_series');

const {
  incrementClaimWaifuRoll,
  clearStreaks,
  getClientsGuildsInfo,
  addClaimWaifuTrue,
  addClaimWaifuFail,
  resetRollsByUserID,
  resetClaimByUserID,
} = require('../db/tables/clients_guilds/clients_guilds_table');

const {
  addUserFriend,
  removeUserFriend,
  getAllFriendUser,
  getTopFriends,
  getTopServerFriends,
} = require('../db/tables/clients_friends/clients_friends');

const {
  addUserMarry,
  removeUserMarry,
  getAllMarryUser,
  getTopMarries,
  getTopServerMarries,
} = require('../db/tables/clients_marries/clients_marries');

const { insertGuildRolled } = require('../db/tables/guild_rolled/guild_rolled');

const { initializeGetNewUser } = require('../util/functions/user');
const { invalidBoolSetting } = require('../util/functions/validators');

const { rollCharacter } = require('../handlers/rolls');
const { restartBackupQueue } = require('../db/tables/guild_data/guild_data');

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
route.patch('/:id/settings/use-my-image', async (req, res) => updateSettings(req, res, updateUserUseMyImage));

route.patch('/:id/settings/character-limit', async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;

  if (!id || !number || isNaN(number)) return res.status(400).send({ error: 'Expected param id and number (valid) in body' });

  await updateUserCharacterLimit(id, parseInt(number, 10));

  return res.status(200).send({ id, number });
});

route.patch('/:id/settings/lists/waifu/title', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (title && title.length > 120) return res.status(400).send({ error: 'title must be less than 120 characters in length' });

  await setWaifuListTitle(id, title);

  return res.status(204).send();
});

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

route.patch('/:id/settings/images/bot/sfw', async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;

  if (!url.startsWith('https://cdn.bongo.best') && !url.startsWith('https://cdn.bongobot.io')) return res.status(400).send({ error: 'Image must be hosted by me.' });

  const image = await selectImageByURL(url);
  if (image && image[0] && image[0].nsfw) return res.status(400).send({ error: 'sfw bot image may not be nsfw.' });

  const success = await updateUserBotSFWImage(id, url);
  if (!success) return res.status(500).send();

  return res.status(204).send();
});

route.patch('/:id/settings/images/bot/nsfw', async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;

  if (!url.startsWith('https://cdn.bongo.best') && !url.startsWith('https://cdn.bongobot.io')) return res.status(400).send({ error: 'Image must be hosted by me.' });

  const success = await updateUserBotNSFWImage(id, url);
  if (!success) return res.status(500).send();

  return res.status(204).send();
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
    upgradeWishlistChanceAmount = 0,
    rollRankGreaterThan = 0,
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
    upgradeWishlistChanceAmount,
    rollRankGreaterThan,
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
  if (!queryPoints || !queryPoints[0] || !queryPoints[0].points) return res.status(500).send({ error: 'A problem occurred when updating the bank points and game points.' });

  return res.status(200).send({ points: queryPoints[0].points });
});

route.patch('/:userID/points', async (req, res) => {
  const { userID } = req.params;
  const { points } = req.body;

  if (!points || isNaN(points)) return res.status(400).send({ error: `Points given not a valid number for changing: ${points}` });

  const queryPoints = points < 0 ? await subtractClientPoints(userID, -points) : await addBankPoints(userID, points);
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

route.patch('/:userID/guilds/:guildID/reset-claim', async (req, res) => {
  const { userID, guildID } = req.params;

  await resetClaimByUserID(userID, guildID);

  res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/reset-rolls', async (req, res) => {
  const { userID, guildID } = req.params;

  await resetRollsByUserID(userID, guildID);

  res.status(204).send();
});

route.patch('/:userID/bank-rolls', async (req, res) => {
  const { userID } = req.params;
  const { changeBankRollAmount } = req.body;

  await updateBankRollsByUserID(userID, changeBankRollAmount);

  res.status(204).send();
});

route.get('/:userID/buys/waifus/unique', async (req, res) => {
  const { userID } = req.params;
  const { nsfw = false, useDiscordImage = false, limit = 1 } = req.query;

  const nsfwClean = nsfw === 'true' || nsfw === true;
  const useDiscordImageClean = useDiscordImage === 'true' || useDiscordImage === true;
  const limitClean = limit > 0 && limit <= 10 && !isNaN(limit) ? limit : 1;

  const rows = await getUniqueWaifu(userID, nsfwClean, useDiscordImageClean, limitClean);

  res.status(200).send(rows);
});

route.post('/:userID/buys/waifus', async (req, res) => {
  const { userID } = req.params;
  const {
    guildID,
    name,
    characterID,
  } = req.body;

  const rows = await buyWaifu(userID, guildID, name, characterID);

  res.status(201).send(rows);
});

route.delete('/:userID/buys/waifus/:characterID', async (req, res) => {
  const { userID, characterID } = req.params;
  const { name } = req.query;

  const rows = await removeBuyWaifu(userID, name, characterID);

  if (rows.length > 0) {
    return res.status(204).send();
  }

  return res.status(404).send();
});

route.patch('/:userID/buys/waifus/move/all', async (req, res) => {
  const { userID } = req.params;
  const { theirID } = req.body;

  await moveAllBuyWaifu(userID, theirID);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/claims/waifus/move/all', async (req, res) => {
  const { userID, guildID } = req.params;
  const { theirID } = req.body;

  await moveAllClaimedWaifu(userID, guildID, theirID);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/customs/waifus/move/all', async (req, res) => {
  const { userID, guildID } = req.params;
  const { theirID } = req.body;

  await moveAllCustomWaifu(userID, guildID, theirID);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/claims/series/:seriesID/move', async (req, res) => {
  const { userID, guildID, seriesID } = req.params;
  const { theirID } = req.body;

  await moveSeries(userID, theirID, guildID, seriesID);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/buys/series/:seriesID/move', async (req, res) => {
  const { userID, guildID, seriesID } = req.params;
  const { theirID } = req.body;

  await moveBuySeries(userID, theirID, guildID, seriesID);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/claims/series/:seriesID/favorites', async (req, res) => {
  const { userID, guildID, seriesID } = req.params;
  const { favorite } = req.body;

  const favoriteClean = favorite === 'true' || favorite === true;

  await updateFavoriteClaimWaifuBySeriesID(userID, guildID, seriesID, favoriteClean);

  return res.status(204).send();
});

route.patch('/:userID/buys/series/:seriesID/favorites', async (req, res) => {
  const { userID, seriesID } = req.params;
  const { favorite } = req.body;

  const favoriteClean = favorite === 'true' || favorite === true;

  await updateFavoriteBuyWaifuBySeriesID(userID, seriesID, favoriteClean);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/claims/characters/:characterID/favorites', async (req, res) => {
  const { userID, guildID, characterID } = req.params;
  const { favorite } = req.body;

  const favoriteClean = favorite === 'true' || favorite === true;

  await updateFavoriteClaimCharacter(userID, guildID, characterID, favoriteClean);

  return res.status(204).send();
});

route.patch('/:userID/guilds/:guildID/customs/characters/:characterID/favorites', async (req, res) => {
  const { userID, guildID, characterID } = req.params;
  const { favorite } = req.body;

  const favoriteClean = favorite === 'true' || favorite === true;

  await updateFavoriteCustomCharacter(userID, guildID, characterID, favoriteClean);

  return res.status(204).send();
});

route.patch('/:userID/buys/characters/:characterID/favorites', async (req, res) => {
  const { userID, characterID } = req.params;
  const { favorite } = req.body;

  const favoriteClean = favorite === 'true' || favorite === true;

  await updateFavoriteBuyCharacter(userID, characterID, favoriteClean);

  return res.status(204).send();
});

// characters disable
route.delete('/:userID/characters/:characterID/disable', async (req, res) => {
  const { userID, characterID } = req.params;

  await removeBlacklistCharacterUser(userID, characterID);

  return res.status(204).send();
});

route.post('/characters/disable', async (req, res) => {
  const { userID, characterID } = req.body;

  await addBlacklistCharacterUser(userID, characterID);

  return res.status(201).send();
});

route.get('/:userID/characters/disable/count', async (req, res) => {
  const { userID } = req.params;

  const rows = await getBlacklistCharacterUserCount(userID);
  if (!rows || !rows[0] || rows[0].count == null) return res.status(404).send();

  return res.status(200).send(rows[0].count);
});

route.get('/:userID/characters/disable', async (req, res) => {
  const { userID } = req.params;
  const { offset, limit } = req.query;

  if (offset < 0 || limit < 0 || isNaN(offset) || isNaN(limit)) return res.status(400).send({ error: `offset and limit must be greater than zero and a number. Received: ${JSON.stringify({ offset, limit })}` });

  const rows = await getBlacklistCharactersUserPage(userID, offset, limit);

  return res.status(200).send(rows);
});

// series disable
route.delete('/:userID/series/:seriesID/disable', async (req, res) => {
  const { userID, seriesID } = req.params;

  await removeBlacklistSeriesUser(userID, seriesID);

  return res.status(204).send();
});

route.post('/series/disable', async (req, res) => {
  const { userID, seriesID } = req.body;

  await addBlacklistSeriesUser(userID, seriesID);

  return res.status(201).send();
});

route.get('/:userID/series/disable/count', async (req, res) => {
  const { userID } = req.params;

  const rows = await getBlacklistSeriesUserCount(userID);
  if (!rows || !rows[0] || rows[0].count == null) return res.status(404).send();

  return res.status(200).send(rows[0].count);
});

route.get('/:userID/series/disable', async (req, res) => {
  const { userID } = req.params;
  const { offset, limit } = req.query;

  if (offset < 0 || limit < 0 || isNaN(offset) || isNaN(limit)) return res.status(400).send({ error: `offset and limit must be greater than zero and a number. Received: ${JSON.stringify({ offset, limit })}` });

  const rows = await getBlacklistSeriesUserPage(userID, offset, limit);

  return res.status(200).send(rows);
});

// friends
route.post('/friends', async (req, res) => {
  const { userID, friendID } = req.body;

  await addUserFriend(userID, friendID);

  return res.status(201).send();
});

route.delete('/:userID/friends/:friendID', async (req, res) => {
  const { userID, friendID } = req.params;

  await removeUserFriend(userID, friendID);

  return res.status(204).send();
});

route.get('/:userID/friends', async (req, res) => {
  const { userID } = req.params;

  const rows = await getAllFriendUser(userID);

  return res.status(200).send(rows);
});

route.get('/friends/top', async (_, res) => {
  const rows = await getTopFriends();

  return res.status(200).send(rows);
});

route.get('/guilds/:guildID/friends/top', async (req, res) => {
  const { guildID } = req.params;

  const rows = await getTopServerFriends(guildID);

  return res.status(200).send(rows);
});

// marries
route.post('/marries', async (req, res) => {
  const { userID, marryID } = req.body;

  await addUserMarry(userID, marryID);

  return res.status(201).send();
});

route.delete('/:userID/marries/:marryID', async (req, res) => {
  const { userID, marryID } = req.params;

  await removeUserMarry(userID, marryID);

  return res.status(204).send();
});

route.get('/:userID/marries', async (req, res) => {
  const { userID } = req.params;

  const rows = await getAllMarryUser(userID);

  return res.status(200).send(rows);
});

route.get('/marries/top', async (_, res) => {
  const rows = await getTopMarries();

  return res.status(200).send(rows);
});

route.get('/guilds/:guildID/marries/top', async (req, res) => {
  const { guildID } = req.params;

  const rows = await getTopServerMarries(guildID);

  return res.status(200).send(rows);
});

// upgrades
const upgrade = (upgradeFunction) => async (req, res) => {
  const { userID } = req.params;
  const { addNumber, points } = req.body;

  await upgradeFunction(userID, addNumber, points);

  return res.status(204).send();
};

route.patch('/:userID/upgrades/series/disable', upgrade(upgradeUserDisableSeries));

route.patch('/:userID/upgrades/characters/disable', upgrade(upgradeUserDisableCharacters));

route.patch('/:userID/upgrades/series/wishlist', upgrade(upgradeUserWishlistSeries));

route.patch('/:userID/upgrades/characters/wishlist', upgrade(upgradeUserWishlistCharacter));

route.patch('/:userID/upgrades/rolls', upgrade(upgradeUserRollsPerReset));

route.patch('/:userID/upgrades/wishlist/percentage', upgrade(upgradeUserWishlistChance));

route.patch('/:userID/upgrades/characters/limits', upgrade(upgradeUserRollRankGreaterThan));

route.patch('/:userID/upgrades/discount', upgrade(upgradeUserDiscount));

route.patch('/:userID/upgrades/bot-image', upgrade(upgradeUserBotImages));

module.exports = route;
