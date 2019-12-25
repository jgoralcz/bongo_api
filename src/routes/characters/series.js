const route = require('express-promise-router')();

const { validateBuffer } = require('../../handlers/validate');

const {
  storeNewSeriesImage, upsertSeries,
  getAllSeriesByName, getSeries,
} = require('../../db/waifu_schema/series/series_table');

const { storeImageBufferToURL } = require('../../util/functions/bufferToURL');
const { getBuffer } = require('../../util/functions/buffer');

route.put('/:id', async (req, res) => {
  const { body } = req;

  const { series } = body;
  if (!series) return res.status(400).send({ error: 'Missing series.', message: 'Missing series object to insert.', body });

  const { name, description } = series;
  if (!name || !description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: name, description.', body });

  const updatedSeries = await upsertSeries(series);
  return res.status(200).send(updatedSeries);
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

  const getImageInfo = await getBuffer(imageURL);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  const { height, width, error } = validateBuffer(req, res, buffer, {});
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

  const row = await storeImageBufferToURL(id, buffer, storeNewSeriesImage, { isThumbnaiL: false, height, width, nsfw, type: 'series', uploader });
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading series ${name}.` });

  const [info] = row;
  return res.status(201).send({ url: info.url });
});

route.get('/', async (req, res) => {
  const { search: name } = req.query;

  const seriesExistsQuery = await getAllSeriesByName(name);
  if (!seriesExistsQuery || seriesExistsQuery.length <= 0) return res.status(400).send({ error: 'Series does not exist.', message: `The series ${name} does not exist.` });

  return res.status(200).send(seriesExistsQuery);
});

module.exports = route;
