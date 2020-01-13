const route = require('express-promise-router')();

const {
  getWaifuById, getRandomBadWaifu, updateWaifu,
} = require('../db/waifu_schema/waifu/waifu');

route.get('/', async (req, res) => {
  const query = await getRandomBadWaifu('Cupcake', 'Emojis');
  for (let i = 0; i < query.length; i += 1) {
    const bad = query[i];
    if (bad && bad.id) {
      const waifu = await getWaifuById(bad.id);
      if (waifu && waifu[0]) {
        console.log(waifu);
        await updateWaifu(waifu[0]).catch(console.error);
      }
    }
  }
});

module.exports = route;
