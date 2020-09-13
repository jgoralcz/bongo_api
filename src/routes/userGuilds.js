const route = require('express-promise-router')();

const { getClientInfo } = require('../db/tables/clients/clients_table');
const { initializeGuildClient } = require('../db/tables/clients_guilds/clients_guilds_table');

route.post('/', async (req, res) => {
  const { userID, guildID } = req.body;

  const queryUser = await getClientInfo(userID);
  if (!queryUser || queryUser.length <= 0 || !queryUser[0]) return res.status(404).send({ error: `User ${userID} does not exist. You may need to POST a new user.` });

  const query = await initializeGuildClient(userID, guildID);
  if (!query || query.length <= 0 || !query[0]) return res.status(500).send({ error: `User ${userID} with guild ${guildID} could not be created.` });

  return res.status(201).send(query[0]);
});


module.exports = route;
