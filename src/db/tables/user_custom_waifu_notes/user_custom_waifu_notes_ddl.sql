CREATE TABLE IF NOT EXISTS user_custom_waifu_notes (
  id SERIAL PRIMARY KEY,
  waifu_id INTEGER REFERENCES guild_custom_waifus(id),
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  note varchar(50),

  UNIQUE(waifu_id, user_id)
)
