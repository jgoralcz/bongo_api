CREATE TABLE IF NOT EXISTS clients_guilds_nicknames (
  id varchar(65) PRIMARY KEY,
  "userId" varchar(32) NOT NULL,
  "guildId" varchar(32) NOT NULL,
  nickname varchar(64) NOT NULL,
  date TIMESTAMP NOT NULL
);

CREATE INDEX cg_nicknames_date ON clients_guilds_nicknames(date);
