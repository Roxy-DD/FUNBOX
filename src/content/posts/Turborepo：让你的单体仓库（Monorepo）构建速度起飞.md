---
title: Turborepo：让你的单体仓库（Monorepo）构建速度起飞
description: Turborepo 是一个用于 JavaScript 和 TypeScript 代码库的高性能构建系统。它由 Jared Palmer 创建，目前由 Vercel（Next.js 的开发团队）维护。
published: 2025-12-09
draft: false
tags:
  - Turborepo
  - 工具
  - 开源
category: 工具
pinned: false
image: ""
---
在现代前端开发中，**Monorepo（单体仓库）** 架构正变得越来越流行。将 Web 端、桌面端（如 Tauri/Electron）、小程序以及共享的 UI 组件库放在同一个 Git 仓库中管理，带来了极大的代码复用便利。

但随着项目规模的扩大，一个致命的痛点随之而来：**构建（Build）速度越来越慢**。

如果你厌倦了在这个项目中运行 `npm run build` 后漫长的等待，那么 **Turborepo** 就是你急需的救星。

## 什么是 Turborepo？

Turborepo 是一个用于 JavaScript 和 TypeScript 代码库的高性能构建系统。它由 Jared Palmer 创建，目前由 **Vercel**（Next.js 的开发团队）维护。

简单来说，Turborepo 不会重写你的代码，它是一个**智能的任务调度管家**。它接管了你的 `build`、`test`、`lint` 等命令，通过极其聪明的缓存和并行策略，将构建时间从“几分钟”压缩到“几秒钟”。

## 核心痛点：Monorepo 的性能瓶颈

假设你有一个包含 Tauri 桌面端、Next.js 网页端和 Shared UI 库的项目：

Plaintext

```
/apps
  /web (Next.js)
  /desktop (Tauri)
/packages
  /ui (Shared Components)
```

在传统的构建工具（如早期的 Lerna 或简单的 npm scripts）中，任务通常是**串行**或**全量**执行的：

1. 不管你改没改代码，每次都重新构建 UI 库。
    
2. 构建完 UI 库，再去构建 Web，最后构建 Desktop。
    
3. CPU 可能只有一个核心在工作，其他核心在围观。
    

这就是 Turborepo 要解决的问题。

## Turborepo 的三大杀手锏

### 1. 智能并行执行 (Parallel Execution)

Turborepo 能通过静态分析，自动生成一张**任务依赖图（DAG）**。

- 它知道 `Web` 和 `Desktop` 都依赖 `UI`。
    
- 它知道 `Web` 和 `Desktop` 之间互不依赖。
    

因此，它的执行逻辑是：

1. **先跑 UI**（利用多核 CPU 快速完成）。
    
2. **UI 完成后，同时启动 Web 和 Desktop 的构建**。
    

这意味着你的构建时间不再是 `Time(UI) + Time(Web) + Time(Desktop)`，而是被压缩成了 `Time(UI) + Max(Time(Web), Time(Desktop))`。

### 2. 增量构建与多级缓存 (Incremental Computation)

这是 Turborepo 最核心的“黑科技”。它不会盲目地执行命令，而是先做一次**指纹比对**。

当你运行任务时，Turborepo 会计算一个 Hash 值，这个值包含了：

- 源文件的内容
    
- 环境变量
    
- **依赖项的 Hash 值**
    

场景演示：

你修改了 apps/web 里的一行代码，但没有碰 packages/ui 和 apps/desktop。

- **UI 库：** Hash 没变 ➡️ **直接命中缓存 (HIT)**。Turborepo 会在毫秒级时间内从硬盘恢复上次构建出的 `.js` 文件。
    
- **Desktop：** 代码没变，依赖的 UI 也没变 ➡️ **命中缓存 (HIT)**。
    
- **Web：** 自身代码变了 ➡️ **未命中 (MISS)**。Turborepo 只会重新构建 Web 这一部分。
    

这种机制被称为“**永远不要做重复的工作**”。

### 3. 远程缓存 (Remote Caching)

如果你觉得本地缓存已经很快了，Turborepo 还有更进一步的玩法：**云端缓存**。

在一个团队中，如果同事 A 已经构建过了 `packages/ui`，Turborepo 可以将这个缓存上传到云端（Vercel Cloud 或自建服务器）。当你拉取代码并在自己电脑上运行时，Turborepo 会发现云端已经有这个 Hash 了，直接下载产物。

**结果：** 你甚至不需要构建你同事已经构建过的代码。

## 实战：如何在 Tauri + Next.js 项目中配置

要在项目中启用 Turborepo，核心在于根目录下的 `turbo.json` 配置文件。

### 1. 定义任务管道

JSON

```
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // ^ 表示拓扑依赖：构建我之前，先构建我的所有依赖项
      "dependsOn": ["^build"],
      // 告诉 Turbo 哪些文件是产出物，需要被缓存
      "outputs": [".next/**", "dist/**", "src-tauri/target/**"]
    },
    "dev": {
      // 开发模式不需要缓存，且需要持久运行
      "cache": false,
      "persistent": true
    }
  }
}
```

### 2. 享受开发体验

配置完成后，你只需要在根目录运行：

Bash

```
npx turbo build
```

你将看到终端输出中不同颜色的任务条。第一次可能需要一点时间，但当你紧接着运行第二次时，你会看到那个令人心情愉悦的标志：

> **FULL TURBO** (耗时 < 100ms)

## 总结

Turborepo 是 Monorepo 架构的完美拼图，特别是对于像 **Tauri + Web** 这种“一码多端”的现代项目。

它不仅帮你实现了**代码复用**（通过 Workspace），更通过**空间换时间**的策略，让你在享受单体仓库便利的同时，彻底告别了臃肿缓慢的构建流程。

如果你的团队正在维护一个包含多个应用和共享库的项目，引入 Turborepo 可能是你今年做出的最高 ROI（投资回报率）的技术决策。

---

### 下一步行动

你可以尝试在本地通过官方脚手架快速体验：

npx create-turbo@latest

## CI/CD 配置是什么CI/CD 是什么

如果说 **Turborepo** 是你本地的“加速外挂”，那么 **CI/CD** 就是帮你全自动干活的“云端机器人”。这两者通常是焦不离孟的。

### CI/CD 是什么？

你可以把 CI/CD 想象成一个**全自动化的软件流水线工厂**。

#### 1. CI (Continuous Integration) - 持续集成

**“合并代码前的安检机器”**

- **场景：** 你和小王都在开发同一个项目。你写了 UI，他写了后端。你们每天都要把代码合并（Merge）到主分支。
    
- **问题：** 万一你的代码和小王的代码冲突了？或者你把代码传上去，结果别人一下载就报错跑不起来？
    
- CI 做什么：
    
    当你按下 git push（上传代码）时，云端服务器会自动启动一个机器人。它会：
    
    1. 下载你的代码。
        
    2. 安装依赖（`npm install`）。
        
    3. **运行测试**（`npm test`）。
        
    4. **尝试构建**（`npx turbo build`）。
        
    
    - **结果：** 如果任何一步出错，机器人会立刻发邮件骂你（报错），并禁止这段代码合并。
        

#### 2. CD (Continuous Delivery/Deployment) - 持续交付/部署

**“自动打包发货的快递员”**

- **场景：** 代码通过了 CI 的检查，没 Bug 了。现在你要把它发布给用户（比如更新网站，或者发布 Tauri 的 `.exe` 安装包）。
    
- **问题：** 手动发布很累。你要自己打包、自己登录服务器上传、自己重启服务。
    
- CD 做什么：
    
    一旦 CI 检查通过，CD 机器人接手：
    
    1. **自动打包**（生成 .exe 或 .dmg）。
        
    2. **自动上传** 到服务器或应用商店。
        
    3. **自动更新** 线上网站。
        
    
    - **结果：** 你只需要喝着咖啡提交一行代码，几分钟后，全世界的用户就用上新版本了。
        

![CI CD pipeline workflow diagram的图片](https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTyJWgWFRoflELz5kWNvAwB0Qc7c0AvZ81jvCu7bXNQVY07bsgRtceEob1e3w-12c6lChOG8FA0xsM67XF8XkdLevPWfnKmrseLna4EIhvCF8wg03Q)

### CI/CD 配置是什么？

**配置**就是你写给这个机器人的**“操作手册”**。

机器人很笨，它不知道怎么运行你的代码。你需要写一个文件（通常是 YAML 格式），一步一步告诉它该干什么。

不同的平台配置文件的名字不一样：

- **GitHub Actions:** `.github/workflows/main.yml` (最流行)
    
- **GitLab CI:** `.gitlab-ci.yml`
    
- **Jenkins:** `Jenkinsfile`
    

#### 一个典型的配置长什么样？（以 GitHub Actions 为例）

这个配置文件通常包含三个核心部分：

1. **Trigger (触发器)：** 什么时候干活？（比如：有人 push 代码时）。
    
2. **Environment (环境)：** 在哪干活？（比如：给我开一台 Ubuntu 的虚拟电脑）。
    
3. **Steps (步骤)：** 具体干什么？（拉代码 -> 装环境 -> 跑 Turbo）。
    

让我们来看一个结合了 **Turborepo + Tauri** 的真实配置案例：

YAML

```
# 文件名: .github/workflows/build.yml

# 1. 触发器：当有人 push 代码到 main 分支时
on:
  push:
    branches: ["main"]

# 2. 任务列表
jobs:
  build-and-test:
    # 环境：在最新的 Ubuntu 虚拟机上运行
    runs-on: ubuntu-latest

    # 3. 步骤：机器人的具体动作
    steps:
      # 第一步：把代码从仓库里拉下来
      - name: Checkout code
        uses: actions/checkout@v3

      # 第二步：安装 Node.js 环境
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      # 第三步：安装 pnpm (Turborepo 推荐的包管理器)
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        
      # 第四步：安装依赖
      - name: Install dependencies
        run: pnpm install

      # ==========================================
      # 第五步：【关键】召唤 Turborepo
      # 这一步会同时构建 Web 和 Tauri (如果是纯构建检查)
      # 并且会自动利用云端缓存！
      # ==========================================
      - name: Build with Turbo
        run: npx turbo build
```

---

### Turborepo 在 CI/CD 里的神级作用

你可能会问：“既然 CI/CD 就是自动跑脚本，那有没有 Turborepo 有什么区别？”

**区别在于：钱和时间。**

CI/CD 服务通常是**按分钟收费**的（或者免费额度有限）。

- **没有 Turborepo：** 每次提交代码，CI 都要傻傻地从头构建所有东西。耗时 10 分钟。
    
- **有 Turborepo：**
    
    1. 你上传代码。
        
    2. CI 里的 Turborepo 启动。
        
    3. 它检查云端缓存（Remote Cache）。
        
    4. 它发现：“咦？UI 库和 Web 端都没变，只有 Tauri 端变了。”
        
    5. **它直接跳过 UI 和 Web 的构建**，只跑 Tauri。
        
    6. **耗时 2 分钟。**
        

**总结：**

- **CI/CD** 是那个帮你自动干脏活累活的**机器人**。
    
- **配置 (YAML)** 是你写给机器人的**说明书**。
    
- **Turborepo** 是你给机器人装的**高速马达**，让它干活快十倍。