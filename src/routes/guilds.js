const route = require('express-promise-router')();

const { initializeGetNewGuild } = require('../util/functions/guild');
const {
  updateClaimsRollsPatronsWaiting,
  clearStaleQueue,
  getGuild,
  updateResetClaimsHour,
  updateGuildResetClaimsRollsMinutes,
  updateGuildResetClaimsRollsMinutesWait,
  updateGuildRarity,
  updateGuildWishlistMultiplier,
  updateGuildClaimSeconds,
  updateGuildShowGender,
  updateGuildBuyRolls,
  updateGuildBuyClaims,
  updateGuildShowRankRollingWaifus,
  updateUnlimitedClaims,
  getAllWaifusByName,
  getWaifusByTagGuildOwners,
  getAllWaifusBySeries,
  getGuildsClaimsCharacter,
  updateGuildStealCharacter,
  updateRollCustomOnly,
  updateGuildAnimeReactions,
  updateGuildWesternRolls,
  updateGuildCroppedImages,
  updateGuildAnimeRolls,
  updateGuildUserClaimSeconds,
  updateAllowOtherUsersToClaimAfterSeconds,
  updateGuildWebhookURL,
  updateGuildWebhookName,
} = require('../db/tables/guild_data/guild_data');

const { clearLastPlayed } = require('../db/tables/guild_lastplayed_queue/guild_lastplayed_queue');
const {
  getRandomGuildClaimEmoji,
  removeGuildClaimEmoji,
  saveGuildClaimEmoji,
  getAllGuildClaimEmojis,
} = require('../db/tables/guild_claim_emojis/guild_claim_emojis');

const { getCustomWaifuCount } = require('../db/tables/guild_custom_waifus/guild_custom_waifu_table');

const { getUsersWishWaifu } = require('../db/tables/cg_wishlist_waifu/cg_wishlist_waifu_table');
const { getUsersWishSeries } = require('../db/tables/cg_wishlist_series/cg_wishlist_series_table');

const {
  getRemainingClaimWaifusServer,
  findClaimWaifuByNameJoinURL,
  removeAllGuildClaimCharactersByID,
} = require('../db/tables/cg_claim_waifu/cg_claim_waifu');

const {
  removeAllGuildCustomsCharactersByID,
  getRemainingCustomWaifusServer,
} = require('../db/tables/cg_custom_waifu/cg_custom_waifu');

const { invalidBoolSetting } = require('../util/functions/validators');
const {
  MAX_CLAIM_HOUR,
  MIN_CLAIM_HOUR,
  MAX_CLAIM_MINUTE,
  MIN_CLAIM_MINUTE,
  MAX_RARITY_PERCENTAGE,
  MIN_RARITY_PERCENTAGE,
  MAX_WISHLIST_MULTIPLIER,
  MIN_WISHLIST_MULTIPLIER,
  MAX_SECONDS_CLAIM_WAIFU,
  MIN_SECONDS_CLAIM_WAIFU,
  MIN_SECONDS_USER_CLAIM_CHARACTER,
  MAX_SECONDS_USER_CLAIM_CHARACTER,
} = require('../util/constants/guilds');

const updateSettings = async (req, res, updateFunction) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id for updating guild settings.' });

  if (req.body.updatedBool == null) return res.status(400).send({ error: `updatedBool value needed as a boolean (true or false), received: ${req.body.updatedBool}` });
  const updatedBool = invalidBoolSetting(req.body.updatedBool);
  if (updatedBool == null) return res.status(400).send({ error: `updatedBool value needed as a boolean (true or false), received: ${req.body.updatedBool}` });

  const updated = await updateFunction(id, updatedBool);
  if (!updated || updated.length <= 0 || !updated[0] || updated[0].updatedBool == null) return res.status(404).send({ error: `Guild ${id} not found.` });

  return res.status(200).send({ id, updatedBool: updated[0].updatedBool });
};

route.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ error: 'Guild id not provided. Expected id in body.' });

  const { status, send } = await initializeGetNewGuild(id);
  return res.status(status).send(send);
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

route.delete('/:id/characters/:characterID/claims', async (req, res) => {
  const { id, characterID } = req.params;

  const rows = await removeAllGuildClaimCharactersByID(id, characterID);
  if (!rows || rows.length <= 0) return res.status(404).send(`Guild ${id} does not have claimed character ${characterID}`);

  return res.status(204).send();
});

route.delete('/:id/characters/:characterID/customs', async (req, res) => {
  const { id, characterID } = req.params;

  const rows = await removeAllGuildCustomsCharactersByID(id, characterID);
  if (!rows || rows.length <= 0) return res.status(404).send(`Guild ${id} does not have custom claimed character ${characterID}`);

  return res.status(204).send();
});

route.patch('/:id/settings/claim-hour', async (req, res) => {
  const { id } = req.params;
  const { hour } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  if (hour == null || isNaN(hour)) return res.status(400).send({ error: `The hour is not a number: hour=${hour}.` });
  if (hour > MAX_CLAIM_HOUR || hour < MIN_CLAIM_HOUR) return res.status(400).send({ error: `The hour is not valid. Hour must be between ${MIN_CLAIM_HOUR}-${MAX_CLAIM_HOUR}: hour=${hour}.` });

  await updateResetClaimsHour(id, hour);
  return res.status(204).send();
});

route.patch('/:id/settings/claim-other-rolls', async (req, res) => {
  const { id } = req.params;
  const { seconds } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  if (seconds == null || isNaN(seconds)) return res.status(400).send({ error: `The seconds is not a number: seconds=${seconds}.` });
  if (seconds > MAX_SECONDS_CLAIM_WAIFU || seconds < MIN_SECONDS_CLAIM_WAIFU) return res.status(400).send({ error: `The seconds is not valid. Seconds must be between ${MIN_SECONDS_CLAIM_WAIFU}-${MAX_SECONDS_CLAIM_WAIFU}: seconds=${seconds}.` });

  await updateAllowOtherUsersToClaimAfterSeconds(id, seconds);
  return res.status(204).send();
});

route.patch('/:id/settings/claim-minute', async (req, res) => {
  const { id } = req.params;
  const { minute } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  const { roll_claim_minute: rollClaimMinute } = guilds[0];
  if (minute > rollClaimMinute) {
    await updateGuildResetClaimsRollsMinutesWait(id, minute);
    return res.status(204).send({ error: `Guild ${id} must wait for the next hour for their minute adjustment.` });
  }

  if (minute == null || isNaN(minute)) return res.status(400).send({ error: `The hour is not a number: minute=${minute}.` });
  if (minute > MAX_CLAIM_MINUTE || minute < MIN_CLAIM_MINUTE) return res.status(400).send({ error: `The hour is not valid. Hour must be between ${MIN_CLAIM_MINUTE}-${MAX_CLAIM_MINUTE}: minute=${minute}.` });

  await updateGuildResetClaimsRollsMinutes(id, minute);
  return res.status(204).send();
});

route.patch('/:id/settings/rarity', async (req, res) => {
  const { id } = req.params;
  const { percentage } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  if (percentage == null || isNaN(percentage)) return res.status(400).send({ error: `The rarity is not a number: percentage=${percentage}.` });
  if (percentage > MAX_RARITY_PERCENTAGE || percentage < MIN_RARITY_PERCENTAGE) return res.status(400).send({ error: `The percentage is not valid. Percentage must be between ${MIN_RARITY_PERCENTAGE}-${MAX_RARITY_PERCENTAGE}: percentage=${percentage}.` });

  await updateGuildRarity(id, percentage);
  return res.status(204).send();
});

route.patch('/:id/settings/multiplier', async (req, res) => {
  const { id } = req.params;
  const { multiplier } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  if (!multiplier == null || isNaN(multiplier)) return res.status(400).send({ error: `The multiplier is not a number: multiplier=${multiplier}.` });
  if (multiplier > MAX_WISHLIST_MULTIPLIER || multiplier < MIN_WISHLIST_MULTIPLIER) return res.status(400).send({ error: `The multiplier is not valid. Multiplier must be between ${MIN_RARITY_PERCENTAGE}-${MAX_RARITY_PERCENTAGE}: multiplier=${multiplier}.` });

  await updateGuildWishlistMultiplier(id, multiplier);
  return res.status(204).send();
});

route.patch('/:id/settings/claim-seconds', async (req, res) => {
  const { id } = req.params;
  const { seconds } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  if (seconds == null || isNaN(seconds)) return res.status(400).send({ error: `The seconds is not a number: seconds=${seconds}.` });
  if (seconds > MAX_SECONDS_CLAIM_WAIFU || seconds < MIN_SECONDS_CLAIM_WAIFU) return res.status(400).send({ error: `The seconds is not valid. Seconds must be between ${MIN_SECONDS_CLAIM_WAIFU}-${MAX_SECONDS_CLAIM_WAIFU}: seconds=${seconds}.` });

  await updateGuildClaimSeconds(id, seconds);
  return res.status(204).send();
});

route.patch('/:id/settings/users-claim-seconds', async (req, res) => {
  const { id } = req.params;
  const { seconds } = req.body;

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  const max = guilds[0].claim_seconds;

  if (seconds == null || isNaN(seconds)) return res.status(400).send({ error: `The seconds is not a number: seconds=${seconds}.` });
  if (seconds > MAX_SECONDS_USER_CLAIM_CHARACTER || seconds > max || seconds < MIN_SECONDS_USER_CLAIM_CHARACTER) return res.status(400).send({ error: `The seconds is not valid. Seconds must be between ${MIN_SECONDS_USER_CLAIM_CHARACTER}-${max} where the absolute max is ${MAX_SECONDS_USER_CLAIM_CHARACTER}: seconds=${seconds}.` });

  await updateGuildUserClaimSeconds(id, seconds);
  return res.status(204).send();
});

route.patch('/:id/settings/anime-reactions', async (req, res) => updateSettings(req, res, updateGuildAnimeReactions));
route.patch('/:id/settings/western-rolls', async (req, res) => updateSettings(req, res, updateGuildWesternRolls));
route.patch('/:id/settings/cropped-images', async (req, res) => updateSettings(req, res, updateGuildCroppedImages));
route.patch('/:id/settings/anime-rolls', async (req, res) => updateSettings(req, res, updateGuildAnimeRolls));
route.patch('/:id/settings/steal_character', async (req, res) => updateSettings(req, res, updateGuildStealCharacter));
route.patch('/:id/settings/show-gender', async (req, res) => updateSettings(req, res, updateGuildShowGender));
route.patch('/:id/settings/buy-rolls', async (req, res) => updateSettings(req, res, updateGuildBuyRolls));
route.patch('/:id/settings/buy-claims', async (req, res) => updateSettings(req, res, updateGuildBuyClaims));
route.patch('/:id/settings/show-rank', async (req, res) => updateSettings(req, res, updateGuildShowRankRollingWaifus));
route.patch('/:id/settings/unlimited-claims', async (req, res) => updateSettings(req, res, updateUnlimitedClaims));
route.patch('/:id/settings/roll-custom-only', async (req, res) => updateSettings(req, res, updateRollCustomOnly));

route.get('/:id/wishlists/characters/:characterID', async (req, res) => {
  const { id, characterID } = req.params;

  const query = await getUsersWishWaifu(id, characterID);
  // if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any wishlists or character ID ${characterID} does not exist.` });

  return res.status(200).send(query || []);
});

route.get('/:id/wishlists/series/:seriesID', async (req, res) => {
  const { id, seriesID } = req.params;

  const query = await getUsersWishSeries(id, seriesID);
  // if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any wishlists or series ID ${seriesID} does not exist.` });

  return res.status(200).send(query || []);
});

route.get('/:id/characters/:characterID/claims', async (req, res) => {
  const { id, characterID } = req.params;

  const query = await getGuildsClaimsCharacter(id, characterID);

  return res.status(200).send(query || []);
});

route.delete('/:id/emojis/:emojiID/claim', async (req, res) => {
  const { id, emojiID } = req.params;

  await removeGuildClaimEmoji(id, emojiID);

  return res.status(204).send();
});

route.post('/:id/emojis/claim', async (req, res) => {
  const { id } = req.params;
  const { emojiID } = req.body;
  if (!emojiID) return res.status(400).send({ error: `Expected emojiID. Recieved: ${req.body}` });

  await saveGuildClaimEmoji(id, emojiID);

  return res.status(204).send();
});

route.get('/:id/emojis/claim', async (req, res) => {
  const { id } = req.params;

  const query = await getAllGuildClaimEmojis(id);
  if (!query || query.length <= 0 || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any emojis and may not exist.` });

  return res.status(200).send(query);
});

route.get('/:id/emojis/claim/random', async (req, res) => {
  const { id } = req.params;

  const query = await getRandomGuildClaimEmoji(id);
  if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any emojis and may not exist.` });

  return res.status(200).send(query[0]);
});

route.get('/:id/characters/claim/remaining', async (req, res) => {
  const { id } = req.params;

  const query = await getRemainingClaimWaifusServer(id);
  if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any claimed characters or may not exist.` });

  return res.status(200).send(query[0]);
});

route.get('/:id/characters/custom/remaining', async (req, res) => {
  const { id } = req.params;

  const query = await getRemainingCustomWaifusServer(id);
  if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any custom characters or may not exist.` });

  return res.status(200).send(query[0]);
});

route.get('/:guildID/characters/claims', async (req, res) => {
  const { guildID } = req.params;
  const { name } = req.query;

  if (!name) return res.status(400).send({ error: 'Expected name for character claims.' });
  const query = await findClaimWaifuByNameJoinURL(guildID, name);

  return res.status(200).send(query || []);
});

route.get('/:id/characters/custom/count', async (req, res) => {
  const { id } = req.params;

  const query = await getCustomWaifuCount(id);
  if (!query || !query[0]) return res.status(404).send({ error: `Guild ${id} does not have any claimed custom characters and may not exist.` });

  return res.status(200).send(query[0]);
});

route.get('/:id/requester/:requesterID/characters', async (req, res) => {
  const { id, requesterID } = req.params;

  const { name, limit, useDiscordImage } = req.query;
  if (!name || (limit != null && isNaN(limit)) || (useDiscordImage != null && useDiscordImage !== 'true' && useDiscordImage !== 'false')) return res.status(400).send({ error: 'Incorrect query string.', query: req.query });

  const query = await getAllWaifusByName(name, id, limit, requesterID, useDiscordImage);
  return res.status(200).send(query);
});

route.get('/:id/requester/:requesterID/characters/series', async (req, res) => {
  const { id, requesterID } = req.params;

  const { name, useDiscordImage } = req.query;
  if (!name || (useDiscordImage != null && useDiscordImage !== 'true' && useDiscordImage !== 'false')) return res.status(400).send({ error: 'Incorrect query string.', query: req.query });

  const query = await getAllWaifusBySeries(name, id, requesterID, useDiscordImage);
  return res.status(200).send(query || []);
});

route.get('/:id/characters/tags/:tag', async (req, res) => {
  const { id, tag } = req.params;

  const characters = await getWaifusByTagGuildOwners(id, tag);

  return res.status(200).send(characters);
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ error: 'Expected id' });

  const guilds = await getGuild(id);
  if (!guilds || guilds.length <= 0 || !guilds[0]) return res.status(404).send({ error: `Guild not found with id ${id}.` });

  return res.status(200).send(guilds[0]);
});

route.patch('/:id/webhook/name', async (req, res) => {
  const { id: guildID, name } = req.body;
  if (!guildID) return res.status(400).send({ error: `expected guildID in body ${guildID}`, body: req.body });

  await updateGuildWebhookName(guildID, name);

  return res.status(204).send();
});

route.patch('/:id/webhook/url', async (req, res) => {
  const { id: guildID, url } = req.body;
  if (!guildID) return res.status(400).send({ error: `expected guildID in body ${guildID}`, body: req.body });

  await updateGuildWebhookURL(guildID, url);

  return res.status(204).send();
});

module.exports = route;
