const { poolQuery } = require('../../index');

const insertAppearsIn = async (waifuID, seriesID) => poolQuery(`
  INSERT INTO waifu_schema.appears_in (waifu_id, series_id)
  VALUES ($1, $2)
  
  ON CONFLICT(waifu_id, series_id)
  DO NOTHING;
`, [waifuID, seriesID]);

const deleteAppearsIn = async (waifuID, seriesID) => poolQuery(`
  DELETE
  FROM waifu_schema.appears_in
  WHERE waifu_id = $1 AND series_id = $2
  RETURNING *;
`, [waifuID, seriesID]);

const getCharacterAppearsIn = async (characterID) => poolQuery(`
  SELECT series_id, name
  FROM waifu_schema.appears_in wsai
  JOIN waifu_schema.series_table wsst ON wsst.id = wsai.series_id
  WHERE wsai.waifu_id = $1;
`, [characterID]);

module.exports = {
  insertAppearsIn,
  deleteAppearsIn,
  getCharacterAppearsIn,
};
