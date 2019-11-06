const { poolQuery } = require('../../index.js');

/**
 * gets all the nicknames for a user to reset.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getAllNicknames = async guildID => poolQuery(`
  SELECT "userId", nickname
  FROM clients_guilds_nicknames
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * remove from the database the expired names, then update their names.
 * @param date the date to tet against.
 * @returns {Promise<Promise<*>|*>}
 */
const removeExpiredNicknames = async date => poolQuery(`
  DELETE
  FROM clients_guilds_nicknames
  WHERE date < $1
  RETURNING "userId", "guildId", nickname;
`, [date]);

/**
 * sets the nickname into the database.
 * @param guildID the guild's id.
 * @param userID the user's id.
 * @param nickname the nickname.
 * @param date the date of when to change back.
 * @returns {Promise<Promise<*>|*>}
 */
const setNickname = async (guildID, userID, nickname, date) => poolQuery(`
  INSERT INTO clients_guilds_nicknames (id, "userId", "guildId", nickname, date)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (id) DO NOTHING;
`, [`${guildID}-${userID}`, userID, guildID, nickname, date]);

// /**
//  * gets the user's nick name.
//  * @param guildID the guild's id.
//  * @param userID the user's id.
//  * @returns {Promise<Promise<*>|*>}
//  */
// const getUserNickName = async (guildID, userID) => poolQuery(`
//   SELECT nickname
//   FROM clients_guilds_nicknames
//   WHERE "guildId" = $1 AND "userId" = $2
// `, [guildID, userID]);


module.exports = {
  removeExpiredNicknames,
  setNickname,
  getAllNicknames,
};
