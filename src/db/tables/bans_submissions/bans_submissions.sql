CREATE TABLE IF NOT EXISTS bans_submissions(
  id SERIAL PRIMARY KEY,
  user_id varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  banned_submission_date timestamp DEFAULT NOW(),
  
  UNIQUE (user_id)
);
