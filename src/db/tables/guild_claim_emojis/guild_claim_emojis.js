const { poolQuery } = require('../../index');

/**
* saves the guild emoji
* @param guildID the guild id
* @param emojiID the emoji id
* @returns {Promise<void>}
*/
const saveGuildClaimEmoji = async (guildID, emojiID) => poolQuery(`
  INSERT INTO guild_claim_emojis(guild_id, emoji_id) 
  VALUES ($1, $2)
  ON CONFLICT(guild_id, emoji_id)
  DO NOTHING;
`, [guildID, emojiID]);

/**
* removes the guild emoji
* @param guildID the guild id
* @param emojiID the emoji id
* @returns {Promise<void>}
*/
const removeGuildClaimEmoji = async (guildID, emojiID) => poolQuery(`
  DELETE FROM
  guild_claim_emojis
  WHERE guild_id = $1 AND emoji_id = $2;
`, [guildID, emojiID]);

/**
* get all the guild emojis
* @param guildID the guild id
* @returns {Promise<void>}
*/
const getAllGuildClaimEmojis = async (guildID) => poolQuery(`
  SELECT emoji_id
  FROM guild_claim_emojis
  WHERE guild_id = $1;
`, [guildID]);

// /**
// * get all the guild emojis
// * @param guildID the guild ID
// * @param emojiID the emoji's ID
// * @returns {Promise<void>}
// */
// const getGuildClaimEmoji = async (guildID, emojiID) => poolQuery(`
//     SELECT emoji_id
//     FROM guild_claim_emojis
//     WHERE guild_id = $1 AND emoji_id = $2;
// `, [guildID, emojiID]);

/**
* get all the guild emojis
* @param guildID the guild ID
* @returns {Promise<void>}
*/
const getRandomGuildClaimEmoji = async (guildID) => poolQuery(`
  SELECT emoji_id
  FROM guild_claim_emojis
  WHERE guild_id = $1
  ORDER BY random()
  LIMIT 1;
`, [guildID]);

module.exports = {
  saveGuildClaimEmoji,
  removeGuildClaimEmoji,
  getAllGuildClaimEmojis,
  // getGuildClaimEmoji,
  getRandomGuildClaimEmoji,
};
