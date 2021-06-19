const { poolQuery } = require('../../index');

const addBlacklistSeriesUser = async (userID, seriesID) => poolQuery(`
  INSERT INTO clients_disable_series(user_id, series_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, series_id)
  DO NOTHING;
`, [userID, seriesID]);

const removeBlacklistSeriesUser = async (userID, seriesID) => poolQuery(`
  DELETE
  FROM clients_disable_series
  WHERE user_id = $1 AND series_id = $2;
`, [userID, seriesID]);

const getBlacklistSeriesUserCount = async (userID) => poolQuery(`
  SELECT count(*)
  FROM clients_disable_series
  WHERE user_id = $1;
`, [userID]);

const getBlacklistSeriesUserPage = async (userID, offset, limit) => poolQuery(`
  SELECT wsst.name, wsst.url, wsst.id
  FROM clients_disable_series cds
  JOIN waifu_schema.series_table wsst on wsst.id = cds.series_id
  WHERE user_id = $1
  ORDER BY wsst.name ASC
  LIMIT $3 OFFSET $2;
`, [userID, offset, limit]);

module.exports = {
  addBlacklistSeriesUser,
  removeBlacklistSeriesUser,
  getBlacklistSeriesUserCount,
  getBlacklistSeriesUserPage,
};
