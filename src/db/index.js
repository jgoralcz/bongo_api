const { Pool } = require('pg');

const {
  db: {
    user, host, database, password, port, max, connectionTimeoutMillis, idleTimeoutMillis,
  },
} = require('../../config.json');

const pool = new Pool({
  user,
  host,
  database,
  password,
  port,
  max,
  connectionTimeoutMillis,
  idleTimeoutMillis,
});

/**
 * pool query function
 * @param {string} query the query to use against
 * @param {array<string>} paramsArray
 * @returns {Promise<*>}
 */
const poolQuery = async (query, paramsArray) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, paramsArray);

    if (!result || !result.rows || !result.rowCount) return undefined;

    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  poolQuery,
};

// useful to restore 1 table
// pg_dump -d anime_data -t waifu_table > waifus.sql
// psql discordbot_datatest < /home/josh/waifus.sql OR \i /home/josh/waifus.sql
// DROP TABLE waifu_schema.waifu_table;
// ALTER TABLE waifu_table SET SCHEMA waifu_schema;
