@echo off
chcp 65001 >nul
echo =======================================
echo 正在自动配置 Git 并推送到 GitHub...
echo =======================================

cd /d "d:\shop_328" || (echo 目录不存在！请检查路径。 & pause & exit /b 1)

echo.
echo [1/6] 初始化 Git 仓库...
git init

echo.
echo [2/6] 配置用户名和邮箱（仅针对当前仓库）...
git config user.name "peng676"
git config user.email "peng676@github.com"

echo.
echo [3/6] 添加文件到暂存区...
git add .

echo.
echo [4/6] 提交文件...
git commit -m "Update files - %date% %time%"

echo.
echo [5/6] 设置主分支并关联远程仓库...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/peng676/shop_328.git

echo.
echo [6/6] 开始推送到 GitHub...
echo 尝试推送，如果失败将尝试拉取合并...
git push -u origin main
if errorlevel 1 (
    echo.
    echo 推送失败，可能是远程有更新。尝试先拉取合并...
    git pull origin main --rebase --allow-unrelated-histories
    if errorlevel 1 (
        echo 拉取合并失败，请手动处理冲突。
        pause
        exit /b 1
    ) else (
        echo 合并成功，再次推送...
        git push -u origin main
        if errorlevel 1 (
            echo 推送仍然失败，请检查错误信息。
            pause
            exit /b 1
        )
    )
)

echo.
echo =======================================
echo 执行完毕！成功推送到 GitHub。
echo 仓库地址：https://github.com/peng676/shop_328
echo =======================================
pause