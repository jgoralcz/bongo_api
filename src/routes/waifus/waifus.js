const route = require('express-promise-router')();
const { createCanvas, loadImage } = require('canvas');

const {
  getRandomNoBufferWaifuImageByURL, storeWaifuImageBufferByURL,
} = require('../../db/waifu_schema/waifu/waifu');

// route.get('/:id', async (req, res) => {
//   const { id } = req.query;

//   if (!id) return res.status(404).send('404: Not found');

//   const waifuQuery = 0;

//   if (true) {}
// });

route.patch('/cdn_images', async (req, res) => {
  
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
          console.log('finished', imageURL);
        }
      }
    } catch (error) {
      console.error(error);
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
