const { poolQuery } = require('../../index.js');

/**
 * sets a custom client command.
 */
const setClientCustomCommand = async info => poolQuery(`
  INSERT INTO "clientsCommandsTable" ("userId", "commandName", "commandValue", "url", "noTitle", "noEmbed", "forceImage")
  VALUES ($1, $2, $3, $4, $5, $6, $7);
`, [info.userId, info.commandName, info.commandValue, info.url, info.noTitle, info.noEmbed, info.forceImage]);

// const getClientCommandTable = async (userId) => {
//   return await client.query(`
//       SELECT *
//       FROM "clientsCommandsTable"
//       WHERE "userId" = $1;
//   `, [userId]);
// };

/**
 * gets all client commands
 * @param commandName the command name
 * @param userID the user's id.
 * @returns {Promise<*>}
 */
const getClientCommand = async (commandName, userID) => poolQuery(`
  SELECT * 
  FROM "clientsCommandsTable" 
  WHERE "commandName" = $1 AND "userId" = $2;
`, [commandName, userID]);

/**
 * updates a client's custom command
 * @param commandInfo the command's info object.
 * @param commandName the command's name
 * @param userID the user's ID.
 * @returns {Promise<Promise<*>|*>}
 */
const updateClientCustomCommand = async (commandInfo, commandName, userID) => poolQuery(`
  UPDATE "clientsCommandsTable" 
  SET "commandValue" = $1, "url" = $2, "noEmbed" = $3, "noTitle" = $4, "forceImage" = $5
  WHERE "commandName" = $6 AND "userId" = $7;
`, [commandInfo.commandValue, commandInfo.url, commandInfo.noEmbed, commandInfo.noTitle,
  commandInfo.forceImage, commandName, userID]);

/**
 * deletes a custom client command.
 * @param commandName the command's name.
 * @param userID the user's ID
 * @returns {Promise<Promise<*>|*>}
 */
const deleteClientCustomCommand = async (commandName, userID) => poolQuery(`
  DELETE 
  FROM "clientsCommandsTable" 
  WHERE "commandName" = $1 AND "userId" = $2;
`, [commandName, userID]);

/**
 * list all the client commands ordered.
 * @param userID the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const listClientCommandsOrdered = async userID => poolQuery(`
  SELECT * 
  FROM "clientsCommandsTable" 
  WHERE "userId" = $1
  ORDER BY "commandName";
`, [userID]);

module.exports = {
  setClientCustomCommand,
  getClientCommand,
  updateClientCustomCommand,
  deleteClientCustomCommand,
  listClientCommandsOrdered,
};
