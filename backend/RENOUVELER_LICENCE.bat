@echo off
title AIT Transport - Renouvellement Licence

echo.
echo  ============================================
echo   A.I.T Transport - Renouvellement Licence
echo  ============================================
echo.

echo  Licences actuelles :
echo  ─────────────────────────────────────────
node licence.js list
echo  ─────────────────────────────────────────
echo.

set /p CLIENT="Nom du client a renouveler : "
set /p VILLE="Ville : "
set /p DUREE="Duree (1an / 6mois) [1an] : "
if "%DUREE%"=="" set DUREE=1an

echo.
node licence.js generate "%CLIENT%" "%VILLE%" "%DUREE%"
echo.
echo  Copiez la cle ci-dessus et envoyez par WhatsApp au client.
pause
