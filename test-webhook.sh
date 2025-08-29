#!/bin/bash

# Test script for SendGrid Webhook endpoint

# Set the endpoint URL (change this to your actual endpoint)
ENDPOINT="http://localhost:8080/webhook/sendgrid"

# Test 1: Health check
echo "Testing health endpoint..."
curl -X GET http://localhost:8080/webhook/health
echo -e "\n"

# Test 2: Single delivered event
echo "Testing single delivered event..."
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '[
    {
      "email": "test@example.com",
      "timestamp": 1630329600,
      "event": "delivered",
      "category": ["newsletter", "marketing"],
      "sg_event_id": "sg_event_123",
      "sg_message_id": "sg_msg_456",
      "smtp-id": "<123456@example.com>",
      "response": "250 OK",
      "tls": 1
    }
  ]'
echo -e "\n"

# Test 3: Multiple events
echo "Testing multiple events..."
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '[
    {
      "email": "user1@example.com",
      "timestamp": 1630329600,
      "event": "delivered",
      "category": ["newsletter"],
      "sg_event_id": "evt_001",
      "sg_message_id": "msg_001"
    },
    {
      "email": "user2@example.com",
      "timestamp": 1630329700,
      "event": "opened",
      "category": ["newsletter"],
      "sg_event_id": "evt_002",
      "sg_message_id": "msg_002",
      "useragent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "ip": "192.168.1.100"
    },
    {
      "email": "user3@example.com",
      "timestamp": 1630329800,
      "event": "clicked",
      "category": ["promotion"],
      "sg_event_id": "evt_003",
      "sg_message_id": "msg_003",
      "url": "https://example.com/promo",
      "useragent": "Chrome/91.0",
      "ip": "10.0.0.1"
    },
    {
      "email": "user4@example.com",
      "timestamp": 1630329900,
      "event": "bounced",
      "category": ["transactional"],
      "sg_event_id": "evt_004",
      "sg_message_id": "msg_004",
      "reason": "Mailbox full",
      "status": "5.2.2",
      "type": "blocked"
    },
    {
      "email": "user5@example.com",
      "timestamp": 1630330000,
      "event": "unsubscribe",
      "category": ["newsletter"],
      "sg_event_id": "evt_005",
      "sg_message_id": "msg_005",
      "asm_group_id": 123
    }
  ]'
echo -e "\n"

# Test 4: Event with custom args
echo "Testing event with custom arguments..."
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '[
    {
      "email": "custom@example.com",
      "timestamp": 1630330100,
      "event": "delivered",
      "category": ["campaign"],
      "sg_event_id": "evt_custom",
      "sg_message_id": "msg_custom",
      "unique_args": {
        "user_id": "12345",
        "campaign_id": "summer2025",
        "segment": "premium"
      },
      "marketing_campaign_id": 789,
      "marketing_campaign_name": "Summer Sale 2025",
      "pool": {
        "name": "marketing_pool",
        "id": 1
      }
    }
  ]'
echo -e "\n"

echo "Tests completed!"