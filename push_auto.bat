@echo off
rem 完全自动化推送脚本，无需用户操作

echo =======================================
echo 正在自动推送到 GitHub...
echo =======================================

rem 切换到项目目录
cd /d "d:\shop_328" 2>nul

rem 检查 Git 是否存在
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到 Git 命令，请确保 Git 已安装并添加到环境变量
    timeout /t 3 >nul
    exit /b 1
)

echo.
echo [1/6] 初始化 Git 仓库...
git init >nul 2>&1

echo.
echo [2/6] 配置用户名和邮箱...
git config user.name "peng676" >nul 2>&1
git config user.email "peng676@github.com" >nul 2>&1

echo.
echo [3/6] 添加文件到暂存区...
git add . >nul 2>&1

echo.
echo [4/6] 提交文件...
git commit -m "Update files - %date% %time%" >nul 2>&1

echo.
echo [5/6] 设置主分支并关联远程仓库...
git branch -M main >nul 2>&1
git remote remove origin >nul 2>&1
git remote add origin https://github.com/peng676/shop_328.git >nul 2>&1

echo.
echo [6/6] 推送到 GitHub...
git push -u origin main >nul 2>&1
if %errorlevel% neq 0 (
    echo 推送失败，尝试拉取合并...
    git pull origin main --rebase --allow-unrelated-histories >nul 2>&1
    if %errorlevel% equ 0 (
        echo 合并成功，再次推送...
        git push -u origin main >nul 2>&1
    )
)

echo.
echo =======================================
echo 执行完毕！
echo 仓库地址：https://github.com/peng676/shop_328
echo =======================================

rem 等待 2 秒后自动退出
timeout /t 2 >nul