const { poolQuery } = require('../../index.js');

const upsertWhitelist = async (id, type, whitelistArray) => poolQuery(`
  INSERT INTO whitelist_table (whitelist_user_id, type, whitelist) VALUES ($1, $2, $3)
  ON CONFLICT(whitelist_user_id) DO
  UPDATE
    SET whitelist = $3 WHERE whitelist_table.whitelist_user_id = $1;
`, [id, type, whitelistArray]);

const getWhitelists = async (id) => poolQuery(`
  SELECT * FROM
  whitelist_table
  WHERE whitelist_user_id = $1;
`, [id]);

module.exports = {
  upsertWhitelist,
  getWhitelists,
};
