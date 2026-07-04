@echo off
chcp 65001 >nul
title AIT Transport Original - Lanceur
color 0E

echo ============================================================
echo    ALINO L'IMPERIAL TRANSPORT (A.I.T) - Demarrage
echo ============================================================
echo.

echo [1/4] Verification de MySQL...
sc query MySQL80 | find "RUNNING" >nul
if errorlevel 1 (
  echo    MySQL n'est pas demarre. Tentative de demarrage...
  net start MySQL80 >nul 2>nul
) else (
  echo    MySQL est actif. OK.
)
echo.

echo [2/4] Nettoyage des anciens serveurs...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul
echo    OK.
echo.

echo [3/4] Demarrage du BACKEND (port 3001)...
start "AIT - BACKEND (3001)" cmd /k "cd /d C:\AIT-Transport\backend && npm run dev"
timeout /t 5 /nobreak >nul
echo    Backend lance.
echo.

echo [4/4] Demarrage du FRONTEND...
start "AIT - FRONTEND" cmd /k "cd /d C:\AIT-Transport\frontend && npm run dev"
timeout /t 6 /nobreak >nul
echo    Frontend lance.
echo.

echo ============================================================
echo    Application lancee !
echo    Ouvre ton navigateur sur :  http://localhost:5173
echo.
echo    Connexion : admin / admin2026  (Agence Soubre)
echo.
echo    NE FERME PAS les fenetres BACKEND et FRONTEND.
echo    Pour tout arreter : ferme ces deux fenetres.
echo ============================================================
echo.

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo Cette fenetre peut etre fermee.
pause
