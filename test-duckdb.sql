-- DuckDB Test Script for SendGrid Parquet Files
-- This script demonstrates how to read and analyze the Parquet files created by the application

CREATE SECRET minio (
    TYPE S3,
    KEY_ID 'minioadmin',
    SECRET 'minioadmin',
    ENDPOINT '127.0.0.1:9000',
    USE_SSL false,
    URL_STYLE 'path'
  );

-- Simple query
SELECT * FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*");
SELECT * FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*") LIMIT 5;
SELECT * FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*") WHERE event = 'delivered';

-- GROUP BY
SELECT 
    event,
    COUNT(*) as event_count
FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*")
GROUP BY event
ORDER BY event_count DESC;

SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event,
    COUNT(*) as count
FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*")
GROUP BY hour, event
ORDER BY hour, event;

-- Test 5: Check for bounce issues
SELECT 
    email,
    reason,
    response,
    timestamp
FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*")
WHERE event = 'bounce'
ORDER BY timestamp DESC;

-- Test 6: Campaign performance
SELECT 
    marketing_campaign_name,
    event,
    COUNT(*) as count
FROM parquet_scan("s3://sendgrid-events-dev/sendgrid-events/*/*/*/*")
WHERE marketing_campaign_name IS NOT NULL
GROUP BY marketing_campaign_name, event;

-- アプリケーション組み込み時には httpfs のインストールが必要になる可能性がある
-- Install and load required extensions
INSTALL httpfs;
LOAD httpfs;

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
