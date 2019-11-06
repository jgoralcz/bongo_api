CREATE TABLE IF NOT EXISTS "clientsGuildsTable" (
  id varchar(65) PRIMARY KEY NOT NULL,
  "userId" varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  "guildId" varchar(32) NOT NULL REFERENCES "guildsTable",
  "friendsFromServer" TEXT ARRAY,
  "totalFriends" INTEGER DEFAULT 0,
  "marryFromServer" TEXT ARRAY,
  "totalMarriages" INTEGER DEFAULT 0,
  daily BOOLEAN,
  streak INTEGER DEFAULT 0,
  streak_date timestamp,
  rolls_waifu SMALLINT DEFAULT 0,
  claim_waifu BOOLEAN,
  public_wish_list BOOLEAN DEFAULT FALSE,
  anime_rolls BOOLEAN DEFAULT TRUE,
  latest_roll_date timestamp

  UNIQUE("userId", "guildId")
);
-- TODO: normalize friendsFromServer an marryFromServer
CREATE UNIQUE INDEX IF NOT EXISTS client_guild ON "clientsGuildsTable"("userId", "guildId");
CREATE INDEX IF NOT EXISTS idx_claim_waifu ON "clientsGuildsTable"(claim_waifu);
CREATE INDEX IF NOT EXISTS idx_rolls_waifu ON "clientsGuildsTable"(rolls_waifu);
CREATE INDEX IF NOT EXISTS idx_total_friends ON "clientsGuildsTable"("totalFriends");
CREATE INDEX IF NOT EXISTS idx_total_f ON "clientsGuildsTable"("totalMarriages");
CREATE INDEX IF NOT EXISTS idx_cg_date ON "clientsGuildsTable"(latest_roll_date);
