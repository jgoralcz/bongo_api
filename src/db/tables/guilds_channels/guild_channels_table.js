const { poolQuery } = require('../../index');

// /**
//  * gets all the info from all channels for a specific guild
//  * @param guildId
//  * @returns {Promise<Promise<*>|*>}
//  */
// const getGuildChannelsTable = async (guildId) => poolQuery(`
//   SELECT *
//   FROM "guildChannelsTable"
//   WHERE "guildId" = $1;
// `, [guildId]);

/**
 * gets a specific guild channel by their IDs.
 * @param guildId the guild id.
 * @param channelId the channel id.
 * @returns {Promise<Promise<*>|*>}
 */
const getSpecificGuildChannel = async (guildId, channelId) => poolQuery(`
  SELECT *
  FROM "guildChannelsTable"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * deletes a specific guild channel
 * @param channelId the channel id
 * @returns {Promise<Promise<*>|*>}
 */
const deleteSpecificGuildChannel = async (channelId) => poolQuery(`
  DELETE FROM "guildChannelsTable"
  WHERE "channelId" = $1;
`, [channelId]);

/**
 * sets up a specific guild channel
 * @param guildId the guild ID.
 * @param channelId the channel ID
 * @returns {Promise<Promise<*>|*>}
 */
const setupGuildChannel = async (guildId, channelId) => poolQuery(`
  INSERT INTO "guildChannelsTable" ("guildId", "channelId") 
  VALUES ($1, $2)
  ON CONFLICT("channelId") DO NOTHING;
`, [guildId, channelId]);

/**
 * the member of day channel
 * @param guildId the guild id.
 * @param channelId the channel id.
 * @returns {Promise<*>}
 */
const setMemeOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "memeOfDay" = NOT "memeOfDay" 
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * sets the channel as an anime channel
 * @param guildId the guild id
 * @param channelId the channel id
 * @returns {Promise<*>}
 */
const setAnimemeOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable" 
  SET "animemeOfDay" = NOT "animemeOfDay"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * sets the channel as an aww channel
 * @param guildId the guild id.
 * @param channelId the channel id.
 * @returns {Promise<*>}
 */
const setAwwOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "awwOfDay" = NOT "awwOfDay"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * sets the channel as an awwnime channel.
 * @param guildId the guild's id.
 * @param channelId the channel's id.
 * @returns {Promise<Promise<*>|*>}
 */
const setAwwnimeOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "awwnimeOfDay" = NOT "awwnimeOfDay"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * sets the word of the day for a channel
 * @param guildId the guild id.
 * @param channelId the channel id.
 * @returns {Promise<*>}
 */
const setWordOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "wordOfDay" = NOT "wordOfDay"
  WHERE "guildId" = $1 AND "channelId" = $2;
`,[guildId, channelId]);

/**
 * sets the wiki of the day for a channel
 * @param guildId the guild id.
 * @param channelId the channel id.
 * @returns {Promise<*>}
 */
const setWikiOfDayChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "wikiOfDay" = NOT "wikiOfDay"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * sets the auto delete channel
 * @param guildId the guild's id.
 * @param channelId the channel's id.
 * @returns {Promise<*>}
 */
const setAutoDeleteChannel = async (guildId, channelId) => poolQuery(`
  UPDATE "guildChannelsTable"
  SET "autoDelete" = NOT "autoDelete"
  WHERE "guildId" = $1 AND "channelId" = $2;
`, [guildId, channelId]);

/**
 * gets all word of the day channels
 * @returns {Promise<*>}
 */
const getAllWordOfDayChannels = async () => poolQuery(`
  SELECT * FROM
  "guildChannelsTable"
  WHERE "wordOfDay" = TRUE;
`, []);

/**
 * gets all wiki of day channels.
 * @returns {Promise<Promise<*>|*>}
 */
const getAllWikiOfDayChannels = async () => poolQuery(`
  SELECT * 
  FROM "guildChannelsTable"
  WHERE "wikiOfDay" = TRUE;
`, []);

/**
 * gets all meme of day channels
 * @returns {Promise<*>}
 */
const getAllMemeOfDayChannels = async () => poolQuery(`
  SELECT *
  FROM "guildChannelsTable"
  WHERE "memeOfDay" = TRUE;
`, []);

/**
 * gets all animeme of day channels.
 * @returns {Promise<Promise<*>|*>}
 */
const getAllAnimemeOfDayChannels = async () => poolQuery(`
  SELECT * 
  FROM "guildChannelsTable"
  WHERE "animemeOfDay" = TRUE;
`, []);

/**
 * gets all awwnime of day channels
 * @returns {Promise<*>}
 */
const getAllAwwnimeOfDayChannels = async () => poolQuery(`
  SELECT * 
  FROM "guildChannelsTable" 
  WHERE "awwnimeOfDay" = TRUE;
`, []);

/**
 * gets all aww of day channels
 * @returns {Promise<*>}
 */
const getAllAwwOfDayChannels = async () => poolQuery(`
  SELECT * 
  FROM "guildChannelsTable" 
  WHERE "awwOfDay" = TRUE;
`, []);

module.exports = {
  // getGuildChannelsTable,
  getSpecificGuildChannel,
  deleteSpecificGuildChannel,
  setupGuildChannel,
  setMemeOfDayChannel,
  setAnimemeOfDayChannel,
  setAwwOfDayChannel,
  setAwwnimeOfDayChannel,
  setWordOfDayChannel,
  setWikiOfDayChannel,
  setAutoDeleteChannel,
  getAllWordOfDayChannels,
  getAllWikiOfDayChannels,
  getAllMemeOfDayChannels,
  getAllAnimemeOfDayChannels,
  getAllAwwnimeOfDayChannels,
  getAllAwwOfDayChannels,
};
