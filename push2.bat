@echo off
chcp 65001 >nul
echo =======================================
echo 正在推送到 GitHub...
echo =======================================

cd /d "d:\shop_328" || (echo 目录不存在！请检查路径。 & pause & exit /b 1)

echo.
echo [1/4] 检查 Git 状态...
git status

set "hasChanges=false"
for /f "delims=" %%i in ('git status --porcelain') do (
    set "hasChanges=true"
    goto :changesFound
)
:changesFound

if "%hasChanges%" equ "true" (
    echo.
    echo [2/4] 添加文件到暂存区...
    git add .
    
    echo.
    echo [3/4] 提交文件...
    git commit -m "Update files - %date% %time%"
) else (
    echo.
    echo [2/4] 没有文件需要提交，跳过提交步骤...
)

echo.
echo [4/4] 推送到 GitHub...
echo 尝试推送...
git push origin main

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
        git push origin main
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