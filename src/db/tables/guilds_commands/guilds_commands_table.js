const { poolQuery } = require('../../index');

/**
 * set guild custom command.
 * @param info the guild's info.
 * @returns {Promise<Promise<*>|*>}
 */
const setGuildCustomCommand = async info => poolQuery(`
  INSERT INTO "guildsCommandsTable" ("guildId", "commandName", "commandValue", url, "noTitle", "noEmbed", "forceImage")
  VALUES ($1, $2, $3, $4, $5, $6, $7);
`, [info.guild, info.commandName, info.commandValue, info.url, info.noTitle, info.noEmbed, info.forceImage]);

/**
 * gets the guild commands.
 * @param commandName the command name.
 * @param guildId the guild id.
 * @returns {Promise<Promise<*>|*>}
 */
const getGuildCommand = async (commandName, guildId) => poolQuery(`
  SELECT * 
  FROM "guildsCommandsTable"
  WHERE "commandName" = $1 AND "guildId" = $2;
`, [commandName, guildId]);

/**
 * updates the guild custom command.
 * @param commandInfo the command info.
 * @param commandName the command name.
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const updateGuildCustomCommand = async (commandInfo, commandName, guildId) => poolQuery(`
  UPDATE "guildsCommandsTable" 
  SET "commandValue" = $1, "url" = $2, "noEmbed" = $3, "noTitle" = $4, "forceImage" = $5 
  WHERE "commandName" = $6 AND "guildId" = $7;
`, [commandInfo.commandValue, commandInfo.url, commandInfo.noEmbed, commandInfo.noTitle, commandInfo.forceImage, commandName, guildId]);

/**
 * deletes the guild custom command.
 * @param commandName the command name
 * @param guildId the guild id.
 * @returns {Promise<Promise<*>|*>}
 */
const deleteGuildCustomCommand = async (commandName, guildId) => poolQuery(`
  DELETE FROM "guildsCommandsTable" 
  WHERE "commandName" = $1 AND "guildId" = $2;
`, [commandName, guildId]);

/**
 * lists the guilds commands ordered
 * @param guildId
 * @returns {Promise<Promise<*>|*>}
 */
const listGuildCommandsOrdered = async guildId => poolQuery(`
  SELECT * 
  FROM "guildsCommandsTable"
  WHERE "guildId" = $1
  ORDER BY "commandName";
`, [guildId]);


module.exports = {
  setGuildCustomCommand,
  getGuildCommand,
  updateGuildCustomCommand,
  deleteGuildCustomCommand,
  listGuildCommandsOrdered,
};
