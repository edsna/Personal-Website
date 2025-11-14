#!/bin/bash
# Test script for Edson's Personal Website deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE="edson-portfolio"

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  Testing Edson's Website Deployment${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# Test 1: Check if namespace exists
echo -e "${YELLOW}Test 1: Checking namespace...${NC}"
if kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Namespace exists${NC}"
else
    echo -e "${RED}✗ Namespace not found${NC}"
    exit 1
fi

# Test 2: Check pods are running
echo -e "\n${YELLOW}Test 2: Checking pods status...${NC}"
kubectl get pods -n $NAMESPACE
BACKEND_READY=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -o true | wc -l)
FRONTEND_READY=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -o true | wc -l)
REDIS_READY=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | grep -o true | wc -l)

if [ "$BACKEND_READY" -ge 1 ] && [ "$FRONTEND_READY" -ge 1 ] && [ "$REDIS_READY" -ge 1 ]; then
    echo -e "${GREEN}✓ All pods are ready${NC}"
else
    echo -e "${RED}✗ Some pods are not ready${NC}"
    echo "Backend: $BACKEND_READY, Frontend: $FRONTEND_READY, Redis: $REDIS_READY"
fi

# Test 3: Port-forward backend and test health
echo -e "\n${YELLOW}Test 3: Testing backend health endpoint...${NC}"
kubectl port-forward -n $NAMESPACE svc/backend-service 8000:8000 &
PF_PID=$!
sleep 3

HEALTH_RESPONSE=$(curl -s http://localhost:8000/api/health)
if echo $HEALTH_RESPONSE | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 4: Test chatbot
echo -e "\n${YELLOW}Test 4: Testing chatbot...${NC}"
CHAT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Edson'\''s current role?", "language": "en"}')

if echo $CHAT_RESPONSE | grep -q "message"; then
    echo -e "${GREEN}✓ Chatbot test passed${NC}"
    echo "Response preview: $(echo $CHAT_RESPONSE | jq -r '.message' | head -c 100)..."
else
    echo -e "${RED}✗ Chatbot test failed${NC}"
    echo "Response: $CHAT_RESPONSE"
fi

# Test 5: Test rate limiting
echo -e "\n${YELLOW}Test 5: Testing rate limiting...${NC}"
USAGE_RESPONSE=$(curl -s http://localhost:8000/api/chat/usage)
if echo $USAGE_RESPONSE | grep -q "tokens_remaining"; then
    echo -e "${GREEN}✓ Rate limiting is working${NC}"
    echo "Usage: $USAGE_RESPONSE"
else
    echo -e "${RED}✗ Rate limiting check failed${NC}"
fi

# Test 6: Test frontend
echo -e "\n${YELLOW}Test 6: Testing frontend...${NC}"
kubectl port-forward -n $NAMESPACE svc/frontend-service 3000:80 &
PF_FRONTEND_PID=$!
sleep 3

FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
    echo "Frontend available at http://localhost:3000"
else
    echo -e "${RED}✗ Frontend not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
fi

# Cleanup port-forwards
kill $PF_PID $PF_FRONTEND_PID 2>/dev/null || true

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  Test Summary${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "✓ = Passed, ✗ = Failed"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend -n $NAMESPACE"
echo ""
echo "To access frontend:"
echo "  kubectl port-forward -n $NAMESPACE svc/frontend-service 3000:80"
echo "  Open http://localhost:3000"
echo ""
echo "To access backend API docs:"
echo "  kubectl port-forward -n $NAMESPACE svc/backend-service 8000:8000"
echo "  Open http://localhost:8000/docs"
echo ""
