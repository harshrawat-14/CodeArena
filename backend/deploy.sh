#!/bin/bash

# PRODUCTION DEPLOYMENT SCRIPT
# This script automates the complete production deployment process

echo "🚀 Starting Production Deployment..."
echo "========================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo "⚠️ Warning: .env file not found. Please copy .env.example and configure it."
    echo "cp .env.example .env"
    exit 1
fi

echo "✅ Environment configuration found"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run startup validation
echo "🔍 Running startup validation..."
npm run startup

if [ $? -ne 0 ]; then
    echo "❌ Startup validation failed"
    exit 1
fi

echo "✅ Startup validation passed"

# Optional: Run build process
read -p "🏗️ Do you want to run the full build process? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️ Starting build process (this may take 30-60 minutes)..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build process failed"
        exit 1
    fi
    
    echo "✅ Build process completed successfully"
else
    echo "⏭️ Skipping build process (you can run 'npm run build' later)"
fi

# Create systemd service file (Linux)
if command -v systemctl &> /dev/null; then
    echo "🔧 Creating systemd service..."
    
    cat > /tmp/codeforces-api.service << EOF
[Unit]
Description=Premium Codeforces API
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    echo "📋 Systemd service file created at /tmp/codeforces-api.service"
    echo "   Run 'sudo cp /tmp/codeforces-api.service /etc/systemd/system/' to install"
fi

# Create Docker support files
echo "🐳 Creating Docker configuration..."

cat > Dockerfile.production << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start application
CMD ["npm", "start"]
EOF

cat > docker-compose.production.yml << EOF
version: '3.8'

services:
  codeforces-api:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - codeforces-api
    restart: unless-stopped
EOF

echo "✅ Docker configuration created"

# Create nginx configuration
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream api {
        server codeforces-api:8000;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Increase timeout for build operations
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }
        
        location /api/health {
            proxy_pass http://api;
            access_log off;
        }
    }
}
EOF

echo "✅ Nginx configuration created"

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "🔍 Production System Monitor"
echo "============================"

# Check if service is running
if pgrep -f "node.*index.js" > /dev/null; then
    echo "✅ Service is running"
else
    echo "❌ Service is not running"
fi

# Check health endpoint
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Health endpoint responding"
else
    echo "❌ Health endpoint not responding"
fi

# Check system resources
echo "📊 System Resources:"
echo "   Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "   Disk: $(df -h . | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
echo "   CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')"

# Check logs for errors
error_count=$(tail -100 logs/error.log 2>/dev/null | wc -l)
echo "   Recent errors: $error_count"

echo ""
echo "🔗 Quick Links:"
echo "   Health: http://localhost:8000/api/health"
echo "   Diagnostics: http://localhost:8000/api/diagnostics"
echo "   Contests: http://localhost:8000/api/contests/2"
EOF

chmod +x monitor.sh

echo "✅ Monitoring script created (./monitor.sh)"

# Final deployment summary
echo ""
echo "🎉 PRODUCTION DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "🚀 Your premium Codeforces API is ready!"
echo ""
echo "📋 Next Steps:"
echo "   1. Start the server: npm start"
echo "   2. Test health: curl http://localhost:8000/api/health"
echo "   3. Run monitor: ./monitor.sh"
echo ""
echo "🐳 Docker Deployment:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "🔧 Service Management:"
echo "   sudo systemctl enable codeforces-api"
echo "   sudo systemctl start codeforces-api"
echo ""
echo "📊 Monitoring:"
echo "   Health: http://localhost:8000/api/health"
echo "   Diagnostics: http://localhost:8000/api/diagnostics"
echo ""
echo "🎯 Performance optimized for premium user experience!"
echo "✨ Ready to compete with LeetCode and Codeforces!"
