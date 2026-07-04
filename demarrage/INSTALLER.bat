@echo off
title AIT Transport - Installation

echo.
echo  ============================================
echo   A.I.T Transport v3.0 - Installation
echo   MySQL + Prisma + React
echo  ============================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERREUR : Node.js non installe !
    echo  Telechargez : https://nodejs.org
    pause & exit /b 1
)
echo  OK : Node.js

"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  AVERTISSEMENT : mysql.exe non trouve dans PATH
    echo  On continue quand meme...
) else (
    echo  OK : MySQL
)

echo.
echo  Creation base de donnees...
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -pAdminLtw123 -e "CREATE DATABASE IF NOT EXISTS ait_transport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
echo  OK : Base ait_transport prete

echo.
echo  Installation backend...
cd /d "%~dp0..\backend"
call npm install
echo  OK : Dependances backend

echo.
echo  Generation Prisma...
call npx prisma generate
echo  OK : Client Prisma genere

echo.
echo  Creation des tables...
call npx prisma db push --accept-data-loss
echo  OK : Tables creees

echo.
echo  Injection donnees initiales...
call node seed.js
echo  OK : Donnees injectees

echo.
echo  Installation frontend...
cd /d "%~dp0..\frontend"
call npm install
echo  OK : Frontend installe

echo.
echo  Compilation frontend...
call npm run build
echo  OK : Frontend compile

echo.
echo  ============================================
echo   INSTALLATION TERMINEE !
echo   Lancez : DEMARRER_SERVEUR.bat
echo  ============================================
echo.
pause
