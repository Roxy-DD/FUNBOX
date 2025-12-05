---
title: Vector3的使用
description: unity中的Vector3的使用
tags:
- Unity
category: Unity笔记
published: 2025-11-08
pubDate: 2025-11-08
date: 2025-11-08
draft: false
---

## 一、脚本概述

VectorTest 是一个基于Unity引擎的C#脚本，用于演示三维向量（Vector3）的基本操作，包括向量的初始化、夹角计算、距离计算、点积、叉积、插值、旋转、缩放、求模和规范化等操作。

## 二、脚本结构

### 1. 命名空间和类定义

```csharp
using UnityEngine;

namespace TimeGhost.Assets
{
    public class VectorTest : MonoBehaviour
    {
        // ...
    }
}
```

- 命名空间：TimeGhost.Assets
- 类名：VectorTest，继承自 MonoBehaviour，这意味着它可以挂载到Unity的游戏对象上。

### 2. Start 方法

```csharp
void Start()
{
    Vector3 v = Vector3.right;
    Vector3 v2 = Vector3.forward;

    // 夹角计算
    // Debug.Log(Vector3.Angle(v, v2));

    // 距离计算
    // Debug.Log(Vector3.Distance(v, v2));

    // 点积计算
    // Debug.Log(Vector3.Dot(v, v2));

    // 叉积计算
    // Debug.Log(Vector3.Cross(v, v2));

    // 线性插值
    // Debug.Log(Vector3.Lerp(v, v2, 0.5f));

    // 旋转操作
    // transform.Rotate(Vector3.up, 90);

    // 缩放操作
    // transform.localScale = new Vector3(2, 2, 2);

    // 向量的模
    // Debug.Log(v.magnitude);

    // 规范化向量
    Debug.Log(v.normalized);
}
```

- 功能：在第一帧更新之前调用，用于初始化向量操作。
- 向量初始化：
  - v 初始化为 Vector3.right，即 (1, 0, 0)。
  - v2 初始化为 Vector3.forward，即 (0, 0, 1)。
- 向量操作：
  - 夹角计算：使用 Vector3.Angle 方法。
  - 距离计算：使用 Vector3.Distance 方法。
  - 点积计算：使用 Vector3.Dot 方法。
  - 叉积计算：使用 Vector3.Cross 方法。
  - 线性插值：使用 Vector3.Lerp 方法，插值比例为 0.5f。
  - 旋转操作：使用 transform.Rotate 方法，绕 y 轴旋转 90 度。
  - 缩放操作：使用 transform.localScale 属性，将对象在三个坐标轴上都放大为原来的 2 倍。
  - 向量的模：使用 v.magnitude 属性。
  - 规范化向量：使用 v.normalized 属性。

### 3. Update 方法

```csharp
void Update()
{
    // 可在此添加每帧更新的逻辑
}
```

- 功能：在每一帧更新时调用，当前为空。如果需要在每一帧执行某些操作，可以在此方法中添加代码。

## 三、注意事项

- 部分操作（如夹角计算、距离计算等）被注释掉，取消注释即可执行相应操作。
- Update 方法目前为空，可根据需求添加每帧更新的逻辑。
