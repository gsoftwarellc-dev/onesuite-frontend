#!/bin/bash
# OneSuite Frontend - Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="asia-southeast1"
SERVICE_NAME="onesuite-frontend"

# Environment variables
BACKEND_API_URL="https://onesuite-backend-86225501431.asia-southeast1.run.app/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}OneSuite Frontend - Cloud Run Deploy${NC}"
echo -e "${BLUE}=====================================${NC}"

# Confirm deployment
echo -e "${YELLOW}Project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Service: ${SERVICE_NAME}${NC}"
echo -e "Deploying source from current directory..."

# Deploy from source
gcloud run deploy ${SERVICE_NAME} \
    --source . \
    --region ${REGION} \
    --project ${PROJECT_ID} \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NEXT_PUBLIC_API_BASE_URL=${BACKEND_API_URL}" \
    --quiet

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Triggered!${NC}"
echo -e "${GREEN}=====================================${NC}"

