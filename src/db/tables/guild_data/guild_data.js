const { poolQuery } = require('../../index');

/**
 * gets all the contents of the guild.
 * @param guildId the guild's ID.
 * @returns {Promise<*>}
 */
const getGuild = async guildId => poolQuery(`
  SELECT * FROM 
  "guildsTable" 
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * sets up a basic guild.
 * @param guildID the guild's ID.
 * @returns {Promise<*>}
 */
const setupGuild = async guildID => poolQuery(`
  INSERT INTO "guildsTable" ("guildId")
  VALUES ($1)
  ON CONFLICT ("guildId") DO NOTHING
  RETURNING *;
`, [guildID]);

/**
 * gets the server queue info.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerQueue = async (guildID) => {
  const query = await poolQuery(`
    SELECT "serverQueue"
    FROM "guildsTable"
    WHERE "guildId" = $1;
  `, [guildID]);
  if (query != null && query.rowCount > 0 && query.rows[0]) {
    return query.rows[0].serverQueue || [];
  }
  return [];
};

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
const getServerQueueMeta = async guildID => poolQuery(`
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
const getServerQueueAndMeta = async guildID => poolQuery(`
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
const cleanServerQueueMeta = async guildID => poolQuery(`
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
const getServerVoiceAndTextChannel = async guildID => poolQuery(`
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
const getServerDJOnly = async guildID => poolQuery(`
  SELECT dj_only
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildID]);

/**
 * gets the server queue and meta data.
 * @param guildID the guild's id.
 * @returns {Promise<Promise<*>|*>}
 */
const getServerDJOnlyAndVoiceChannel = async guildID => poolQuery(`
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

/**
 * enables the prefix so users can use their own prefix.
 * @param prefixForAllEnable the prefix to enable or disable.
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const enablePrefix = async (prefixForAllEnable, guildId) => poolQuery(`
  UPDATE "guildsTable" 
  SET "prefixForAllEnable" = $1 
  WHERE "guildId" = $2
`, [prefixForAllEnable, guildId]);


/**
 * sets the guild prefix.
 * @param guildPrefix the guild's prefix.
 * @param guildId the guild id.
 * @returns {Promise<*>}
 */
const setGuildPrefix = async (guildPrefix, guildId) => poolQuery(`
  UPDATE "guildsTable" 
  SET "guildPrefix" = $1 
  WHERE "guildId" = $2
`, [guildPrefix, guildId]);

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
const resetVoteSkippersAndSeek = async guildId => poolQuery(`
  UPDATE "guildsTable"
  SET vote_skippers = '{}', seek = 0
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * unlimited claims
 * @param guildID the guild id
 * @param unlimitedClaims whether to enable unlimited claims for a waifu or not
 * @returns {Promise<void>}
 */
const updateUnlimitedClaims = async (guildID, unlimitedClaims) => poolQuery(`
  UPDATE "guildsTable"
  SET unlimited_claims = $2
  WHERE "guildId" = $1;
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

/**
 * updates the guild claim seconds
 * @param guildID the guild id
 * @param minutes the number of minutes
 * @returns {Promise<*>}
 */
const updateGuildResetClaimsRollsMinutes = async (guildID, minutes) => poolQuery(`
  UPDATE "guildsTable"
  SET roll_claim_minute = $2
  WHERE "guildId" = $1;
`, [guildID, minutes]);

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
const getAutoPlay = async guildId => poolQuery(`
  SELECT autoplay
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * shows the auto now play when a new song is played.
 * @param guildID the guild id
 * @returns {Promise<Promise<*>|*>}
 */
const getAutoNowPlay = async guildID => poolQuery(`
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
const getShowSkips = async guildId => poolQuery(`
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
const getMaxSongsPerUser = async guildId => poolQuery(`
  SELECT max_songs_per_user AS maxSongs, "serverQueue"
  FROM "guildsTable"
  WHERE "guildId" = $1;
`, [guildId]);

/**
 * updates whether the server should buy rolls or not
 * @param guildID the guild's ID.
 * @param buyRolls whether the server should buy rolls or not
 * @returns {Promise<*>}
 */
const updateGuildBuyRolls = async (guildID, buyRolls) => poolQuery(`
  UPDATE "guildsTable"
  SET buy_rolls = $2
  WHERE "guildId" = $1;
`, [guildID, buyRolls]);

/**
 * updates whether the server should buy claims or not
 * @param guildID the guild's ID.
 * @param buyClaims whether the server should buy claims or not
 * @returns {Promise<*>}
 */
const updateGuildBuyClaims = async (guildID, buyClaims) => poolQuery(`
  UPDATE "guildsTable"
  SET buy_claims = $2
  WHERE "guildId" = $1;
`, [guildID, buyClaims]);

const updateGuildRarity = async (guildID, percentage) => poolQuery(`
  UPDATE "guildsTable"
  SET rarity = $2
  WHERE "guildId" = $1;
`, [guildID, percentage]);

const updateGuildWishlistMultiplier = async (guildID, multiplier) => poolQuery(`
  UPDATE "guildsTable"
  SET wishlist_multiplier = $2
  WHERE "guildId" = $1;
`, [guildID, multiplier]);

module.exports = {
  getGuild,
  setupGuild,
  // removeGuild,
  enablePrefix,
  setGuildPrefix,
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
  getServerQueue,
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
};
