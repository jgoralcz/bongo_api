const { poolQuery } = require('../../index.js');

/**
 * gets all auto roles belonging to this server
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const getAutoRoles = async guildID => poolQuery(`
  SELECT "roleId"
  FROM "guildsAutoRoleTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * checks if the auto role exists
 * @param roleID the role's id
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const autoRoleExists = async (roleID, guildID) => poolQuery(`
  SELECT * 
  FROM "guildsAutoRoleTable" 
  WHERE "roleId" = $1 AND "guildId" = $2;
`, [roleID, guildID]);

/**
 * gets all auto roles belonging to this server.
 * @param roleID the role's id
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const insertAutoRole = async (roleID, guildID) => poolQuery(`
  INSERT INTO "guildsAutoRoleTable" ("roleId", "guildId")
    VALUES ($1, $2);
`, [roleID, guildID]);

/**
 * removes an auto role from the server.
 * @param roleID the role's id
 * @param guildID the guild's id
 * @returns {Promise<*>}
 */
const removeAutoRole = async (roleID, guildID) => poolQuery(`
  DELETE 
  FROM "guildsAutoRoleTable" 
  WHERE "roleId" = $1 AND "guildId" = $2;
`, [roleID, guildID]);

module.exports = {
  getAutoRoles,
  autoRoleExists,
  insertAutoRole,
  removeAutoRole,
};
