const { poolQuery } = require('../../index');

/**
 * gets the user's blacklist series
 * @param userID the user's id.
 * @returns {Promise<*>}
 */
const getBlacklistSeriesUser = async (userID) => poolQuery(`
  SELECT series_id
  FROM clients_disable_series
  WHERE user_id = $1;
`, [userID]);

/**
 * gets the user's blacklist series
 * @param userID the user's id.
 * @returns {Promise<*>}
 */
const getBlacklistSeriesUserCount = async (userID) => {
  const result = await poolQuery(`
    SELECT count(series_id)
    FROM clients_disable_series
    WHERE user_id = $1;
  `, [userID]);

  if (result && result.rows && result.rows[0]) {
    return result.rows[0].count;
  }
  return 0;
};

/**
* gets the user's blacklist series
* @param userID the user's id.
* @param offset the offset to page by.
* @param limit the limit to page by.
* @returns {Promise<*>}
*/
const getBlacklistSeriesUserPage = async (userID, offset, limit) => poolQuery(`
  SELECT url, name
  FROM  (
    SELECT series_id
    FROM clients_disable_series
    WHERE user_id = $1
    LIMIT $3 OFFSET $2
  ) cds
  JOIN waifu_schema.series_table wsws ON cds.series_id = wsws.id;
`, [userID, offset, limit]);

// /**
//  * gets a specific blacklisted series by the user.
//  * @param userID the user's id.
//  * @param seriesID the series's id.
//  * @returns {Promise<void>}
//  */
// const getSpecificBlacklistSeriesUser = async (userID, seriesID) => poolQuery(`
//   SELECT null
//   FROM clients_disable_series
//   WHERE user_id = $1 AND series_id = $2;
// `, [userID, seriesID]);

/**
 * tests if the  the user's custom playlist exists.
 * @param userID the user's id.
 * @param seriesID the series to blacklist
 * @returns {Promise<*>}
 */
const addBlacklistSeriesUser = async (userID, seriesID) => poolQuery(`
  INSERT INTO clients_disable_series(user_id, series_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, series_id)
  DO NOTHING;
`, [userID, seriesID]);

/**
* removes the blacklisted series user.
* @param userID the user's id.
* @param seriesID the series to remove.
* @returns {Promise<*>}
*/
const removeBlacklistSeriesUser = async (userID, seriesID) => poolQuery(`
  DELETE FROM clients_disable_series
  WHERE user_id = $1 AND series_id = $2;
`, [userID, seriesID]);

/**
 * gets all the disabled series
 * @param userID the user's id.
 * @param name the name to search for.
 * @returns {Promise<*>}
 */
const getAllDisabledSeriesByName = async (userID, name) => poolQuery(`
  SELECT name, url, series_id AS id
  FROM (
    SELECT series_id
    FROM clients_disable_series cgs
    WHERE user_id = $1
  ) cgs
  JOIN waifu_schema.series_table wsst on wsst.id = cgs.series_id
  WHERE f_unaccent(name) ILIKE '%' || $2 || '%' OR levenshtein(f_unaccent(name), $2) <= 3;
`, [userID, name]);

module.exports = {
  getBlacklistSeriesUser,
  getBlacklistSeriesUserCount,
  getBlacklistSeriesUserPage,
  // getSpecificBlacklistSeriesUser,
  addBlacklistSeriesUser,
  removeBlacklistSeriesUser,
  getAllDisabledSeriesByName,
};
