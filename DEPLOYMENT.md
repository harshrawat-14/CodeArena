# Online Judge Platform - Docker Deployment Guide

This guide will help you deploy the Online Judge platform using Docker with comprehensive compiler support.

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- 10GB free disk space

### Supported Compilers & Languages

- **C++**: Standards 14, 17, 20, 23 with GCC 9-12
- **C**: GCC 9-12
- **Python**: 3.x with pip
- **Java**: OpenJDK 17

## 📦 Deployment Options

### Option 1: Automated Deployment (Recommended)

#### For Linux/macOS:
```bash
chmod +x deploy.sh
./deploy.sh deploy
```

#### For Windows:
```cmd
deploy.bat deploy
```

### Option 2: Manual Deployment

```bash
# Build and start all services
docker-compose build --no-cache
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🛠️ Available Commands

### Linux/macOS (deploy.sh)
```bash
./deploy.sh deploy    # Build and start all services (default)
./deploy.sh test      # Test compiler availability
./deploy.sh cleanup   # Stop services and clean up
./deploy.sh restart   # Restart all services
./deploy.sh logs      # Show service logs
./deploy.sh stop      # Stop all services
```

### Windows (deploy.bat)
```cmd
deploy.bat deploy     # Build and start all services (default)
deploy.bat test       # Test compiler availability
deploy.bat cleanup    # Stop services and clean up
deploy.bat restart    # Restart all services
deploy.bat logs       # Show service logs
deploy.bat stop       # Stop all services
```

## 🌐 Service URLs

After deployment, access the platform at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Nginx Proxy**: http://localhost:80

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   React Frontend│    │  Node.js Backend│
│   (Port 80)     │◄───┤   (Port 3000)   │◄───┤   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────────────┐
                                              │   Code Execution│
                                              │   Environment   │
                                              │  (Multi-language)│
                                              └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Production settings
NODE_ENV=production
PORT=8000

# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Security (change in production)
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# Database (if using external database)
DATABASE_URL=your-database-url

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Custom Compiler Configuration

To modify compiler settings, edit the backend Dockerfile:

```dockerfile
# Add custom compiler versions
RUN apt-get install -y gcc-13 g++-13

# Create custom symbolic links
RUN ln -sf /usr/bin/gcc-13 /usr/bin/gcc-latest
```

## 📊 Monitoring & Logging

### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Health Checks
```bash
# Check service health
curl http://localhost:8000/health  # Backend
curl http://localhost:3000/health  # Frontend
curl http://localhost:80/health    # Nginx
```

### Monitor Resource Usage
```bash
# View container stats
docker stats

# View system resource usage
docker system df
```

## 🔒 Security Considerations

### Production Deployment

1. **Use HTTPS**: Configure SSL certificates in `nginx.conf`
2. **Change Default Secrets**: Update JWT and session secrets
3. **Network Security**: Use Docker networks for service isolation
4. **Resource Limits**: Set container resource limits
5. **Regular Updates**: Keep Docker images updated

### SSL Configuration

Uncomment the HTTPS server block in `nginx.conf` and add your certificates:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8000
   
   # Stop the conflicting service
   sudo systemctl stop <service-name>
   ```

2. **Docker Build Fails**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Service Won't Start**:
   ```bash
   # Check service logs
   docker-compose logs <service-name>
   
   # Restart specific service
   docker-compose restart <service-name>
   ```

4. **Compiler Not Found**:
   ```bash
   # Access backend container
   docker-compose exec backend bash
   
   # Check available compilers
   which gcc g++ python java
   ```

### Reset Everything

To completely reset the deployment:

```bash
# Stop all services
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove images
docker rmi $(docker images -q)

# Clean system
docker system prune -a

# Redeploy
./deploy.sh deploy
```

## 📈 Performance Optimization

### For High Load Environments

1. **Scale Services**:
   ```bash
   docker-compose up -d --scale backend=3
   ```

2. **Resource Limits**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 4G
   ```

3. **Caching**: Add Redis for session storage and caching

4. **Database**: Use external database for production

## 🤝 Support

For issues and questions:

1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check Docker and Docker Compose versions
4. Ensure sufficient system resources

## 📝 License

This deployment configuration is provided as-is for the Online Judge Platform.
