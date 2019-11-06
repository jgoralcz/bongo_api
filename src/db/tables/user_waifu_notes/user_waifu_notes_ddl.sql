CREATE TABLE IF NOT EXISTS user_waifu_notes (
  id SERIAL PRIMARY KEY,
  waifu_id INTEGER,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  note varchar(50),

  UNIQUE(waifu_id, user_id)
)
