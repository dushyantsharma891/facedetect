# Face Detection Docker Setup

## Quick Start

### Development (HTTP only)
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# Access at http://localhost
```

### Production (HTTPS with SSL)
```bash
# 1. Setup SSL certificates
./ssl-setup.sh

# 2. Update nginx.conf with your domain
# 3. Start production environment
docker-compose up --build -d

# Access at https://your-domain.com
```

### Option 2: Using Build Script
```bash
# Make executable and run
chmod +x docker-build.sh
./docker-build.sh
```

### Option 3: Manual Docker Commands
```bash
# Build image
docker build -t face-detection:latest .

# Run container
docker run -d \
  --name face-detection-app \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/known_faces:/app/known_faces \
  face-detection:latest
```

## API Endpoints

- **GET** `/working` - Health check
- **POST** `/detect` - File upload detection
- **POST** `/detect-base64` - Base64 image detection

## Docker Management

```bash
# View logs
docker logs face-detection-app

# Stop container
docker stop face-detection-app

# Remove container
docker rm face-detection-app

# Remove image
docker rmi face-detection:latest
```

## Environment Variables

- `NODE_ENV=production` - Production mode
- `PORT=3000` - Server port (default)

## Volume Mounts

- `./uploads` - Temporary file uploads
- `./models` - Face-API model files
- `./known_faces` - Reference face images

## Resource Limits

- Memory: 2GB limit, 1GB reserved
- Automatic restart on failure
- Health checks every 30 seconds