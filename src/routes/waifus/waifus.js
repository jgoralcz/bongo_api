const route = require('express-promise-router')();
const { createCanvas, loadImage } = require('canvas');
const logger = require('log4js').getLogger();

const imageSize = require('image-size');

const { getWaifuById } = require('../../db/waifu_schema/waifu/waifu');

const { storeImageBufferToURL } = require('../../util/functions/storeImageBufferToURL');
const { getBuffer } = require('../../util/functions/buffer');

const { updateWaifusCDNurl, storeNewImageBuffer } = require('../../db/waifu_schema/waifu_images/waifu_table_images');

const {
  getRandomNoBufferWaifuImageByURL, storeWaifuImageBufferByURL,
  getWaifuImageNoCDNurl, updateWaifuCDNurl,
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
  const { body, query } = req;

  if (!body || !body.url || !query || !query.id) return res.status(400).send({ url: body.url, id: query.id });

  const { id } = query;
  const { url } = body;

  const waifu = await getWaifuById(id);
  if (!waifu) return res.status(400).send(`waifu not found with id ${id}.`);

  const getImageInfo = await getBuffer(url);
  if (!getImageInfo || !getImageInfo.buffer) return res.status(400).send(`No buffer found for url ${url}.`);

  const { buffer } = getImageInfo;

  const { height, width } = imageSize(buffer); // has to be sync according to image-size docs
  if (!height || !width) return res.status(400).send(`No width or height found for url ${url}; height=${height}, width=${width}`);

  const row = await storeImageBufferToURL(id, buffer, storeNewImageBuffer);
  if (!row) return res.status(400).send(`Failed uploading ${url}`);

  return res.status(200).send(row.image_url);
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
