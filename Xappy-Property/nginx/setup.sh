#!/bin/bash

# Xappy Property - Nginx Setup Script
# Run this on your server (122.166.148.116)

set -e

echo "=========================================="
echo "  Xappy Property - Nginx Setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./setup.sh)"
    exit 1
fi

# Update system
echo "[1/7] Updating system..."
apt update && apt upgrade -y

# Install nginx
echo "[2/7] Installing Nginx..."
apt install -y nginx

# Install certbot for SSL
echo "[3/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Copy nginx configs
echo "[4/7] Copying Nginx configurations..."
cp prop.xappy.io.conf /etc/nginx/sites-available/
cp propapi.xappy.io.conf /etc/nginx/sites-available/

# Enable sites
echo "[5/7] Enabling sites..."
ln -sf /etc/nginx/sites-available/prop.xappy.io.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/propapi.xappy.io.conf /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config (without SSL first)
echo "[6/7] Testing Nginx configuration..."

# Create temporary configs without SSL for initial setup
cat > /etc/nginx/sites-available/prop.xappy.io.conf << 'EOF'
server {
    listen 80;
    server_name prop.xappy.io;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

cat > /etc/nginx/sites-available/propapi.xappy.io.conf << 'EOF'
server {
    listen 80;
    server_name propapi.xappy.io;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo "[7/7] Obtaining SSL certificates..."
certbot --nginx -d prop.xappy.io -d propapi.xappy.io --non-interactive --agree-tos --email admin@xappy.io

# Final restart
systemctl restart nginx

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Your sites are now available at:"
echo "  - https://prop.xappy.io (Frontend)"
echo "  - https://propapi.xappy.io (API)"
echo ""
echo "Make sure your apps are running:"
echo "  - Frontend: npm run start (port 3000)"
echo "  - Backend: uvicorn main:app (port 8000)"
echo ""
