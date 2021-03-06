const route = require('express-promise-router')();

const { validateBuffer } = require('../../handlers/validate');

const {
  storeNewSeriesImage,
  upsertSeries,
  getSeriesById,
  getAllSeriesByName,
  getSeries,
  updateSeries,
} = require('../../db/waifu_schema/series/series_table');

const { storeImageBufferToURL } = require('../../util/functions/bufferToURL');
const { getBuffer } = require('../../util/functions/buffer');

route.put('/:id', async (req, res) => {
  const updatedSeries = req.body;

  if (!updatedSeries || !updatedSeries.id) return res.status(400).send({ error: 'Missing series.', message: 'Missing series object to insert.', body: req.body });

  const oldSeriesRow = await getSeriesById(updatedSeries.id);
  if (!oldSeriesRow || !oldSeriesRow[0] || !oldSeriesRow[0].id) return res.status(404).send({ error: 'Series not found.', message: `${updatedSeries.id} does not exist`, body: req.body });

  const updatedSeriesObject = Object.assign(oldSeriesRow[0], updatedSeries);
  await updateSeries(updatedSeriesObject);

  return res.status(204).send();
});

route.patch('/', async (req, res) => {
  const { body } = req;

  if (!body.imageURL || !body.name || body.nsfw == null || !body.description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: imageURL, name, nsfw, description.', body });

  const {
    imageURL,
    name,
    nsfw,
    description,
    url,
    uploader,
    is_western: western,
    is_game: game,
  } = body;

  const buffer = await getBuffer(imageURL);
  if (!buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width || error) return res.status(400).send(error);

  let seriesQuery;
  if (url) {
    seriesQuery = await upsertSeries(body);
  } else {
    const series = {
      name,
      nsfw,
      description,
      uploader,
      imageURL,
      western,
      game,
    };
    seriesQuery = await upsertSeries(series);
  }

  if (!seriesQuery || !seriesQuery[0] || !seriesQuery[0].id) return res.status(500).send({ error: `Failed uploading series ${name}.` });

  const series = seriesQuery[0];
  const { id } = series;

  const row = await storeImageBufferToURL(id, buffer, storeNewSeriesImage, {
    width, height, nsfw, type: 'series', uploader,
  });
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading series ${name}.` });

  const [info] = row;
  return res.status(201).send({ url: info.image_url, image_id: info.id, id });
});

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.imageURL || !body.name || body.nsfw == null || !body.description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: imageURL, name, nsfw, description.', body });

  const {
    imageURL, name, nsfw, description, url,
    uploader, is_western: western, is_game: game,
  } = body;

  const seriesExistsQuery = await getSeries(name);
  if (seriesExistsQuery && seriesExistsQuery.length >= 0) return res.status(400).send({ error: 'Series already exists.', message: `The series ${name} already exists. You can update the series with a PATCH request.`, body });

  const buffer = await getBuffer(imageURL);
  if (!buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { height, width, error } = await validateBuffer(req, res, buffer, { overrideDefaultHW: true });
  if (!height || !width || error) return res.status(400).send(error);

  let seriesQuery;
  if (url) {
    seriesQuery = await upsertSeries(body);
  } else {
    const series = {
      name,
      nsfw,
      description,
      uploader,
      imageURL,
      western,
      game,
    };
    seriesQuery = await upsertSeries(series);
  }

  if (!seriesQuery || !seriesQuery[0] || !seriesQuery[0].id) return res.status(500).send({ error: `Failed uploading series ${name}.` });

  const series = seriesQuery[0];
  const { id } = series;

  const row = await storeImageBufferToURL(id, buffer, storeNewSeriesImage, {
    width, height, nsfw, type: 'series', uploader,
  });
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading series ${name}.` });

  const [info] = row;
  return res.status(201).send({ url: info.image_url, image_id: info.id, id });
});

route.get('/', async (req, res) => {
  const {
    name,
    userID,
    guildID,
    claimsOnly = false,
    anyClaimsOnly = false,
    favoritesOnly = false,
    boughtOnly = false,
    boughtFavoriteOnly = false,
    wishlistOnly = false,
    disableSeriesOnly = false,
  } = req.query;
  if (!name) return res.status(400).send({ error: 'Name query parameter expected.' });

  const claimsOnlyClean = claimsOnly === 'true' || claimsOnly === true;
  const anyClaimsOnlyClean = anyClaimsOnly === 'true' || anyClaimsOnly === true;
  const favoritesOnlyClean = favoritesOnly === 'true' || favoritesOnly === true;
  const boughtOnlyClean = boughtOnly === 'true' || boughtOnly === true;
  const boughtFavoriteOnlyClean = boughtFavoriteOnly === 'true' || boughtFavoriteOnly === true;
  const wishlistOnlyClean = wishlistOnly === 'true' || wishlistOnly === true;
  const disableSeriesOnlyClean = disableSeriesOnly === 'true' || disableSeriesOnly === true;

  const series = await getAllSeriesByName(name, userID, guildID, claimsOnlyClean, anyClaimsOnlyClean, favoritesOnlyClean, boughtOnlyClean, boughtFavoriteOnlyClean, wishlistOnlyClean, disableSeriesOnlyClean);

  return res.status(200).send(series || []);
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;

  const query = await getSeriesById(id);
  if (!query || !query[0]) return res.status(404).send({ error: `${id} is not a valid id.` });

  return res.status(200).send(query[0]);
});

module.exports = route;
