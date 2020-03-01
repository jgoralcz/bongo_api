const { poolQuery } = require('../../index');

/**
 * increments the paid respects today.
 * @returns {Promise<void>}
 */
const incrementRespectsToday = async () => {
  const query = await poolQuery(`
    UPDATE state
    SET respects_paid_today = respects_paid_today + 1
    RETURNING respects_paid_today AS rpt;
  `, []);

  if (query && query.rowCount > 0 && query.rows[0]) return query.rows[0].rpt;
  return 1;
};

const getNowDatabase = async () => poolQuery(`
  SELECT NOW() AS now;
`, []);

// const resetRespectsToday = async () => poolQuery(`
//   UPDATE state
//   SET respects_paid_today = 0;
// `, []);

module.exports = {
  incrementRespectsToday,
  getNowDatabase,
};
