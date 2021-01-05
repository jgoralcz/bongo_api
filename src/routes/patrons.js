const route = require('express-promise-router')();

const { getAllGuildClaimCount } = require('../db/tables/cg_claim_waifu/cg_claim_waifu');
const { getGuild } = require('../db/tables/guild_data/guild_data');
const {
  getPatronRolesUserID,
  resetGuildPatron,
  removePatron,
  resetSuperBongoPatron,
  insertPatron,
  updatePatronUser,
  updateGuildPatronOne,
  updateGuildPatronTwo,
  getPatronRoleID,
  haremCopy,
} = require('../db/tables/patrons/patron_table');

const bongoNeko = 3;
const smolNeko = 4;

route.patch('/users/:id/guilds/reset', async (req, res) => {
  const { id } = req.params;
  const { patronID } = req.body;

  if (!id) return res.status(400).send({ error: 'Missing id.' });

  const rows = await getPatronRolesUserID(id);
  if (!rows || !rows.length) return res.status(404).send({ error: 'User does not have any patron roles.' });

  for (let i = 0; i < rows.length; i += 1) {
    const guildID = rows[i].guild_id;
    await resetGuildPatron(guildID);
  }

  if (!patronID) return res.status(400).send({ error: 'Missing patronID.' });
  await removePatron(id, patronID);

  return res.status(204).send();
});

route.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  const rows = await getPatronRolesUserID(id);
  if (!rows || rows.length <= 0) return res.status(404).send({ error: `Could not find patron with user id ${id}` });

  return res.status(200).send(rows);
});

route.patch('/users/:id/reset', async (req, res) => {
  const { id } = req.params;
  const { patronID } = req.body;

  if (!id) return res.status(400).send({ error: 'Missing id.' });
  await resetSuperBongoPatron(id);

  if (!patronID) return res.status(400).send({ error: 'Missing patronID.' });
  await removePatron(id, patronID);

  return res.status(204).send();
});

route.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { patronID } = req.body;

  if (!id) return res.status(400).send({ error: 'Missing id.' });
  if (!patronID) return res.status(400).send({ error: 'Missing patronID.' });

  await insertPatron(id, patronID, null);
  await updatePatronUser(id, true);

  return res.status(204).send();
});

route.patch('/users/:userID/guilds/:guildID', async (req, res) => {
  const { userID, guildID } = req.params;
  const { patronID } = req.body;

  if (!userID || !guildID) return res.status(400).send({ error: 'Missing userID or guildID.' });
  if (!patronID) return res.status(400).send({ error: 'Missing patronID.' });

  await insertPatron(userID, patronID, guildID);

  if (patronID === bongoNeko) {
    await updateGuildPatronTwo(guildID, true);
    return res.status(204).send();
  }

  if (patronID === smolNeko) {
    await updateGuildPatronOne(guildID, true);
    return res.status(204).send();
  }

  return res.status(404).send();
});

route.get('/id-by-name/:roleName', async (req, res) => {
  const { roleName } = req.params;

  const patronIDQuery = await getPatronRoleID(roleName);
  if (!patronIDQuery || !patronIDQuery[0] || !patronIDQuery[0].patron_id) return res.status(404).send({ error: `Cannot find role with name ${roleName}.` });

  const { patron_id: patronID } = patronIDQuery[0];
  return res.status(200).send({ patronID });
});

route.post('/haremcopy', async (req, res) => {
  const { oldServerID, newServerID } = req.body;

  if (!oldServerID || !newServerID) return res.status(400).send({ error: `Expected oldServerID and newServerID. Received ${JSON.stringify(req.body)}` });

  const newGuild = await getGuild(newServerID);
  if (!newGuild) return res.status(404).send({ error: `Server ${newServerID} does not exist` });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const guildCreatedTime = (new Date(newGuild.date_created)).getTime();

  if (guildCreatedTime < threeMonthsAgo.getTime()) return res.status(400).send({ error: `Server ${newServerID} is older than three months` });

  const rowsBefore = await getAllGuildClaimCount(newServerID);
  const countBefore = rowsBefore[0].count;

  await haremCopy(oldServerID, newServerID);

  const rowsAfter = await getAllGuildClaimCount(newServerID);
  const countAfter = await rowsAfter[0].count;

  if (countBefore <= countAfter) return res.status(500).send({ error: `Did not copy any from ${oldServerID} to ${newServerID}` });

  return res.status(200).send();
});

module.exports = route;
