CREATE TABLE IF NOT EXISTS message_character (
  message_id varchar(32) PRIMARY KEY,
  -- waifu_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table ON DELETE CASCADE ON UPDATE CASCADE,
  -- TODO: decide if we should make 2 tables (1 for custom, 1 for ours)
  waifu_id INTEGER NOT NULL,
  is_custom_waifu BOOLEAN NOT NULL DEFAULT FALSE,
  date timestamp NOT NULL DEFAULT NOW(),
  user_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId"),
  unlock_embed_color BOOLEAN NOT NULL DEFAULT FALSE,
  claimable BOOLEAN NOT NULL DEFAULT TRUE
);
