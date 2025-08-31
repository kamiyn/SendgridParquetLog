#!/bin/bash
# さくらのクラウド API v1.1
# https://manual.sakura.ad.jp/cloud-api/1.1/
# AppRun API リファレンス
# https://manual.sakura.ad.jp/cloud/apprun/api.html
# https://manual.sakura.ad.jp/api/cloud/apprun

set -e

# --- Positional arguments (from line 10) -------------------------------------------------
# Usage: SakuraCloud.sh <app_name> [port] [tag]
#   $1 = APPRUN_APPLICATION_NAME (required, will be lower-cased)
#   $2 = APPRUN_PORT (optional, default: 8080)
#   $3 = Docker image tag / DEPLOY_VERSION (optional, default: latest)

APPRUN_APPLICATION_NAME="$1"
APPRUN_PORT_ARG="$2"
DEPLOY_VERSION_ARG="$3"

if [ -z "$APPRUN_APPLICATION_NAME" ]; then
  echo "Usage: $0 <source_path> <app_name> [port] [tag]"
  echo "  <app_name>      Application name for APPRUN (required, lowercase)"
  echo "  [port]          APPRUN_PORT (optional, default: 8080)"
  echo "  [tag]           Docker image tag (optional, default: latest)"
  exit 1
fi

# normalize application name to lowercase
APPRUN_APPLICATION_NAME=$(echo "$APPRUN_APPLICATION_NAME" | tr '[:upper:]' '[:lower:]')

# apply defaults: APPRUN_PORT defaults to existing env or 8080; DEPLOY_VERSION defaults to env or latest
if [ -n "$APPRUN_PORT_ARG" ]; then
  APPRUN_PORT="$APPRUN_PORT_ARG"
else
  APPRUN_PORT=${APPRUN_PORT:-8080}
fi

if [ -n "$DEPLOY_VERSION_ARG" ]; then
  DEPLOY_VERSION="$DEPLOY_VERSION_ARG"
else
  DEPLOY_VERSION=${DEPLOY_VERSION:-latest}
fi

# ----------------------------------------------------------------------------------------

# Required environment variables
# https://secure.sakura.ad.jp/cloud/?#/apikeys
: "${SAKURACLOUD_ACCESS_TOKEN:?Environment variable SAKURACLOUD_ACCESS_TOKEN is required}"
: "${SAKURACLOUD_ACCESS_TOKEN_SECRET:?Environment variable SAKURACLOUD_ACCESS_TOKEN_SECRET is required}"
: "${APPRUN_APPLICATION_NAME:?Environment variable APPRUN_APPLICATION_NAME is required}"
: "${CONTAINER_REGISTRY_URL:?Environment variable CONTAINER_REGISTRY_URL is required}"
: "${DEPLOY_VERSION:?Environment variable DEPLOY_VERSION is required}"

# Required S3 configuration environment variables
: "${S3__ServiceUrl:?Environment variable S3__ServiceUrl is required}"
: "${S3__AccessKey:?Environment variable S3__AccessKey is required}"
: "${S3__SecretKey:?Environment variable S3__SecretKey is required}"
S3__BucketName=${S3__BucketName:-"sendgrid-events"}

# Optional environment variables with defaults
# APPRUN_PORT=${APPRUN_PORT:-8080} # 引数で渡される
APPRUN_TIMEOUT=${APPRUN_TIMEOUT:-60}
APPRUN_MIN_SCALE=${APPRUN_MIN_SCALE:-0}
APPRUN_MAX_SCALE=${APPRUN_MAX_SCALE:-1}
APPRUN_MAX_CPU=${APPRUN_MAX_CPU:-"0.1"}
APPRUN_MAX_MEMORY=${APPRUN_MAX_MEMORY:-"256Mi"}

# Docker registry credentials (optional)
CONTAINER_REGISTRY_USERNAME=${CONTAINER_REGISTRY_USERNAME:-""}
CONTAINER_REGISTRY_PASSWORD=${CONTAINER_REGISTRY_PASSWORD:-""}

# AppRun API endpoint
API_BASE_URL="https://secure.sakura.ad.jp/cloud/api/apprun/1.0/apprun/api"

DOCKER_FULL_IMAGE_URL="${CONTAINER_REGISTRY_URL}/${APPRUN_APPLICATION_NAME}:${DEPLOY_VERSION}"

# ================================================================
# ここまで変数定義
# ================================================================

# Login to registry if credentials provided
if [ -n "${CONTAINER_REGISTRY_USERNAME}" ] && [ -n "${CONTAINER_REGISTRY_PASSWORD}" ]; then
  echo "Logging into container registry..."
  echo "${CONTAINER_REGISTRY_PASSWORD}" | docker login "${CONTAINER_REGISTRY_URL%%/*}" -u "${CONTAINER_REGISTRY_USERNAME}" --password-stdin
fi

# Tag and push image
echo "Tagging image as ${DOCKER_FULL_IMAGE_URL}..."
docker tag ${APPRUN_APPLICATION_NAME}:latest "${DOCKER_FULL_IMAGE_URL}"

echo "Pushing image to registry..."
docker push "${DOCKER_FULL_IMAGE_URL}"

# ================================================================
# Functions for AppRun API operations
# ================================================================

# Function: Check if application exists and get its ID
# Returns: Sets APP_ID (UUID) variable if application exists
check_application_exists() {
  local app_name="$1"
  
  echo "Checking if application '${app_name}' exists..."
  
  # List all applications
  local list_response=$(curl -s -w "%{http_code}" \
    -u "${SAKURACLOUD_ACCESS_TOKEN}:${SAKURACLOUD_ACCESS_TOKEN_SECRET}" \
    -H "Content-Type: application/json" \
    -X GET \
    "${API_BASE_URL}/applications")
  
  local http_code="${list_response: -3}"
  local response_body="${list_response%???}"
  
  if [ "${http_code}" -ne 200 ]; then
    echo "❌ Failed to list applications. HTTP code: ${http_code}"
    echo "Response: ${response_body}"
    return 1
  fi
  
  APP_ID=""  
  # Try to use jq if available, otherwise fall back to python
  if command -v jq >/dev/null 2>&1; then
    APP_ID=$(echo "${response_body}" | jq -r ".data[]? | select(.name==\"${app_name}\") | .id" 2>/dev/null || true)
  else
    if [ -n "${app_exists}" ]; then
      echo "⚠️  Install jq command"
    fi
  fi
  
  # echo $response_body
  if [ -n "${APP_ID}" ]; then
    echo "✓ Application found with ID: ${APP_ID}"
    return 0
  else
    echo "✓ Application not found"
    return 0
  fi
}

# Function: Create new application with POST
create_application() {
  local payload="$1"
  
  echo "Creating new application..."
  
  local response=$(curl -s -w "%{http_code}" \
    -u "${SAKURACLOUD_ACCESS_TOKEN}:${SAKURACLOUD_ACCESS_TOKEN_SECRET}" \
    -H "Content-Type: application/json" \
    -X POST \
    "${API_BASE_URL}/applications" \
    -d "${payload}")
  
  local http_code="${response: -3}"
  local response_body="${response%???}"
  
  if [ "${http_code}" -eq 200 ] || [ "${http_code}" -eq 201 ]; then
    echo "✅ Application created successfully!"
    echo "Response: ${response_body}"
    return 0
  else
    echo "❌ Application creation failed with HTTP code: ${http_code}"
    echo "Response: ${response_body}"
    return 1
  fi
}

# Function: Update existing application with PATCH
update_application() {
  local app_id="$1"
  local payload="$2"
  
  echo "Updating existing application (ID: ${app_id})..."
  
  local response=$(curl -s -w "%{http_code}" \
    -u "${SAKURACLOUD_ACCESS_TOKEN}:${SAKURACLOUD_ACCESS_TOKEN_SECRET}" \
    -H "Content-Type: application/json" \
    -X PATCH \
    "${API_BASE_URL}/applications/${app_id}" \
    -d "${payload}")
  
  local http_code="${response: -3}"
  local response_body="${response%???}"
  
  if [ "${http_code}" -eq 200 ] || [ "${http_code}" -eq 202 ]; then
    echo "✅ Application updated successfully!"
    echo "Response: ${response_body}"
    return 0
  else
    echo "❌ Application update failed with HTTP code: ${http_code}"
    echo "Response: ${response_body}"
    return 1
  fi
}

# ================================================================
# Main deployment logic
# ================================================================

# Create deployment payload
DEPLOYMENT_PAYLOAD=$(cat <<EOF
{
  "name": "${APPRUN_APPLICATION_NAME}",
  "timeout_seconds": ${APPRUN_TIMEOUT},
  "port": ${APPRUN_PORT},
  "min_scale": ${APPRUN_MIN_SCALE},
  "max_scale": ${APPRUN_MAX_SCALE},
  "components": [
    {
      "name": "main-component",
      "max_cpu": "${APPRUN_MAX_CPU}",
      "max_memory": "${APPRUN_MAX_MEMORY}",
          "deploy_source": {
        "container_registry": {
          "image": "${DOCKER_FULL_IMAGE_URL}"
        }
      },
      "env": [
        {
          "key": "ASPNETCORE_ENVIRONMENT",
          "value": "Production"
        },
        {
          "key": "S3__ServiceUrl",
          "value": "${S3__ServiceUrl}"
        },
        {
          "key": "S3__AccessKey",
          "value": "${S3__AccessKey}"
        },
        {
          "key": "S3__SecretKey",
          "value": "${S3__SecretKey}"
        },
        {
          "key": "S3__BucketName",
          "value": "${S3__BucketName}"
        }
      ]
    }
  ]
}
EOF
)

echo "Deployment payload:"
echo "${DEPLOYMENT_PAYLOAD}"

# ================================================================
# Main execution: Check existence and deploy
# ================================================================

echo ""
echo "=== Starting AppRun Deployment ==="
echo ""

# Step 1: Check if application exists
if ! check_application_exists "${APPRUN_APPLICATION_NAME}"; then
  echo "Failed to check application existence"
  exit 1
fi

# Step 2: Deploy based on existence
echo ""
if [ -z "${APP_ID}" ]; then
  # Application doesn't exist - create new one
  echo "→ Application does not exist. Proceeding with creation..."
  if ! create_application "${DEPLOYMENT_PAYLOAD}"; then
    exit 1
  fi
else
  # Application exists - update it
  echo "→ Application exists. Proceeding with update..."
  if ! update_application "${APP_ID}" "${DEPLOYMENT_PAYLOAD}"; then
    exit 1
  fi
fi

echo ""
echo "=== Deployment Complete ==="
echo ""
