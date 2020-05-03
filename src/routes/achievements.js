const route = require('express-promise-router')();

const { updateClientsSnipe, checkSnipe } = require('../db/tables/clients/clients_table');

route.get('/snipes/users/:userID', async (req, res) => {
  const { userID } = req.params;

  const queryUser = await checkSnipe(userID);
  if (!queryUser || queryUser.length <= 0 || !queryUser[0]) return res.status(404).send({ error: `User ${userID} does not exist. You may need to POST a new user.` });

  return res.status(200).send(queryUser[0]);
});

route.patch('/snipes/users/:userID', async (req, res) => {
  const { userID } = req.params;
  const { sniped } = req.body;

  if (sniped !== true && sniped !== false) return res.status(400).send({ error: `Body expected boolean. Received: ${sniped}` });

  await updateClientsSnipe(userID, sniped);
  return res.status(204).send();
});


module.exports = route;
