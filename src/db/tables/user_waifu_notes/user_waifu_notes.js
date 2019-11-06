const { poolQuery } = require('../../index.js');

/**
 * sets a note for a waifu
 * @param waifuID the waifus id number
 * @param userID the user's id
 * @param note the user's note.
 * @returns {Promise<*>}
 */
const setUserWaifuNote = async (waifuID, userID, note) => poolQuery(`
  INSERT INTO user_waifu_notes(waifu_id, user_id, note)
  VALUES ($1, $2, $3)
  ON CONFLICT (waifu_id, user_id) DO
    UPDATE SET note = $3;
`, [waifuID, userID, note]);

/**
 * gets a user's note for a specific waifu
 * @param waifuID the waifu's id
 * @param userID the user's id
 * @returns {Promise<*>}
 */
const getUserWaifuNote = async (waifuID, userID) => poolQuery(`
  SELECT note
  FROM user_waifu_notes
  WHERE waifu_id = $1 AND user_id = $2;
`, [waifuID, userID]);

module.exports = {
  setUserWaifuNote,
  getUserWaifuNote,
};
