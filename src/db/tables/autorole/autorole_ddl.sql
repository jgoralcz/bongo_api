CREATE TABLE IF NOT EXISTS "guildsAutoRoleTable" (
    "roleId" varchar(32) NOT NULL,
    "guildId" varchar(32) NOT NULL REFERENCES "guildsTable" ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("roleId", "guildId")
);
