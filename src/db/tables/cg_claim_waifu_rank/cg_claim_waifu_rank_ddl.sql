CREATE MATERIALIZED VIEW IF NOT EXISTS mv_rank_claim_waifu AS
  SELECT waifu_id,
    count(cgcwt.waifu_id), 
    row_number() OVER ( ORDER BY count(cgcwt.waifu_id) DESC) AS position
  FROM cg_claim_waifu_table cgcwt
  GROUP BY waifu_id;
  
-- DROP MATERIALIZED VIEW mv_rank_claim_waifu
-- refreshes every minute in a cron job.

