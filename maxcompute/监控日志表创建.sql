-- 创建监控日志表
DROP TABLE IF EXISTS iacg.iacg_monitor;
CREATE TABLE IF NOT EXISTS iacg.iacg_monitor
(
    appId STRING COMMENT '应用ID',
    pageId STRING COMMENT '页面ID',
    timestamp STRING  COMMENT '埋点上报时间 ',
    ua STRING COMMENT '浏览器UserAgent',
    url STRING COMMENT '页面URL',
    args STRING COMMENT '自定义参数',
    eventType STRING COMMENT '日志类型'

)
PARTITIONED BY 
(
    datetime STRING COMMENT '分区字段：日期'
)
LIFECYCLE 7; -- 7天

ALTER TABLE iacg.iacg_monitor ADD COLUMNS (
    user_id STRING COMMENT '用户ID',
    visitor_id STRING COMMENT '访客ID（当user_id存在时，取user_id）'
);

ALTER TABLE iacg.iacg_monitor ADD COLUMNS (
    mod_id STRING COMMENT '模块ID'
);