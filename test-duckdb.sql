-- DuckDB Test Script for SendGrid Parquet Files
-- This script demonstrates how to read and analyze the Parquet files created by the application

-- Install and load required extensions
INSTALL httpfs;
LOAD httpfs;

-- Configure S3 credentials (replace with your actual credentials)
-- SET s3_access_key_id='your-access-key';
-- SET s3_secret_access_key='your-secret-key';
-- SET s3_endpoint='your-s3-endpoint.com';

-- Test 1: Read schema from a local Parquet file (for testing)
-- First, you would need to download a sample file or use the test file
-- SELECT * FROM parquet_schema('path/to/your/file.parquet');

-- Test 2: Create a test Parquet file with the same schema
CREATE TABLE test_sendgrid_events (
    email VARCHAR,
    timestamp TIMESTAMP,
    event VARCHAR,
    category VARCHAR,
    sg_event_id VARCHAR,
    sg_message_id VARCHAR,
    smtp_id VARCHAR,
    useragent VARCHAR,
    ip VARCHAR,
    url VARCHAR,
    reason VARCHAR,
    status VARCHAR,
    response VARCHAR,
    tls INTEGER,
    attempt VARCHAR,
    type VARCHAR,
    bounce_classification VARCHAR,
    asm_group_id INTEGER,
    unique_args VARCHAR,
    marketing_campaign_id INTEGER,
    marketing_campaign_name VARCHAR,
    pool_name VARCHAR,
    pool_id INTEGER,
    send_at TIMESTAMP
);

-- Insert test data
INSERT INTO test_sendgrid_events VALUES
    ('user1@example.com', '2025-08-29 10:00:00', 'delivered', '["newsletter"]', 'sg_evt_1', 'sg_msg_1', 'smtp_1', 'Mozilla/5.0', '192.168.1.1', NULL, NULL, '250', 'OK', 1, '1', NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL),
    ('user2@example.com', '2025-08-29 10:05:00', 'opened', '["newsletter"]', 'sg_evt_2', 'sg_msg_2', 'smtp_2', 'Chrome/91.0', '192.168.1.2', NULL, NULL, NULL, NULL, 1, '1', NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL),
    ('user3@example.com', '2025-08-29 10:10:00', 'clicked', '["promotion"]', 'sg_evt_3', 'sg_msg_3', 'smtp_3', 'Safari/14.1', '192.168.1.3', 'https://example.com/promo', NULL, NULL, NULL, 1, '1', NULL, NULL, NULL, '{"campaign_id":"summer2025"}', 123, 'Summer Sale', 'pool_1', 1, NULL),
    ('user4@example.com', '2025-08-29 10:15:00', 'bounced', '["transactional"]', 'sg_evt_4', 'sg_msg_4', 'smtp_4', NULL, '192.168.1.4', NULL, 'Mailbox full', '550', 'Mailbox unavailable', 0, '3', 'bounce', 'hard', NULL, '{}', NULL, NULL, NULL, NULL, NULL),
    ('user5@example.com', '2025-08-29 10:20:00', 'spamreport', '["newsletter"]', 'sg_evt_5', 'sg_msg_5', 'smtp_5', 'Outlook', '192.168.1.5', NULL, NULL, NULL, NULL, 1, '1', NULL, NULL, 1, '{}', NULL, NULL, NULL, NULL, NULL);

-- Export to Parquet file for testing
COPY test_sendgrid_events TO 'test_sendgrid_events.parquet' (FORMAT PARQUET);

-- Test 3: Query the test Parquet file
SELECT 
    event,
    COUNT(*) as event_count
FROM read_parquet('test_sendgrid_events.parquet')
GROUP BY event
ORDER BY event_count DESC;

-- Test 4: Time-based aggregation
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event,
    COUNT(*) as count
FROM read_parquet('test_sendgrid_events.parquet')
GROUP BY hour, event
ORDER BY hour, event;

-- Test 5: Check for bounce issues
SELECT 
    email,
    reason,
    response,
    timestamp
FROM read_parquet('test_sendgrid_events.parquet')
WHERE event = 'bounced'
ORDER BY timestamp DESC;

-- Test 6: Campaign performance
SELECT 
    marketing_campaign_name,
    event,
    COUNT(*) as count
FROM read_parquet('test_sendgrid_events.parquet')
WHERE marketing_campaign_name IS NOT NULL
GROUP BY marketing_campaign_name, event;

-- Test 7: Verify all columns are readable
SELECT * FROM read_parquet('test_sendgrid_events.parquet') LIMIT 5;

-- Clean up
DROP TABLE IF EXISTS test_sendgrid_events;

-- Note: Once you have actual files in S3, you can query them directly:
-- SELECT * FROM read_parquet('s3://your-bucket/sendgrid-events/2025/08/29/*.parquet') LIMIT 10;