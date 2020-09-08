const { poolQuery } = require('../../index.js');

const refreshLeaderBoards = async () => poolQuery(`
  BEGIN;
  REFRESH MATERIALIZED VIEW mv_top_buy_amiibo;
  REFRESH MATERIALIZED VIEW mv_top_buy_waifu;
  REFRESH MATERIALIZED VIEW mv_top_claim_waifu;
  REFRESH MATERIALIZED VIEW mv_top_pokemon;
  REFRESH MATERIALIZED VIEW mv_rank_claim_waifu;
  REFRESH MATERIALIZED VIEW mv_rank_buy_waifu;
  COMMIT;
`, []);

module.exports = {
  refreshLeaderBoards,
};
