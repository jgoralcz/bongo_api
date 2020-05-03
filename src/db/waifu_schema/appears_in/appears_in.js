const logger = require('log4js').getLogger();

const { poolQuery } = require('../../index');
const { getSeries } = require('../../../db/waifu_schema/series/series_table');

const insertAppearsIn = async (waifuID, seriesID) => poolQuery(`
  INSERT INTO waifu_schema.appears_in (waifu_id, series_id)
  VALUES ($1, $2)
  
  ON CONFLICT(waifu_id, series_id)
  DO NOTHING;
`, [waifuID, seriesID]);

const insertSeries = async (waifuID, series) => {
  const sQuery = await getSeries(series).catch((error) => logger.error(error));
  if (sQuery && sQuery[0] && sQuery[0].id) {
    await insertAppearsIn(waifuID, sQuery[0].id).catch((error) => logger.error(error));
  }
};

module.exports = {
  insertAppearsIn,
  insertSeries,
};
