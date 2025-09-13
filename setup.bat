@echo off
echo ==========================================
echo 🚌 Smart Bus Optimization System Setup
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
)

echo [INFO] All requirements are met!
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo [INFO] Installing ML service dependencies...
cd ml-service
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install ML service dependencies
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] All dependencies installed!
echo.

REM Setup environment files
echo [INFO] Setting up environment files...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo [SUCCESS] Created backend\.env file
) else (
    echo [WARNING] backend\.env already exists, skipping...
)

if not exist frontend\.env.local (
    copy frontend\env.example frontend\.env.local
    echo [SUCCESS] Created frontend\.env.local file
) else (
    echo [WARNING] frontend\.env.local already exists, skipping...
)

echo [SUCCESS] Environment files setup complete!
echo.

REM Build applications
echo [INFO] Building applications...
echo [INFO] Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend
    pause
    exit /b 1
)
cd ..

echo [INFO] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] Applications built successfully!
echo.

echo ==========================================
echo [SUCCESS] Setup completed successfully!
echo ==========================================
echo.
echo To start the application:
echo   npm run dev
echo.
echo Or start services individually:
echo   npm run dev:frontend  # Frontend on http://localhost:3000
echo   npm run dev:backend   # Backend on http://localhost:3001
echo   npm run dev:ml        # ML Service on http://localhost:8001
echo.
echo Database Setup Required:
echo   1. Install PostgreSQL from https://postgresql.org/
echo   2. Create database: smart_bus_db
echo   3. Run: psql -d smart_bus_db -f database\schema.sql
echo   4. Run: psql -d smart_bus_db -f database\seed_data.sql
echo.
echo API Documentation:
echo   http://localhost:3001/api
echo.
pause

