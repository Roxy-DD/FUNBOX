---
title: 协程和管道
description: "go中的协程和管道"
tags: [Go]
category: Go笔记
draft: false
published: 2025-07-13
---
## **程序、进程、线程、协程**

【1】程序(program)
 是为完成特定任务、用某种语言编写的一组指令的集合，是一段静态的代码。(程序是静态的）
 【2】进程(process)
 是程序的一次执行过程。正在运行的一个程序，进程作为资源分配的单位，在内存中会为每个进程分配不同的内存区域。（进程是动态的）是一个
 动的过程，进程的生命周期：有它自身的产生、存在和消亡的过程
 【3】线程(thread)
 进程可进一步细化为线程，是一个程序内部的一条执行路径。
 若一个进程同一时间并行执行多个线程，就是支持多线程的。

![PixPin_2025-07-13_15-07-16](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-13_15-07-16-20250713150720-564yflj.png)

![PixPin_2025-07-13_15-18-01](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-13_15-18-01-20250713151806-yjq3uqw.png)

【4】协程(goroutine)
 又称为微线程，纤程，协程是一种用户态的轻量级线程

作用：在执行A函数的时候，可以随时中断，去执行B函数，然后中断继续执行A函数(可以自动切换)，注意这一切换过程并不是函数调用（没有调用
 语句），过程很像多线程，然而协程中只有一个线程在执行（协程的本质是个单线程）

![PixPin_2025-07-13_15-18-37](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-13_15-18-37-20250713151839-jmywwjs.png)

对于单线程下，我们不可避免程序中出现io操作，但如果我们能在自己的程序中（即用户程序级别，而非操作系统级别）控制单线程下的多个任务能在一个任务遇到io阻塞时就将寄存器上下文和栈保存到某个其他地方，然后切换到另外一个任务去计算。在任务切回来的时候，恢复先前保存的寄存器上下文和栈，这样就保证了该线程能够最大限度地处于就绪态，即随时都可以被cpu执行的状态，相当于我们在用户程序级别将自己的io操作最大限度地隐藏起来，从而可以迷惑操作系统，让其看到：该线程好像是一直在计算，io比较少，从而会更多的将cpu的执行权限分配给我们的线程（注意：线程是CPU控制的，而协程是程序自身控制的，属于程序级别的切换，操作系统完全感知不到，因而更加轻量级)

## **协程入门**

【1】案例：
 请编写一个程序，完成如下功能：
 （1）在主线程中，开启一个goroutine，该goroutine每隔1秒输出"hellogolang"
 （2）在主线程中也每隔一秒输出"hellomsb"，输出10次后，退出程序
 （3）要求主线程和goroutine同时执行

代码

```go
package main

import (
	"fmt"
	"strconv"
	"time"
)

func test(){
	for i :=1; i <= 10; i++ {
		fmt.Println("hello golang" + strconv.Itoa(i))
		//阻塞一秒
		time.Sleep(time.Second)
	}
}


func main(){//主线程
	go test()//开启一个协程
	
	for i :=1; i <= 10; i++ {
		fmt.Println("hello xuee" + strconv.Itoa(i))
		//阻塞一秒
		time.Sleep(time.Second)
	}
}
```

代码结果

![PixPin_2025-07-13_16-06-41](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-13_16-06-41-20250713160643-24us4y1.png)

主线程和协程执行流程示意图：

![PixPin_2025-07-13_16-11-46](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-13_16-11-46-20250713161150-kglc2xf.png)

## **主死从随**

【1】主死从随：
 1）如果主线程退出了，则协程即使还没有执行完毕，也会退出
 2）当然协程也可以在主线程没有退出前，就自己结束了，比如完成了自己的任务

```go
package main

import (
	"fmt"
	"strconv"
	"time"
)

func test(){
	for i :=1; i <= 1000; i++ {
		fmt.Println("hello golang" + strconv.Itoa(i))
		//阻塞一秒
		time.Sleep(time.Second)
	}
}


func main(){//主线程
	go test()//开启一个协程

	for i :=1; i <= 10; i++ {
		fmt.Println("hello xuee" + strconv.Itoa(i))
		//阻塞一秒
		time.Sleep(time.Second)
	}
}
```

## **启动多个协程**

【1】案例：

```go
package main

import (
	"fmt"
	"time"
)


func main(){
	//匿名函数+外部变量 = 闭包
	for i :=1; i <= 5; i++ {
		//启动一个协程
		go func(n int) {
			fmt.Println(n)	
		}(i) // 这里加上 ()表示立即执行匿名函数
	}

	time.Sleep(time.Second * 2) // 等待协程执行完毕
}
```

## **使用WaitGroup控制协程退出**

【1】WaitGroup的作用：
 WaitGroup用于等待一组线程的结束。父线程调用Add方法来设定应等待的线程的数量。每个被等待的线程在结束时应调用Done方法。同时，
 主线程里可以调用Wait方法阻塞至所有线程结束。---》解决主线程在子协程结束后自动结束
 【2】主要函数：

（1）

#### func (*WaitGroup) [Add](https://github.com/golang/go/blob/master/src/sync/waitgroup.go?name=release#44)

```
func (wg *WaitGroup) Add(delta int)
```

Add方法向内部计数加上delta，delta可以是负数；如果内部计数器变为0，Wait方法阻塞等待的所有线程都会释放，如果计数器小于0，方法panic。注意Add加上正数的调用应在Wait之前，否则Wait可能只会等待很少的线程。一般来说本方法应在创建新的线程或者其他应等待的事件之前调用。

（2）

#### func (*WaitGroup) [Done](https://github.com/golang/go/blob/master/src/sync/waitgroup.go?name=release#81)

```
func (wg *WaitGroup) Done()
```

Done方法减少WaitGroup计数器的值，应在线程的最后执行。

（3）

#### func (*WaitGroup) [Wait](https://github.com/golang/go/blob/master/src/sync/waitgroup.go?name=release#86)

```
func (wg *WaitGroup) Wait()
```

Wait方法阻塞直到WaitGroup计数器减为0。

【3】案例：
 (1）Add\Done\Wait:

```go
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup //只定义无需赋值

func main(){
	// 启动五个协程
	for i := 1; i <= 5; i++ {
		wg.Add(1) // 每启动一个协程就增加计数
		go func(i int) {
			fmt.Println(i)
			wg.Done() // 协程执行完毕后减少计数
		}(i) // 使用闭包传递 i 的值
	}
	//主线程一直在阻塞，什么时候wg的计数为0，主线程才会继续往下执行
	wg.Wait() // 等待所有协程执行完毕

}
```

（2）如果防止忘记计数器减1操作，结合defer关键字使用：

```go
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup //只定义无需赋值

func main() {
	// 启动五个协程
	for i := 1; i <= 5; i++ {
		wg.Add(1) // 每启动一个协程就增加计数
		go func(i int) {
			defer wg.Done() // 协程结束时减少计数
			fmt.Println(i)
		}(i) // 使用闭包传递 i 的值
	}
	//主线程一直在阻塞，什么时候wg的计数为0，主线程才会继续往下执行
	wg.Wait() // 等待所有协程执行完毕

}
```

（3）可以最开始在知道协程次数的情况下先Add操作：

```go
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup //只定义无需赋值

func main() {
	// 启动五个协程
	wg.Add(5)
	for i := 1; i <= 5; i++ {
		go func(i int) {
			defer wg.Done() // 协程结束时减少计数
			fmt.Println(i)
		}(i) // 使用闭包传递 i 的值
	}
	//主线程一直在阻塞，什么时候wg的计数为0，主线程才会继续往下执行
	wg.Wait() // 等待所有协程执行完毕

}
```

注意：Add中加入的数字和协程的次数一定要保持一致

## **多个协程操纵同一数据案例（互斥锁）**

【1】案例：多个协程操纵同一数据

```go
package main

import (
	"fmt"
	"sync"
)

//定义一个变量：
var totalNum int
var wg sync.WaitGroup
func add()  {
	defer wg.Done()
	for i:=0;i<10000; i++{
		totalNum = totalNum+1
	}
}

func sub()  {
	defer wg.Done()
	for i:=0;i<10000; i++{
		totalNum = totalNum-1
	}
}

func main(){
	wg.Add(2)
	//启动协程
	go add()
	go sub()
	wg.Wait()
	fmt.Println(totalNum)
}
```

结果：在理论上这个totalNum结果应该是0，无论协程怎么交替执行，最终想象的结果就是0但是事实上：不是

![PixPin_2025-07-14_14-59-02](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_14-59-02-20250714145903-n1qa3b7.png)

问题出现的原因：（图解为其中一种可能性）

![PixPin_2025-07-14_15-06-01](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_15-06-01-20250714150603-i7t6n5m.png)

解决问题：

有一个机制：确保：一个协程在执行逻辑的时候另外的协程不执行--》锁的机制--》加入互斥锁

### type [Mutex](https://github.com/golang/go/blob/master/src/sync/mutex.go?name=release#21)

```
type Mutex struct {
    // 包含隐藏或非导出字段
}
```

Mutex是一个互斥锁，可以创建为其他结构体的字段；零值为解锁状态。Mutex类型的锁和线程无关，可以由不同的线程加锁和解锁。

#### func (*Mutex) [Lock](https://github.com/golang/go/blob/master/src/sync/mutex.go?name=release#41)

```
func (m *Mutex) Lock()
```

Lock方法锁住m，如果m已经加锁，则阻塞直到m解锁。

#### func (*Mutex) [Unlock](https://github.com/golang/go/blob/master/src/sync/mutex.go?name=release#82)

```
func (m *Mutex) Unlock()
```

Unlock方法解锁m，如果m未加锁会导致运行时错误。锁和线程无关，可以由不同的线程加锁和解锁。

代码：

```go
package main

import (
	"fmt"
	"sync"
)

//定义一个变量：
var totalNum int
var wg sync.WaitGroup
//加入互斥锁
var lock sync.Mutex

func add()  {
	defer wg.Done()
	for i:=0;i<10000; i++{
		//加锁
		lock.Lock()
		totalNum = totalNum+1
		//解锁
		lock.Unlock()
	}
}

func sub()  {
	defer wg.Done()
	for i:=0;i<10000; i++{
		//加锁
		lock.Lock()
		totalNum = totalNum-1
		//解锁
		lock.Unlock()
	}
}

func main(){
	wg.Add(2)
	//启动协程
	go add()
	go sub()
	wg.Wait()
	fmt.Println(totalNum)
}
```

## **读写锁的引入**

golang中sync包实现了两种锁Mutex（互斥锁）和RWMutex（读写锁）
 【1】互斥锁
 其中Mutex为互斥锁，LockO加锁，Unlock(解锁，使用LockO加锁后，便不能再次对其进行加锁，直到利用UnlockO解锁对其解锁
 后，才能再次加锁．适用于读写不确定场景，即读写次数没有明显的区别

----性能、效率相对来说比较低
 【2】读写锁
 RWMutex是一个读写锁，其经常用于读次数远远多于写次数的场景.

----在读的时候，数据之间不产生影响，写和读之间才会产生影响



【3】案例：

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup
//加入读写锁
var lock sync.RWMutex

func read()  {
	defer wg.Done()
	lock.RLock()//如果只是读数据，那么这个数据不产生影响，但是读写同时发生的时候，就会有影响
	fmt.Println("开始读取数据")
	time.Sleep(time.Second)
	fmt.Println("读取数据成功")
	lock.RUnlock()
}

func write()  {
	wg.Done()
	lock.Lock()
	fmt.Println("开始修改数据")
	time.Sleep(time.Second*10)
	fmt.Println("修改数据成功")
	lock.Unlock()
}

func main(){
	wg.Add(6)
	//启动协程 -->场合：读多写少
	for i:=0;i < 5; i++{
		go read()
	}
	go write()
	
	wg.Wait()
}
```

![PixPin_2025-07-14_18-02-45](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_18-02-45-20250714180247-dyjdqse.png)

### 📦 什么是读写锁（RWMutex）

Go 标准库里的 sync.RWMutex 是一种读写锁，它相对于普通互斥锁（sync.Mutex）来说，能更好地提升「读多写少」场景的并发性能。

它有两种加锁模式：

- 读锁（RLock）：允许多个 goroutine 同时获取，前提是没有 goroutine 持有写锁。
- 写锁（Lock）：只允许一个 goroutine 获取，并且获取写锁时会阻塞所有其他读锁和写锁。

------

### ✅ 为什么要有读写锁

如果用普通的 sync.Mutex：

- 每次读、写都互斥执行，导致大量读操作也被互斥阻塞。
- 如果读操作很多，写操作很少，就浪费了并发性能。

用 sync.RWMutex：

- 多个读操作可以并行执行，只要没有写操作。
- 写操作需要独占，写期间阻塞其他读写。

### ✏ 读写锁的使用场景

适合：

- 读多写少：数据经常被读，偶尔需要更新。
- 比如：缓存系统、配置数据等。

不适合：

- 写多读少：频繁更新，写锁总是让读锁等待，性能反而比普通锁差。

------

✅ 总结：

- RWMutex 支持多读单写。
- RLock：允许多个读同时进行。
- Lock：写时独占，阻塞其他读写。
- 在读多写少场景下显著提高并发性能。

## **管道介绍**

【1】管道（channel）特质介绍：
 （1）管道本质就是一个数据结构-队列
 （2）数据是先进先出
 （3）自身线程安全，多协程访问时，不需要加锁，channel本身就是线程安全的
 （4）管道有类型的，一个string的管道只能存放string类型数据

![PixPin_2025-07-14_18-16-19](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_18-16-19-20250714181622-qsrncod.png)

## **管道入门案例**

【1】管道的定义：
 var变量名chan数据类型
 PS1：chan管道关键字
 PS2：数据类型指的是管道的类型，里面放入数据的类型，管道是有类型的，int 类型的管道只能写入整数int
 PS3：管道是引用类型，必须初始化才能写入数据，即make后才能使用
 【2】案例：

```go
package main

import (
	"fmt"
)

func main()  {
	//定义管道、声明管道 --》定义一个int类型的管道
	var intChan chan int
	//通过make初始化：管道可以存放3个int类型的数据
	intChan = make(chan int, 3)

	//证明管道是引用类型：
	fmt.Printf("intChand的值：%v\n", intChan) //0xc00001e180
	//向管道存放数据：
	intChan<- 10
	num := 20
	intChan<- num
	intChan<- 40
	//注意：不能存放大于容量的数据：
	//intChan<-80

	//在管道中读取数据：
	num1 := <- intChan
	num2 := <- intChan
	num3 := <- intChan
	fmt.Println(num1)
	fmt.Println(num2)
	fmt.Println(num3)
	//注意：在没有使用协程的情况下，如果管道的数据已经全部取出，如果再取就会报错：
	// num4 := <-intChan
	// fmt.Println(num4)

	//输出管道的长度：
	fmt.Printf("管道的实际长度：%v,管道的容量是：%v",len(intChan),cap(intChan))
}
```

### 📦 cap() 是什么？

在 Go 语言中，cap() 是一个内置函数，用来返回：

- 切片（slice）
- 数组（array）
- channel（chan）

的容量（capacity）。

------

### ✅ 切片中的 cap()

这是最常用的场景。

对于一个切片：

- len() 返回切片当前包含的元素个数
- cap() 返回切片底层数组最多可以容纳的元素个数（从切片的起始位置到底层数组的末尾）

例如：

```go
s := make([]int, 2, 5)
fmt.Println(len(s)) // 2
fmt.Println(cap(s)) // 5
```

- len(s) 是 2，因为你创建了一个长度为 2 的切片
- cap(s) 是 5，因为底层数组的容量是 5

------

### 🧩 为什么会有 capacity？

Go 的切片是基于数组实现的：

- 切片结构中有三个字段：指向底层数组的指针、长度（len）、容量（cap）。
- 容量表示：从切片起始位置到底层数组结尾的元素数。

当你给切片追加元素时：

- 如果追加后的长度 ≤ cap()，不需要重新分配数组，只改变长度
- 如果超过 cap()，Go 会重新分配一个更大的底层数组（通常是原来的 2 倍），拷贝原有数据

------

### 🧪 例子：切片的 cap()

```go
package main

import "fmt"

func main() {
    nums := []int{1, 2, 3}
    fmt.Println("len:", len(nums)) // 3
    fmt.Println("cap:", cap(nums)) // 3

    nums = append(nums, 4)
    fmt.Println("After append:")
    fmt.Println("len:", len(nums)) // 4
    fmt.Println("cap:", cap(nums)) // 6（可能翻倍，也可能按算法增长）
}
```

- 初始 cap(nums) 是 3
- 当长度超过容量时，Go 会重新分配一个容量更大的底层数组

------

### ✅ 数组中的 cap()

对数组来说：

- cap(array) 返回数组长度，因为数组的长度固定

```go
arr := [5]int{1, 2, 3, 4, 5}
fmt.Println(cap(arr)) // 输出 5
```

------

### ✅ channel 中的 cap()

对 channel：

- cap(channel) 返回 channel 的缓冲区大小（无缓冲 channel 返回 0）

```go
ch := make(chan int, 10)
fmt.Println(cap(ch)) // 10
```

------

### ✏ cap() vs len() 总结

|         | len()                   | cap()                                            |
| ------- | ----------------------- | ------------------------------------------------ |
| 切片    | 当前元素个数            | 底层数组从切片起始位置到末尾能容纳的最多元素个数 |
| 数组    | 数组长度                | 数组长度                                         |
| channel | 当前 channel 中元素个数 | 缓冲区大小                                       |

------

### ✅ 为什么要关注 cap()？

- 了解切片扩容策略：避免频繁扩容，提升性能
- 在大数据量场景下提前 make 合理的容量
- 控制内存使用

------

### 🌱 一句话记忆 cap()：

> cap() 返回「还能放多少」的潜力，而 len() 返回「现在有多少」。

## **管道的关闭**

【1】管道的关闭：
 使用内置函数close可以关闭管道，当管道关闭后，就不能再向管道写数据了，但是仍然可以从该管道读取数据。

### func [close](https://github.com/golang/go/blob/master/src/builtin/builtin.go?name=release#213)

```
func close(c chan<- Type)
```

内建函数close关闭信道，该通道必须为双向的或只发送的。它应当只由发送者执行，而不应由接收者执行，其效果是在最后发送的值被接收后停止该通道。在最后的值从已关闭的信道中被接收后，任何对其的接收操作都会无阻塞的成功。对于已关闭的信道，语句：

```
x, ok := <-c
```

还会将ok置为false。

【2】案例：

```go
package main

import (
	"fmt"
)


func main()  {
	//定义管道、声明管道 --》定义一个int类型的管道
	var intChan chan int
	//通过make初始化：管道可以存放3个int类型的数据
	intChan = make(chan int, 3)
	//在管道中存放数据：
	intChan<- 10
	intChan<- 20

	//关闭管道：
	close(intChan)

	//再次写入数据：---报错
	// intChan <-30

	//当管道关闭以后，读取数据是可以的：
	num := <- intChan
	fmt.Println(num)

}
```

## **管道的遍历**

【1】管道的遍历：
 管道支持or-range的方式进行遍历，请注意两个细节
 1)在遍历时，如果管道没有关闭，则会出现deadlock的错误
 2)在遍历时，如果管道已经关闭，则会正常遍历数据，遍历完后，就会退出遍历。

【2】案例：

```go
package main

import (
	"fmt"
)


func main()  {
	//定义管道、声明管道 --》定义一个int类型的管道
	var intChan chan int
	//通过make初始化：管道可以存放3个int类型的数据
	intChan = make(chan int, 100)
	for i:=0; i<100;i++{
		intChan<-i
	}
	//在遍历前，如果没有关闭管道，就会出现deadlock的错误
	//所以我们在遍历前要进行管道的关闭
	close(intChan)
	//遍历：for-rang
	for v := range intChan{
		fmt.Println("value= ",v)
	}
}
```

## **协程和管道协同工作案例**

【1】案例需求：
 请完成协程和管道协同工作的案例，具体要求：
 1）开启一个writeData协程，向管道中写入50个整数
 2)开启一个readData协程，从管道中读取writeData写入的数据。
 3）注意：writeData和readDate操作的是同一个管道
 4）主线程需要等待writeData和readDate协程都完成工作才能退出
 【2】原理图：

![PixPin_2025-07-14_19-37-47](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_19-37-47-20250714193750-vowigfz.png)
 【3】代码：

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup

//写：
func writeData(intChan chan int)  {
	defer wg.Done()
	for i :=1; i<=50;i++{
		intChan<-i
		fmt.Println("写入的数据为：",i)
		time.Sleep(time.Second)
	}

	//管道关闭：
	close(intChan)
}
//读：
func readData(intChan chan int)  {
	defer wg.Done()
	//遍历：
	for v := range intChan{
		fmt.Println("读取的数据为：",v)
		time.Sleep(time.Second)
	}
}

func main()  {//主线程
	//写协程和读协程共同操作同一个管道--》定义管道：
	intChan := make(chan int,50)
	wg.Add(2)
	//开启读和写的协程：
	go writeData(intChan)
	go readData(intChan)
	wg.Wait()

}
```

运行结果：

![PixPin_2025-07-14_19-49-53](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-14_19-49-53-20250714194954-9n8gr17.png)

## **声明只读只写管道**

【1】管道可以声明为只读或者只写性质

【2】代码

```go
package main

import (
	"fmt"
)

func main()  {
	//默认情况下，管道是双向的--》可读可写：
	//var intChan1 chan int
	//声明为只写：
	var intChan2 chan<- int//管道具备<-只写性质
	intChan2 = make(chan int,3)
	intChan2<- 20
	//num := <- intChan2 报错
	fmt.Println("intChan2:",intChan2)
	//声明为只读：
	var intChan3 <- chan int
	ch := make(chan int, 1)
	ch <- 42
	close(ch)
	intChan3 = ch
	if intChan3 != nil{
		num1 := <- intChan3
		fmt.Println("num1",num1)
	}
	// intChan3<- 30 报错
} 
```

## **管道的阻塞**

【1】当管道只写入数据，没有读取，就会出现阻塞：

```go
package main

import (
	"fmt"
	"sync"
	// "time"
)

var wg sync.WaitGroup

//写：
func writeData(intChan chan int)  {
	defer wg.Done()
	for i :=1; i<=50;i++{
		intChan<-i
		fmt.Println("写入的数据为：",i)
		// time.Sleep(time.Second)
	}

	//管道关闭：
	close(intChan)
}
//读：
func readData(intChan chan int)  {
	defer wg.Done()
	//遍历：
	for v := range intChan{
		fmt.Println("读取的数据为：",v)
		// time.Sleep(time.Second)
	}
}

func main()  {//主线程
	//写协程和读协程共同操作同一个管道--》定义管道：
	intChan := make(chan int,50)
	wg.Add(2)
	//开启读和写的协程：
	go writeData(intChan)
	// go readData(intChan)
	wg.Wait()

}
```

![PixPin_2025-07-15_11-00-09](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-15_11-00-09-20250715110010-kiu3a8v.png)

【2】写的快，读的慢（管道读写频率不一致），不会出现阻塞问题：

### ✅ 先解释一下原理（管道为什么不会阻塞）

在 Go 中，chan 本质就是一个带缓冲的队列：

- 如果 写入速度快，读出速度慢：
  - 只要管道容量 cap(chan) 足够，就能临时「存下」这些数据，不会马上阻塞。
  - 当管道被写满时，写协程会被阻塞，等到有空间再写。
- 如果 读的快，写的慢：
  - 管道里一直没数据，读协程就会阻塞，等到有数据可读。

所以：

- 如果 cap(intChan)=50，写协程能一次性写最多 50 个值，不会马上阻塞。
- 如果同时有读协程慢慢消费，写协程还能继续写新的数据进去。

------

### 🛠 示例修改：写的快、读的慢

为了演示「写的快、读的慢」，只需要让读协程 time.Sleep 慢一些，比如每次 sleep 1 秒，而写协程去掉 sleep，让它疯狂写：

- 写协程速度非常快
- 读协程每读一个值都等 1 秒

下面是修改版的例子：

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup

// 写：快速写入数据
func writeData(intChan chan int) {
	defer wg.Done()
	for i := 1; i <= 50; i++ {
		intChan <- i
		fmt.Println("写入的数据为：", i)
		// 写得快：不加 sleep
	}
	// 关闭管道
	close(intChan)
}

// 读：每次读都慢慢来
func readData(intChan chan int) {
	defer wg.Done()
	for v := range intChan {
		fmt.Println("读取的数据为：", v)
		time.Sleep(time.Second) // 每次读取都等 1 秒
	}
}

func main() {
	// 定义带缓冲的管道
	intChan := make(chan int, 50) // 容量 50
	wg.Add(2)
	// 启动写协程和读协程
	go writeData(intChan)
	go readData(intChan)
	wg.Wait()
}
```

------

### ✅ 为什么这里不会出现写阻塞？

- 写协程瞬间往管道写入 50 个数字（1 到 50）。
- 因为 intChan 的容量是 50，刚好能放下。
- 写完以后管道满了，但这时候写协程就结束了（已经写够了 50 个数）。
- 读协程开始慢慢读，每秒钟取一个值，直到管道被读空。

注意：

- 如果写的数据比容量大，比如想写 100 个，而容量只有 50：
  - 写到第 51 个时，写协程就会被阻塞，必须等读协程消费掉一个值后才能继续写。
  - 因为管道是 FIFO（先进先出）队列。

------

### 📌 小总结：

- Go 的带缓冲 channel 是一个并发安全的队列。
- 写协程写得快、读协程读得慢，不会马上阻塞，只要管道容量足够大。
- 当写协程写入量 > 容量，就会阻塞等到读协程消费。

### 🌱 阻塞的根本原因：

在 Go 中，channel 是并发协程之间同步的工具：

- 无缓冲 channel：需要「收发同时」才能继续。
- 带缓冲 channel：容量满了就阻塞写；空了就阻塞读。

------

### ✅ 具体情况：什么时候会出现阻塞

### 情况 1：写阻塞

- 无缓冲 channel：

  ```go
  ch := make(chan int)
  ch <- 1 // 阻塞，直到有另一个协程来读 <-ch
  ```

  写协程必须等到有读协程来接收，否则一直阻塞。

- 带缓冲 channel：

  ```go
  ch := make(chan int, 3)
  ch <- 1
  ch <- 2
  ch <- 3
  ch <- 4 // 第4次写时阻塞，因为容量只有3
  ```

  当写入的数据个数 > 容量时，写协程会阻塞，直到有读协程读出一个数据腾出空间。

------

### 情况 2：读阻塞

- 无缓冲 channel：

  ```go
  ch := make(chan int)
  fmt.Println(<-ch) // 阻塞，直到有另一个协程写 ch <- x
  ```

  必须有人写，否则读协程会一直等。

- 带缓冲 channel：

  ```go
  ch := make(chan int, 3)
  fmt.Println(<-ch) // 阻塞，如果此时 channel 是空的
  ```

  当 channel 没有任何数据时，读协程会阻塞，等待数据写入。

------

### 📦 更直观点总结：

| 情况     | 无缓冲 channel       | 带缓冲 channel |
| -------- | -------------------- | -------------- |
| 写时阻塞 | 总是需要同时有读协程 | 当管道已满时   |
| 读时阻塞 | 总是需要同时有写协程 | 当管道为空时   |

------

🧪 结合你的例子：

```go
intChan := make(chan int, 50)
```

- 写协程写 50 个数：只要管道容量够，就不会阻塞。
- 如果要写 51 个数：
  - 前 50 个都能进管道，写协程没阻塞。
  - 写第 51 个时，发现管道已满：必须等读协程读走一个数腾出空位，写协程才能继续。

------

### 🧠 常见阻塞场景总结：

✅ 写时阻塞：

- 写入超过缓冲容量。
- 无缓冲 channel，没人读。

✅ 读时阻塞：

- 管道里没数据，没人写。

------

### ⚠ 额外注意：

- 如果所有写协程都退出了，但还有读协程在等读，就会出现死锁（fatal error: all goroutines are asleep - deadlock!）。
- 如果所有读协程都退出了，但还有写协程在写，也会死锁。

------

### ✅ 一句话记忆：

- 无缓冲 channel： 读写必须同时进行，否则阻塞。
- 带缓冲 channel： 写满了阻塞写；读空了阻塞读。

## **select功能**

【1】select功能：解决多个管道的选择问题，也可以叫做多路复用，可以从多个管道中随机公平地选择一个来执行
 PS：case后面必须进行的是io操作，不能是等值，随机去选择一个io操作
 PS:default防止select被阻塞住，加入default

【2】代码：

```go
package main

import (
	"fmt"
	"time"
)

func main()  {
	//定义一个int管道：
	intChan := make(chan int, 1)
	go func ()  {
		time.Sleep(time.Second * 5)
		intChan<-10
	}()
	//定义一个string管道：
	stringChan := make(chan string, 1)
	go func ()  {
		time.Sleep(time.Second * 2)
		stringChan<-"hello golang"
	}()


	// fmt.Println(<-intChan)//本身取数据就是阻塞的

	select{
		case v := <-intChan:
			fmt.Println("intChan:",v)
		case v := <- stringChan:
			fmt.Println("intChan:",v)
		default:
			fmt.Println("防止select被阻塞")
	}
}
```

### ✅ 什么是 select

在 Go 中，select 是专门用来同时等待多个 channel 操作的语法：

- 类似 switch，但是 select 的每个 case 是一个 channel 的收发操作。
- 当有多个 case 同时可以执行时，Go 会随机选择一个执行。
- 如果没有任何 case 可以执行（比如所有 channel 都阻塞），且又没有 default，那么 select 自己也会阻塞，一直等到有一个 case 可以执行。

------

### 📦 你的例子里做了什么

### 定义两个 channel

```go
intChan := make(chan int, 1)
stringChan := make(chan string, 1)
```

- intChan 用于传输 int，缓冲区大小 1
- stringChan 用于传输 string，缓冲区大小 1

------

### 开两个 goroutine 异步写数据

```go
go func() {
	time.Sleep(time.Second * 5)
	intChan <- 10
}()
```

- 等 5 秒后往 intChan 写入数字 10

```go
go func() {
	time.Sleep(time.Second * 2)
	stringChan <- "hello golang"
}()
```

- 等 2 秒后往 stringChan 写入字符串

------

### 使用 select 同时等待两个 channel 的数据

```go
select {
	case v := <-intChan:
		fmt.Println("intChan:", v)
	case v := <-stringChan:
		fmt.Println("intChan:", v)
	default:
		fmt.Println("防止select被阻塞")
}
```

- select 同时等：
  - <-intChan：看 intChan 有没有可读数据
  - <-stringChan：看 stringChan 有没有可读数据
- 如果此时两个 channel 都没有数据（刚开始那一瞬间肯定没有）：
  - 如果有 default：会立即执行 default 里的语句
  - 如果没有 default：select 自身会阻塞，直到至少有一个 channel 可读

------

### ⚙️ 程序实际运行流程

- 程序启动后，两个 goroutine 分别在 2 秒、5 秒后向 channel 写数据

- main 函数中的 select 在刚开始执行时，两个 channel 都还没写入数据

- 因为 select 有 default 分支，所以不会阻塞，会立即执行：

  ```
  防止select被阻塞
  ```

- 程序就继续往下走（main 函数很快结束，程序退出）

------

### ✅ 重点总结：select 的特性

| 特性     | 解释                                                 |
| -------- | ---------------------------------------------------- |
| 多路监听 | 可以同时等待多个 channel 的收发操作                  |
| 随机性   | 如果多个case同时可以执行，Go 会随机选一个            |
| 阻塞     | 如果没有default，且所有 channel 都阻塞，select会阻塞 |
| 非阻塞   | 加上default分支，select总能立即执行，不会阻塞        |

------

### 🧠 为什么写 default？

- 防止 select 永久阻塞
- 实现非阻塞的「尝试收发」
- 比如定时检查、尝试发送等场景

------

### ✏ 更多实际用法

### 场景 1：同时接收多个 channel

```go
select {
case v := <-ch1:
    fmt.Println("收到 ch1:", v)
case v := <-ch2:
    fmt.Println("收到 ch2:", v)
}
```

------

### 场景 2：带超时控制

```go
select {
case v := <-ch:
    fmt.Println("收到数据", v)
case <-time.After(3 * time.Second):
    fmt.Println("超时！3秒内没收到数据")
}
```

------

### 场景 3：尝试非阻塞发送

```go
select {
case ch <- value:
    fmt.Println("发送成功")
default:
    fmt.Println("发送失败：channel 满了")
}
```

------

### ✅ 一句话记忆：

> select 用于同时等待多个 channel；有 default 不阻塞，没有 default 时如果所有 channel 都阻塞，就会阻塞。

## **defer+recover机制处理错误**

【1】问题原因：多个协程工作，其中一个协程出现panic，导致程序崩溃
 【2】解决办法：利用defer+recover捕获panic进行处理，即使协程出现问题，主线程仍然不受影响可以继续执行。
 【3】案例：

结果：

![PixPin_2025-07-15_11-31-32](https://siyuan-roxy.oss-cn-chengdu.aliyuncs.com/PixPin_2025-07-15_11-31-32-20250715113134-5gq7zd4.png)

代码：

```go
package main

import (
	"fmt"
	"time"
)

//输出数字：
func printNum()  {
	for i := 1;i<=10;i ++{
		fmt.Println(i)
	}
}
//做除法操作：
func devide()  {
	defer func ()  {
		err := recover()	
		if err != nil{
			fmt.Println("devide()出现错误：",err)
		}
	}()
	num1 := 10
	num2 := 0
	result := num1 / num2
	fmt.Println(result)
}
func main()  {
	//启动两个协程
	go printNum()
	go devide()
	time.Sleep(time.Second*5)
}
```
