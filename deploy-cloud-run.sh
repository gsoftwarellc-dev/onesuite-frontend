#!/bin/bash

# ========================================
# OneSuite Frontend - Cloud Run Deployment Script
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# CONFIGURATION
# ========================================

PROJECT_ID="festive-music-484414-v7"
REGION="asia-southeast1"
SERVICE_NAME="onesuite-frontend"
BACKEND_URL="https://onesuite-backend-86225501431.asia-southeast1.run.app/api"

# ========================================
# FUNCTIONS
# ========================================

print_step() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# ========================================
# PRE-DEPLOYMENT CHECKS
# ========================================

print_step "Checking prerequisites..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not logged into gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set project
print_step "Setting GCP project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# ========================================
# BUILD AND DEPLOY
# ========================================

print_step "Building and deploying frontend to Cloud Run..."
print_warning "This will take several minutes..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars "NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL" \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "NEXT_TELEMETRY_DISABLED=1"

# ========================================
# POST-DEPLOYMENT
# ========================================

print_step "Deployment complete!"
print_step "Retrieving service URL..."

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region $REGION \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Frontend URL: $SERVICE_URL"
echo "Backend URL: $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Visit $SERVICE_URL to verify the frontend"
echo "2. Test login and dashboard functionality"
echo "3. Attach custom domain later: app.onesuite.com"
echo ""
