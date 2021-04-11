const { poolQuery } = require('../../index');

const getGuildsClaimsCharacter = async (guildID, characterID) => poolQuery(`
  SELECT COUNT(*)
  FROM cg_claim_waifu_table
  WHERE guild_id = $1 AND waifu_id = $2
`, [guildID, characterID]);

const getGuild = async (guildId) => poolQuery(`
  SELECT *
  FROM "guildsTable" 
  WHERE "guildId" = $1;
`, [guildId]);

const setupGuild = async (guildID) => poolQuery(`
  INSERT INTO "guildsTable" ("guildId")
  VALUES ($1)
  ON CONFLICT ("guildId") DO NOTHING
  RETURNING *;
`, [guildID]);

const updateGuildShowGender = async (guildID, showGender) => poolQuery(`
  UPDATE "guildsTable"
  SET show_gender = $2
  WHERE "guildId" = $1
  RETURNING show_gender AS "updatedBool";
`, [guildID, showGender]);

const updateGuildStealCharacter = async (guildID, stealCharacter) => poolQuery(`
  UPDATE "guildsTable"
  SET steal_character = $2
  WHERE "guildId" = $1
  RETURNING steal_character AS "updatedBool";
`, [guildID, stealCharacter]);

/**
 * gets the server queue info.
 * @param guildID the guild's id.
 * @param beginning the beginning to query from.
 * @param end the end to query from the array.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerQueuePagination = async (guildID, beginning, end) => {
  const query = await poolQuery(`
    SELECT array_length("serverQueue", 1) AS length,
      "serverQueue"[$2+1:$3] AS "serverQueue",
      voice_channel,
      seek,
      loop,
      shuffle,
      autoplay,
      shuffle_index,
      volume,
      music_channel,
      vote_skippers,
      "voteSkip",
      dj_only,
      bass_boost
    FROM "guildsTable"
    WHERE "guildId" = $1;
  `, [guildID, beginning, end]);
  if (query && query.rows[0] && query.rows[0].serverQueue) {
    return query.rows[0];
  }
  return undefined;
};

/**
 * sets the server queue
 * @param guildID the guild's id.
 * @param queue the new queue.
 * @returns {Promise<Promise<*>|*>}
 */
const updateServerQueue = async (guildID, queue) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = $2
  WHERE "guildId" = $1;
`, [guildID, queue]);

/**
 * sets the server queue
 * @param guildID the guild's id.
 * @param num the number to start at.
 * @param length the length to start at.
 * @returns {Promise<Promise<*>|*>}
 */
const splitCombineLoopQueue = async (guildID, num, length) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue"[$2:$3] || "serverQueue"[1:$2-1]
  WHERE "guildId" = $1;
`, [guildID, num, length]);

/**
 * sets the server queue
 * @param guildID the guild's id.
 * @param start the start position to keep
 * @param end the end position to keep
 * @returns {Promise<Promise<*>|*>}
 */
const keepServerQueueRange = async (guildID, start, end) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue"[$2:$3]
  WHERE "guildId" = $1
  RETURNING "serverQueue";
`, [guildID, start, end]);

/**
 * updates the loop status
 * @param guildID the guild's id.
 * @param loop the loop status to update.
 * @returns {Promise<Promise<*>|*>}
 */
const updateLoopStatus = async (guildID, loop) => poolQuery(`
  UPDATE "guildsTable"
  SET loop = $2
  WHERE "guildId" = $1;
`, [guildID, loop]);

/**
 * gets the json meta data belonging to the queue.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerQueueMeta = async (guildID) => poolQuery(`
  SELECT array_length("serverQueue", 1) AS length,
    voice_channel,
    seek,
    loop,
    shuffle,
    autoplay,
    shuffle_index,
    volume,
    music_channel,
    vote_skippers,
    "voteSkip",
    dj_only,
    bass_boost
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerQueueAndMeta = async (guildID) => poolQuery(`
  SELECT "serverQueue",
    array_length("serverQueue", 1) AS length,
    voice_channel,
    seek,
    loop,
    shuffle,
    autoplay,
    shuffle_index,
    volume,
    music_channel,
    vote_skippers,
    "voteSkip",
    dj_only
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * updates the queue with a specific position
 * @param guildID the guild's id.
 * @param position the position to move it tou
 * @param value the value to insert.
 * @returns {Promise<Promise<*>|*>}
 */
const insertIntoServerQueue = async (guildID, position, value) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue"[:$2+1] || $3::json || "serverQueue"[$2+2:]
  WHERE "guildId" = $1;
`, [guildID, position, value]);

/**
 * updates the queue with another queue, but in the front.
 * @param guildID the guild's id.
 * @param upsertQueue upsert the queue
 * @returns {Promise<Promise<*>|*>}
 */
const updateQueueFront = async (guildID, upsertQueue) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = $2 || "serverQueue"
  WHERE "guildId" = $1;
`, [guildID, upsertQueue]);

/**
 * updates the queue with another queue, but in the back of the queue.
 * @param guildID the guild's id.
 * @param upsertQueue upsert the queue
 * @returns {Promise<Promise<*>|*>}
 */
const updateQueueBack = async (guildID, upsertQueue) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue" || $2
  WHERE "guildId" = $1;
`, [guildID, upsertQueue]);

/**
 * clears the server queue meta.
 * @param guildID the guild's ID.
 * @returns {Promise<Promise<*>|*>}
 */
const cleanServerQueueMeta = async (guildID) => poolQuery(`
  UPDATE "guildsTable"
  SET loop = 'off',
    shuffle = false,
    autoplay = false,
    shuffle_index = 0,
    vote_skippers = '{}',
    dj_only = false,
    voice_channel = NULL,
    music_channel = NULL,
    volume = 100,
    seek = 0
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * clears the server queue meta.
 * @param guildID the guild's ID.
 * @param jsonObject the json object
 * @returns {Promise<Promise<*>|*>}
 */
const updateQueuePush = async (guildID, jsonObject) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue" || $2::json
  WHERE "guildId" = $1
  RETURNING array_length("serverQueue", 1) AS length;
`, [guildID, jsonObject]);

/**
 * updates the queue auto play
 * @param guildID the guild's ID.
 * @param autoplay the server's auto play option.
 * @returns {Promise<Promise<*>|*>}
 */
const updateQueueAutoPlay = async (guildID, autoplay) => poolQuery(`
  UPDATE "guildsTable"
  SET autoplay = $2
  WHERE "guildId" = $1;
`, [guildID, autoplay]);

/**
 * updates the queue shuffle
 * @param guildID the guild's ID.
 * @param shuffle the shuffle status
 * @returns {Promise<void>}
 */
const updateQueueShuffle = async (guildID, shuffle) => poolQuery(`
  UPDATE "guildsTable"
  SET shuffle = $2
  WHERE "guildId" = $1;
`, [guildID, shuffle]);

/**
 * clears the server queue meta.
 * @param guildID the guild's ID.
 * @param volume the server's volume.
 * @returns {Promise<Promise<*>|*>}
 */
const updateServerPlayerVolume = async (guildID, volume) => poolQuery(`
  UPDATE "guildsTable"
  SET volume = $2
  WHERE "guildId" = $1;
`, [guildID, volume]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerVoiceAndTextChannel = async (guildID) => poolQuery(`
  SELECT voice_channel, music_channel
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @param voiceChannelID the voice channel's ID.
 * @returns {Promise<Promise<*>|*>}
 */
const updateServerVoiceChannel = async (guildID, voiceChannelID) => poolQuery(`
  UPDATE "guildsTable"
  SET voice_channel = $2
  WHERE "guildId" = $1;
`, [guildID, voiceChannelID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @param textChannelID the voice channel's ID.
 * @returns {Promise<Promise<*>|*>}
 */
const updateServerTextChannel = async (guildID, textChannelID) => poolQuery(`
  UPDATE "guildsTable"
  SET music_channel = $2
  WHERE "guildId" = $1;
`, [guildID, textChannelID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerDJOnly = async (guildID) => poolQuery(`
  SELECT dj_only
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerDJOnlyAndVoiceChannel = async (guildID) => poolQuery(`
  SELECT dj_only, voice_channel
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * updates the server queue position.
 * @param guildID the guild's ID.
 * @param index the array index to manipulate.
 * @param updatedTrack the updated track
 * @returns {Promise<Promise<*>|*>}
 */
const upsertServerQueuePosition = async (guildID, index, updatedTrack) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue"[$2+1] = $3
  WHERE "guildId" = $1;
`, [guildID, index, updatedTrack]);

/**
 * removes the server queue position.
 * @param guildID the guild's ID.
 * @param index the array index to manipulate.
 * @returns {Promise<Promise<*>|*>}
 */
const removeServerQueuePosition = async (guildID, index) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue"[:$2] || "serverQueue"[$2+2:]
  WHERE "guildId" = $1;
`, [guildID, index]);

/**
 * removes the song from the queue then
 * adds one in the correct positionimmediately after
 * @param guildID the guild's id.
 * @param moveFrom the position to remove.
 * @param position the position to add to
 * @param track the track to move.
 * @returns {Promise<Promise<*>|*>}
 */
const moveServerQueueTrackTransaction = async (guildID, moveFrom, position, track) => poolQuery(`
  WITH cte AS (
    UPDATE "guildsTable"
    SET "serverQueue" = "serverQueue"[:$2] || "serverQueue"[$2+2:]
    WHERE "guildId" = $1
    RETURNING *
  )
  UPDATE "guildsTable"
  SET "serverQueue" = "serverQueue"[:$3+1] || $4::json || "serverQueue"[$3+2:]
  WHERE "guildId" = $1;
`, [guildID, moveFrom, position, track]);

// /**
//  * removes guild and affects all the foreign keys.
//  * @param guildId the guild's id
//  * @returns {Promise<*>}
//  */
// const removeGuild = async guildId => poolQuery(`
//   DELETE
//   FROM "guildsTable"
//   WHERE "guildId" = $1;
// `, [guildId]);

const updatePrefix = async (guildID, prefix, prefixForAllEnable) => poolQuery(`
  UPDATE "guildsTable"
  SET "guildPrefix" = $2, "prefixForAllEnable" = $3
  WHERE "guildId" = $1
`, [guildID, prefix, prefixForAllEnable]);

/**
 * updates the max volume
 * @param guildID the guild's id.
 * @param volumeNum the volume number to update to
 * @returns {Promise<*>}
 */
const updateMaxVolume = async (guildID, volumeNum) => poolQuery(`
  UPDATE "guildsTable"
  SET "maxVolume" = $2
  WHERE "guildId" = $1;
`, [guildID, volumeNum]);
/**
 *
 * updates the max volume
 * @param guildID the guild's id.
 * @param volume the volume number to update to.
 * @returns {Promise<*>}
 */
const updateQueueVolume = async (guildID, volume) => poolQuery(`
  UPDATE "guildsTable"
  SET volume = $2
  WHERE "guildId" = $1;
`, [guildID, volume]);

/**
 * updates the vote skip
 * @param voteNum updates the percentage needed to skip.
 * @param guildId the guild's id.
 * @returns {Promise<*>}
 */
const updateVoteSkip = async (voteNum, guildId) => poolQuery(`
  UPDATE "guildsTable"
  SET "voteSkip" = $1
  WHERE "guildId" = $2;
`, [voteNum, guildId]);

/**
 * updates the vote skip and seek to default.
 * @param guildId the guild's id.
 * @returns {Promise<*>}
 */
const resetVoteSkippersAndSeek = async (guildId) => poolQuery(`
  UPDATE "guildsTable"
  SET vote_skippers = '{}', seek = 0
  WHERE "guildId" = $1;
`, [guildId]);

const updateUnlimitedClaims = async (guildID, unlimitedClaims) => poolQuery(`
  UPDATE "guildsTable"
  SET unlimited_claims = $2
  WHERE "guildId" = $1
  RETURNING unlimited_claims AS "updatedBool";
`, [guildID, unlimitedClaims]);

/**
 * updates the guild claim seconds
 * @param guildID the guild id
 * @param seconds the number of seconds
 * @returns {Promise<*>}
 */
const updateGuildClaimSeconds = async (guildID, seconds) => poolQuery(`
  UPDATE "guildsTable"
  SET claim_seconds = $2
  WHERE "guildId" = $1;
`, [guildID, seconds]);

const updateGuildResetClaimsRollsMinutes = async (guildID, minutes) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_claim_minute = $2
  WHERE "guildId" = $1;
`, [guildID, minutes]);

const updateResetClaimsHour = async (guildID, hour) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_claim_hour = $2
  WHERE "guildId" = $1;
`, [guildID, hour]);

/**
 * updates the guild claim seconds
 * @param guildID the guild id
 * @param minutes the number of minutes
 * @returns {Promise<*>}
 */
const updateGuildResetClaimsRollsMinutesWait = async (guildID, minutes) => poolQuery(`
  UPDATE "guildsTable"
  SET wait_minutes = $2
  WHERE "guildId" = $1;
`, [guildID, minutes]);

/**
 * stores the queue as a backup incase bot restarts.
 * @param guildId the guild id
 * @param voteSkippersArray the id array of vote skippers
 * @returns {Promise<void>}
 */
const updateVoteSkippers = async (guildId, voteSkippersArray) => poolQuery(`
  UPDATE "guildsTable"
  SET vote_skippers = $2
  WHERE "guildId" = $1;
`, [guildId, voteSkippersArray]);

/**
 * stores the queue as a backup incase bot restarts.
 * @param guildId the guild id
 * @param jsonQueue the queue in json form
 * @returns {Promise<void>}
 */
const updateGuildQueue = async (guildId, jsonQueue) => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = $2
  WHERE "guildId" = $1;
`, [guildId, jsonQueue]);

/**
 * reset all the queues
 * @returns {Promise<void>}
 */
const resetAllQueue = async () => poolQuery(`
  UPDATE "guildsTable"
  SET queue = NULL
  WHERE queue IS NOT NULL;
`, []);

/**
 * updates the auto play
 * @param guildId the guild id
 * @param bool whether to set it to true or false.
 * @returns {Promise<void>}
 */
const updateAutoPlay = async (guildId, bool) => poolQuery(`
  UPDATE "guildsTable"
  SET autoplay = $2
  WHERE "guildId" = $1;
`, [guildId, bool]);

/**
 * updates the queue's bass boost.
 * @param guildId the guild's id
 * @param bassBoost boosts the player.
 * @returns {Promise<*>}
 */
const updateBassBoost = async (guildId, bassBoost) => poolQuery(`
  UPDATE "guildsTable"
  SET bass_boost = $2
  WHERE "guildId" = $1;
`, [guildId, bassBoost]);

/**
 * updates the shuffle index for a specific user.
 * @param guildID the guild's ID.
 * @param shuffleIndex the shuffle index.
 * @returns {Promise<Promise<*>|*>}
 */
const updateServerShuffleIndex = async (guildID, shuffleIndex) => poolQuery(`
  UPDATE "guildsTable"
  SET shuffle_index = $2
  WHERE "guildId" = $1;
`, [guildID, shuffleIndex]);

/**
 * when the bot restarts, get the queue and any other
 * info to make it seem like it had never happened.
 * @returns {Promise<void>}
 */
const restartBackupQueue = async () => poolQuery(`
  SELECT "guildId", shuffle_index, seek, volume, loop, shuffle, bass_boost, autoplay, voice_channel, music_channel
  FROM "guildsTable"
  WHERE array_length("serverQueue", 1) > 0;
`, []);

/**
 * selects the auto now play
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const getAutoPlay = async (guildId) => poolQuery(`
  SELECT autoplay
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * shows the auto now play when a new song is played.
 * @param guildID the guild id
 * @returns {Promise<Promise<*>|*>}
 */
const getAutoNowPlay = async (guildID) => poolQuery(`
  SELECT auto_now_play
  FROM "guildsTable"
  WHERE "guildId" = $1
`, [guildID]);

/**
 * selects the auto now play
 * IMPORTANT: postgres arrays start at 1.
 * @param guildId the guild id.
 * @param index the index to request
 * @returns {Promise<*>}
 */
const getServerQueueTrack = async (guildId, index) => {
  const query = await poolQuery(`
    SELECT
      CASE
        WHEN $2 >= 0 AND $2 <= array_length("serverQueue", 1)
          THEN "serverQueue"[$2+1]
      ELSE NULL
      END AS track
    FROM "guildsTable"
    WHERE "guildId" = $1;
  `, [guildId, index]);
  if (query && query.rowCount > 0 && query.rows[0] && query.rows[0].track) {
    return query.rows[0].track;
  }
  return undefined;
};

/**
 * selects the total time from the server's queue.
 * @param guildID the guild's id.
 * @returns {Promise<*>}
 */
const getServerQueueTime = async (guildID) => {
  const query = await poolQuery(`
    SELECT sum((json::json->'track'->'info'->>'length')::DECIMAL) AS time
    FROM (
      SELECT UNNEST("serverQueue") as json
      FROM "guildsTable"
      WHERE "guildId" = $1
    ) q;
  `, [guildID]);
  if (query && query.rowCount > 0 && query.rows[0] && query.rows[0].time) {
    return query.rows[0].time;
  }
  return 0;
};

/**
 * updates show skips
 * @param guildId the guild id
 * @param bool whether to set it to true or false.
 * @returns {Promise<void>}
 */
const updateShowSkippedSongs = async (guildId, bool) => poolQuery(`
  UPDATE "guildsTable"
  SET show_skips = $2
  WHERE "guildId" = $1;
`, [guildId, bool]);

/**
 * selects the show skips
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const getShowSkips = async (guildId) => poolQuery(`
  SELECT show_skips
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * updates the max songs per user.
 * @param guildID the guild's ID
 * @returns {Promise<*>}
 */
const selectDJOnly = async (guildID) => {
  const query = await poolQuery(`
    SELECT dj_only
    FROM "guildsTable"
    WHERE "guildId" = $1;
  `, [guildID]);
  if (query && query.rowCount > 0 && query.rows[0]) {
    return query.rows[0].dj_only;
  }
  return undefined;
};

/**
 * updates the current track seek time.
 * @param guildID the guild's id.
 * @param position the queue's position.
 * @returns {Promise<void>}
 */
const updateCurrentServerQueueTrackSeek = async (guildID, position) => poolQuery(`
  UPDATE "guildsTable"
  SET seek = $2, queue_last_updated = NOW()
  WHERE "guildId" = $1;
`, [guildID, position]);

/**
 * updates DJ only depending on user's request.
 * @param guildID the guild's id.
 * @param djOnly the dj only
 * @returns {Promise<void>}
 */
const updateDJOnly = async (guildID, djOnly) => poolQuery(`
  UPDATE "guildsTable"
  SET dj_only = $2
  WHERE "guildId" = $1;
`, [guildID, djOnly]);

/**
 * updates the max songs per user.
 * @param volumeNum the volume number.
 * @param guildId the guild's ID
 * @returns {Promise<*>}
 */
const updateMaxSongsPerUser = async (volumeNum, guildId) => poolQuery(`
  UPDATE "guildsTable"
  SET max_songs_per_user = $1
  WHERE "guildId" = $2;
`, [volumeNum, guildId]);

/**
 * updates the auto timeout.
 * @param guildID the guild's id.
 * @param autoTimeout whether to timeout or not
 */
const updateTimeOut = async (guildID, autoTimeout) => poolQuery(`
  UPDATE "guildsTable"
  SET auto_timeout = $2
  WHERE "guildId" = $1;
`, [guildID, autoTimeout]);

/**
 * updates the auto timeout.
 * @param guildID the guild's id.
 */
const getAutoLeave = async (guildID) => {
  const autoLeaveQuery = await poolQuery(`
    SELECT auto_timeout
    FROM "guildsTable"
    WHERE "guildId" = $1;
  `, [guildID]);

  return autoLeaveQuery.rows[0] && autoLeaveQuery.rows[0].auto_timeout;
};

/**
 * selects the auto now play
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const getMaxSongsPerUser = async (guildId) => poolQuery(`
  SELECT max_songs_per_user AS maxSongs, "serverQueue"
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildId]);

const updateGuildBuyRolls = async (guildID, buyRolls) => poolQuery(`
  UPDATE "guildsTable"
  SET buy_rolls = $2
  WHERE "guildId" = $1
  RETURNING buy_rolls AS "updatedBool";
`, [guildID, buyRolls]);

const updateRollCustomOnly = async (guildID, rollCustomOnly) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_custom_only = $2
  WHERE "guildId" = $1
  RETURNING roll_custom_only AS "updatedBool";
`, [guildID, rollCustomOnly]);

const updateGuildBuyClaims = async (guildID, buyClaims) => poolQuery(`
  UPDATE "guildsTable"
  SET buy_claims = $2
  WHERE "guildId" = $1
  RETURNING buy_claims AS "updatedBool";
`, [guildID, buyClaims]);

const updateGuildRarity = async (guildID, percentage) => poolQuery(`
  UPDATE "guildsTable"
  SET rarity = $2
  WHERE "guildId" = $1
  RETURNING *;
`, [guildID, percentage]);

const updateGuildWishlistMultiplier = async (guildID, multiplier) => poolQuery(`
  UPDATE "guildsTable"
  SET wishlist_multiplier = $2
  WHERE "guildId" = $1;
`, [guildID, multiplier]);

const updateClaimsRollsPatronsWaiting = async () => poolQuery(`
  UPDATE "guildsTable"
  SET roll_claim_minute = wait_minutes, wait_minutes = 0
  WHERE wait_minutes > 0;
`, []);

const clearStaleQueue = async () => poolQuery(`
  UPDATE "guildsTable"
  SET "serverQueue" = '{}', seek = 0
  WHERE queue_last_updated IS NOT NULL AND queue_last_updated < NOW() - INTERVAL '3 days';
`, []);

const updateGuildShowRankRollingWaifus = async (guildID, waifuRankBool) => poolQuery(`
  UPDATE "guildsTable"
  SET show_waifu_rank = $2
  WHERE "guildId" = $1
  RETURNING show_waifu_rank AS "updatedBool";
`, [guildID, waifuRankBool]);

const getAllWaifusByName = async (waifuName, guildID, limit = 100, userID, useDiscordImage = false) => poolQuery(`
  SELECT name, nsfw, series, husbando, unknown_gender, user_id, url, description, last_edit_by, last_edit_date,
    wt.id, original_name, origin, count, position, (
      SELECT
      CASE
      WHEN ct.cropped_images = TRUE AND ct.image_url_clean_path_extra IS NOT NULL THEN
        COALESCE (
          (
            SELECT json_build_object('url', image_url_clean_path_extra, 'nsfw', nsfw) AS user_image
            FROM (
              SELECT image_id
              FROM claim_waifu_user_images
              WHERE user_id = wt.user_id AND waifu_id = wt.id
            ) cwui
            JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
          ),
          (
            SELECT json_build_object('url', image_url_clean_path_extra, 'nsfw', nsfw) AS user_image
            FROM (
              SELECT image_id
              FROM claim_waifu_user_images
              WHERE user_id = $4 AND waifu_id = wt.id
            ) cwui
            JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
          )
        )
      ELSE
        COALESCE (
          (
            SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw) AS user_image
            FROM (
              SELECT image_id
              FROM claim_waifu_user_images
              WHERE user_id = wt.user_id AND waifu_id = wt.id
            ) cwui
            JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
          ),
          (
            SELECT json_build_object('url', image_url_path_extra, 'nsfw', nsfw) AS user_image
            FROM (
              SELECT image_id
              FROM claim_waifu_user_images
              WHERE user_id = $4 AND waifu_id = wt.id
            ) cwui
            JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
          )
        )
      END
    FROM (
      SELECT cropped_images, image_url_clean_path_extra, image_url_path_extra, nsfw
      FROM (
        SELECT image_id, user_id
        FROM claim_waifu_user_images
        WHERE user_id = $4 AND waifu_id = wt.id
      ) cwui
      JOIN waifu_schema.waifu_table_images wti ON wti.image_id = cwui.image_id
      JOIN "clientsTable" c ON c."userId" = cwui.user_id
    ) ct
  ) AS user_image,
  (
    SELECT
      CASE
      WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
        image_url
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $5 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $4
    ) ct
  ) AS image_url
  FROM (
    SELECT ws.name, (
      SELECT
        CASE ws.nsfw WHEN TRUE then TRUE
          ELSE wsst.nsfw
        END
    ) AS nsfw, ws.series, ws.husbando, ws.unknown_gender,
      cg.user_id, ws.image_url, ws.image_url_clean_discord, ws.image_url_clean, ws.url, ws.description,
      ws.id, ws.original_name, ws.origin, ws.last_edit_by, ws.last_edit_date
    FROM waifu_schema.waifu_table ws
    LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = ws.id AND guild_id = $2
    LEFT JOIN waifu_schema.series_table wsst ON wsst.id = ws.series_id
    WHERE ws.name ILIKE '%' || $1 || '%' OR levenshtein(ws.name, $1) <= 1
      OR ws.name ILIKE ANY (
        SELECT UNNEST(string_to_array($1 || '%', ' ')) AS name
      )
      OR (ws.original_name ILIKE '%' || $1 || '%' AND ws.original_name IS NOT NULL)
      OR (ws.romaji_name ILIKE '%' || $1 || '%' AND ws.romaji_name IS NOT NULL)
    ORDER BY
      CASE
      WHEN ws.name ILIKE $1 THEN 0
      WHEN ws.name ILIKE $1 || '%' THEN 1
      WHEN ws.name ILIKE '%' || $1 || '%' THEN 2
      WHEN ws.romaji_name ILIKE $1 THEN 3
      WHEN ws.romaji_name ILIKE $1 || '%' THEN 4
      WHEN ws.original_name ILIKE $1 THEN 5
      WHEN ws.original_name ILIKE $1 || '%' THEN 6
      WHEN levenshtein(ws.name, $1) <= 1 THEN 7
      ELSE 8 END, ws.name, ws.romaji_name, ws.original_name
    LIMIT $3
  ) wt
  LEFT JOIN mv_rank_claim_waifu mv ON mv.waifu_id = wt.id
  ORDER BY
    CASE
    WHEN name ILIKE $1 THEN 0
    WHEN name ILIKE $1 || '%' THEN 1
    WHEN name ILIKE '%' || $1 || '%' THEN 2
    WHEN original_name ILIKE $1 THEN 3
    WHEN name ILIKE ANY (
      SELECT UNNEST(string_to_array('%' || $1 || '%', ' ')) AS name
    ) THEN 4
    WHEN original_name ILIKE $1 THEN 5
    WHEN original_name ILIKE $1 || '%' THEN 6
    WHEN levenshtein(name, $1) <= 1 THEN 7
    ELSE 8 END, name, original_name
  LIMIT $3;
`, [waifuName, guildID, limit, userID, useDiscordImage]);

const getAllWaifusBySeries = async (waifuSeries, guildID, userID, useDiscordImage = false) => poolQuery(`
  SELECT name, nsfw, series, user_id, url, description, ws.id, original_name, origin, husbando, 
    unknown_gender, count, position, last_edit_by, last_edit_date,
  (
    SELECT
      CASE
      WHEN ct.cropped_images = FALSE OR image_url_clean IS NULL THEN
        image_url
      WHEN ct.cropped_images = TRUE AND ct.cropped_images = $4 AND image_url_clean_discord IS NOT NULL THEN
        image_url_clean_discord
      ELSE
        image_url_clean
      END
    FROM (
      SELECT 
        CASE
        WHEN ctt.cropped_images = TRUE OR gt.cropped_images_server THEN
          TRUE
        ELSE
          FALSE
        END AS cropped_images
      FROM "clientsTable" ctt
      JOIN "guildsTable" gt ON gt."guildId" = $2
      WHERE "userId" = $3
    ) ct
  ) AS image_url
  FROM (
    SELECT wswt.name, (
      SELECT
        CASE wswt.nsfw WHEN TRUE then TRUE
          ELSE wsst.nsfw
        END
    ) AS nsfw, wsst.name AS series, wswt.image_url, wswt.image_url_clean,
      wswt.image_url_clean_discord, wswt.url, wswt.description, wswt.id, wswt.original_name,
      wswt.origin, wswt.husbando, wswt.unknown_gender, wswt.last_edit_by, wswt.last_edit_date
    FROM (
      SELECT id, name, nsfw
      FROM waifu_schema.series_table
      WHERE name ILIKE '%' || $1 || '%'
        OR alternate_name ILIKE '%' || $1 || '%'
    ) wsst
    JOIN waifu_schema.waifu_table wswt ON wsst.id = wswt.series_id
  ) ws
  LEFT JOIN cg_claim_waifu_table cg ON cg.waifu_id = ws.id AND guild_id = $2
  LEFT JOIN mv_rank_claim_waifu mv ON mv.waifu_id = ws.id
  ORDER BY series ASC, name ASC
  LIMIT 1500;
`, [waifuSeries, guildID, userID, useDiscordImage]);

const getWaifusByTagGuildOwners = async (guildID, tag) => poolQuery(`
  SELECT distinct(wswt.id), name, nsfw, series, user_id, image_url, url, description, original_name, origin
  FROM (
      SELECT tag_id
      FROM waifu_schema.waifu_table_tag_type
      WHERE tag_name ILIKE '%' || $2 || '%'
  )  wswttt
  
  JOIN waifu_schema.waifu_table_tags wswtt ON wswtt.tag_id = wswttt.tag_id 
  JOIN waifu_schema.waifu_table wswt ON wswt.id = wswtt.waifu_id
  LEFT JOIN cg_claim_waifu_table cgcwt ON cgcwt.waifu_id = wswt.id AND cgcwt.guild_id = $1

  ORDER BY series DESC, name ASC
  LIMIT 1500;
`, [guildID, tag]);

/**
 * gets the count needed for the algorithm that handles rolling.
 * @param {string} guildID the guild ID (discord server ID)
 */
const getCountForServer = async (guildID) => poolQuery(`
  SELECT (
    SELECT count(DISTINCT(waifu_id)) AS claimed_characters
    FROM cg_claim_waifu_table
    WHERE guild_id = $1
  ), (
    SELECT count(*) AS custom_characters_count
    FROM guild_custom_waifus
    WHERE guild_id = $1
  ), (
    SELECT count AS character_count
    FROM mv_character_count
  ), (
    SELECT count(DISTINCT(waifu_id)) AS claimed_custom_characters
    FROM cg_custom_waifu_table
    WHERE guild_id = $1
  );
`, [guildID]);

const refreshCount = async () => poolQuery(`
  BEGIN;
  REFRESH MATERIALIZED VIEW mv_character_count;
  REFRESH MATERIALIZED VIEW mv_random_waifu_series;
  COMMIT;
`, []);

const updateGuildAnimeReactions = async (guildID, animeReactionsOnly) => poolQuery(`
  UPDATE "guildsTable"
  SET anime_reactions_server = $2
  WHERE "guildId" = $1
  RETURNING anime_reactions_server AS "updatedBool";
`, [guildID, animeReactionsOnly]);

const updateGuildWesternRolls = async (guildID, rollWestern) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_western_server = $2
  WHERE "guildId" = $1
  RETURNING roll_western_server AS "updatedBool";
`, [guildID, rollWestern]);

const updateGuildCroppedImages = async (guildID, croppedImagesOnly) => poolQuery(`
  UPDATE "guildsTable"
  SET cropped_images_server = $2
  WHERE "guildId" = $1
  RETURNING cropped_images_server AS "updatedBool";
`, [guildID, croppedImagesOnly]);

const updateGuildAnimeRolls = async (guildID, rollAnimeOnly) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_anime_server = $2
  WHERE "guildId" = $1
  RETURNING roll_anime_server AS "updatedBool";
`, [guildID, rollAnimeOnly]);

const updateGuildUserClaimSeconds = async (guildID, claimTimerDisappearInSeconds) => poolQuery(`
  UPDATE "guildsTable"
  SET claim_time_disappear = $2
  WHERE "guildId" = $1
  RETURNING claim_time_disappear AS "updatedBool";
`, [guildID, claimTimerDisappearInSeconds]);

const updateAllowOtherUsersToClaimAfterSeconds = async (guildID, seconds) => poolQuery(`
  UPDATE "guildsTable"
  SET claim_other_rolls_seconds = $2
  WHERE "guildId" = $1
  RETURNING claim_other_rolls_seconds AS "updatedBool";
`, [guildID, seconds]);

module.exports = {
  getGuild,
  setupGuild,
  // removeGuild,
  updatePrefix,
  updateMaxVolume,
  updateVoteSkip,
  updateUnlimitedClaims,
  updateGuildClaimSeconds,
  updateGuildResetClaimsRollsMinutes,
  updateGuildResetClaimsRollsMinutesWait,
  updateGuildRarity,
  updateGuildQueue,
  resetAllQueue,
  updateAutoPlay,
  restartBackupQueue,
  getAutoPlay,
  updateShowSkippedSongs,
  getShowSkips,
  updateMaxSongsPerUser,
  updateTimeOut,
  getAutoLeave,
  getMaxSongsPerUser,
  updateGuildBuyRolls,
  updateGuildBuyClaims,
  // getServerQueue,
  getServerQueueMeta,
  getServerQueueAndMeta,
  getServerVoiceAndTextChannel,
  getServerDJOnly,
  getServerDJOnlyAndVoiceChannel,
  cleanServerQueueMeta,
  updateServerPlayerVolume,
  updateQueueAutoPlay,
  updateQueuePush,
  insertIntoServerQueue,
  updateServerVoiceChannel,
  updateServerTextChannel,
  getServerQueueTrack,
  resetVoteSkippersAndSeek,
  upsertServerQueuePosition,
  removeServerQueuePosition,
  updateServerShuffleIndex,
  updateBassBoost,
  selectDJOnly,
  updateDJOnly,
  updateCurrentServerQueueTrackSeek,
  updateServerQueue,
  updateLoopStatus,
  keepServerQueueRange,
  updateVoteSkippers,
  getServerQueuePagination,
  getServerQueueTime,
  updateQueueShuffle,
  updateQueueVolume,
  updateQueueFront,
  updateQueueBack,
  splitCombineLoopQueue,
  moveServerQueueTrackTransaction,
  getAutoNowPlay,
  updateGuildWishlistMultiplier,
  updateClaimsRollsPatronsWaiting,
  clearStaleQueue,
  updateResetClaimsHour,
  updateGuildShowGender,
  updateGuildShowRankRollingWaifus,
  getAllWaifusByName,
  getWaifusByTagGuildOwners,
  getAllWaifusBySeries,
  getGuildsClaimsCharacter,
  updateGuildStealCharacter,
  updateRollCustomOnly,
  getCountForServer,
  refreshCount,
  updateGuildAnimeReactions,
  updateGuildWesternRolls,
  updateGuildCroppedImages,
  updateGuildAnimeRolls,
  updateGuildUserClaimSeconds,
  updateAllowOtherUsersToClaimAfterSeconds,
};
