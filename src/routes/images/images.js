const route = require('express-promise-router')();
const klaw = require('klaw');
const fs = require('fs');
const { createCanvas, Image, loadImage } = require('canvas');

const { storeImageSeriesBufferByID } = require('../../db/waifu_schema/series/series_table');
const { getWaifuImageBufferByID, storeImageBufferByID, getRandomImageBuffer } = require('../../db/waifu_schema/waifu_images/waifu_table_images');


route.get('/random', async (req, res) => {
  const query = await getRandomImageBuffer();

  // res.set('Content-Type', 'image/png');
  res.set('Content-Length', query[0].buffer.length);
  res.status(200).send(query[0].buffer);
});

route.get('/store', async (req, res) => {
  klaw('../../waifu_images')
  .on('data', async (file) => {
    try {
      if (!fs.lstatSync(file.path).isDirectory()) {
        const buffer = fs.readFileSync(file.path);
        const theirImage = await loadImage(buffer);
        const { width, height } = theirImage;

        if (width && height) {
          const canvas = createCanvas(width, height);
          const ctx = canvas.getContext('2d');
      
          ctx.drawImage(theirImage, 0, 0, width, height);
      
          const buffer = await canvas.toBuffer((file.path.includes('png') ? 'image/png' : 'image/jpeg'), { quality: 0.8 });

          const filename = file.path.replace('/Users/Josh/Documents/GitHub/', '');

          console.log('filename', filename);
          const rows = await storeImageSeriesBufferByID(filename.replace('waifu_images/', '').replace('.png', ''), filename, buffer, width, height);
          console.log(filename, 'done');
          if (rows && rows.length > 0) {
            fs.unlinkSync(file.path);
          } else {
            // ternary opeator for series.
            const rows = await storeImageBufferByID(filename, buffer, width, height);
            if (rows && rows.length > 0) {
              fs.unlinkSync(file.path);
            }
          }
        }
      }
    } catch(error) {
      console.error(error);
    }
  })
  .on('end', () => {
    console.log('================\nFinished!!\n================');
  })
  .on('error', (err, item) => {
    console.error(err.message);
    console.error(item.path); // the file the error occurred on
  });
});

route.get('/:id', async (req, res) => {
  const { id } = req.params;
  const image = await getWaifuImageBufferByID(id);
  console.log(image);
});


module.exports = route;