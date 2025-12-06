---
title: 'Claude Code Router 安装配置使用教程'
description: '本教程将教你如何快速安装和配置 CCR。'
published: 2025-11-14
draft: false
tags:
  - AI
category: AI工具
pinned: false
image: ''
---

## 简介

Claude Code Router (CCR) 是一个强大的工具，可以将 Claude Code 请求路由到不同的模型，包括免费的 GLM-4.5-Flash 模型。本教程将教你如何快速安装和配置 CCR。

参考资料：

- [Claude Code Router GitHub](https://github.com/musistudio/claude-code-router)

## 安装步骤

### 1. 安装 Claude Code

首先，确保已安装 Claude Code：

```
npm install -g @anthropic-ai/claude-code
```

验证安装：

```
claude --version
```

### 2. 安装 Claude Code Router

安装 CCR：

```
npm install -g @musistudio/claude-code-router
```

验证安装：

```
ccr --version
```

## 基本配置

### 启动 CCR UI

使用 Web 界面管理配置：

```
ccr ui
```

![image](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/20251114051242.png)

### 添加 GLM-4.5-Flash 模型

1. 打开 CCR UI 界面
2. 点击 "添加供应商" 按钮
3. 填写配置信息：
   - 模板：智谱
   - Name: 智谱
   - API URL: https://open.bigmodel.cn/api/paas/v4/chat/completions
   - API Key: 你的 GLM API 密钥
   - 模型: glm-4.5-flash
4. 点击保存

![image](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/20251114051624.png)

### 配置文件方式

也可以直接编辑配置文件 ~/.claude-code-router/config.json：

```
{
  "Providers": [
    {
      "name": "glm",
      "api_base_url": "https://open.bigmodel.cn/api/paas/v4",
      "api_key": "your-api-key",
      "models": ["glm-4.5-flash"]
    }
  ],
  "Router": {
    "default": "glm,glm-4.5-flash"
  }
}
```

## 使用方法

### 启动路由器

```
ccr start
//或者
ccr code
```

### 使用激活命令

```
eval "$(ccr activate)"
```

现在可以直接使用 claude 命令，请求会自动路由到配置的模型。

### CLI 模型管理

使用交互式 CLI 管理模型：

```
ccr model
```

![image](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/20251114051727.png)

## 实际使用

### 在项目中使用

```
ccr code
```

### 动态切换模型

在 Claude Code 中使用 /model 命令：

```
/model glm,glm-4.5-flash
```

## 常见问题

### 安装失败

```
npm cache clean --force
npm install -g @musistudio/claude-code-router --force
```

### 配置不生效

重启路由器服务：

```
ccr restart
```

### API 连接问题

- 检查 API 密钥是否正确
- 确保网络连接正常
- 验证 API 端点可访问

## 总结

Claude Code Router 让你可以轻松使用免费的 GLM-4.5-Flash 模型。通过 CCR UI 界面，配置过程非常简单，几分钟就能完成设置并开始使用。