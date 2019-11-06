const { poolQuery } = require('../../index.js');

/**
 * gets all amiibos by the name.
 * @returns {Promise<*>}
 */
const getAllAmiiboNames = async () => poolQuery(`
  SELECT name, image_url, game_series AS series,
    count(*) OVER (PARTITION BY game_series) AS num
  FROM amiibo.amiibo_table
  ORDER BY series DESC, name ASC;
`, []);

/**
 * searches for an amibbo by the name or series
 * @param amiiboSearch the name or series of the amiibo
 * @returns {Promise<*>}
 */
const getAllAmiibosByNameOrSeries = async amiiboSearch => poolQuery(`
  SELECT *
  FROM amiibo.amiibo_table
  WHERE 
    name ILIKE '%' || $1 || '%' 
    OR levenshtein(name, $1) <= 3 
    OR game_series ILIKE '%' || $1 || '%' 
    OR amiibo_series ILIKE '%' || $1 || '%'
  ORDER BY
      CASE
      WHEN name ILIKE $1 || '%' THEN 0
      ELSE 1 END, name
  LIMIT 30;
`, [amiiboSearch]);

/**
 * searches for an amiibo by the name.
 * @param amiiboName the amiibo's name to search for.
 * @returns {Promise<*>}
 */
const getAllAmiibosByName = async amiiboName => poolQuery(`
  SELECT name, character, amiibo_series, game_series, image_url, id
  FROM amiibo.amiibo_table
  WHERE name ILIKE '%' || $1 || '%' OR levenshtein(name, $1) <= 3
  ORDER BY
    CASE
    WHEN name ILIKE $1 || '%' THEN 0
    ELSE 1 END, name
  LIMIT 50;
`, [amiiboName]);

/**
 * searches for an amiibo by the name.
 * @param amiiboName the amiibo's name to search for.
 * @returns {Promise<*>}
 */
const getRandomAmiibo = async amiiboName => poolQuery(`
  SELECT *
  FROM amiibo.amiibo_table
  ORDER BY random()
  LIMIT 1;
`, []);

// /**
//  * creates or updates a new amiibo based off the properties.
//  * @param amiibo the amiibo object.
//  * @returns {Promise<*>}
//  */
// const upsertAmiibo = async (amiibo) => {
//   const client = await pool.connect();
//   try {
//     return await client.query(`
//       INSERT INTO amiibo.amiibo_table (character, name, amiibo_series, game_series, head, tail, release_au, release_eu, release_jp,
//       release_na, type, image_url, image_file_path)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//
//       ON CONFLICT(image_url) DO UPDATE
//         SET character = $1, name = $2, amiibo_series = $3, game_series = $4, head = $5, tail = $6, release_au = $7, release_eu = $8,
//         release_jp = $9, release_na = $10, type = $11;
//       `,
//     [amiibo.character, amiibo.name, amiibo.amiibo_series, amiibo.game_series, amiibo.head,
//       amiibo.tail, amiibo.release_au, amiibo.release_eu, amiibo.release_jp, amiibo.release_na,
//       amiibo.type, amiibo.image_url, amiibo.image_file_path]);
//   } finally {
//     client.release();
//   }
// };

// /**
//  * gets an amiibo by the ID
//  * @returns {Promise<*>}
//  */
// const getAmiibosByID = async () => {
//   const client = await pool.connect();
//   try {
//     return await client.query(`
//        SELECT name, image_url, game_series AS series,
//           count(*) OVER (PARTITION BY game_series) AS num
//         FROM amiibo.amiibo_table
//         ORDER BY series DESC, name ASC;
//     `, []);
//   } finally {
//     client.release();
//   }
// };

module.exports = {
  // upsertAmiibo,
  getAllAmiiboNames,
  // getAmiiboByID,
  getAllAmiibosByNameOrSeries,
  getAllAmiibosByName,
  getRandomAmiibo,
};
