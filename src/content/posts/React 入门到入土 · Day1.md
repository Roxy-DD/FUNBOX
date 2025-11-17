---
title: React 入门到入土 · Day1
description: React 入门到入土 Day1 笔记：从 JSX 核心语法、事件绑定、useState 状态不可变铁律、列表/条件渲染，到手撕完整 B 站评论区（Tab 高亮、删除、最热/最新排序）
tags:
  - react
category: React笔记
published: 2025-11-16
pubDate: 2025-11-16
date: 2025-11-16
draft: false
---
# React 入门到入土 · Day1

## 一、为什么 2025 年还要学 React？
| 维度           | React 现状（2025）                                 |
|----------------|----------------------------------------------------|
| 市场份额       | GitHub Star 230k+，全球前端框架第 1                |
| 大厂使用率     | 阿里、腾讯、字节、Shopify、Vercel、Airbnb 全线使用 |
| 生态成熟度     | Next.js 14、Remix、Expo、React Query、Zustand 等   |
| 跨端能力       | Web + React Native（App）+ Electron（桌面）        |
| 就业薪资       | 英国中高级 React 岗位 £55k–£120k+                  |

结论：**学了 React = 学会现代前端 80% 的思想**

## 二、2025 年推荐开发环境（已淘汰 CRA）
| 工具            | 命令                                          | 推荐场景                     |
|-----------------|-----------------------------------------------|------------------------------|
| Vite（最快）    | `pnpm create vite@latest -- --template react-ts` | 学习、个人项目、快速原型     |
| Next.js 14+     | `npx create-next-app@latest --ts --app`        | 生产项目、SEO、SSR、全栈     |
| React Router v7 | `npx create-react-router@latest`              | 纯前端 + 想完全掌控路由      |

> create-react-app 已在 2023 年正式停止维护

## 三、JSX 核心语法（面试必考）
```tsx
// {} 里只能放「表达式」，不能放语句（if、for）
{true && <div>显示</div>}
{flag ? <A /> : <B />}
{list.map(item => <li key={item.id}>{item.name}</li>)}
{(() => 'IIFE 也可以')()}
```

关键规则：
- 必须有且仅有一个根元素 → 用 `<></>`（Fragment）
- 所有标签必须闭合
- class → className
- style={{ }} 接收对象
- key 必须唯一且稳定（不要用 index 除非列表永不增删排序）

## 四、事件绑定 4 种正确姿势
```tsx
const handleClick = (name: string, e: React.MouseEvent) => {}

<button onClick={handleClick.bind(null, 'jack')}>1</button>
<button onClick={() => handleClick('jack', e)}>2 推荐</button>
<button onClick={handleClick.bind(null, 'jack')}>3</button>
<button onClick={e => handleClick('jack', e)}>4 最清晰</button>
```

## 五、useState 铁律（背下来！）
1. 状态是**只读**的 → 永远不要直接改
2. 永远传**新对象/新数组**给 set 函数
```tsx
// 正确
setCount(c => c + 1)                    // 函数式更新（解决闭包问题）
setUser(u => ({ ...u, name: 'new' }))
setList(list.filter(...))               // 新数组
setList([...list, newItem])

// 错误（视图不会更新）
state.count = 100
state.list.push(item)
```

## 六、B站评论区完整案例（2025 最佳实践版）
```tsx
import { useState, MouseEvent } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import avatar from './images/bozai.png'
import './App.scss'

type Tab = 'hot' | 'time'

interface Comment {
  rpid: number
  user: { uid: string; uname: string; avatar: string }
  content: string
  ctime: string
  like: number
}

const defaultList: Comment[] = [/* ...数据同上 */]
const currentUser = { uid: '30009257', avatar, uname: '黑马前端' }
const tabs = [{ type: 'hot', text: '最热' }, { type: 'time', text: '最新' }] as const

export default function App() {
  const [list, setList] = useState<Comment[]>(() =>
    _.orderBy(defaultList, 'like', 'desc')
  )
  const [active, setActive] = useState<Tab>('hot')

  const deleteComment = (rpid: number) => {
    setList(prev => prev.filter(item => item.rpid !== rpid))
  }

  const switchTab = (tab: Tab) => {
    setActive(tab)
    setList(prev =>
      tab === 'hot'
        ? _.orderBy(prev, 'like', 'desc')
        : _.orderBy(prev, 'ctime', 'desc')
    )
  }

  return (
    <div className="app">
      {/* Tab 栏 */}
      <div className="reply-navigation">
        <ul className="nav-bar">
          <li className="nav-title">
            <span>评论</span>
            <span className="total-reply">{list.length}</span>
          </li>
          <li className="nav-sort">
            {tabs.map(item => (
              <span
                key={item.type}
                className={classNames('nav-item', { active: active === item.type })}
                onClick={() => switchTab(item.type)}
              >
                {item.text}
              </span>
            ))}
          </li>
        </ul>
      </div>

      {/* 评论列表 */}
      <div className="reply-list">
        {list.map(item => (
          <div key={item.rpid} className="reply-item">
            {/* 头像 + 内容 */}
            <div className="user-info">
              <img className="avatar" src={item.user.avatar || avatar} alt="" />
              <div className="user-name">{item.user.uname}</div>
            </div>
            <div className="reply-content">{item.content}</div>
            <div className="reply-footer">
              <span>{item.ctime}</span>
              <span>点赞 {item.like}</span>
              {currentUser.uid === item.user.uid && (
                <span className="delete" onClick={() => deleteComment(item.rpid)}>
                  删除
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Day1 核心总结（30 秒背会版）

| 考点       | 一句话记住                                             |
| -------- | ------------------------------------------------- |
| JSX      | 花括号里只能写表达式，所有标签必须闭合                               |
| 列表渲染     | map + key（用唯一 ID，尽量别用 index）                      |
| 条件渲染     | &&、三元、函数返回 JSX                                    |
| 事件绑定     | onClick={() => fn(params)} 或 (e) => fn(e, params) |
| useState | 状态不可变！永远传新值给 set 函数                               |
| 类名动态控制   | 强烈推荐 classnames 库                                 |
| 组件       | 首字母大写函数，返回 JSX                                    |
| 工具库      | lodash（排序）、classnames（类名）必装                       |
