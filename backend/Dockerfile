# Use Ubuntu as base image for better compiler support
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=18.x
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs

# Install compilers and interpreters
RUN apt-get update && apt-get install -y \
    # C/C++ compilers with different standards
    gcc-9 \
    gcc-10 \
    gcc-11 \
    gcc-12 \
    g++-9 \
    g++-10 \
    g++-11 \
    g++-12 \
    # Build essentials
    build-essential \
    # Python with pip
    python3 \
    python3-pip \
    python3-dev \
    # Java
    openjdk-17-jdk \
    openjdk-17-jre \
    # Additional tools
    cmake \
    make \
    gdb \
    valgrind \
    time \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for different C++ standards
RUN ln -sf /usr/bin/gcc-12 /usr/bin/gcc \
    && ln -sf /usr/bin/g++-12 /usr/bin/g++ \
    && ln -sf /usr/bin/gcc-11 /usr/bin/gcc-11 \
    && ln -sf /usr/bin/g++-11 /usr/bin/g++-11 \
    && ln -sf /usr/bin/gcc-10 /usr/bin/gcc-10 \
    && ln -sf /usr/bin/g++-10 /usr/bin/g++-10 \
    && ln -sf /usr/bin/gcc-9 /usr/bin/gcc-9 \
    && ln -sf /usr/bin/g++-9 /usr/bin/g++-9

# Create symbolic links for Python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create directories for temporary files
RUN mkdir -p /tmp/code-execution \
    && chmod 777 /tmp/code-execution

# Create a non-root user for security
RUN useradd -m -s /bin/bash coderunner \
    && chown -R coderunner:coderunner /app \
    && chown -R coderunner:coderunner /tmp/code-execution

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Switch to non-root user
USER coderunner

# Start the application
CMD ["node", "index.js"]



