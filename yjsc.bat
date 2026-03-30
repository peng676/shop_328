@echo off
chcp 65001 >nul
title 一键上传到 GitHub - shop_328
color 0A
mode con cols=80 lines=25

echo.
echo ======================================================
echo          🚀 一键自动上传文件到 GitHub
echo          仓库：peng676/shop_328
echo ======================================================
echo.

:: ====================== 固定配置（不用改）======================
set "REPO_URL=https://github.com/peng676/shop_328.git"
set "BRANCH=main"
set "COMMIT_MSG=自动提交 %date% %time%"
:: =================================================================

:: 1. 检查是否安装Git
git --version >nul 2>&1
if errorlevel 1 (
    echo 🔴 错误：请先安装 Git！
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

:: 2. 初始化仓库（仅第一次）
if not exist .git (
    echo 🟢 首次使用：初始化Git仓库...
    git init
    git remote add origin %REPO_URL%
    echo.
)

:: 3. 同步远程代码（避免冲突）
echo 🔄 正在同步远程代码...
git pull origin %BRANCH% --allow-unrelated-histories >nul 2>&1

:: 4. 添加所有文件
echo 📁 正在添加所有文件...
git add .

:: 5. 提交
echo ✏️  正在提交...
git commit -m "%COMMIT_MSG%" >nul 2>&1
if errorlevel 1 (
    echo ℹ️  没有文件需要提交
    echo.
    pause
    exit /b 0
)

:: 6. 推送到 GitHub
echo 🚀 正在推送到 GitHub...
git push -u origin %BRANCH%

:: 7. 结果判断
if errorlevel 1 (
    echo.
    echo 🔴 上传失败！请检查 GitHub 登录状态
    pause
    exit /b 1
)

echo.
echo ======================================================
echo               ✅ 成功上传到 GitHub！
echo ======================================================
echo.
pause