@echo off
title AIT - Planification Backup Automatique

echo.
echo  ============================================
echo   AIT Transport - Backup Automatique
echo   Planification : tous les jours a 23h00
echo  ============================================
echo.

:: Créer la tâche planifiée Windows
schtasks /create /tn "AIT-Backup-Quotidien" /tr "C:\AIT-Transport\backup\BACKUP_AUTO.bat" /sc daily /st 23:00 /ru SYSTEM /f

if %errorlevel% equ 0 (
    echo  OK : Backup planifie tous les jours a 23h00
    echo  Les sauvegardes seront dans :
    echo  C:\AIT-Transport\backup\sauvegardes\
) else (
    echo  ERREUR : Relancez en tant qu'administrateur
)
echo.
pause
