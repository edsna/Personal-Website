#!/bin/bash
# Deployment script for Edson's Personal Website

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="edson-portfolio"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-your-registry.com}"
VERSION="${VERSION:-latest}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Edson Personal Website Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi

print_info "Prerequisites check passed ✓"
echo ""

# Step 1: Build Docker Images
print_info "Building Docker images..."

# Build frontend
print_info "Building frontend image..."
docker build -t ${DOCKER_REGISTRY}/edson-portfolio-frontend:${VERSION} ./frontend
if [ $? -eq 0 ]; then
    print_info "Frontend image built successfully ✓"
else
    print_error "Frontend image build failed"
    exit 1
fi

# Build backend
print_info "Building backend image..."
docker build -t ${DOCKER_REGISTRY}/edson-portfolio-backend:${VERSION} ./backend
if [ $? -eq 0 ]; then
    print_info "Backend image built successfully ✓"
else
    print_error "Backend image build failed"
    exit 1
fi

echo ""

# Step 2: Push to Registry (optional)
read -p "Push images to registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pushing images to registry..."

    docker push ${DOCKER_REGISTRY}/edson-portfolio-frontend:${VERSION}
    docker push ${DOCKER_REGISTRY}/edson-portfolio-backend:${VERSION}

    print_info "Images pushed successfully ✓"
fi

echo ""

# Step 3: Create namespace
print_info "Creating Kubernetes namespace..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
print_info "Namespace created/updated ✓"

echo ""

# Step 4: Create secrets
print_info "Creating secrets..."

if [ -z "$OPENAI_API_KEY" ]; then
    print_warn "OPENAI_API_KEY not set. Please create secrets manually:"
    echo "kubectl create secret generic backend-secrets -n ${NAMESPACE} \\"
    echo "  --from-literal=openai_api_key=sk-... \\"
    echo "  --from-literal=anthropic_api_key=sk-ant-..."
else
    kubectl create secret generic backend-secrets \
        --from-literal=openai_api_key=$OPENAI_API_KEY \
        --from-literal=anthropic_api_key=${ANTHROPIC_API_KEY:-""} \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    print_info "Secrets created ✓"
fi

echo ""

# Step 5: Apply Kubernetes manifests
print_info "Applying Kubernetes manifests..."

kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/configmap.yaml
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/ingress.yaml

print_info "Kubernetes manifests applied ✓"

echo ""

# Step 6: Wait for deployments
print_info "Waiting for deployments to be ready..."

kubectl rollout status deployment/redis -n ${NAMESPACE} --timeout=5m
kubectl rollout status deployment/backend -n ${NAMESPACE} --timeout=5m
kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=5m

print_info "All deployments ready ✓"

echo ""

# Step 7: Get service information
print_info "Getting service information..."
kubectl get services -n ${NAMESPACE}

echo ""
print_info "Getting pod information..."
kubectl get pods -n ${NAMESPACE}

echo ""
print_info "Getting ingress information..."
kubectl get ingress -n ${NAMESPACE}

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Your website should be accessible at:"
print_info "https://edsonzandamela.com"
echo ""
print_info "To view logs:"
echo "  kubectl logs -f deployment/backend -n ${NAMESPACE}"
echo "  kubectl logs -f deployment/frontend -n ${NAMESPACE}"
echo ""
print_info "To scale deployments:"
echo "  kubectl scale deployment/backend --replicas=3 -n ${NAMESPACE}"
echo ""
