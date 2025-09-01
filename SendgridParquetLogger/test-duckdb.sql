-- DuckDB Test Script for SendGrid Parquet Files
-- This script demonstrates how to read and analyze the Parquet files created by the application

-- アプリケーション組み込み時には httpfs のインストールが必要になる可能性がある
INSTALL httpfs;
LOAD httpfs;

SET VARIABLE base_url = "s3://sendgrid-events/v1raw";

CREATE SECRET s3_secret (
    TYPE S3,
    PROVIDER config,
    KEY_ID 'your-access-key',
    SECRET 'your-secret-key',
    ENDPOINT 'your-s3-endpoint.com',
    REGION 'jp-north-1'
  );
/* 開発環境の場合
CREATE SECRET minio (
    TYPE S3,
    KEY_ID 'minioadmin',
    SECRET 'minioadmin',
    ENDPOINT '127.0.0.1:9000',
    USE_SSL false,
    URL_STYLE 'path'
  );
*/

-- Simple query
SELECT * FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*")) LIMIT 5;
SELECT * FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*")) WHERE event = 'delivered';

-- GROUP BY
SELECT 
    event,
    COUNT(*) as event_count
FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*"))
GROUP BY event
ORDER BY event_count DESC;

SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event,
    COUNT(*) as count
FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*"))
GROUP BY hour, event
ORDER BY hour, event;

-- Test 5: Check for bounce issues
SELECT 
    email,
    reason,
    response,
    timestamp
FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*"))
WHERE event = 'bounce'
ORDER BY timestamp DESC;

-- Test 6: Campaign performance
SELECT 
    marketing_campaign_name,
    event,
    COUNT(*) as count
FROM parquet_scan(concat(getvariable('base_url'), "/*/*/*/*"))
WHERE marketing_campaign_name IS NOT NULL
GROUP BY marketing_campaign_name, event;

-- データの読み込みと分析
SELECT 
    event,
    COUNT(*) as count,
    DATE_TRUNC('day', timestamp) as day
FROM read_parquet(concat(getvariable('base_url'), "/2025/08/31/*.parquet"))
GROUP BY event, day
ORDER BY day DESC, count DESC;

-- 特定期間のイベント集計
SELECT 
    email,
    event,
    timestamp
FROM read_parquet(concat(getvariable('base_url'), "/2025/08/31/*.parquet"))
WHERE timestamp >= '2025-08-31 11:00:00'
 AND  timestamp <  '2025-08-31 13:00:00'
ORDER BY timestamp DESC
LIMIT 100;

-- 以下テーブル定義
-- CREATE TABLE test_sendgrid_events (
--     email VARCHAR,
--     timestamp TIMESTAMP,
--     event VARCHAR,
--     category VARCHAR,
--     sg_event_id VARCHAR,
--     sg_message_id VARCHAR,
--     smtp_id VARCHAR,
--     useragent VARCHAR,
--     ip VARCHAR,
--     url VARCHAR,
--     reason VARCHAR,
--     status VARCHAR,
--     response VARCHAR,
--     tls INTEGER,
--     attempt VARCHAR,
--     type VARCHAR,
--     bounce_classification VARCHAR,
--     asm_group_id INTEGER,
--     unique_args VARCHAR,
--     marketing_campaign_id INTEGER,
--     marketing_campaign_name VARCHAR,
--     pool_name VARCHAR,
--     pool_id INTEGER,
--     send_at TIMESTAMP
-- );
