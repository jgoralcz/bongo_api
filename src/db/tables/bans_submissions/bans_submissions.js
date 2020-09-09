const { poolQuery } = require('../../index');

const banSubmissionUser = async (userID) => poolQuery(`
  INSERT INTO bans_submissions(user_id)
  VALUES ($1)
  ON CONFLICT (user_id) DO NOTHING;
`, [userID]);

const unbanSubmissionUser = async (userID) => poolQuery(`
  DELETE
  FROM bans_submissions
  WHERE user_id = $1
  RETURNING *;
`, [userID]);

module.exports = {
  banSubmissionUser,
  unbanSubmissionUser,
};
