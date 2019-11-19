const route = require('express-promise-router')();
const klaw = require('klaw');
const fs = require('fs');
const { createCanvas, Image, loadImage } = require('canvas');

const { storeImageSeriesBufferByID } = require('../../db/waifu_schema/series/series_table');
const {
  getWaifuImageBufferByID, deleteImageByURL, storeImageBufferByID,
  getRandomImageBuffer, storeImageBufferByURL,
  getRandomNoBufferImageByURL,
} = require('../../db/waifu_schema/waifu_images/waifu_table_images');


route.get('/random', async (req, res) => {
  const query = await getRandomImageBuffer();

  res.set('Content-Type', 'image/png');
  res.set('Content-Length', query[0].buffer.length);
  res.status(200).send(query[0].buffer);
});

route.patch('/forgotbuffers', async (req, res) => {
  setInterval(async () => {
    let imageURL = '';
    try {
      const row = await getRandomNoBufferImageByURL();
      if (!row || !row[0] || !row[0].image_url_path_extra) return;

      imageURL = row[0].image_url_path_extra;

      const theirImage = await loadImage(imageURL);
      const { width, height } = theirImage;

      if (width && height) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(theirImage, 0, 0, width, height);
        const buffer = await canvas.toBuffer((imageURL.includes('png') ? 'image/png' : 'image/jpeg'), { quality: 0.75 });
        const rows = await storeImageBufferByURL(imageURL, buffer, width, height);

        if (rows) {
          console.log('finished', imageURL);
        }
      }
    } catch (error) {
      console.error(error);
      if (imageURL) {
        await deleteImageByURL(imageURL).catch(console.error);
      }
    }
  }, 8000 + (Math.random() * 2000));
});

route.patch('/store', async (req, res) => {
  let index = 0;
  klaw('/waifu_images')
    .on('data', async (file) => {
      try {
        if (!fs.lstatSync(file.path).isDirectory()) {
          const filename = file.path.replace('/Users/Josh/Documents/GitHub/', '');

          index += 1;
          const fileBuffer = fs.readFileSync(file.path);
          const theirImage = await loadImage(fileBuffer);
          const { width, height } = theirImage;

          if (width && height) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(theirImage, 0, 0, width, height);
            const buffer = await canvas.toBuffer((file.path.includes('.png') ? 'image/png' : 'image/jpeg'), { quality: 0.75 });

            console.log('filename', filename);
            setTimeout(async () => {
              const cleanFileName = (filename.startsWith('/')) ? filename.substring(1, filename.length) : filename;
              const rows = await storeImageSeriesBufferByID(cleanFileName.replace('waifu_images/', '').replace('.png', ''), cleanFileName, buffer, width, height);
              console.log(filename, 'done');
              if (!rows || rows.length <= 0) {
                await storeImageBufferByID(cleanFileName, buffer, width, height);
              }
              fs.unlinkSync(file.path);
            }, index * 50);
          }
        }
      } catch (error) {
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

// route.get('/:id', async (req, res) => {
//   const { id } = req.params;
//   const query = await getWaifuImageBufferByID(id);

//   res.set('Content-Type', 'image/png');
//   res.set('Content-Length', query[0].buffer.length);
//   res.status(200).send(query[0].buffer);
// });

module.exports = route;
