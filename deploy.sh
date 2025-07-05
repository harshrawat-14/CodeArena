#!/bin/bash

# Online Judge Platform Deployment Script
# This script helps deploy the OJ platform with all required compilers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if ports are available
check_ports() {
    print_status "Checking port availability..."
    
    ports=(80 443 3000 8000)
    for port in "${ports[@]}"; do
        if netstat -tuln | grep -q ":$port "; then
            print_warning "Port $port is already in use. You may need to stop the service using this port."
        fi
    done
}

# Build and start services
deploy_services() {
    print_header "Building and Starting Services"
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check service health
    print_status "Checking service health..."
    docker-compose ps
}

# Test compiler availability
test_compilers() {
    print_header "Testing Compiler Availability"
    
    print_status "Testing C++ compilers..."
    docker-compose exec backend bash -c "
        echo 'Testing C++ compilers...'
        echo 'GCC versions:'
        gcc --version | head -1
        gcc-9 --version | head -1 2>/dev/null || echo 'GCC-9 not available'
        gcc-10 --version | head -1 2>/dev/null || echo 'GCC-10 not available'
        gcc-11 --version | head -1 2>/dev/null || echo 'GCC-11 not available'
        gcc-12 --version | head -1 2>/dev/null || echo 'GCC-12 not available'
        
        echo 'G++ versions:'
        g++ --version | head -1
        
        echo 'Testing C++14 support:'
        echo '#include <iostream>' > /tmp/test14.cpp
        echo 'int main() { auto x = 42; std::cout << x << std::endl; return 0; }' >> /tmp/test14.cpp
        g++ -std=c++14 /tmp/test14.cpp -o /tmp/test14 && echo 'C++14 works' || echo 'C++14 failed'
        
        echo 'Testing C++17 support:'
        echo '#include <iostream>' > /tmp/test17.cpp
        echo 'int main() { if (auto x = 42; x > 0) std::cout << x << std::endl; return 0; }' >> /tmp/test17.cpp
        g++ -std=c++17 /tmp/test17.cpp -o /tmp/test17 && echo 'C++17 works' || echo 'C++17 failed'
        
        echo 'Testing C++20 support:'
        echo '#include <iostream>' > /tmp/test20.cpp
        echo 'int main() { std::cout << \"C++20 works\" << std::endl; return 0; }' >> /tmp/test20.cpp
        g++ -std=c++20 /tmp/test20.cpp -o /tmp/test20 && echo 'C++20 works' || echo 'C++20 failed'
    "
    
    print_status "Testing Python..."
    docker-compose exec backend bash -c "
        echo 'Python version:'
        python --version
        python3 --version
        
        echo 'Testing Python execution:'
        echo 'print(\"Python works!\")' > /tmp/test.py
        python /tmp/test.py
    "
    
    print_status "Testing Java..."
    docker-compose exec backend bash -c "
        echo 'Java version:'
        java --version
        javac --version
        
        echo 'Testing Java execution:'
        echo 'public class Test { public static void main(String[] args) { System.out.println(\"Java works!\"); } }' > /tmp/Test.java
        javac /tmp/Test.java -d /tmp && java -cp /tmp Test
    "
}

# Show service URLs
show_urls() {
    print_header "Deployment Complete!"
    
    print_status "Services are running at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  Nginx Proxy: http://localhost:80"
    echo ""
    
    print_status "Available compilers:"
    echo "  C++14, C++17, C++20, C++23 (with GCC 9-12)"
    echo "  Python 3.x"
    echo "  Java 17"
    echo ""
    
    print_status "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
}

# Cleanup function
cleanup() {
    print_header "Cleaning Up"
    print_status "Stopping services..."
    docker-compose down
    
    print_status "Removing unused images..."
    docker image prune -f
    
    print_status "Cleanup complete"
}

# Main deployment function
main() {
    print_header "Online Judge Platform Deployment"
    
    case "${1:-deploy}" in
        "deploy")
            check_docker
            check_ports
            deploy_services
            test_compilers
            show_urls
            ;;
        "test")
            test_compilers
            ;;
        "cleanup")
            cleanup
            ;;
        "restart")
            print_status "Restarting services..."
            docker-compose restart
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "stop")
            print_status "Stopping services..."
            docker-compose down
            ;;
        *)
            echo "Usage: $0 {deploy|test|cleanup|restart|logs|stop}"
            echo "  deploy  - Build and start all services (default)"
            echo "  test    - Test compiler availability"
            echo "  cleanup - Stop services and clean up"
            echo "  restart - Restart all services"
            echo "  logs    - Show service logs"
            echo "  stop    - Stop all services"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
