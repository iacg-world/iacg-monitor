--odps sql 
--********************************************************************--
--author:斜光hikari
--create time:2023-05-25 11:07:49
--********************************************************************--
DROP TABLE IF EXISTS dwd_iacg_monitor_feature;
CREATE TABLE IF NOT EXISTS dwd_iacg_monitor_feature
(
    appId STRING COMMENT '应用ID',
    pageId STRING COMMENT '页面ID',
    modId STRING COMMENT '模块ID',
    `type` STRING COMMENT '指标类型',
    `value` STRING COMMENT '指标数据',
    `date` STRING COMMENT '指标日期'
)
PARTITIONED BY 
(
    `datetime` STRING  COMMENT '时间分区'
)
TBLPROPERTIES ("transactional"="true");