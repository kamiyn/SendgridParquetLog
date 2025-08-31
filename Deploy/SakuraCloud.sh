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
          "key": "NODE_ENV",
          "value": "${NODE_ENV:-production}"
        }
      ]
    }
  ]
}
EOF
)

echo ${DEPLOYMENT_PAYLOAD}

# Deploy to AppRun
echo "Deploying to AppRun..."
RESPONSE=$(curl -s -w "%{http_code}" \
  -u "${SAKURACLOUD_ACCESS_TOKEN}:${SAKURACLOUD_ACCESS_TOKEN_SECRET}" \
  -H "Content-Type: application/json" \
  -X POST \
  "${API_BASE_URL}/applications" \
  -d "${DEPLOYMENT_PAYLOAD}")

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

if [ "${HTTP_CODE}" -eq 200 ] || [ "${HTTP_CODE}" -eq 201 ]; then
  echo "✅ Deployment successful!"
  echo "Response: ${RESPONSE_BODY}"
else
  echo "❌ Deployment failed with HTTP code: ${HTTP_CODE}"
  echo "Response: ${RESPONSE_BODY}"
  exit 1
fi

echo "=== Deployment Complete ==="
