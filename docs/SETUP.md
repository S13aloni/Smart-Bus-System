# 🚀 Setup & Installation Guide

This guide will help you set up the Smart Bus Optimization System on your local machine.

## 📋 Prerequisites

### Required Software
- **Node.js** 18.0 or higher
- **Python** 3.8 or higher
- **PostgreSQL** 12 or higher
- **Git** (for cloning the repository)
- **npm** or **yarn** (package manager)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Smart-Bus-System
```

### 2. Database Setup

#### Install PostgreSQL

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or download from postgresql.org
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_bus_system;

# Create user (optional)
CREATE USER bus_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_bus_system TO bus_admin;

# Exit psql
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Backend Environment

Edit `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=smart_bus_system

# Application Configuration
PORT=3001
NODE_ENV=development

# ML Service Configuration
ML_SERVICE_URL=http://localhost:8001
```

#### Run Database Migrations

```bash
# Generate migration (if needed)
npm run migration:generate -- -n InitialMigration

# Run migrations
npm run migration:run

# Seed database with Ahmedabad routes
npm run seed
```

#### Start Backend

```bash
npm run start:dev
```

The backend will be available at `http://localhost:3001`

### 4. ML Service Setup

```bash
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# If you encounter issues with Python 3.12, try:
pip install -r requirements-compatible.txt
```

#### Start ML Service

```bash
python -m uvicorn main:app --reload --port 8001
```

The ML service will be available at `http://localhost:8001`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env.local
```

#### Configure Frontend Environment

Edit `frontend/.env.local` (optional):

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
```

#### Start Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🎯 Quick Start Script

Create a `start-all.sh` script for easy startup:

```bash
#!/bin/bash
# start-all.sh

echo "🚀 Starting Smart Bus System..."

# Start Backend
echo "📡 Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Start ML Service
echo "🤖 Starting ML Service..."
cd ../ml-service
python -m uvicorn main:app --reload --port 8001 &
ML_PID=$!

# Wait for ML service to start
sleep 5

# Start Frontend
echo "🌐 Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "ML Service: http://localhost:8001"
echo "API Docs: http://localhost:8001/docs"

# Keep script running
wait
```

Make it executable:
```bash
chmod +x start-all.sh
./start-all.sh
```

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: smart_bus_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_DATABASE: smart_bus_system
    depends_on:
      - postgres

  ml-service:
    build: ./ml-service
    ports:
      - "8001:8001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      - ml-service

volumes:
  postgres_data:
```

### Start with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## 🔍 Verification

### Check All Services

1. **Backend Health Check**
```bash
curl http://localhost:3001/health
```

2. **ML Service Health Check**
```bash
curl http://localhost:8001/health
```

3. **Frontend Access**
Open `http://localhost:3000` in your browser

4. **API Documentation**
Open `http://localhost:8001/docs` for Swagger UI

### Test Database Connection

```bash
# Connect to PostgreSQL
psql -U postgres -d smart_bus_system

# Check tables
\dt

# Check sample data
SELECT * FROM routes LIMIT 5;
SELECT * FROM buses LIMIT 5;

# Exit
\q
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3001
netstat -ano | findstr :8001
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (macOS/Linux)
kill -9 <process_id>
```

#### 2. Database Connection Error
- Check PostgreSQL is running
- Verify credentials in `.env` file
- Ensure database exists
- Check firewall settings

#### 3. Python Dependencies Error
```bash
# Update pip
python -m pip install --upgrade pip

# Install setuptools
pip install setuptools wheel

# Try alternative requirements
pip install -r requirements-compatible.txt
```

#### 4. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use nvm to manage versions
nvm install 18
nvm use 18
```

#### 5. Frontend Build Errors
```bash
# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

### Logs and Debugging

#### Backend Logs
```bash
cd backend
npm run start:dev
# Check console output for errors
```

#### ML Service Logs
```bash
cd ml-service
python -m uvicorn main:app --reload --port 8001 --log-level debug
```

#### Frontend Logs
```bash
cd frontend
npm run dev
# Check browser console for errors
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_gps_logs_bus_timestamp ON gps_logs(bus_id, timestamp);
CREATE INDEX idx_ticket_sales_timestamp ON ticket_sales(timestamp);
CREATE INDEX idx_passenger_counts_timestamp ON passenger_counts(timestamp);
```

### Memory Optimization
- Increase Node.js memory: `node --max-old-space-size=4096`
- Use PM2 for process management
- Enable database connection pooling

## 🔒 Security Configuration

### Production Setup
1. Change default passwords
2. Enable SSL/TLS
3. Configure CORS properly
4. Set up rate limiting
5. Use environment variables for secrets

### Environment Variables
```bash
# Production environment
NODE_ENV=production
DB_SSL=true
JWT_SECRET=your-secret-key
API_RATE_LIMIT=1000
```

## 📱 Mobile Development

### React Native Setup
```bash
# Install React Native CLI
npm install -g react-native-cli

# Create mobile app
npx react-native init SmartBusMobile

# Install dependencies
cd SmartBusMobile
npm install react-native-maps
npm install @react-native-async-storage/async-storage
```

## 🚀 Deployment

### Production Deployment
1. Build frontend: `npm run build`
2. Set production environment variables
3. Use PM2 for process management
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates
6. Configure monitoring and logging

### Cloud Deployment
- **AWS**: Use EC2, RDS, and S3
- **Azure**: Use App Service and SQL Database
- **Google Cloud**: Use Compute Engine and Cloud SQL
- **Heroku**: Use Heroku Postgres and dynos

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs
3. Check GitHub issues
4. Contact the development team
5. Create a new issue with detailed error information

---

**Happy coding! 🚌✨**
