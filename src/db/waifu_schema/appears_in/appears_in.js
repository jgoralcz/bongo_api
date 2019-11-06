const { poolQuery } = require('../../index');
/**
 * appears in
 * @param waifuID the waifu's id
 * @param seriesID the serie's id
 * @returns {Promise<void>}
 */
const insertAppearsIn = async (waifuID, seriesID) => {
  // eslint-disable-next-line no-console
  console.log(`inserting (${waifuID}, ${seriesID})`);
  return poolQuery(`
    INSERT INTO waifu_schema.appears_in (waifu_id, series_id)
    VALUES ($1, $2)
    
    ON CONFLICT(waifu_id, series_id)
    DO NOTHING;
`, [waifuID, seriesID]);
};


module.exports = {
  insertAppearsIn,
};
