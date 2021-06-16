const { poolQuery } = require('../../index');

const insertSeriesAppearsIn = async (seriesID, seriesAppearsInID) => poolQuery(`
  INSERT INTO waifu_schema.series_appears_in_series (series_id, series_appears_in_id)
  VALUES ($1, $2)
  
  ON CONFLICT(series_id, series_appears_in_id)
  DO NOTHING;
`, [seriesID, seriesAppearsInID]);

const deleteSeriesAppearsIn = async (seriesID, seriesAppearsInID) => poolQuery(`
  DELETE
  FROM waifu_schema.series_appears_in_series
  WHERE series_id = $1 AND series_appears_in_id = $2
  RETURNING *;
`, [seriesID, seriesAppearsInID]);

const getSeriesAppearsIn = async (seriesID) => poolQuery(`
  SELECT series_appears_in_id, name
  FROM waifu_schema.series_appears_in_series wssais
  JOIN waifu_schema.serieS_table wsst ON wsst.id = wssais.series_appears_in_id
  WHERE wssais.series_id = $1
`, [seriesID]);

module.exports = {
  insertSeriesAppearsIn,
  deleteSeriesAppearsIn,
  getSeriesAppearsIn,
};
