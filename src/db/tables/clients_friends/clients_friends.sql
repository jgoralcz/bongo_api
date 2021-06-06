CREATE TABLE IF NOT EXISTS clients_friends (
  id SERIAL PRIMARY KEY,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  -- friend_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  friend_id varchar(32),
  created_at timestamp DEFAULT NOW() not null,
  
  UNIQUE(user_id, friend_id)
);
