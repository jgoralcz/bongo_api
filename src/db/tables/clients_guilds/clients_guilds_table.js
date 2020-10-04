const { poolQuery } = require('../../index');

/**
* used for reaction images.
* @param guildID the guild's id
* @param userID the user's id
* @returns {Promise<*>}
*/
const updateClientAnimeRolls = async (guildID, userID) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET anime_rolls = NOT anime_rolls,
  WHERE "guildId" = $1 AND "userId" = $2;
`, [guildID, userID]);

const updateWishListVisibility = async (userID, guildID, visibility) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET public_wish_list = $3
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userID, guildID, visibility]);


const incrementClaimWaifuRoll = async (userID, guildID) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET rolls_waifu = rolls_waifu + 1, latest_roll_date = now()
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userID, guildID]);

/**
* increment the user's rolls
* @param userID the user's id.
* @param guildID the guild's id.
* @param amount the amount to set it to
* @returns {Promise<void>}
*/
const maxClaimWaifuRoll = async (userID, guildID, amount) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET rolls_waifu = $3
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userID, guildID, amount]);

const addClaimWaifuTrue = async (userId, guildId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = TRUE
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userId, guildId]);

const addClaimWaifuFalse = async (userId, guildId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = FALSE
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userId, guildId]);

const resetRollsByUserId = async (userId, guildId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET rolls_waifu = 0
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userId, guildId]);

/**
* resets the claim based off the user's id and guild id
* @param userId the user's id
* @param guildId the guild's id
* @returns {Promise<void>}
*/
const resetClaimByUserId = async (userId, guildId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = NULL
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userId, guildId]);

const resetRollsByIdVote = async (userId, guildId) => poolQuery(`                
  WITH cte AS (
    UPDATE "clientsGuildsTable"
    SET rolls_waifu = 0, claim_waifu = NULL
    WHERE "userId" = $1 AND "guildId" = $2
    RETURNING *
  )
  UPDATE "clientsTable"
  SET vote_enabled = NULL
  FROM cte
  
  WHERE "clientsTable"."userId" = $1
    AND vote_enabled IS NOT NULL;
`, [userId, guildId]);


// /**
// * get client guild points.
// * @param userId the user's id
// * @param guildId the guild's id
// * @returns {Promise<*>}
// */
// const getClientGuildPoints = async (userId, guildId) => poolQuery(`
//   SELECT points
//   FROM "clientsGuildsTable"
//   WHERE "userId" = $1 AND "guildId" = $2;
// `, [userId, guildId]);


const getTotalMemberDailies = async (userId) => poolQuery(`
  SELECT count(*) AS "totalDailies"
  FROM "clientsGuildsTable"
  WHERE "userId" = $1 AND daily IS NOT NULL;
`, [userId]);

const updateClientGuildDaily = async (userId, guildId, used, date, additionalPoints) => poolQuery(`
  WITH cte AS (
    UPDATE "clientsGuildsTable"
    SET daily = $3, streak = streak + 1, streak_date = $4
    WHERE "userId" = $1 AND "guildId" = $2
    RETURNING streak
  )
  UPDATE "clientsTable"
  SET "bankPoints" = 
    CASE WHEN cte.streak >= 30
      THEN "clientsTable"."bankPoints" + 3000 + 125 * 30 + $5
      ELSE "clientsTable"."bankPoints" + 3000 + 125 * cte.streak + $5
    END
  FROM cte
  WHERE "userId" = $1
  RETURNING "bankPoints", streak;
`, [userId, guildId, used, date, additionalPoints]);


/**
 * adds a friend to their friends list.
 * @param friendId the friend's id.
 * @param id the guild user id??
 * @param userId the user's id.
 * @param guildId the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const addFriend = async (friendId, id, userId, guildId) => poolQuery(`
  INSERT INTO "clientsGuildsTable" ("friendsFromServer", "id", "userId", "guildId")
  VALUES(ARRAY[$1]::TEXT[], $2, $3, $4)
  ON CONFLICT(id) DO
    UPDATE
    SET "friendsFromServer" = array_append("clientsGuildsTable"."friendsFromServer", $1::TEXT),
    "totalFriends" = "clientsGuildsTable"."totalFriends" + 1
    WHERE "clientsGuildsTable"."id" = $2;
`, [friendId, id, userId, guildId]);

/**
 * removes a friend from the list
 * @param friendId the friend's id.
 * @param userId the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const removeFriend = async (friendId, userId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET "friendsFromServer" = array_remove("friendsFromServer", $1), "totalFriends" = "totalFriends" - 1
  WHERE "userId" = $2;
`, [friendId, userId]);


/**
 * gets all friends belonging to a user.
 * @param userId the user's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getAllFriends = async (userId) => poolQuery(`
  SELECT array_agg(friends) AS "friendsFromServer"
  FROM (
    SELECT UNNEST("friendsFromServer") AS friends
    FROM "clientsGuildsTable"
    WHERE "userId" = $1
  ) sub;
`, [userId]);


/**
* get all the marriages and friends from a user.
* @param userId the user's id.
* @returns {Promise<*>}
*/
const getAllFriendsAndMarriages = async (userId) => poolQuery(`
  SELECT array_remove(array_agg(friends), NULL) AS "friendsFromServer", array_remove(array_agg(marriages), NULL) AS "marryFromServer"
  FROM (
    SELECT UNNEST("friendsFromServer") AS friends, UNNEST("marryFromServer") AS marriages
    FROM "clientsGuildsTable"
    WHERE "userId" = $1
  ) sub;
`, [userId]);

/**
 * gets x top members with friends
 * @returns {Promise<*>}
 */
const getTopFriends = async () => poolQuery(`
  SELECT "userId", SUM("totalFriends") AS top
  FROM "clientsGuildsTable"
  WHERE "totalFriends" > 2
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, []);

/**
 * gets x top server friends.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getTopServerFriends = async (guildID) => poolQuery(`
  SELECT "userId", "totalFriends" AS top
  FROM "clientsGuildsTable"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildID]);

/**
 * adds a marriage to the user's list.
 * @param marryId the user to add id.
 * @param id the combined id??
 * @param userId the user's id.
 * @param guildId the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const addMarriage = async (marryId, id, userId, guildId) => poolQuery(`
  INSERT INTO "clientsGuildsTable" ("marryFromServer", "id", "userId", "guildId")
  VALUES(ARRAY[$1]::TEXT[], $2, $3, $4)
  ON CONFLICT(id) DO
  UPDATE
  SET "marryFromServer" = array_append("clientsGuildsTable"."marryFromServer", $1::TEXT),
  "totalMarriages" = "clientsGuildsTable"."totalMarriages" + 1
  WHERE "clientsGuildsTable"."id" = $2;
`, [marryId, id, userId, guildId]);


/**
 * remove their marriage from the user's array
 * @param marryId the marry id.
 * @param id the user's id.
 * @returns {Promise<*>}
 */
const removeMarriage = async (marryId, id) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET "marryFromServer" = array_remove("marryFromServer", $1), 
  "totalMarriages" = "totalMarriages" - 1
  WHERE "userId" = $2;
`, [marryId, id]);

const getAllMarriages = async (userId) => poolQuery(`
SELECT array_agg(marriages) AS "marryFromServer"
  FROM (
    SELECT UNNEST("marryFromServer") AS marriages
    FROM "clientsGuildsTable"
    WHERE "userId" = $1
  ) sub;
`, [userId]);


/**
 * gets the x top marriages
 * @returns {Promise<*>}
 */
const getTopMarriages = async () => poolQuery(`
  SELECT "userId", SUM("totalMarriages") AS top
  FROM "clientsGuildsTable"
  WHERE "totalMarriages" > 2
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;
`, []);

/**
 * gets the top server marriages
 * @param guildId the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getTopServerMarriages = async (guildId) => poolQuery(`
  SELECT "userId", "totalMarriages" AS top
  FROM "clientsGuildsTable"
  WHERE "guildId" = $1
  ORDER BY top DESC
  LIMIT 20;
`, [guildId]);


/**
* get all client info based off id
* @param id the guild-user id key
* @returns {Promise<*>}
*/
const getClientsGuildsInfoById = async (id) => poolQuery(`
SELECT * 
FROM (
  SELECT *
  FROM "clientsGuildsTable"
  WHERE "id" = $1
) cgt
JOIN "clientsTable" ct ON cgt."userId" = ct."userId";
`, [id]);

const getClientsGuildsInfo = async (userId, guildId) => poolQuery(`
  SELECT cgt."userId", cgt."guildId", "guildPrefix", prefix, "prefixForAllEnable", daily, daily_gather, streak, rolls_waifu, claim_waifu, public_wish_list,
    patron, patron_one, patron_two, unlimited_claims, claim_seconds, wishlist_multiplier, rarity, "maxVolume", auto_now_play,
    autoplay, show_skips, "voteSkip", max_songs_per_user, anime_reactions, "bankPoints", streak_vote, vote_date,
    vote_enabled, auto_timeout, user_roll_claimed, play_first, roll_claim_minute, roll_claim_hour, sniped, achievement_aki, show_gender,
    achievement_reddit, achievement_search_anime, owoify, buy_rolls, buy_claims, gauntlet, show_waifu_rank, cropped_images,
    donut, pizza, cookie, fuel, stones, ramen, roll_game, roll_western, roll_anime, steal_character, roll_custom_only, banned_submission_date
  FROM (
    SELECT "userId", "guildId", daily, streak, rolls_waifu, claim_waifu, public_wish_list
    FROM "clientsGuildsTable"
    WHERE "userId" = $1 AND "guildId" = $2
  ) cgt
  JOIN "clientsTable" ct ON cgt."userId" = ct."userId"
  JOIN "guildsTable" gt on cgt."guildId" = gt."guildId"
  LEFT JOIN bans_submissions bs on cgt."userId" = bs.user_id;
`, [userId, guildId]);

const initializeGuildClient = async (userId, guildId) => poolQuery(`
  INSERT INTO "clientsGuildsTable" (id, "userId", "guildId")
  VALUES ($1, $2, $3)
  ON CONFLICT (id) DO NOTHING
  RETURNING *;
`, [`${guildId}-${userId}`, userId, guildId]);

const resetRolls = async (minute) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET rolls_waifu = 0
  WHERE rolls_waifu IS NOT NULL AND rolls_waifu > 0
    AND "guildId" IN (
      SELECT "guildId"
      FROM "guildsTable"
      WHERE "guildId" IS NOT NULL 
        AND roll_claim_minute IS NOT NULL
        AND roll_claim_minute = $1
  );
`, [minute]);

const resetClaims = async (hours, minute) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = NULL
  WHERE claim_waifu IS NOT NULL
    AND "guildId" IN (
      SELECT "guildId"
      FROM "guildsTable"
      WHERE "guildId" IS NOT NULL
        AND roll_claim_minute IS NOT NULL
        AND roll_claim_minute = $2
        AND roll_claim_hour IS NOT NULL
        AND MOD($1, roll_claim_hour) = 0
    );
`, [hours, minute]);

const clearStreaks = async () => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET streak = 0, streak_date = NULL
  WHERE streak_date <= NOW();
`, []);

module.exports = {
  updateClientAnimeRolls,
  updateWishListVisibility,
  incrementClaimWaifuRoll,
  maxClaimWaifuRoll,
  addClaimWaifuTrue,
  addClaimWaifuFalse,
  resetRollsByUserId,
  resetClaimByUserId,
  resetRollsByIdVote,
  // getClientGuildPoints,
  getTotalMemberDailies,
  updateClientGuildDaily,
  addFriend,
  removeFriend,
  getAllFriends,
  getAllFriendsAndMarriages,
  getTopFriends,
  getTopServerFriends,
  addMarriage,
  removeMarriage,
  getAllMarriages,
  getTopMarriages,
  getTopServerMarriages,
  getClientsGuildsInfoById,
  getClientsGuildsInfo,
  initializeGuildClient,
  resetClaims,
  resetRolls,
  clearStreaks,
};
