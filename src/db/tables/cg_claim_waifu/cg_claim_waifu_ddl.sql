CREATE TABLE IF NOT EXISTS cg_claim_waifu_table (
  id SERIAL PRIMARY KEY,
  guild_user_id varchar(65) NOT NULL REFERENCES "clientsGuildsTable" ON UPDATE CASCADE,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON UPDATE CASCADE,
  guild_id varchar(32) NOT NULL REFERENCES "guildsTable" ON UPDATE CASCADE,
  waifu_id INTEGER,
  favorite BOOLEAN DEFAULT FALSE,
  date timestamp
);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_claim_waifu AS SELECT user_id AS "userId", count(waifu_id) AS top
  FROM cg_claim_waifu_table
  GROUP BY "userId"
  ORDER BY top DESC
  LIMIT 20;

CREATE UNIQUE INDEX IF NOT EXISTS cg_claim_waifu_table_waifu_id_guild_id_idx ON cg_claim_waifu_table(user_id, guild_id, waifu_id);
CREATE INDEX IF NOT EXISTS cg_claim_waifu_table_waifu_id_guild_id_idx ON cg_claim_waifu_table(waifu_id, guild_id);
CREATE INDEX IF NOT EXISTS idx_cg_claim_guild_id ON cg_claim_waifu_table(guild_id);
CREATE INDEX IF NOT EXISTS idx_cg_claim_guild_id_user_id ON cg_claim_waifu_table(user_id, guild_id);
