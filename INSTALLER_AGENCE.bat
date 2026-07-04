@echo off
title AIT Transport - Installation

echo.
echo  ============================================
echo   A.I.T Transport - Installation Agence
echo   AIT Transport Soubre
echo   Serveur : 192.168.100.200
echo  ============================================
echo.

:: Verifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Node.js non installe !
    pause & exit /b 1
)
echo OK : Node.js detecte

:: Detecter chemin MySQL
set MYSQL_BIN=
if exist "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 9.7\bin
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin

if "%MYSQL_BIN%"=="" (
    echo ERREUR : MySQL non detecte !
    pause & exit /b 1
)
echo OK : MySQL detecte

:: Creer base de donnees
echo Creation base de donnees...
"%MYSQL_BIN%\mysql.exe" -u root -pAdminLtw123 -e "CREATE DATABASE IF NOT EXISTS ait_transport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo OK : Base creee

:: Creer utilisateur — mot de passe SANS caractères spéciaux
"%MYSQL_BIN%\mysql.exe" -u root -pAdminLtw123 -e "CREATE USER IF NOT EXISTS 'ait_app'@'localhost' IDENTIFIED BY 'AitApp2026Secure';"
"%MYSQL_BIN%\mysql.exe" -u root -pAdminLtw123 -e "GRANT SELECT,INSERT,UPDATE,DELETE ON ait_transport.* TO 'ait_app'@'localhost'; FLUSH PRIVILEGES;"
echo OK : Utilisateur ait_app cree

:: Configurer backend .env — URL sans caractères spéciaux
echo Configuration backend...
(
echo DATABASE_URL="mysql://ait_app:AitApp2026Secure@localhost:3306/ait_transport"
echo JWT_SECRET=AIT_SOUBRE_2026_192168100200_SECURE_KEY
echo PORT=3001
echo NODE_ENV=production
echo ALLOWED_ORIGINS=http://192.168.100.200:5173,http://192.168.100.201:5173,http://localhost:5173
) > "C:\AIT-Transport\backend\.env"
echo OK : Backend configure

:: Configurer frontend .env
(
echo VITE_API_URL=http://192.168.100.200:3001
) > "C:\AIT-Transport\frontend\.env"
echo OK : Frontend configure

:: Installer dependances backend
echo Installation backend...
cd /d "C:\AIT-Transport\backend"
call npm install --omit=dev
echo OK : Backend installe

:: Prisma
echo Creation tables...
call npx prisma generate
call npx prisma db push --accept-data-loss
echo OK : Tables creees

:: Donnees initiales
echo Injection donnees...
call node seed.js
echo OK : Donnees injectees

:: Frontend
echo Installation frontend...
cd /d "C:\AIT-Transport\frontend"
call npm install
echo OK : Frontend installe

echo Compilation frontend...
call npm run build
echo OK : Frontend compile

:: Demarrage automatique
echo Configuration demarrage automatique...
copy "C:\AIT-Transport\demarrage\DEMARRER_SERVEUR.bat" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AIT-Demarrer.bat" /Y
copy "C:\AIT-Transport\demarrage\WATCHDOG.bat" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AIT-Watchdog.bat" /Y
echo OK : Demarrage automatique configure

:: Backup automatique
schtasks /create /tn "AIT-Backup" /tr "C:\AIT-Transport\backup\BACKUP_AUTO.bat" /sc daily /st 23:00 /ru SYSTEM /f >nul 2>&1
echo OK : Backup planifie a 23h00

:: Generer licence
echo Generation licence...
cd /d "C:\AIT-Transport\backend"
node licence.js generate "AIT Transport Soubre" "Soubre" "1an"

:: Proteger fichiers sensibles
attrib +H +S "C:\AIT-Transport\backend\.env" 2>nul
attrib +H +S "C:\AIT-Transport\backend\licence.js" 2>nul
attrib +H +S "C:\AIT-Transport\backend\server.js" 2>nul
attrib +H +S "C:\AIT-Transport\backend\seed.js" 2>nul

echo.
echo  ============================================
echo   INSTALLATION TERMINEE !
echo   URL     : http://192.168.100.200:5173
echo   Vendeur : http://192.168.100.201:5173
echo   admin   / admin2026
echo   Vendeur1/ 1111
echo   Vendeur2/ 2222
echo  ============================================
echo.
pause
