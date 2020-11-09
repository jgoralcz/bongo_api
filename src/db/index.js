const { Pool } = require('pg');
const logger = require('log4js').getLogger();

const { api } = require('../util/constants/paths');
const nconf = require('nconf').file('api', api);
const db = nconf.get('db');

const pool = new Pool(db);

pool.on('error', (error) => {
  logger.error(error);
});

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
