const { poolQuery } = require('../../index');

const insertSeriesNicknameByID = async (seriesID, nickname) => poolQuery(`
  INSERT INTO waifu_schema.series_nicknames(series_id, nickname)
  VALUES ($1, $2)
  ON CONFLICT (series_id, nickname) DO NOTHING
  RETURNING *;
`, [seriesID, nickname]);

const updateSeriesNicknameByID = async (id, newNickname) => poolQuery(`
  UPDATE waifu_schema.series_nicknames
  SET nickname = $2, updated_at = NOW()
  WHERE id = $1
  RETURNING *;
`, [id, newNickname]);

const deleteSeriesNicknameByID = async (id) => poolQuery(`
  DELETE
  FROM waifu_schema.series_nicknames
  WHERE id = $1
  RETURNING *;
`, [id]);

const getSeriesNicknames = async (name) => poolQuery(`
  SELECT id, name, nicknames, nicknames_search
  FROM (
    SELECT wsst.name, wsst.id, json_object_agg(wssn.id, wssn.nickname) nicknames,
    COALESCE(array_remove(array_agg(DISTINCT(wssn.nickname)), NULL), '{}') AS nicknames_search
    FROM (
      SELECT id, series_id, nickname
      FROM waifu_schema.series_nicknames wssn
      WHERE f_unaccent(nickname) ILIKE '%' || f_unaccent($1) || '%'
      ORDER BY
        CASE
          WHEN f_unaccent(nickname) ILIKE f_unaccent($1) || '%' THEN 0
          WHEN f_unaccent(nickname) ILIKE '%' || f_unaccent($1) || '%' THEN 1
        ELSE 2 END, wssn.nickname
    ) wssn
    JOIN waifu_schema.series_table wsst ON wsst.id = wssn.series_id
    GROUP BY wsst.name, wsst.id
  ) t1
  ORDER BY
    CASE
      WHEN f_unaccent($1) ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames_search) ), ' ')) ) THEN 1
      WHEN f_unaccent($1) || '%' ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames_search) ), ' ')) ) THEN 2
      WHEN '%' || f_unaccent($1) || '%' ILIKE ANY ( SELECT UNNEST( string_to_array(f_unaccent( UNNEST(nicknames_search) ), ' ')) ) THEN 3
    ELSE 4 END, name
  LIMIT 40;
`, [name]);

module.exports = {
  insertSeriesNicknameByID,
  updateSeriesNicknameByID,
  deleteSeriesNicknameByID,
  getSeriesNicknames,
};
