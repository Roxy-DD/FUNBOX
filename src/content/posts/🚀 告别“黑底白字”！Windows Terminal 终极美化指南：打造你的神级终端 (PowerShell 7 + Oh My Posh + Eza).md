---
title: 🚀 告别“黑底白字”！Windows Terminal 终极美化指南：打造你的神级终端 (PowerShell 7 + Oh My Posh + Eza)
description: 还在忍受 Windows 自带那个又丑又慢的蓝色框框？羡慕 Mac/Linux 用户那样酷炫的终端？今天带你用一套“组合拳”，把你的 Windows Terminal 变成效率与颜值兼备的开发神器！支持秒开、智能提示、图标显示和网格布局。包含一键懒人脚本！
published: 2025-12-11
draft: false
tags:
  - 工具
  - 指南
category: 指南
pinned: false
image: ""
---
正文模板

> **摘要**：还在忍受 Windows 自带那个又丑又慢的蓝色框框？羡慕 Mac/Linux 用户那样酷炫的终端？今天带你用一套“组合拳”，把你的 Windows Terminal 变成效率与颜值兼备的开发神器！支持**秒开**、**智能提示**、**图标显示**和**网格布局**。包含**一键懒人脚本**！

---

## 🧐 为什么要折腾这个？

作为程序员，终端（Terminal）就是我们的第二个家。但是 Windows 默认的 PowerShell 5.1（那个蓝色的）...怎么说呢，确实有点“复古”。

**我们想要的是这样的终端：**

1. **颜值即正义**：要有高大上的提示符（Prompt），不仅好看，还要能显示 Git 分支、Python 版本、运行时间。
    
2. **一目了然**：`ls` 列出文件时，不仅要有颜色，还要有图标，最好能像 Linux 那样整齐的网格平铺。
    
3. **速度要快**：不能为了美化牺牲启动速度，必须秒开！
    

今天，我们使用 **PowerShell 7 + Oh My Posh (Spaceship主题) + Eza + Vivid** 这套目前 GitHub 上最流行的黄金搭档来实现它！

---

## 🛠️ 第一步：地基要打好 (必看前置)

在开始美化之前，必须搞定两件事，否则后面全是乱码！

### 1. 安装 Windows Terminal 和 PowerShell 7

别用老的 `cmd` 了！

- 去 **Microsoft Store** 搜索下载 **Windows Terminal**。
    
- 去 **Microsoft Store** 搜索下载 **PowerShell** (图标是黑色的，不是蓝色的！)。
    
- 打开 Windows Terminal 设置，把**默认配置文件**改成黑色的 PowerShell。
    

### 2. 安装 Nerd Font 字体 (乱码救星) 🚨

**这是 99% 的人失败的原因！** 普通字体没有那些漂亮的图标（Git 分支图标、文件夹图标）。

- **下载**：推荐 [MesloLGM Nerd Font](https://www.google.com/search?q=https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/Meslo.zip) 或 [CaskaydiaCove Nerd Font](https://www.google.com/search?q=https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/CascadiaCode.zip)。
    
- **安装**：解压 -> 全选 ttf 文件 -> 右键“安装”。
    
- **配置**：打开 Windows Terminal 设置 -> 左侧选择“PowerShell” -> **外观** -> **字体** -> 选择你刚才安装的 Nerd Font -> **保存**。
    

---

## ⚡ 第二步：懒人一键安装脚本 (强烈推荐)

我知道大家都不想一行行敲命令。为了防止输错代码或环境变量不生效，我写了一个**智能容错脚本**。

它会自动帮你：

✅ 安装 Oh My Posh, Eza, Vivid

✅ 下载极简的 Spaceship 主题

✅ 配置智能缓存（实现秒开）

✅ 设置 ls 别名（实现网格图标显示）

**使用方法：**

1. **右键** Windows Terminal，选择**“以管理员身份运行”**。
    
2. 复制下面所有代码，粘贴进终端，回车！
    

PowerShell

```
# ==========================================
# 🚀 Windows 终端美化 - 懒人一键脚本 v2.0
# ==========================================

$ErrorActionPreference = "SilentlyContinue"
Write-Host ">>> 开始执行懒人配置..." -ForegroundColor Cyan

# 1. 检查并安装核心工具 (Winget)
Write-Host "📦 [1/4] 正在检查核心组件..." -ForegroundColor Yellow
$packages = @("JanDeDobbeleer.OhMyPosh", "eza-community.eza", "sharkdp.vivid")
foreach ($pkg in $packages) {
    Write-Host "    - 正在处理 $pkg ..."
    winget install --id $pkg --source winget --accept-source-agreements --accept-package-agreements
}

# 2. 下载 Spaceship 主题到本地 (防止网络超时)
Write-Host "🎨 [2/4] 正在部署 Spaceship 主题..." -ForegroundColor Yellow
$themePath = "$env:USERPROFILE\spaceship.omp.json"
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/spaceship.omp.json' -OutFile $themePath

# 3. 生成智能配置文件
Write-Host "📝 [3/4] 正在写入配置文件 ($PROFILE)..." -ForegroundColor Yellow

# 确保配置目录存在
if (!(Test-Path (Split-Path $PROFILE))) { New-Item -ItemType Directory -Path (Split-Path $PROFILE) -Force }

# 写入完美的配置代码
$Content = @"
# =======================================================
#  自动生成的终极配置 (Oh My Posh + Eza + Vivid)
# =======================================================

# 1. 智能启动 Oh My Posh (静态缓存加速)
`$omp_config = "$env:USERPROFILE\spaceship.omp.json"
`$omp_cache  = "$env:USERPROFILE\omp_init.ps1"

if (Test-Path `$omp_cache) {
    . `$omp_cache
} else {
    # 第一次启动或缓存丢失时，自动生成
    if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
        oh-my-posh init pwsh --config `$omp_config --print > `$omp_cache
        . `$omp_cache
    }
}

# 2. 颜色配置 (Vivid - Gruvbox Dark 暖色调)
if (Get-Command vivid -ErrorAction SilentlyContinue) {
    `$env:LS_COLORS = (vivid generate gruvbox-dark | Out-String).Trim()
}

# 3. Eza 配置 (网格+图标)
if (Get-Command eza -ErrorAction SilentlyContinue) {
    # 清除旧别名
    if (Test-Path alias:ls) { Remove-Item alias:ls }
    
    # 定义超强命令
    # ls: 网格平铺 + 图标 + 文件夹优先
    function ls { eza --icons --grid --classify --group-directories-first `$args }
    # ll: 详细列表
    function ll { eza --long --header --icons --git --group-directories-first `$args }
    # lg: 混合视图 (墙裂推荐)
    function lg { eza --long --grid --icons --header --git --time-style relative --group-directories-first `$args }
    # tree: 树形目录
    function tree { eza --tree --icons `$args }
}

# 4. 细节微调
`$PSStyle.FileInfo.Directory = "`e[34m"
"@

Set-Content -Path $PROFILE -Value $Content -Encoding utf8

Write-Host "✅ [4/4] 安装与配置完成！" -ForegroundColor Green
Write-Host "------------------------------------------------"
Write-Host "⚠️  重要提示：请务必执行以下最后两步 ⚠️" -ForegroundColor Red
Write-Host "1. 关闭当前所有终端窗口，重新打开 (让环境变量生效)。" -ForegroundColor White
Write-Host "2. 确保你的终端字体已设置为 'Nerd Font'，否则图标会显示为乱码方块。" -ForegroundColor White
Write-Host "------------------------------------------------"
```

---

## 🕹️ 使用指南：新终端能干什么？

重启终端后，你现在拥有的不仅仅是好看，更是生产力。

### 1. 智能提示符 (Prompt)

你现在使用的是 **Spaceship** 主题。

- **平时**：它非常干净，只显示路径，不打扰你。
    
- **Git仓库**：进入有 `.git` 的文件夹，它会自动显示 `on  main` (分支名) 和状态颜色。
    
- **Python/Node**：进入代码目录，它会显示 `via 🐍 3.10` 或 `via ⬢ 18.0`。
    

### 2. 超级列表命令

别再用原来的 `dir` 或 `ls` 了，试试这两个新命令：

- 输入 ls：
    
    你会看到类似 Linux 的网格平铺视图！文件图标一目了然，文件夹自动排在最前面，颜色使用的是舒适的 Gruvbox 暖色调。
    
- 输入 lg (List Grid)：
    
    这是我最推荐的视图！它既保留了网格布局（省空间），又显示了文件大小和修改时间。卡片式的信息展示，极度舒适。
    

---

## ⚡ 进阶技巧：如何解决“卡顿”？

如果你觉得启动时有 0.5秒~1秒 的延迟，或者运行命令时有一点点顿挫感，这是 **Windows Defender** 在扫描美化工具。

**30秒解决法：**

1. 打开 **Windows 安全中心** -> 病毒和威胁防护 -> 管理设置 -> **排除项**。
    
2. 添加两个**“进程”**排除项（注意选进程）：
    
    - `oh-my-posh.exe`
        
    - `eza.exe`
        

做完这一步，你的终端就是真正的**瞬开**了。

---

## 🛑 常见避坑 QA

Q: 我重启后，图标全是方块 □ 或者问号 ?？

A: 字体！字体！字体！你肯定没在 Windows Terminal 设置里把“PowerShell”的字体改成 Nerd Font。请回到第一步检查。

Q: 运行脚本时提示“禁止运行脚本”？

A: 这是 PowerShell 的安全策略。以管理员运行终端，输入 Set-ExecutionPolicy RemoteSigned 然后回车选 Y 即可。

Q: 输入 ls 报错 Unknown argument？

A: 你的 eza 参数写错了。请务必使用我上面的懒人脚本，我使用的是最新版兼容参数 --group-directories-first。

---

### 🎉 结语

折腾终端不是为了花哨，而是为了**取悦自己**。每天面对一个赏心悦目、交互流畅的黑色窗口，写代码的心情都会变好，效率自然也就高了（确信）。
