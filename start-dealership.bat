@echo off
title APEX MOTORS - 3D Hypercar Virtual Dealership
echo =====================================================================
echo  APEX MOTORS - Virtual 3D Hypercar Showroom
echo  Frontend: Angular + Three.js WebGL
echo  Backend:  ASP.NET Core (.NET 10 Web API)
echo =====================================================================
echo.

echo [1/2] Starting .NET 10 Web API Backend...
start "Apex Motors - .NET API" cmd /k "cd /d %~dp0backend && dotnet run"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Angular 3D Showroom Frontend...
start "Apex Motors - Angular WebGL Showroom" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo =====================================================================
echo  Virtual Showroom launching!
echo  Backend API:  https://localhost:5001 / http://localhost:5000
echo  Frontend App: http://localhost:4200
echo =====================================================================
timeout /t 5 >nul
start http://localhost:4200
