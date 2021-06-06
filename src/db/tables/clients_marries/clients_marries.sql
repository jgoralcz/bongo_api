CREATE TABLE IF NOT EXISTS clients_marries (
  id SERIAL PRIMARY KEY,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  -- marry_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  marry_id varchar(32),
  created_at timestamp DEFAULT NOW() not null,
  
  UNIQUE(user_id, marry_id)
);
