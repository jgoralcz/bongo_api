const { poolQuery } = require('../../index.js');

const getRankClaimedWaifuByID = async (waifuID) => poolQuery(`
  SELECT waifu_id, count, position
  FROM mv_rank_claim_waifu
  WHERE waifu_id = $1;
`, [waifuID]);

module.exports = {
  getRankClaimedWaifuByID,
};
