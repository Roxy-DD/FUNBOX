---
title: '创建Vue3工程'
description: '创建Vue3工程'
published: 2025-11-10
draft: false
tags:
  - Vue
category: Vue笔记
pinned: false
image: ''
---

## nodejs

前端的基础依赖，优先选择LTS长期支持版

验证安装成功使用 node -v显示版本号即安装成功

## 创建项目

使用 pnpm create vue@latest命令创建vue项目，默认使用vite工具构建

如下所示

```bash
(base) PS D:\> pnpm create vue@latest
┌  Vue.js - The Progressive JavaScript Framework
│
◇  请输入项目名称：
│  vue-project
│
◇  请选择要包含的功能： (↑/↓ 切换，空格选择，a 全选，回车确认)
│  TypeScript, Prettier（代码格式化）
│
◇  选择要包含的试验特性： (↑/↓ 切换，空格选择，a 全选，回车确认)
│  none
│
◇  跳过所有示例代码，创建一个空白的 Vue 项目？
│  No

正在初始化项目 D:\vue-project...
│
└  项目初始化完成，可执行以下命令：

   cd vue-project
   pnpm install
   pnpm format
   pnpm dev

| 可选：使用以下命令在项目目录中初始化 Git：

   git init && git add -A && git commit -m "initial commit"

(base) PS D:\
```

## 【基于 vite 创建】(推荐)

vite 是新一代前端构建工具，官网地址：[https://vitejs.cn](https://vitejs.cn/)，vite的优势如下：

- 轻量快速的热重载（HMR），能实现极速的服务启动。
- 对 TypeScript、JSX、CSS 等支持开箱即用。
- 真正的按需编译，不再等待整个应用编译完成。
- webpack构建 与 vite构建对比图如下：
- ![1683167182037-71c78210-8217-4e7d-9a83-e463035efbbe](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/1683167182037-71c78210-8217-4e7d-9a83-e463035efbbe-20251110230838-bs4tsaj.png)
- ![1683167204081-582dc237-72bc-499e-9589-2cdfd452e62f](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/1683167204081-582dc237-72bc-499e-9589-2cdfd452e62f-20251110230843-ex2d8pa.png)
- 具体操作如下（点击查看[官方文档](https://cn.vuejs.org/guide/quick-start.html#creating-a-vue-application)）

```
## 1.创建命令
npm create vue@latest

## 2.具体配置
## 配置项目名称
√ Project name: vue3_test
## 是否添加TypeScript支持
√ Add TypeScript?  Yes
## 是否添加JSX支持
√ Add JSX Support?  No
## 是否添加路由环境
√ Add Vue Router for Single Page Application development?  No
## 是否添加pinia环境
√ Add Pinia for state management?  No
## 是否添加单元测试
√ Add Vitest for Unit Testing?  No
## 是否添加端到端测试方案
√ Add an End-to-End Testing Solution? » No
## 是否添加ESLint语法检查
√ Add ESLint for code quality?  Yes
## 是否添加Prettiert代码格式化
√ Add Prettier for code formatting?  No
```

自己动手编写一个App组件

```
<template>
  <div class="app">
    <h1>你好啊！</h1>
  </div>
</template>

<script lang="ts">
  export default {
    name:'App' //组件名
  }
</script>

<style>
  .app {
    background-color: #ddd;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 20px;
  }
</style>
```

安装官方推荐的vscode插件：

![image-20231218085906380](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/image-20231218085906380-20251110230802-n4hj1g7.png)

![volar](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/volar-20251110230806-4qnuvic.png)

总结：

- Vite 项目中，index.html 是项目的入口文件，在项目最外层。
- 加载index.html后，Vite 解析 <script type="module" src="xxx"> 指向的JavaScript。
- Vue3中是通过 createApp 函数创建一个应用实例。

## 2.3. 【一个简单的效果】

Vue3向下兼容Vue2语法，且Vue3中的模板中可以没有根标签

```
<template>
  <div class="person">
    <h2>姓名：{{name}}</h2>
    <h2>年龄：{{age}}</h2>
    <button @click="changeName">修改名字</button>
    <button @click="changeAge">年龄+1</button>
    <button @click="showTel">点我查看联系方式</button>
  </div>
</template>

<script lang="ts">
  export default {
    name:'App',
    data() {
      return {
        name:'张三',
        age:18,
        tel:'13888888888'
      }
    },
    methods:{
      changeName(){
        this.name = 'zhang-san'
      },
      changeAge(){
        this.age += 1
      },
      showTel(){
        alert(this.tel)
      }
    },
  }
</script>
```

