@echo off
:: 设置变量
set SOURCE_DIR=build
set DEST_USER=zzy
set DEST_HOST=10.50.3.98
set DEST_PATH=/var/www/html

:: 使用 scp 命令复制文件
scp -r "%SOURCE_DIR%\*" "%DEST_USER%@%DEST_HOST%:%DEST_PATH%"

:: 检查命令是否成功执行
if %errorlevel% equ 0 (
    echo success
) else (
    echo fail
)

pause