const { poolQuery } = require('../../index');

const addUserMarry = async (userID, marryID) => poolQuery(`
  INSERT INTO clients_marries(user_id, marry_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, marry_id)
  DO NOTHING;
`, [userID, marryID]);

const removeUserMarry = async (userID, marryID) => poolQuery(`
  DELETE
  FROM clients_marries
  WHERE user_id = $1 AND marry_id = $2;
`, [userID, marryID]);

const getAllMarryUser = async (userID) => poolQuery(`
  SELECT user_id, marry_id
  FROM clients_marries
  WHERE user_id = $1
  ORDER BY created_at;
`, [userID]);

const getTopMarries = async () => poolQuery(`
  SELECT user_id, count(marry_id) AS top
  FROM clients_marries
  GROUP BY user_id
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerMarries = async (guildID) => poolQuery(`
  SELECT user_id, count(marry_id) AS top
  FROM clients_marries
  WHERE user_id IN (
    SELECT "userId" AS user_id
    FROM "clientsGuildsTable"
    WHERE "guildId" = $1
  )
  GROUP BY user_id
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);

module.exports = {
  addUserMarry,
  removeUserMarry,
  getAllMarryUser,
  getTopMarries,
  getTopServerMarries,
};
