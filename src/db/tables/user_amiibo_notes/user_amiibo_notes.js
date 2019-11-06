const { poolQuery } = require('../../index.js');

/**
 * sets a user note for a specific amiibo
 * @param amiiboID the amiibo's id
 * @param userID the user's id
 * @param note the note to add to the amiibo.
 * @returns {Promise<*>}
 */
const setUserAmiiboNote = async (amiiboID, userID, note) => poolQuery(`
  INSERT INTO user_amiibo_notes(amiibo_id, user_id, note)
  VALUES ($1, $2, $3)
  ON CONFLICT (amiibo_id, user_id) DO 
    UPDATE SET note = $3;
`, [amiiboID, userID, note]);

/**
 * gets a user's note for a specific amiibo
 * @param amiiboID the amiibo's id
 * @param userID the user's id
 * @returns {Promise<*>}
 */
const getUserAmiiboNote = async (amiiboID, userID) => poolQuery(`
  SELECT note
  FROM user_amiibo_notes
  WHERE amiibo_id = $1 AND user_id = $2;
`, [amiiboID, userID]);

module.exports = {
  setUserAmiiboNote,
  getUserAmiiboNote,
};
