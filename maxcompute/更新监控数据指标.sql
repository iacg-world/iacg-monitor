-- 清空当天表数据
DELETE FROM iacg.dwd_iacg_monitor_feature WHERE datetime='${biz_date}';
-- 插入PV指标
INSERT INTO TABLE iacg.dwd_iacg_monitor_feature  PARTITION (datetime='${biz_date}')
    SELECT appId, pageId, '' AS modId, 'pv' AS type, COUNT(*) AS value, '${biz_date}' as date
    FROM iacg.iacg_monitor
    WHERE datetime = '${biz_date}' AND eventtype = 'PV'
    GROUP BY appid, pageid, datetime;
-- 插入UV指标
INSERT INTO TABLE iacg.dwd_iacg_monitor_feature  PARTITION (datetime='${biz_date}')
    SELECT appId, pageId, '' AS modId, 'uv' AS type, COUNT(DISTINCT visitor_id) AS value, '${biz_date}' AS date
    FROM iacg.iacg_monitor
    WHERE datetime = '${biz_date}' AND eventtype = 'PV'
    GROUP BY appid, pageid, datetime;

-- 插入PV点击指标
INSERT INTO TABLE iacg.dwd_iacg_monitor_feature  PARTITION (datetime='${biz_date}')
    SELECT appid, pageid, '' AS modId, 'pv_click' AS type, COUNT(*) AS value, '${biz_date}' AS date
    FROM (
        SELECT t1.appid AS appid, t1.pageid AS pageid, t2.datetime AS datetime
        FROM (
            SELECT appid, pageid
            FROM iacg.iacg_monitor 
            WHERE datetime = '${biz_date}' AND eventtype = 'PV'
            GROUP BY appid, pageid, datetime
        ) AS t1 LEFT JOIN iacg.iacg_monitor  AS t2 ON t1.appid = t2.appid AND t1.pageid = t2.pageid
        WHERE t2.datetime = '${biz_date}' AND t2.eventtype = 'CLICK'
    ) AS t1
    GROUP BY appid, pageid, datetime;

-- 插入UV点击指标
INSERT INTO TABLE iacg.dwd_iacg_monitor_feature  PARTITION (datetime='${biz_date}')
    SELECT appid, pageid, '' AS modId, 'uv_click' AS type, COUNT_IF(uv_click > 0) AS value, '${biz_date}' AS date
    FROM (
        SELECT appid, pageid, datetime, uv_click, uv
        FROM (
            SELECT appid, pageid, datetime, COUNT_IF(eventtype = 'CLICK') AS uv_click, COUNT_IF(eventtype = 'PV') AS uv
            FROM (
                SELECT appid, pageid, datetime, visitor_id, eventtype
                FROM iacg.iacg_monitor 
                WHERE datetime = '${biz_date}' AND (eventtype = 'PV' OR eventtype = 'CLICK')
            ) AS t1
            GROUP BY appid, pageid, datetime, visitor_id
        )
    ) AS t1
    GROUP BY appid, pageid, datetime;

-- 插入停留时长指标
INSERT INTO TABLE iacg.dwd_iacg_monitor_feature  PARTITION (datetime='${biz_date}')
    SELECT appid, pageid, '' AS modId, 'stay' AS type, AVG(stayTime) AS value, '${biz_date}' AS date
    FROM (
        SELECT appid, pageid, datetime, args, GET_JSON_OBJECT(args, '$.stayTime') as stayTime
        FROM iacg.iacg_monitor 
        WHERE datetime = '20230524' AND eventtype = 'STAY'
    ) AS t1
    WHERE stayTime > 0 AND stayTime < 600 * 1000
    GROUP BY appid, pageid, datetime;