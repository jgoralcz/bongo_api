const route = require('express-promise-router')();
const { createCanvas, loadImage } = require('canvas');
const logger = require('log4js').getLogger();

const imageSize = require('image-size');
const { mbLimit } = require('../../util/constants/bytes');

const { getWaifuById } = require('../../db/waifu_schema/waifu/waifu');

const { storeImageBufferToURL } = require('../../util/functions/storeImageBufferToURL');
const { getBuffer } = require('../../util/functions/buffer');

const { updateWaifusCDNurl, storeNewImageBuffer, getHashFromBufferID } = require('../../db/waifu_schema/waifu_images/waifu_table_images');

const {
  getRandomNoBufferWaifuImageByURL, storeWaifuImageBufferByURL,
  getWaifuImageNoCDNurl, updateWaifuCDNurl, updateWaifuImage,
} = require('../../db/waifu_schema/waifu/waifu');

// route.get('/:id', async (req, res) => {
//   const { id } = req.query;

//   if (!id) return res.status(404).send('404: Not found');

//   const waifuQuery = 0;

//   if (true) {}
// });


route.patch('/cdn_images', async (req, res) => {
  for (let i = 0; i < 10000; i += 1) {
    try {
      logger.log('working...');
      const row = await getWaifuImageNoCDNurl();
      if (!row || !row[0] || !row[0].buffer || !row[0].id) {
        console.error('buffer or id not found');
        continue;
      }

      const { id, buffer } = row[0];
      await storeImageBufferToURL(id, buffer, updateWaifusCDNurl);
    } catch (error) {
      console.error(error);
    }
  }
});

route.post('/:id/images', async (req, res) => {
  const { body, params, query } = req;

  if (!body || !body.uri || !params || !params.id) {
    return res.status(400).send({
      error: 'Missing info. Required params.id, body.uri',
      body,
      params,
      query,
    });
  }

  const { id } = params;
  const { uri, nsfw = false } = body;

  const waifuRow = await getWaifuById(id);
  if (!waifuRow || waifuRow.length <= 0 || !waifuRow[0] || !waifuRow[0].id) return res.status(400).send({ error: `character not found with id ${id}.` });

  const [waifu] = waifuRow;

  const getImageInfo = await getBuffer(uri);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send({ error: `No buffer found for url ${uri}.` });

  const { buffer: tempBuffer } = getImageInfo;
  const buffer = Buffer.from(tempBuffer);

  if (!buffer || !buffer.length) return res.status(400).send({ error: `${uri} is not a supported image type.` });
  if ((buffer.length / 1024 / 1024) > mbLimit) return res.status(400).send({ error: `${uri} exceeds the ${mbLimit}mb limit.` });

  const { height, width } = imageSize(buffer);
  if (!height || !width) return res.status(400).send({ error: `No width or height found for url ${uri}; height=${height}, width=${width}` });

  const checkImageExists = await getHashFromBufferID(waifu.id, buffer);
  if (checkImageExists && checkImageExists[0]) return res.status(400).send({ error: `The hash for ${uri} already exists for ${waifu.id}.` });

  const row = await storeImageBufferToURL(id, buffer, storeNewImageBuffer, false, height, width, nsfw);
  if (!row || row.length <= 0 || !row[0]) return res.status(400).send({ error: `Failed uploading ${uri}.` });

  const [info] = row;

  if (!waifu.buffer || !waifu.image_url || !waifu.image_url_cdn) {
    await updateWaifuImage(id, buffer, info.image_url_path_extra, width,
      height, nsfw, buffer.length, info.file_type).catch((error) => logger.error(error));
  }

  return res.status(200).send({ url: info.image_url_path_extra });
});


// route.get('/random', async (req, res) => {
//   const query = await getRandomImageBuffer();

//   res.set('Content-Type', 'image/png');
//   res.set('Content-Length', query[0].buffer.length);
//   res.status(200).send(query[0].buffer);
// });

route.patch('/forgotbuffers', async (req, res) => {
  setInterval(async () => {
    let imageURL = '';
    try {
      const row = await getRandomNoBufferWaifuImageByURL();
      if (!row || !row[0] || !row[0].image_url) return;

      imageURL = row[0].image_url;

      const theirImage = await loadImage(imageURL);
      const { width, height } = theirImage;

      if (width && height) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.quality = 'best';

        ctx.drawImage(theirImage, 0, 0, width, height);
        const buffer = await canvas.toBuffer((imageURL.includes('png') ? 'image/png' : 'image/jpeg'), { quality: 0.90 });
        const rows = await storeWaifuImageBufferByURL(imageURL, buffer, width, height);

        if (rows) {
          logger.log('finished', imageURL);
        }
      }
    } catch (error) {
      logger.error(error);
    }
  }, 12000 + (Math.random() * 4000));
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  const query = await getWaifuImageBufferByID(id);

  res.set('Content-Type', 'image/png');
  res.set('Content-Length', query[0].buffer.length);
  res.status(200).send(query[0].buffer);
});

module.exports = route;
