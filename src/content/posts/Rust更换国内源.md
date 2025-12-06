---
title: 'Rust更换国内源'
description: 'Rust更换国内源的方法'
published: 2025-08-12
draft: false
tags: [Rust, 参考资料]
category: Rust笔记
pinned: false
image: ''
---
------

- Rust更换国内源 - nohup的博客
- https://nohup.life/post/Rust-change-source/index.html
- cargo，rustup换源
- 2025-08-11 01:35

------

## Rust更换国内源

发表于2021-06-06|[编程](https://nohup.life/categories/code/)

|字数总计:316

## 一、前言

Rust的两个工具换源：工具链管理器rustup，包管理器cargo。

## 二、rustup换源

rustup 可以设置两个源，一个用于更新工具链，一个用于更新 rustup 自身。

```text
# 清华大学
RUSTUP_UPDATE_ROOT=https://mirrors.tuna.tsinghua.edu.cn/rustup/rustup
RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup

# 中国科学技术大学
RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static

# 上海交通大学
RUSTUP_DIST_SERVER=https://mirrors.sjtug.sjtu.edu.cn/rust-static/

#官方
RUSTUP_UPDATE_ROOT=https://static.rust-lang.org/rustup
RUSTUP_UPDATE_ROOT=https://static.rust-lang.org
```

选择要使用的源。

### Win

![设置环境变量](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/win-20250812013504-5heqjhu.png)

设置环境变量

### Linux

bash运行

```bash
echo 'export RUSTUP_UPDATE_ROOT=https://mirrors.tuna.tsinghua.edu.cn/rustup/rustup' >> ~/.bash_profile
echo 'export RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup' >> ~/.bash_profile
```

## 三、cargo换源

### Win

将如下配置写入 <b b-added-by-siyuan="true">C:/Users/你的用户名/.cargo/config</b> 文件（没有就新建）。

```ini
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

# 替换成要使用的镜像源
replace-with = 'tuna'

# 清华大学
[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"

# 中国科学技术大学
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"

# 上海交通大学
[source.sjtu]
registry = "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index"

# rustcc社区
[source.rustcc]
registry = "git://crates.rustcc.cn/crates.io-index"
```

### Linux

将上述配置配置写入 <b b-added-by-siyuan="true">home/.cargo/config</b> 文件。
