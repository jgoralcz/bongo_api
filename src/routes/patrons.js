const route = require('express-promise-router')();

const {
  getPatronRolesUserID, resetGuildPatron,
  removePatron, resetSuperBongoPatron,
  insertPatron, updatePatronUser, updateGuildPatronOne,
  updateGuildPatronTwo, getPatronRoleID,
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

module.exports = route;
