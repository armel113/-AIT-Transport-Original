@echo off
title AIT Transport - Nouvelle Agence

echo.
echo  ============================================
echo   A.I.T Transport - Configuration Agence
echo   Remplissez les informations ci-dessous
echo  ============================================
echo.

set /p AGENCE_NOM="Nom de l'agence (ex: AIT Transport Gagnoa) : "
set /p AGENCE_ID="Code agence (ex: gagnoa) : "
set /p IP_SERVEUR="IP du PC gestionnaire (ex: 192.168.1.100) : "
set /p IP_VENDEUR1="IP du PC vendeur 1 (ex: 192.168.1.101) : "
set /p IP_VENDEUR2="IP du PC vendeur 2 (ex: 192.168.1.102) : "

echo.
echo  Recapitulatif :
echo  Agence    : %AGENCE_NOM%
echo  Code      : %AGENCE_ID%
echo  Serveur   : %IP_SERVEUR%
echo  Vendeur 1 : %IP_VENDEUR1%
echo  Vendeur 2 : %IP_VENDEUR2%
echo.
set /p CONFIRM="Confirmer ? (O/N) : "
if /i "%CONFIRM%" neq "O" goto FIN

:: Backend .env
(
echo DATABASE_URL="mysql://ait_app:Ait@App2026#Secure@localhost:3306/ait_transport"
echo JWT_SECRET=AIT_%AGENCE_ID%_2026_%IP_SERVEUR%_KEY
echo PORT=3001
echo NODE_ENV=production
echo ALLOWED_ORIGINS=http://%IP_SERVEUR%:5173,http://%IP_VENDEUR1%:5173,http://%IP_VENDEUR2%:5173,http://localhost:5173
) > "C:\AIT-Transport\backend\.env"

:: Frontend .env
(
echo VITE_API_URL=http://%IP_SERVEUR%:3001
) > "C:\AIT-Transport\frontend\.env"

:: Recompiler frontend
echo  Recompilation frontend...
cd /d "C:\AIT-Transport\frontend"
call npm run build
echo  OK : Frontend recompile

:: Protéger fichiers
attrib +H +S "C:\AIT-Transport\backend\.env"

:: Générer licence 1 an
echo.
echo  Generation de la licence...
cd /d "C:\AIT-Transport\backend"
node licence.js generate "%AGENCE_NOM%" "%AGENCE_ID%" "1an"

echo.
echo  ============================================
echo   CONFIGURATION TERMINEE !
echo   Agence  : %AGENCE_NOM%
echo   Serveur : http://%IP_SERVEUR%:5173
echo  ============================================

:FIN
pause
