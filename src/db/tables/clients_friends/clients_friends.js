const { poolQuery } = require('../../index');

const addUserFriend = async (userID, friendID) => poolQuery(`
  INSERT INTO clients_friends(user_id, friend_id)
  VALUES ($1, $2)
  ON CONFLICT(user_id, friend_id)
  DO NOTHING;
`, [userID, friendID]);

const removeUserFriend = async (userID, friendID) => poolQuery(`
  DELETE
  FROM clients_friends
  WHERE user_id = $1 AND friend_id = $2;
`, [userID, friendID]);

const getAllFriendUser = async (userID) => poolQuery(`
  SELECT user_id, friend_id
  FROM clients_friends
  WHERE user_id = $1
  ORDER BY created_at;
`, [userID]);

const getTopFriends = async () => poolQuery(`
  SELECT user_id, count(friend_id) AS top
  FROM clients_friends
  GROUP BY user_id
  ORDER BY top DESC
  LIMIT 20;
`, []);

const getTopServerFriends = async (guildID) => poolQuery(`
  SELECT user_id, count(friend_id) AS top
  FROM clients_friends
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
  addUserFriend,
  removeUserFriend,
  getAllFriendUser,
  getTopFriends,
  getTopServerFriends,
};
