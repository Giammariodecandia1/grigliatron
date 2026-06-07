@echo off
SETLOCAL
:: Imposta la directory corrente come quella del file batch
cd /d "%~dp0"

echo ==========================================
echo       🔥 AVVIO DI GRIGLIATRON 🔥
echo ==========================================
echo.
echo [1/2] Controllo dipendenze...

:: Se la cartella node_modules non esiste, esegui npm install
if not exist "node_modules\" (
    echo [!] node_modules non trovata. Installazione dipendenze...
    call npm install
) else (
    echo [OK] Dipendenze gia' presenti.
)

echo.
echo [2/2] Avvio del server locale...
echo.
echo ------------------------------------------
echo 🚀 Grigliatron sara' disponibile tra poco!
echo 🔗 Apri il browser su: http://localhost:5173
echo ------------------------------------------
echo.

:: Avvia il server Vite
call npm run dev

:: Se il server viene fermato, chiedi se si vuole uscire
pause
