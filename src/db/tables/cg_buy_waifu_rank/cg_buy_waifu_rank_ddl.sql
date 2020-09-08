CREATE MATERIALIZED VIEW IF NOT EXISTS mv_rank_buy_waifu AS
  SELECT waifu_id,
    count(cgbwt.waifu_id), 
    row_number() OVER ( ORDER BY count(cgbwt.waifu_id) DESC) AS position
  FROM cg_buy_waifu_table cgbwt
  GROUP BY waifu_id;
