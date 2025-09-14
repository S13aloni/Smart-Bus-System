# 🚀 Deployment Guide

## Overview

This guide covers deploying the Smart Bus Optimization System to production environments. The system can be deployed using various methods including Docker, cloud platforms, and traditional server deployment.

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 20GB+ storage

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: smart_bus_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: smart_bus_system
      NODE_ENV: production
      ML_SERVICE_URL: http://ml-service:8001
    depends_on:
      - postgres
    restart: unless-stopped

  ml-service:
    build: ./ml-service
    ports:
      - "8001:8001"
    environment:
      PYTHONPATH: /app
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_ML_SERVICE_URL: http://localhost:8001
    depends_on:
      - backend
      - ml-service
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
      - ml-service
    restart: unless-stopped

volumes:
  postgres_data:
```

### Environment Variables

Create `.env` file:

```env
# Database
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=production
JWT_SECRET=your_jwt_secret
API_RATE_LIMIT=1000

# Security
CORS_ORIGIN=https://yourdomain.com
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Deploy with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (t3.medium or larger)
# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. RDS Database Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier smart-bus-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password your_password \
    --allocated-storage 20
```

#### 3. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd Smart-Bus-System

# Configure environment
cp .env.example .env
# Edit .env with RDS endpoint

# Deploy with Docker Compose
docker-compose up -d
```

### Azure Deployment

#### 1. Container Instances

```bash
# Create resource group
az group create --name smart-bus-rg --location eastus

# Create container registry
az acr create --resource-group smart-bus-rg --name smartbusregistry --sku Basic

# Build and push images
az acr build --registry smartbusregistry --image frontend:latest ./frontend
az acr build --registry smartbusregistry --image backend:latest ./backend
az acr build --registry smartbusregistry --image ml-service:latest ./ml-service
```

#### 2. Azure Database for PostgreSQL

```bash
# Create PostgreSQL server
az postgres server create \
    --resource-group smart-bus-rg \
    --name smart-bus-server \
    --admin-user postgres \
    --admin-password your_password \
    --sku-name GP_Gen5_2
```

### Google Cloud Platform

#### 1. Cloud Run Deployment

```bash
# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com

# Create Cloud SQL instance
gcloud sql instances create smart-bus-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1

# Deploy services
gcloud run deploy frontend --source ./frontend --platform managed
gcloud run deploy backend --source ./backend --platform managed
gcloud run deploy ml-service --source ./ml-service --platform managed
```

## 🖥️ Traditional Server Deployment

### Ubuntu Server Setup

#### 1. System Requirements
- Ubuntu 20.04 LTS
- 4GB+ RAM
- 20GB+ storage
- Node.js 18+
- Python 3.8+
- PostgreSQL 13+

#### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip python3-venv -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

#### 3. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE smart_bus_system;
CREATE USER bus_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE smart_bus_system TO bus_app;
\q
```

#### 4. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd Smart-Bus-System

# Setup Backend
cd backend
npm install
npm run build
cp .env.example .env
# Edit .env file

# Setup ML Service
cd ../ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
npm run build
```

#### 5. Process Management with PM2

```bash
# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'ml-service',
      cwd: './ml-service',
      script: 'python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',
      env: {
        PYTHONPATH: './ml-service'
      }
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 6. Nginx Configuration

```nginx
# /etc/nginx/sites-available/smart-bus
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # ML Service
    location /ml/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smart-bus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Setup

```bash
# Generate self-signed certificate (development only)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/private.key \
    -out /etc/nginx/ssl/certificate.crt
```

## 📊 Monitoring and Logging

### Application Monitoring

#### 1. PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 monit

# View logs
pm2 logs
pm2 logs backend
pm2 logs ml-service
```

#### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor resources
htop
iotop
nethogs
```

### Log Management

#### 1. Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/smart-bus

# Add:
/var/log/smart-bus/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

#### 2. Centralized Logging

```bash
# Install ELK Stack (optional)
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.15.0
docker run -d --name kibana --link elasticsearch:elasticsearch -p 5601:5601 kibana:7.15.0
docker run -d --name logstash --link elasticsearch:elasticsearch -p 5044:5044 logstash:7.15.0
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/backup/smart-bus"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U postgres smart_bus_system > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/smart-bus

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Schedule backup
crontab -e
# Add: 0 2 * * * /opt/smart-bus/backup.sh
```

### Disaster Recovery

```bash
# Restore database
psql -h localhost -U postgres smart_bus_system < backup_file.sql

# Restore application
tar -xzf app_backup.tar.gz -C /
pm2 restart all
```

## 🚀 Performance Optimization

### Database Optimization

```sql
-- Optimize PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

### Application Optimization

```bash
# Optimize Node.js
export NODE_OPTIONS="--max-old-space-size=2048"

# Optimize Python
export PYTHONOPTIMIZE=1
export PYTHONDONTWRITEBYTECODE=1
```

### Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔐 Security Hardening

### Firewall Configuration

```bash
# Configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000
sudo ufw deny 3001
sudo ufw deny 8001
```

### Application Security

```bash
# Set secure file permissions
sudo chown -R www-data:www-data /opt/smart-bus
sudo chmod -R 755 /opt/smart-bus
sudo chmod 600 /opt/smart-bus/.env

# Disable unnecessary services
sudo systemctl disable apache2
sudo systemctl stop apache2
```

## 📈 Scaling Strategies

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
  nginx:
    # Load balancer configuration
```

### Load Balancing

```nginx
# nginx load balancer config
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

upstream frontend {
    server frontend1:3000;
    server frontend2:3000;
}
```

## 🧪 Health Checks

### Application Health

```bash
# Health check script
cat > health_check.sh << EOF
#!/bin/bash
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:8001/health || exit 1
curl -f http://localhost:3000 || exit 1
EOF

chmod +x health_check.sh

# Schedule health checks
crontab -e
# Add: */5 * * * * /opt/smart-bus/health_check.sh
```

---

This deployment guide provides comprehensive instructions for deploying the Smart Bus Optimization System in various environments. Choose the method that best fits your infrastructure and requirements.
