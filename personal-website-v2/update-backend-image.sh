#!/bin/bash
# Update backend image in Kubernetes containerd

set -e

echo "🔄 Updating backend image in Kubernetes..."
echo

cd /home/spartan/Documents/Personal-Website/personal-website-v2

# Tag the Docker Compose image
echo "1/4 Tagging Docker image..."
docker tag personal-website-v2-backend:latest edson-portfolio-backend:latest
echo "✅ Tagged"
echo

# Save to tar
echo "2/4 Saving to tar..."
docker save edson-portfolio-backend:latest -o /tmp/edson-backend.tar
echo "✅ Saved"
echo

# Remove old image and import new one
echo "3/4 Updating containerd (removing old image)..."
sudo ctr --namespace k8s.io image rm docker.io/library/edson-portfolio-backend:latest || true
echo "✅ Old image removed"
echo

echo "4/4 Importing new image..."
sudo ctr --namespace k8s.io image import /tmp/edson-backend.tar
rm /tmp/edson-backend.tar
echo "✅ New image imported"
echo

echo "🎉 Backend image updated!"
echo "Restarting backend pods..."
kubectl rollout restart deployment/backend -n edson-portfolio
echo "Done!"
