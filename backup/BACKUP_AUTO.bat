@echo off
set BACKUP_DIR=C:\AIT-Transport\backup\sauvegardes
set DATE_TAG=%date:~6,4%-%date:~3,2%-%date:~0,2%
set FILENAME=ait_%DATE_TAG%.sql

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [%date% %time%] Sauvegarde MySQL en cours...

"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysqldump.exe" -u root -pAdminLtw123 ait_transport > "%BACKUP_DIR%\%FILENAME%"

if %errorlevel% equ 0 (
    echo [%date% %time%] OK : %FILENAME% sauvegarde dans %BACKUP_DIR%
) else (
    echo [%date% %time%] ERREUR sauvegarde !
)

echo [%date% %time%] Termine.
pause
