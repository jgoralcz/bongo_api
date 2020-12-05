const route = require('express-promise-router')();

const { updateBotGuilds, getBotGuildsByGuildID } = require('../db/tables/bot_guilds/bot_guilds');

route.put('/patrons/guilds', async (req, res) => {
  const { botID, guilds } = req.body;
  if (!botID || !Array.isArray(guilds)) return res.status(400).send({ error: `expected botID and array of guilds. Received botID=${botID} guilds=${JSON.stringify(guilds)}` })

  await updateBotGuilds(botID, guilds);
  return res.status(204).send();
});

route.get('/patrons/guilds/:guildID', async (req, res) => {
  const { guildID } = req.params;

  const bots = await getBotGuildsByGuildID(guildID);
  if (!bots || bots.length <= 0) return res.status(404).send({ error: `No bots found for guildID ${guildID}` });

  const [bot] = bots;

  return res.status(200).send(bot);
});

module.exports = route;
