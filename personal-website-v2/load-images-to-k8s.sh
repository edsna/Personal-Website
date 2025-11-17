#!/bin/bash
# Load Docker images into containerd for Kubernetes

set -e

echo "🔄 Loading images to Kubernetes containerd..."
echo

cd /home/spartan/Documents/Personal-Website/personal-website-v2

# Save images from Docker
echo "1/4 Saving Docker images to tar files..."
docker save edson-portfolio-backend:latest -o /tmp/edson-backend.tar
docker save edson-portfolio-frontend:latest -o /tmp/edson-frontend.tar
echo "✅ Images saved"
echo

# Import to containerd on this node (spartan - worker)
echo "2/4 Importing to containerd on spartan (worker node)..."
sudo ctr --namespace k8s.io image import /tmp/edson-backend.tar
sudo ctr --namespace k8s.io image import /tmp/edson-frontend.tar
echo "✅ Images imported to spartan"
echo

# Verify images are loaded
echo "3/4 Verifying images in containerd..."
sudo ctr --namespace k8s.io images ls | grep edson-portfolio
echo

echo "4/4 Cleaning up tar files..."
rm /tmp/edson-backend.tar /tmp/edson-frontend.tar
echo "✅ Cleanup complete"
echo

echo "🎉 Images successfully loaded to Kubernetes!"
echo "You can now deploy with: kubectl apply -f infrastructure/kubernetes/backend-deployment-openworld.yaml"
