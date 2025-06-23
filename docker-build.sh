#!/bin/bash

# Build and run face detection Docker container

echo "🐳 Building Face Detection Docker Image..."
docker build -t face-detection:latest .

echo "🚀 Starting Face Detection Container..."
docker run -d \
  --name face-detection-app \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/known_faces:/app/known_faces \
  --restart unless-stopped \
  face-detection:latest

echo "✅ Face Detection API running at http://localhost:3000"
echo "📊 Check status: docker logs face-detection-app"