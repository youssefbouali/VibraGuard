@echo off
REM VibraGuard Test Runner Script for Windows
REM This script runs all tests in the VibraGuard project

setlocal enabledelayedexpansion
set "failed=0"

echo.
echo ============================================
echo   VibraGuard Test Suite
echo ============================================
echo.

REM Backend Tests
if exist "vibraguard\backend" (
    echo Running Backend Tests...
    cd vibraguard\backend
    call mvn test -q
    if !errorlevel! equ 0 (
        echo Backend Tests PASSED
    ) else (
        echo Backend Tests FAILED
        set /a failed+=1
    )
    cd ..\..
    echo.
)

REM Frontend Tests
if exist "vibraguard\frontend" (
    echo Running Frontend Tests...
    cd vibraguard\frontend
    call pnpm test
    if !errorlevel! equ 0 (
        echo Frontend Tests PASSED
    ) else (
        echo Frontend Tests FAILED
        set /a failed+=1
    )
    cd ..\..
    echo.
)

REM Blockchain Tests
if exist "vibraguard\blockchain-net" (
    echo Running Blockchain Tests...
    cd vibraguard\blockchain-net
    call npm test
    if !errorlevel! equ 0 (
        echo Blockchain Tests PASSED
    ) else (
        echo Blockchain Tests FAILED
        set /a failed+=1
    )
    cd ..\..
    echo.
)

REM Python Tests
if exist "vibraguard\ia_model" (
    echo Running Python ML Tests...
    cd vibraguard\ia_model
    call pytest tests/ -q
    if !errorlevel! equ 0 (
        echo Python Tests PASSED
    ) else (
        echo Python Tests FAILED
        set /a failed+=1
    )
    cd ..\..
    echo.
)

echo ============================================
if %failed% equ 0 (
    echo All tests passed!
    exit /b 0
) else (
    echo %failed% test suite(s) failed
    exit /b 1
)
