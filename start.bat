@echo off
echo 正在启动Mizuka博客管理系统...
echo.

REM 检查Python是否已安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python 3.7或更高版本
    pause
    exit /b 1
)

REM 检查Flask是否已安装
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Flask...
    pip install flask
    if %errorlevel% neq 0 (
        echo 错误: Flask安装失败
        pause
        exit /b 1
    )
)

REM 检查PyYAML是否已安装
python -c "import yaml" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装PyYAML...
    pip install pyyaml
    if %errorlevel% neq 0 (
        echo 错误: PyYAML安装失败
        pause
        exit /b 1
    )
)

REM 检查Markdown是否已安装
python -c "import markdown" >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Markdown...
    pip install markdown
    if %errorlevel% neq 0 (
        echo 错误: Markdown安装失败
        pause
        exit /b 1
    )
)

echo 所有依赖项已就绪，正在启动应用...
echo.
echo 应用将在浏览器中打开: http://localhost:5000
echo 按 Ctrl+C 停止应用
echo.

REM 启动Flask应用
python app_flask.py

pause