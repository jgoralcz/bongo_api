const route = require('express-promise-router')();

const imageSize = require('image-size');
const { mbLimit } = require('../../util/constants/bytes');

const {
  searchSeriesExactly, insertSeries,
  storeNewSeriesImageBuffer, upsertSeries,
} = require('../../db/waifu_schema/series/series_table');

const { storeImageBufferToURL } = require('../../util/functions/bufferToURL');
const { getBuffer } = require('../../util/functions/buffer');

route.put('/:id', async (req, res) => {
  const { body } = req;

  const { series } = body;
  if (!series) return res.status(400).send({ error: 'Missing series.', message: 'Missing series object to insert.', body });

  const { name, description } = body;
  if (!name || !description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: name, description.', body });

  const updatedSeries = await upsertSeries(series);
  return res.status(200).send(updatedSeries);
});

route.post('/', async (req, res) => {
  const { body } = req;

  if (!body.imageURL || !body.name || body.nsfw == null || !body.description) return res.status(400).send({ error: 'Missing body info.', message: 'Required body: imageURL, name, nsfw, description.', body });

  const {
    image_url: imageURL, name, alternate_name: altName,
    release_date: releaseDate, nsfw, description, url,
    uploader,
  } = body;

  const seriesExistsQuery = await searchSeriesExactly(name);
  if (!seriesExistsQuery || seriesExistsQuery.length >= 0) return res.status(400).send({ error: 'Series already exists.', message: `The series ${name} already. You can update the series with a PATCH request.`, body });

  const getImageInfo = await getBuffer(imageURL);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${imageURL}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  if (!buffer || !buffer.length) return res.status(400).send({ error: `${imageURL} is not a supported image type.` });
  if ((buffer.length / 1024 / 1024) > mbLimit) return res.status(400).send({ error: `${imageURL} exceeds the ${mbLimit}mb limit.` });

  const { height, width } = imageSize(buffer);
  if (!height || !width) return res.status(400).send({ error: `No width or height found for url ${imageURL}; height=${height}, width=${width}` });

  let seriesQuery;
  if (url) {
    seriesQuery = await insertSeries(body);
  } else {
    const series = {
      name,
      url: '',
      altName,
      releaseDate,
      nsfw,
      description,
      uploader,
    };
    seriesQuery = await insertSeries(series);
  }

  if (!seriesQuery || !seriesQuery[0] || !seriesQuery[0].id) return res.status(500).send({ error: `Failed uploading series ${name}.` });

  const series = seriesQuery[0];
  const { id } = series;

  const row = await storeImageBufferToURL(id, buffer, storeNewSeriesImageBuffer, false, height, width, nsfw, uploader);
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading series ${name}.` });

  const [info] = row;
  return res.status(201).send({ url: info.url });
});

module.exports = route;
