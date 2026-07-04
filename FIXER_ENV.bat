@echo off
title AIT - Correction base de donnees

echo Correction du fichier de configuration...

:: Supprimer l'ancien .env
del /f /q "C:\AIT-Transport\backend\.env" 2>nul
attrib -H -S "C:\AIT-Transport\backend\.env" 2>nul
del /f /q "C:\AIT-Transport\backend\.env" 2>nul

:: Recréer le .env correct
echo DATABASE_URL="mysql://ait_app:AitApp2026Secure@localhost:3306/ait_transport"> "C:\AIT-Transport\backend\.env"
echo JWT_SECRET=AIT_SOUBRE_2026_SECURE_KEY>> "C:\AIT-Transport\backend\.env"
echo PORT=3001>> "C:\AIT-Transport\backend\.env"
echo NODE_ENV=production>> "C:\AIT-Transport\backend\.env"
echo ALLOWED_ORIGINS=http://192.168.100.200:5173,http://192.168.100.201:5173,http://localhost:5173>> "C:\AIT-Transport\backend\.env"

echo Verification .env :
type "C:\AIT-Transport\backend\.env"
echo.

:: Tester la connexion
echo Test connexion MySQL...
cd /d "C:\AIT-Transport\backend"
call npx prisma db push --accept-data-loss
if %errorlevel% equ 0 (
    echo OK : Tables creees !
    echo Injection donnees...
    call node seed.js
    echo OK : Donnees injectees !
) else (
    echo ERREUR : Connexion MySQL echouee
)

echo.
echo Compilation frontend...
cd /d "C:\AIT-Transport\frontend"
call npm run build
echo.
echo TERMINE - Appuyez sur une touche
pause
