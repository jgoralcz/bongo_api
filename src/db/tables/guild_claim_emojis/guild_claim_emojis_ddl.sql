CREATE TABLE IF NOT EXISTS guild_claim_emojis (
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON UPDATE CASCADE,
  emoji_id varchar(32),

  PRIMARY KEY (guild_id, emoji_id)
);
