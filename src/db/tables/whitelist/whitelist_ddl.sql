-- this needs to change because an enum is not really good.

DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('discord_user', 'role', 'channel', 'guild');
    END IF;
  END
$$

CREATE TABLE IF NOT EXISTS whitelist_table (
  whitelist_user_id varchar(32) PRIMARY KEY NOT NULL UNIQUE,
  type user_type NOT NULL,
  whitelist text ARRAY
);
