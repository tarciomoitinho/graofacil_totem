@echo off

::Coloque aqui o caminho para o programa:
set Programa=C:\GF\desktop\GF.exe

For %%a in ("%Programa%") do set "Processo=%%~nxa"

:Loop
cls
echo.
echo  Procurando:  %Processo%
tasklist |find /i "%Processo%" 1>nul 2>nul
if not %Errorlevel% EQU 0 start "" "%Programa%"
timeout /t 10 >nul
goto :Loop