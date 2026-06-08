@echo off
REM Start both backend and frontend services
REM Backend runs on port 5000
REM Frontend runs on port 3000

echo.
echo ========================================
echo  Campus Lost and Found - Startup Script
echo ========================================
echo.
echo Installing dependencies...
call npm install

echo.
echo ✓ Dependencies installed!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop services
echo.

call npm start
pause
