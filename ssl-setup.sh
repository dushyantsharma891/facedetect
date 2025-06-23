#!/bin/bash

# SSL Certificate Setup Script

echo "🔐 Setting up SSL certificates..."

# Create SSL directory
mkdir -p ssl

# Option 1: Self-signed certificate (for development)
echo "Creating self-signed certificate for development..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/your-domain.key \
    -out ssl/your-domain.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ Self-signed certificate created"
echo "⚠️  For production, replace with real SSL certificates"

# Option 2: Let's Encrypt (uncomment for production)
# echo "Setting up Let's Encrypt..."
# docker run -it --rm \
#     -v $(pwd)/ssl:/etc/letsencrypt \
#     -p 80:80 \
#     certbot/certbot certonly --standalone \
#     -d your-domain.com \
#     -d www.your-domain.com

echo "🔧 Update nginx.conf with your domain name"
echo "📝 Edit docker-compose.yml SSL paths if needed"