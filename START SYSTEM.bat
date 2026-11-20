@echo off
title Community Waste Management System

// This file is going to help you launch my sytem automatically so you just have rifht click and reveal it in file explorer then double click it //

cd /d "%~dp0"

echo ==========================================
echo   COMMUNITY WASTE MANAGEMENT SYSTEM
echo ==========================================
echo.

echo Checking MongoDB...

sc query MongoDB | findstr /I "RUNNING" >nul

if errorlevel 1 (
    echo Starting MongoDB service...
    net start MongoDB
)

echo.
echo Checking dependencies...

if not exist "node_modules" (
    call npm.cmd install
)

echo.
echo Starting backend server...

start "Community Waste Management Server" cmd /k "cd /d ""%~dp0"" && npm.cmd start"

echo Waiting for server...
timeout /t 5 /nobreak >nul

echo Opening application...
start "" "http://localhost:5000/index.html"

echo.
echo Application launch requested.
echo Keep the server window open while using the system.
pause