# 将当前项目的Admin Dashboard更改复制到Fork仓库的脚本
# 
# 使用方法：
# 1. 先Fork官方仓库并clone到本地
# 2. 修改下面的 $targetRepo 路径为你clone的仓库路径
# 3. 运行此脚本：powershell -ExecutionPolicy Bypass -File .\copy-to-fork.ps1

# ===== 配置区域 =====
$sourceRepo = "d:\code\mizuki_funbox"           # 当前项目路径
$targetRepo = "d:\code\Mizuki"                   # 你Fork并clone的仓库路径（需要修改）

# ===== 检查目标路径 =====
if (-not (Test-Path $targetRepo)) {
    Write-Host "❌ 错误: 目标仓库路径不存在: $targetRepo" -ForegroundColor Red
    Write-Host "请先clone你fork的仓库，然后修改脚本中的 `$targetRepo 变量" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 开始复制Admin Dashboard文件..." -ForegroundColor Cyan

# ===== 复制整个目录 =====
$directories = @(
    "admin",
    "src\data\json",
    "docs\image\admin"
)

foreach ($dir in $directories) {
    $source = Join-Path $sourceRepo $dir
    $target = Join-Path $targetRepo $dir
    
    if (Test-Path $source) {
        Write-Host "📁 复制目录: $dir" -ForegroundColor Green
        
        # 创建目标目录
        $targetParent = Split-Path $target -Parent
        if (-not (Test-Path $targetParent)) {
            New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
        }
        
        # 复制整个目录
        Copy-Item -Path $source -Destination $targetParent -Recurse -Force
        Write-Host "  ✓ 完成" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ 源目录不存在，跳过: $dir" -ForegroundColor Yellow
    }
}

# ===== 复制单个文件 =====
$files = @(
    "docs\ADMIN_GUIDE.md",
    "README.md",
    "README.zh.md"
)

foreach ($file in $files) {
    $source = Join-Path $sourceRepo $file
    $target = Join-Path $targetRepo $file
    
    if (Test-Path $source) {
        Write-Host "📄 复制文件: $file" -ForegroundColor Green
        Copy-Item -Path $source -Destination $target -Force
        Write-Host "  ✓ 完成" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ 源文件不存在，跳过: $file" -ForegroundColor Yellow
    }
}

# ===== 复制PR相关文件（可选） =====
Write-Host "`n📋 复制PR相关文档..." -ForegroundColor Cyan
$prFiles = @(
    "PULL_REQUEST.md",
    "PR_CHECKLIST.md"
)

foreach ($file in $prFiles) {
    $source = Join-Path $sourceRepo $file
    $target = Join-Path $targetRepo $file
    
    if (Test-Path $source) {
        Write-Host "📄 复制: $file" -ForegroundColor Green
        Copy-Item -Path $source -Destination $target -Force
    }
}

Write-Host "`n✅ 文件复制完成！" -ForegroundColor Green
Write-Host "`n下一步操作：" -ForegroundColor Cyan
Write-Host "1. cd $targetRepo" -ForegroundColor White
Write-Host "2. git status               # 查看修改的文件" -ForegroundColor White
Write-Host "3. git add .                # 添加所有更改" -ForegroundColor White
Write-Host "4. git commit -m 'feat: Add admin dashboard with full CRUD'" -ForegroundColor White
Write-Host "5. git push origin feature/admin-dashboard" -ForegroundColor White
Write-Host "6. 在GitHub上创建Pull Request" -ForegroundColor White

Write-Host "`n💡 提示: PR描述内容在 PULL_REQUEST.md 文件中" -ForegroundColor Yellow
