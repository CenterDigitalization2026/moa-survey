@echo off
chcp 65001 >nul
title Фиксация статического IP-адреса

:: Проверка прав администратора
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==================================================
    echo Запрос прав Администратора для настройки сети...
    echo ==================================================
    powershell -Command "Start-Process cmd.exe -ArgumentList '/c `\"%~f0`\"' -Verb RunAs"
    exit /b
)

:: Запуск основного PowerShell скрипта настройки статического IP
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-static-ip.ps1"

pause
