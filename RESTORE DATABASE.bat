@echo off
title Restore Community Waste Management Database

cd /d "%~dp0"

echo ==========================================
echo   DATABASE RESTORATION
echo ==========================================
echo.

echo WARNING: Existing backed-up collections
echo will be replaced with the supplied backup.
echo.
pause

echo Checking MongoDB...

sc query MongoDB | findstr /I "RUNNING" >nul

if errorlevel 1 (
    net start MongoDB
)

echo.
echo Restoring database...

"C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --drop --db CommunityWasteManagement "%~dp0database-backup\CommunityWasteManagement"

if errorlevel 1 (
    echo.
    echo DATABASE RESTORATION FAILED!
    pause
    exit /b 1
)

echo.
echo DATABASE RESTORATION COMPLETED!
pause