CREATE TABLE IF NOT EXISTS bot_guilds (
  bot_id varchar(32) PRIMARY KEY NOT NULL,
  guilds text[]
);
