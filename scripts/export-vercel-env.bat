@echo off
REM Script để export environment variables từ Vercel (Windows)
REM Sử dụng: scripts\export-vercel-env.bat

echo 🚀 Bắt đầu export environment variables từ Vercel...

REM Kiểm tra Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI chưa được cài đặt. Đang cài đặt...
    call npm install -g vercel
)

REM Sử dụng npx nếu vercel không có trong PATH
set VERCEL_CMD=npx vercel
where vercel >nul 2>&1
if %errorlevel% equ 0 (
    set VERCEL_CMD=vercel
)

REM Kiểm tra login
echo 📋 Kiểm tra trạng thái đăng nhập Vercel...
%VERCEL_CMD% whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Chưa đăng nhập Vercel. Vui lòng đăng nhập:
    echo    Chạy: %VERCEL_CMD% login
    exit /b 1
)

echo ✅ Đã đăng nhập Vercel

REM Export cho Customer Frontend
echo.
echo 📦 Exporting env cho Customer Frontend...
cd apps\customer-frontend

REM Kiểm tra xem đã link chưa
if not exist ".vercel\project.json" (
    echo ⚠️  Project chưa được link. Đang link...
    echo    Vui lòng chọn project 'customer-frontend' khi được hỏi
    %VERCEL_CMD% link --yes
)

REM Export các môi trường
echo 📥 Exporting production env...
%VERCEL_CMD% env pull .env.production --environment=production --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export production env

echo 📥 Exporting preview env...
%VERCEL_CMD% env pull .env.preview --environment=preview --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export preview env

echo 📥 Exporting development env...
%VERCEL_CMD% env pull .env.local --environment=development --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export development env

cd ..\..

REM Export cho Admin Frontend
echo.
echo 📦 Exporting env cho Admin Frontend...
cd apps\admin-frontend

REM Kiểm tra xem đã link chưa
if not exist ".vercel\project.json" (
    echo ⚠️  Project chưa được link. Đang link...
    echo    Vui lòng chọn project 'admin-frontend' khi được hỏi
    %VERCEL_CMD% link --yes
)

REM Export các môi trường
echo 📥 Exporting production env...
%VERCEL_CMD% env pull .env.production --environment=production --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export production env

echo 📥 Exporting preview env...
%VERCEL_CMD% env pull .env.preview --environment=preview --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export preview env

echo 📥 Exporting development env...
%VERCEL_CMD% env pull .env.local --environment=development --yes
if %errorlevel% neq 0 echo ⚠️  Không thể export development env

cd ..\..

echo.
echo ✅ Hoàn thành! Các file .env đã được export:
echo    - apps\customer-frontend\.env.production
echo    - apps\customer-frontend\.env.preview
echo    - apps\customer-frontend\.env.local
echo    - apps\admin-frontend\.env.production
echo    - apps\admin-frontend\.env.preview
echo    - apps\admin-frontend\.env.local

pause

