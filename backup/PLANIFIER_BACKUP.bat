@echo off
title AIT - Planification Backup Automatique

echo Planification de la sauvegarde automatique...
echo Execution : tous les jours a 23h00

schtasks /create /tn "AIT-Backup-MySQL" ^
  /tr "%~dp0BACKUP_AUTO.bat" ^
  /sc daily /st 23:00 ^
  /ru SYSTEM /f

if %errorlevel% equ 0 (
    echo OK : Backup planifie tous les jours a 23h00
) else (
    echo ERREUR : Echec planification. Relancez en administrateur.
)

echo.
echo Pour verifier : Planificateur de taches Windows -> AIT-Backup-MySQL
pause
