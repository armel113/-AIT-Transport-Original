@echo off
title AIT - Surveillance
cd /d "C:\AIT-Transport"

echo  AIT Transport - Surveillance (toutes les 30s)
echo  NE PAS FERMER CETTE FENETRE.
echo.

:BOUCLE
curl -s -o nul -w "%%{http_code}" http://localhost:3001/api/ping > %TEMP%\ait_check.txt 2>nul
set /p CODE=< %TEMP%\ait_check.txt
if "%CODE%"=="200" (
    echo  [%time%] OK : Serveur en ligne
) else (
    echo  [%time%] ERREUR - Redemarrage...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    start "AIT-Backend" cmd /k "cd /d C:\AIT-Transport\backend && node server.js"
    echo  [%time%] Redemarrage effectue
)
timeout /t 30 /nobreak >nul
goto BOUCLE
