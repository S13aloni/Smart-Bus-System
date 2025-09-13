#!/bin/bash

# Smart Bus Optimization System Setup Script
echo "🚌 Setting up Smart Bus Optimization System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+ from https://python.org/"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL from https://postgresql.org/"
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    # Install ML service dependencies
    print_status "Installing ML service dependencies..."
    cd ml-service && pip install -r requirements.txt && cd ..
    
    print_success "All dependencies installed!"
}

# Setup database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -q; then
        print_error "PostgreSQL is not running. Please start PostgreSQL service."
        exit 1
    fi
    
    # Create database
    print_status "Creating database..."
    createdb smart_bus_db 2>/dev/null || print_warning "Database 'smart_bus_db' might already exist"
    
    # Run schema and seed data
    print_status "Running database schema..."
    psql -d smart_bus_db -f database/schema.sql
    
    print_status "Seeding database with sample data..."
    psql -d smart_bus_db -f database/seed_data.sql
    
    print_success "Database setup complete!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Frontend environment
    if [ ! -f frontend/.env.local ]; then
        cp frontend/env.example frontend/.env.local
        print_success "Created frontend/.env.local file"
    else
        print_warning "frontend/.env.local already exists, skipping..."
    fi
    
    print_success "Environment files setup complete!"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend && npm run build && cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend && npm run build && cd ..
    
    print_success "Applications built successfully!"
}

# Main setup function
main() {
    echo "=========================================="
    echo "🚌 Smart Bus Optimization System Setup"
    echo "=========================================="
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    build_applications
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "To start the application:"
    echo "  npm run dev"
    echo ""
    echo "Or start services individually:"
    echo "  npm run dev:frontend  # Frontend on http://localhost:3000"
    echo "  npm run dev:backend   # Backend on http://localhost:3001"
    echo "  npm run dev:ml        # ML Service on http://localhost:8001"
    echo ""
    echo "Database:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: smart_bus_db"
    echo "  Username: postgres"
    echo ""
    echo "API Documentation:"
    echo "  http://localhost:3001/api"
    echo ""
}

# Run main function
main "$@"

