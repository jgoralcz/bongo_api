const { poolQuery } = require('../../index');

const getPatronRoleID = async (patronName) => poolQuery(`
  SELECT patron_id
  FROM patron_ranks
  WHERE patron_name ILIKE $1;
`, [patronName]);

const getPatronRolesUserID = async (userID) => poolQuery(`
  SELECT patron_name, pt.patron_id, guild_id
  FROM (
    SELECT patron_id, guild_id
    FROM patron_table
    WHERE user_id = $1
  ) pt
  JOIN patron_ranks pr ON pr.patron_id = pt.patron_id;
`, [userID]);

const insertPatron = async (userID, patronID, guildID) => poolQuery(`
  INSERT INTO patron_table (user_id, patron_id, guild_id)
  VALUES ($1, $2, $3);
`, [userID, patronID, guildID]);

const removePatron = async (userID, patronID) => poolQuery(`
  DELETE
  FROM patron_table
  WHERE user_id = $1 AND patron_id = $2;
`, [userID, patronID]);

const updatePatronUser = async (userID, isPatron) => poolQuery(`
  UPDATE "clientsTable"
  SET patron = $2
  WHERE "userId" = $1;
`, [userID, isPatron]);

const updateGuildPatronOne = async (guildID, isPatron) => poolQuery(`
  UPDATE "guildsTable"
  SET patron_one = $2
  WHERE "guildId" = $1;
`, [guildID, isPatron]);

const updateGuildPatronTwo = async (guildID, isPatron) => poolQuery(`
  UPDATE "guildsTable"
  SET patron_two = $2
  WHERE "guildId" = $1;
`, [guildID, isPatron]);

const resetGuildPatron = async (guildID) => poolQuery(`
  UPDATE "guildsTable"
  SET patron_two = false, patron_one = false, rarity = 60, roll_claim_minute = 0, unlimited_claims = false
  WHERE "guildId" = $1;
`, [guildID]);

const resetSuperBongoPatron = async (userID) => poolQuery(`
  UPDATE "clientsTable"
  SET patron = false, user_roll_claimed = true
  WHERE "userId" = $1;
`, [userID]);

module.exports = {
  insertPatron,
  removePatron,
  getPatronRoleID,
  getPatronRolesUserID,
  updatePatronUser,
  updateGuildPatronOne,
  updateGuildPatronTwo,
  resetGuildPatron,
  resetSuperBongoPatron,
};
