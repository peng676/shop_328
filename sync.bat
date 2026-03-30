@echo off
title Git Sync Script
echo ====================================
echo Git Sync Script
echo ====================================
echo.

:: 切换到脚本所在目录
cd /d "%~dp0"

:: 检查 git 是否可用
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Git，请先安装 Git for Windows
    pause
    exit /b 1
)

:: 初始化仓库（如果还没有）
if not exist ".git" (
    echo 正在初始化 Git 仓库...
    git init
    if %errorlevel% neq 0 (
        echo [错误] 初始化失败
        pause
        exit /b 1
    )
) else (
    echo Git 仓库已存在
)

:: 检查是否已关联远程仓库
git remote -v | find "origin" >nul
if %errorlevel% neq 0 (
    echo.
    echo 未配置远程仓库，请输入你的 GitHub 仓库地址
    echo 例如：https://github.com/你的用户名/shop_328.git
    set /p remote_url="URL: "
    if "%remote_url%"=="" (
        echo [错误] 未输入地址
        pause
        exit /b 1
    )
    git remote add origin %remote_url%
    if %errorlevel% neq 0 (
        echo [错误] 添加远程仓库失败
        pause
        exit /b 1
    )
    echo 远程仓库已添加
) else (
    echo 远程仓库已配置
)

:: 获取当前分支名
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set current_branch=%%i
if "%current_branch%"=="" (
    echo 当前没有分支，创建 main 分支...
    git checkout -b main
    set current_branch=main
)
echo 当前分支：%current_branch%

:: 添加所有更改
echo.
echo 正在添加更改...
git add .
if %errorlevel% neq 0 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)

:: 检查是否有内容需要提交
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo 没有需要提交的更改
) else (
    echo 正在提交...
    git commit -m "自动同步 %date% %time%"
    if %errorlevel% neq 0 (
        echo [错误] 提交失败
        pause
        exit /b 1
    )
)

:: 推送到远程
echo.
echo 正在推送到 GitHub...
git push -u origin %current_branch%
if %errorlevel% neq 0 (
    echo.
    echo [错误] 推送失败
    echo 可能的原因：
    echo - 网络不通
    echo - 远程仓库有新的提交（需先 git pull）
    echo - 账号/令牌错误
    echo.
    echo 请手动处理，或重试脚本。
    pause
    exit /b 1
)

echo.
echo ====================================
echo 同步完成！
echo ====================================
pause