# Multi-Site Server Setup Guide

## Problem: Port 80/443 Already in Use

Here are 4 solutions to run multiple websites on the same server:

## Solution 1: Use Main Server Nginx (Recommended)

### Step 1: Run app without nginx
```bash
docker-compose -f docker-compose.no-nginx.yml up -d
```

### Step 2: Add to main server nginx
```bash
# Copy nginx-main-server.conf content to:
sudo nano /etc/nginx/sites-available/face-detection

# Enable site
sudo ln -s /etc/nginx/sites-available/face-detection /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Add DNS record
```
face-api.your-domain.com → Your Server IP
```

**Access:** https://face-api.your-domain.com

---

## Solution 2: Custom Ports

### Run on different ports
```bash
docker-compose -f docker-compose.custom-port.yml up -d
```

**Access:** 
- http://your-domain.com:8080
- https://your-domain.com:8443

---

## Solution 3: Nginx Proxy Manager

### Install nginx-proxy-manager
```bash
# Create network
docker network create nginx-proxy

# Run proxy manager
docker run -d \
  --name nginx-proxy-manager \
  --network nginx-proxy \
  -p 80:80 -p 443:443 -p 81:81 \
  jc21/nginx-proxy-manager:latest

# Run face detection
docker-compose -f docker-compose.multi-site.yml up -d
```

**Setup:** http://your-server:81 (admin interface)

---

## Solution 4: Traefik (Advanced)

### Use Traefik as reverse proxy
```bash
# Install Traefik first, then:
docker-compose -f docker-compose.traefik.yml up -d
```

---

## Recommended Approach

**For most users:** Use Solution 1 (Main Server Nginx)

1. Your main nginx handles SSL and routing
2. Docker containers run on internal ports
3. Clean separation of concerns
4. Easy to manage multiple sites

### Quick Setup:
```bash
# 1. Start face detection (no nginx)
docker-compose -f docker-compose.no-nginx.yml up -d

# 2. Add nginx config to main server
sudo cp nginx-main-server.conf /etc/nginx/sites-available/face-detection
sudo ln -s /etc/nginx/sites-available/face-detection /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Add DNS: face-api.your-domain.com → server IP
```

**Result:** https://face-api.your-domain.com