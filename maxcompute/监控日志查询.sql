-- 监控测试数据的插入
-- INSERT INTO iacg.iacg_monitor
-- PARTITION ( datetime = '20230427' )
-- VALUES (1, '2023-04-27 17:27:05', '{"a":"1"}'),
-- (1, '2023-04-27 17:37:05', '{"a":"1"}'),
-- (1, '2023-04-27 17:17:05', '{"a":"1"}');

-- 监控测试数据的查询
-- SELECT  type
--         ,timestamp
--         ,arguments
--         ,datetime
-- FROM    iacg.iacg_monitor
-- WHERE   type = 1
-- AND     datetime = '20230427';
SELECT *
FROM iacg.dwd_iacg_monitor_feature
WHERE datetime = '20230526';
SELECT *
FROM iacg.iacg_monitor 
WHERE datetime = '20230524' AND eventtype = 'PV';
-- PV
SELECT appid, pageid, datetime, COUNT(*) AS pv 
FROM iacg.iacg_monitor 
WHERE datetime = '20230524' AND eventtype = 'PV'
GROUP BY appid, pageid, datetime;

-- UV
SELECT appid, pageid, datetime, COUNT(DISTINCT  visitor_id) AS uv 
FROM iacg.iacg_monitor 
WHERE datetime = '20230524' AND eventtype = 'PV'
GROUP BY appid, pageid, datetime;

-- PV点击
SELECT appid, pageid, datetime, COUNT(*) AS click_pv, 'click' as type
FROM (
    SELECT t1.appid AS appid, t1.pageid AS pageid, t2.datetime AS datetime
    FROM (
        SELECT appid, pageid
        FROM iacg.iacg_monitor 
        WHERE datetime = '20230524' AND eventtype = 'PV'
        GROUP BY appid, pageid, datetime
    ) AS t1 LEFT JOIN iacg.iacg_monitor  AS t2 ON t1.appid = t2.appid AND t1.pageid = t2.pageid
    WHERE t2.datetime = '20230524' AND t2.eventtype = 'CLICK'
) AS t1
GROUP BY appid, pageid, datetime;


-- PV点击率纵表
SELECT *
FROM (
    SELECT appid, pageid, datetime, COUNT(*) AS value, 'click' as type
    FROM (
        SELECT t1.appid AS appid, t1.pageid AS pageid, t2.datetime AS datetime
        FROM (
            SELECT appid, pageid
            FROM iacg.iacg_monitor 
            WHERE datetime = '20230524' AND eventtype = 'PV'
            GROUP BY appid, pageid, datetime
        ) AS t1 LEFT JOIN iacg.iacg_monitor  AS t2 ON t1.appid = t2.appid AND t1.pageid = t2.pageid
        WHERE t2.datetime = '20230524' AND t2.eventtype = 'CLICK'
    ) AS t1
    GROUP BY appid, pageid, datetime
) UNION ALL (
    SELECT appid, pageid, datetime, COUNT(*) AS value, 'pv' AS type
    FROM iacg.iacg_monitor 
    WHERE datetime = '20230524' AND eventtype = 'PV'
    GROUP BY appid, pageid, datetime
);

-- PV点击率横表
SELECT appid, pageid, datetime, pv_click, pv, pv_click / pv
FROM (
    SELECT appid, pageid, datetime, COUNT_IF(eventtype = 'CLICK') AS pv_click, COUNT_IF(eventtype = 'PV') AS pv
    FROM (
        SELECT appid, pageid, datetime, eventtype
        FROM iacg.iacg_monitor 
        WHERE datetime = '20230524' AND (eventtype = 'PV' OR eventtype = 'CLICK')
    ) AS t1
    GROUP BY appid, pageid, datetime
);

-- UV点击率
SELECT CONCAT((uv_click / uv) * 100, '%') AS uv_click_rate
FROM (
    SELECT appid, pageid, datetime, COUNT_IF(uv_click > 0) AS uv_click, COUNT(*) AS uv
    FROM (
        SELECT appid, pageid, datetime, uv_click, uv
        FROM (
            SELECT appid, pageid, datetime, COUNT_IF(eventtype = 'CLICK') AS uv_click, COUNT_IF(eventtype = 'PV') AS uv
            FROM (
                SELECT appid, pageid, datetime, visitor_id, eventtype
                FROM iacg.iacg_monitor 
                WHERE datetime = '20230524' AND (eventtype = 'PV' OR eventtype = 'CLICK')
            ) AS t1
            GROUP BY appid, pageid, datetime, visitor_id
        )
    ) AS t1
    GROUP BY appid, pageid, datetime
);

-- 停留时长
SELECT appid, pageid, datetime, AVG(stayTime)
FROM (
    SELECT appid, pageid, datetime, args, GET_JSON_OBJECT(args, '$.stayTime') as stayTime
    FROM iacg.iacg_monitor 
    WHERE datetime = '20230524' AND eventtype = 'STAY'
) AS t1
WHERE stayTime > 0 AND stayTime < 600 * 1000
GROUP BY appid, pageid, datetime;