CREATE TABLE IF NOT EXISTS "clientsNotesTable" (
  id SERIAL PRIMARY KEY,
  "targetId" varchar(32) NOT NULL,
  "note" varchar(256),

  "userId" varchar(32) NOT NULL REFERENCES "clientsTable" ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE("userId", "targetId")
);
