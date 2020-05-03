const { poolQuery } = require('../../index');

const saveGuildClaimEmoji = async (guildID, emojiID) => poolQuery(`
  INSERT INTO guild_claim_emojis(guild_id, emoji_id) 
  VALUES ($1, $2)
  ON CONFLICT(guild_id, emoji_id)
  DO NOTHING;
`, [guildID, emojiID]);

const removeGuildClaimEmoji = async (guildID, emojiID) => poolQuery(`
  DELETE FROM
  guild_claim_emojis
  WHERE guild_id = $1 AND emoji_id = $2;
`, [guildID, emojiID]);

const getAllGuildClaimEmojis = async (guildID) => poolQuery(`
  SELECT emoji_id
  FROM guild_claim_emojis
  WHERE guild_id = $1;
`, [guildID]);

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
