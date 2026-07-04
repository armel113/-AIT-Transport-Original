@echo off
title AIT Transport - Serveur Principal
cd /d "C:\AIT-Transport"

echo.
echo  ============================================
echo   A.I.T Transport v3.0 - Demarrage
echo   192.168.100.200
echo  ============================================
echo.

:: Demarrer MySQL
net start MySQL80 >nul 2>&1
echo  OK : MySQL demarre

:: Detecter MySQL
set MYSQL_BIN=
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin
if exist "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 9.7\bin

:: Demarrer Backend
echo  Demarrage Backend port 3001...
start "AIT-Backend" cmd /k "cd /d C:\AIT-Transport\backend && node server.js"
timeout /t 4 /nobreak >nul

:: Demarrer Frontend
echo  Demarrage Frontend port 5173...
start "AIT-Frontend" cmd /k "cd /d C:\AIT-Transport\frontend && npm run preview -- --host 0.0.0.0 --port 5173"
timeout /t 3 /nobreak >nul

echo.
echo  ============================================
echo   AIT Transport est en ligne !
echo   Ce PC     : http://localhost:5173
echo   Vendeurs  : http://192.168.100.200:5173
echo   API       : http://localhost:3001/status
echo  ============================================
echo.
echo  NE PAS FERMER CETTE FENETRE
pause
