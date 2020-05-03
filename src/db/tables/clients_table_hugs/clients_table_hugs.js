const { poolQuery } = require('../../index');

/**
 * upserts the hug.
 * @param userID the user's id
 * @param receiverUserID the person who receives the hug
 * @returns {Promise<*>}
 */
const upsertHug = async (userID, receiverUserID) => poolQuery(`
  INSERT INTO clients_table_hugs (user_id, receiver_user_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, receiver_user_id) 
  DO NOTHING;
`, [userID, receiverUserID]);

/**
 * upserts the hug.
 * @param userID the user's id
 * @returns {Promise<*>}
 */
const getHugCount = async userID => poolQuery(`
  SELECT count(*) AS hugs
  FROM clients_table_hugs
  WHERE user_id = $1;
`, [userID]);

module.exports = {
  upsertHug,
  getHugCount,
};
