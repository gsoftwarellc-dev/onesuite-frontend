#!/bin/bash
# OneSuite Frontend - Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
REGION="asia-southeast1"
SERVICE_NAME="onesuite-frontend"
IMAGE_NAME="onesuite-frontend"
ARTIFACT_REGISTRY="asia-southeast1-docker.pkg.dev"
REPOSITORY="onesuite"

# Environment variables
BACKEND_API_URL="https://onesuite-backend-862255014313.asia-southeast1.run.app/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}OneSuite Frontend - Cloud Run Deploy${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}Error: gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Confirm project
echo -e "\n${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Service: ${SERVICE_NAME}${NC}"
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Set GCP project
echo -e "\n${BLUE}Setting GCP project...${NC}"
gcloud config set project ${PROJECT_ID}

# Build Docker image
echo -e "\n${BLUE}Building Docker image...${NC}"
IMAGE_TAG="${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

docker build -t ${IMAGE_TAG} -t ${IMAGE_LATEST} .

# Push to Artifact Registry
echo -e "\n${BLUE}Pushing image to Artifact Registry...${NC}"
gcloud auth configure-docker ${ARTIFACT_REGISTRY} --quiet
docker push ${IMAGE_TAG}
docker push ${IMAGE_LATEST}

# Deploy to Cloud Run
echo -e "\n${BLUE}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_TAG} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NEXT_PUBLIC_API_BASE_URL=${BACKEND_API_URL}" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --service-account onesuite-frontend@${PROJECT_ID}.iam.gserviceaccount.com

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${BLUE}Service URL: ${SERVICE_URL}${NC}"
echo -e "${BLUE}Image: ${IMAGE_TAG}${NC}"
echo ""
