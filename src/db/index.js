const { Pool } = require('pg');

const {
  db, db2: test,
} = require('../../config.json');

const pool = new Pool(db);
const poolTest = new Pool(test);

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

const poolQueryTest = async (query, paramsArray) => {
  const clientTest = await poolTest.connect();
  try {
    const result = await clientTest.query(query, paramsArray);

    if (!result || !result.rows || !result.rowCount) return undefined;

    return result.rows;
  } finally {
    clientTest.release();
  }
};

module.exports = {
  poolQuery,
  poolQueryTest,
};

// useful to restore 1 table
// pg_dump -d anime_data -t waifu_table > waifus.sql
// psql discordbot_datatest < /home/josh/waifus.sql OR \i /home/josh/waifus.sql
// DROP TABLE waifu_schema.waifu_table;
// ALTER TABLE waifu_table SET SCHEMA waifu_schema;
