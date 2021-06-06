CREATE TABLE IF NOT EXISTS clients_disable_characters (
  id SERIAL NOT NULL PRIMARY KEY,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable"("userId") ON UPDATE CASCADE ON DELETE CASCADE,
  character_id INTEGER NOT NULL,
  created_at timestamp DEFAULT NOW(),
  -- TODO: reference
  -- character_id INTEGER NOT NULL REFERENCES waifu_schema.waifu_table(id) ON UPDATE CASCADE ON DELETE CASCADE,

  UNIQUE (user_id, character_id)
);
