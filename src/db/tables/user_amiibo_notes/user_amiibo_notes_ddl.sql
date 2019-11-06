CREATE TABLE IF NOT EXISTS user_amiibo_notes (
  id SERIAL PRIMARY KEY,
  amiibo_id INTEGER NOT NULL,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  note varchar(50),

  UNIQUE(amiibo_id, user_id)
);
