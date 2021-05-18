const { poolQuery } = require('../../index');

const insertNicknameByID = async (characterID, nickname, spoiler) => poolQuery(`
  INSERT INTO waifu_schema.character_nicknames(character_id, nickname, is_spoiler)
  VALUES ($1, $2, $3)
  ON CONFLICT (character_id, nickname) DO NOTHING
  RETURNING *;
`, [characterID, nickname, spoiler]);

const updateNicknameByID = async (id, newNickname) => poolQuery(`
  UPDATE waifu_schema.character_nicknames
  SET nickname = $2, updated = NOW()
  WHERE id = $1
  RETURNING *;
`, [id, newNickname]);

const deleteNicknameByID = async (id) => poolQuery(`
  DELETE
  FROM waifu_schema.character_nicknames
  WHERE id = $1
  RETURNING *;
`, [id]);

const getNicknames = async (name) => poolQuery(`
  SELECT name, series, id, nicknames, nicknames_search
  FROM (
    SELECT wswt.name, wsst.name AS series, wswt.id, json_object_agg(wscn.id, wscn.nickname) nicknames,
    COALESCE(array_remove(array_agg(DISTINCT(wscn.nickname)), NULL), '{}') AS nicknames_search
    FROM (
      SELECT id, character_id, nickname
      FROM waifu_schema.character_nicknames wscn
      WHERE f_unaccent(nickname) ILIKE '%' || f_unaccent($1) || '%'
      ORDER BY
        CASE
          WHEN f_unaccent(nickname) ILIKE f_unaccent($1) || '%' THEN 0
          WHEN f_unaccent(nickname) ILIKE '%' || f_unaccent($1) || '%' THEN 1
        ELSE 2 END, wscn.nickname
    ) wscn
    JOIN waifu_schema.waifu_table wswt ON wswt.id = wscn.character_id
    JOIN waifu_schema.series_table wsst ON wsst.id = wswt.series_id
    GROUP BY wswt.name, wsst.name, wswt.id
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
  insertNicknameByID,
  updateNicknameByID,
  deleteNicknameByID,
  getNicknames,
};
