const { poolQuery } = require('../../index');

/**
* sets the user's note
* @param userId the person adding the note
* @param targetId the target id to add the note to
* @param note the user's note
* @returns {Promise<*>}
*/
const setNote = async (userId, targetId, note) => poolQuery(`
  INSERT INTO "clientsNotesTable" ("userId", "targetId", "note")
  VALUES ($1, $2, $3)
  ON CONFLICT ("userId", "targetId") DO
  UPDATE SET "note" = $3;
`, [userId, targetId, note]);

/**
* gets the client's note based off the targeted user
* @param userId the user's id
* @param targetId the target's id
* @returns {Promise<*>}
*/
const getClientNoteInfo = async (userId, targetId) => poolQuery(`
  SELECT note
  FROM "clientsNotesTable"
  WHERE "userId" = $1 AND "targetId" = $2;
`, [userId, targetId]);

module.exports = {
  setNote,
  getClientNoteInfo,
};
