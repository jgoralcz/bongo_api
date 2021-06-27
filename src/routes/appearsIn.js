const route = require('express-promise-router')();

const {
  insertAppearsIn,
  deleteAppearsIn,
  getCharacterAppearsIn,
} = require('../db/waifu_schema/appears_in/appears_in');

const {
  insertSeriesAppearsIn,
  deleteSeriesAppearsIn,
  getSeriesAppearsIn,
} = require('../db/waifu_schema/appears_in_series/appears_in_series');

route.put('/character-series', async (req, res) => {
  const { characterID, seriesID } = req.body;

  if (!characterID || isNaN(characterID) || !seriesID || isNaN(seriesID)) return res.status(400).send({ error: 'expected characterID and seriesID in body' });

  await insertAppearsIn(characterID, seriesID);
  return res.status(204).send();
});

route.get('/characters/:characterID', async (req, res) => {
  const { characterID } = req.params;

  const rows = await getCharacterAppearsIn(characterID);

  return res.status(200).send(rows);
});

route.delete('/characters/:characterID/appears-in/series/:seriesID', async (req, res) => {
  const { characterID, seriesID } = req.params;

  if (!characterID || isNaN(characterID) || !seriesID || isNaN(seriesID)) return res.status(400).send({ error: 'expected characterID and seriesID in params' });

  const rows = await deleteAppearsIn(characterID, seriesID);
  if (!rows || rows.length <= 0) {
    return res.status(404).send();
  }

  await deleteAppearsIn(characterID, seriesID);
  return res.status(204).send();
});

route.put('/series-series', async (req, res) => {
  const { seriesID, seriesAppearsInID } = req.body;

  if (!seriesID || isNaN(seriesID) || !seriesAppearsInID || isNaN(seriesAppearsInID)) return res.status(400).send({ error: 'expected seriesID and seriesAppearsInID in body' });

  await insertSeriesAppearsIn(seriesID, seriesAppearsInID);
  return res.status(204).send();
});

route.get('/series/:seriesID', async (req, res) => {
  const { seriesID } = req.params;

  const rows = await getSeriesAppearsIn(seriesID);

  return res.status(200).send(rows);
});

route.delete('/series/:seriesID/appears-in/series/:seriesAppearsInID', async (req, res) => {
  const { seriesID, seriesAppearsInID } = req.params;

  if (!seriesID || isNaN(seriesID) || !seriesAppearsInID || isNaN(seriesAppearsInID)) return res.status(400).send({ error: 'expected seriesID and seriesAppearsInID in params' });

  const rows = await deleteSeriesAppearsIn(seriesID, seriesAppearsInID);
  if (!rows || rows.length <= 0) {
    return res.status(404).send();
  }

  return res.status(204).send();
});

module.exports = route;
