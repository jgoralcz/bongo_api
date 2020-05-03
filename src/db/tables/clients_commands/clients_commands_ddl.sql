CREATE TABLE IF NOT EXISTS "clientsCommandsTable" (
  "userId" varchar(32) NOT NULL,
  "commandName" varchar(100) NOT NULL,
  "commandValue" TEXT NOT NULL,
  url TEXT,
  "noTitle" BOOLEAN NOT NULL DEFAULT FALSE,
  "noEmbed" BOOLEAN NOT NULL DEFAULT FALSE,
  "forceImage" BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY ("userId", "commandName")
);
