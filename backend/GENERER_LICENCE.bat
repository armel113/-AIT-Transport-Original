@echo off
title AIT Transport - Generateur de Licences

echo.
echo  ============================================
echo   A.I.T Transport - Generateur de Licences
echo  ============================================
echo.

set /p CLIENT="Nom du client (agence) : "
set /p VILLE="Ville : "
set /p DUREE="Duree (1an / 6mois / demo) [1an] : "

if "%DUREE%"=="" set DUREE=1an

echo.
node licence.js generate "%CLIENT%" "%VILLE%" "%DUREE%"
echo.
pause
