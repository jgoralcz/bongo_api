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

const addClaimWaifuFail = async (userId, guildId) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = NULL
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userId, guildId]);

const resetRollsByUserID = async (userID, guildID) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET rolls_waifu = 0
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userID, guildID]);

const resetClaimByUserID = async (userID, guildID) => poolQuery(`
  UPDATE "clientsGuildsTable"
  SET claim_waifu = NULL
  WHERE "userId" = $1 AND "guildId" = $2;
`, [userID, guildID]);

const getClientsGuildsInfo = async (userId, guildId) => poolQuery(`
  SELECT cgt."userId", cgt."userId" AS "userID", cgt."guildId" AS "guildID", cgt."guildId",
    "guildPrefix", prefix, "prefixForAllEnable", daily, daily_gather, streak, rolls_waifu, claim_waifu, public_wish_list,
    patron, patron_one, patron_two, unlimited_claims, claim_seconds, wishlist_multiplier, rarity, "maxVolume", auto_now_play,
    autoplay, show_skips, "voteSkip", max_songs_per_user, anime_reactions, "bankPoints", streak_vote, vote_date,
    vote_enabled, auto_timeout, user_roll_claimed, play_first, roll_claim_minute, roll_claim_hour, sniped, achievement_aki, show_gender,
    achievement_reddit, achievement_search_anime, owoify, buy_rolls, buy_claims, gauntlet, show_waifu_rank, cropped_images,
    donut, pizza, cookie, fuel, stones, ramen, roll_game, roll_western, roll_anime, steal_character, roll_custom_only, banned_submission_date,
    anime_reactions_server, roll_western_server, cropped_images_server, roll_anime_server, claim_time_disappear, claim_other_rolls_seconds, music_leave_time_minutes,
    unlock_color, embed_color, nightcore_enabled, volume, bass_boost, webhook_url, webhook_name, use_my_image, bank_rolls, upgrade_disable_series_amount, upgrade_disable_characters_amount,
    upgrade_wishlist_series_amount, upgrade_wishlist_characters_amount, upgrade_user_rolls, upgrade_wishlist_chance_amount, upgrade_character_limit, set_upgrade_character_limit, upgrade_discount,
    set_upgrade_bot_image_nsfw, set_upgrade_bot_image_sfw, upgrade_bot_image, waifu_list_title
  FROM (
    SELECT "userId", "guildId", rolls_waifu, claim_waifu, public_wish_list
    FROM "clientsGuildsTable"
    WHERE "userId" = $1 AND "guildId" = $2
  ) cgt
  JOIN "clientsTable" ct ON cgt."userId" = ct."userId"
  JOIN "guildsTable" gt on cgt."guildId" = gt."guildId"
  LEFT JOIN bans_submissions bs on ct."userId" = bs.user_id;
`, [userId, guildId]);

const initializeGuildClient = async (userId, guildId) => poolQuery(`
  -- verify we insert into the "guildsTable"
  WITH cte AS (
    INSERT INTO "guildsTable" ("guildId")
    VALUES ($3)
    ON CONFLICT ("guildId") DO NOTHING
  )
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
  addClaimWaifuFail,
  resetRollsByUserID,
  resetClaimByUserID,
  getClientsGuildsInfo,
  initializeGuildClient,
  resetClaims,
  resetRolls,
  clearStreaks,
};
