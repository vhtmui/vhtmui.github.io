# Rust

## 所有权

1. 在作用域内

   * 每个变量，有且只有一个 **所有者**
   * 变量离开**作用域**后会被丢弃
   * 变量**赋值**时：
     * 只在**栈上**的数据会完全复制一个副本，原变量所有权不会丢失
       如：`let x = 5; let y = x;`
     * 包含**堆上**数据的变量会只复制指针、长度、容量等存放在**栈上**的数据。且原栈上数据会被无效化，这个操作也被称为移动
       如：`let s1 = String::from("hello");  let s2 = s1;`这时 `s1`将无效化
   * **克隆**变量会同时复制栈上数据和堆上数据，且原数据不会被无效化。对只在栈上的数据，克隆和复制是一样的
2. 通过 `match`、`let`、`let if`等匹配解构变量时，通过调用函数传参时，所有权的转移与否行为都等同于赋值

   * match

     ```rust
     //Example 1
     fn main() {
        let mut v = String::from("hello,");
        let r = &mut v;
           |
           r是不可变变量，持有变量v的可变引用
        match r {
           value => value.push_str(" world!")
           |
           变量r被move到value，value此时是变量v的可变引用，变量r被废弃
        }
     }
     //Example 2
        let mut v = String::from("hello,");
        let r: &mut String = &mut v;
              |
              r是不可变变量，持有变量v的可变引用
        match r {
           &mut value: String => value.push_str(" world!")
           ----------
                 |
                 加上&mut字段后会解构类型，value会是String类型(即变量r: &mut String去除&mut)，是不可变变量，后续无法修改value
                 要注释变量value的类型为引用类型需使用ref关键字
        }
     //Exampe 3
        let mut v = String::from("hello,");
        let r: &String = &v;
              |
              r是不可变变量，持有变量v的不可变引用
        match r {
           & value: String => value.push_str(" world!")
           -------
              |
              加上&字段后会解构类型，value会是String类型(即变量r: &String去除&)，
                 此时表达式含义为将变量v move至变量value，这是不允许的。
                 因为r是v的引用，r本来不拥有v的所有权，所以value也不能获取v的所有权，
                 这会导致E0507错误:"cannot move out of `v` which is behind a shared reference"。
                 但如果变量v实现了copy trait，就可以。
              要注释变量value的类型为引用类型应该使用ref关键字
        }
     //Exampe 4
        let mut v = String::from("hello,");
        let r: &mut String = &mut v;
              |
              r是可变变量，持有变量v的可变引用
        match r {
           &mut mut value: String => value.push_str(" world!")
           --------
              |
              正确的方法是是r成为v的&mut String类型可变引用
              再使用&mut匹配掉&mut，这时value的类型就会是String，因为r是v的可变引用，因此可以发生move行为
              再使用mut注释value，使后续可以修改value的值
        }
     ```

   * 函数调用
     调用函数并传参通常等同于赋值行为，不过也有例外，比如 `println!`函数，会自动取变量的引用。

     ```rust
     //Exampe 1
     fn main() {
        let x = String::from("1_i32");
        foo(x);//x是String类型，会被move到函数形参y，不能再使用
        println!("{x}");//编译报错
     }
     fn foo<T> (y: T) -> (){}
     //Exampe 2
     fn main() {
        let x = 1_i32;
        foo(x);//x是i32类型，会被copy到函数形参y，后续仍可使用
        println!("{x}");
     }
     fn foo<T> (y: T) -> (){}
     ```

## 引用&借用

使用 `&`加 `变量名`进行借用，如 `&x`，形如 `let y = &x`的形式 `y`获得的就是 `x`的引用，引用是一个**指向被引用变量**的**指针**。

* 借用不会获取数据的**所有权**
* 借用是一个指向被引用数据的指针，而非被引用数据本身，当引用类型的变量 `s`离开作用域不会发生任何 `drop`行为。
* 引用可以声明为**可变**的引用，前提是被引用的**变量**也是可变的
* 同时只能拥有一个可变引用或多个不可变引用

## 二进制数

### 负数

一般对于二进制负数的介绍都是说，二进制负数等于其对应正数的取反加1。

**实际的原理是：**

对于模为 `M`的数 `A`，$A \equiv A + N * M$，`N`为任意整数。也就是说对于通常的二进制数，比如：8位二进制数 `-1010101`（对应十进制数-85），8位二进制数的模为 `100000000`即十进制数256；

1. 应该同余$-01010101 + N ∗ M$，
2. 即$N * 100000000 - 01010101 \equiv -01010101$
3. 设 `N`为1，拆分模得：
   $1 + 11111111 -01010101 \equiv -01010101$
4. 已知$1-1=0$，$1-0=0$因此，用11111111减去相同位数的数，相当于对该数取反，
   结果就是$\sim ~01010101 + 1 \equiv -01010101$，即对正$85$的二进制数取反加一和$-85$同余。注意这里并非相等，而是同余。对应十进制数是$-85$和$171$，即$-85$和$171$同余。
5. 该运算的结果是获取负数的对应同余正数，有一下几个优点：

   1. 从 `-00000001`到 `-10000000`，及从-1开始到-128对应的同余正数恰好是 `11111111`到 `10000000`，首位都是1。用这段数表示负数，用 `00000000`到 `01111111`表示正数，计算机可以通过首位数字是0还是1来快速判断其正负。
   2. 两个数想要想减时，以8位二进制数为例。
      比如 `B`要减去 `A`，就是$B + (-A)$，先给原式加个256（计算机会丢弃超出范围的值，所以加256对结果没有影响），即$B+256-A$，
      原式便等于$B+ \sim A+1$，样便把减法运算变成了一步加法运算（取反加1的运算在保存负数时进行）；

## size类型

usize的长度取决于目标平台的架构，如果是64位系统，那它就是64位的。usize保证可以其可以hold住有的指针地址和偏移量。

通常指针结构中的**指针、长度、容量**，都是usize类型。

## 堆、栈、数据段

这些内存类型均指程序运行时使用的内存。

* **栈**上数据都是在编译时就知道大小的的数据类型的数据，这类数据不论怎么改变值，大小都不会变，比如 `int`、`char`类型。
* 大小未知，即可变大小长度的变量，则会存储在**堆**上，比如 `string`类型，因为 `string`改变值后其占用的内存空间可能会改变。

程序编译时变量的大小必须是已知的，这样才能存储在**栈**上，所以变量hold的都是固定大小类型的**数据** ，或不固定大小类型数据的**指针** 。同时，赋值语句的左值也必须有静态已知大小，详见[连接字符串](#连接string)。

## String、slice、str

### 基本概念

1. 字符串 `String`，Rust中 `String`类型字符串的大小是可变的，可动态拓展的，因此也是编译时未知的（即未实现 `Sized` trait）。如 `let s: String = String::from("你好啊世界")`函数返回一个智能指针结构的变量 `s`

   `s`由三部分组成： *指针* 、 *长度* 、 *容量* 。这组数据存储在 **栈上** ；

   其中**指针**指向其数据存放在**堆**上的区域，即**堆**中存储字符串 `"你好啊世界"`的实际位置。

   > 👋
   > 因为 `String`是可变的，故而运行时存储在可以动态分配大小的**堆**上，但编译时会将 `"你好啊世界"`这段字符串字面量（字节序列）存储在二进制文件的**只读数据段**中。
   >
   > 如果是不可变的 `str`字符串切片或字符串字面量，则会编译到二进制文件的**只读数据段**中，运行时存储在**数据段** **（Data Segment）** 中。
   >
2. 字符串切片 `str`，直接通过 `let y: str = s[2..3]`的形式获取字节切片数据内容是不可行的，因为这里 `s[a..b]`是**字符串切片**即 `str`类型，其**类型大小长度**是不固定的。Rust变量的大小必须是已知的，所以变量只能持有字符串切片的指针，不能直接持有**字符串切片**。

   正确的方法是采用 `&str`进行赋值即 `let x: &str = &s[2..3]`，这时就是将变量 `s`的**引用**，即 `&str`的类型数据赋给变量 `x`，`s`的**引用**的大小是编译时已知的，所以可行。

   注意：字符串切片的引用 `&str`是对字符串的不可变引用，这是隐式的。在程序中要注意避免影响 `rust`的借用规则。

   > 👋
   > 这里说的大小不固定，编译器报错是：str类型大小编译时未知、类型没有实现Sized trait。
   >
   > 不同于 `int32`，`int32`不管内容是什么，其大小都是固定的4字节；`str`的大小取决于切片时切了几个字节，或字符串字面量的实际内容是什么。
   >
   > Rust不能给变量赋一个不固定大小的数据**类型**（可能是因为不能放到栈上），但可以将该数据的**引用**赋给变量。**引用**一般包含*指针、长度、容量*等确定大小的 `usize`类型的数据。
   >
3. 字符串字面量 `str`，对于 `let a: &str = "你好"`因为的字符内容是已知的，因此其需要的内存空间也是已知的，也就是说可以确定这段字符串数据的 ***指针、长度、容量*** 。

   因此只需将数据 `"你好"`写入**二进制文件的只读数据段**中，该字符串的**引用**赋给变量 `a`。最后程序运时将数据加载到 **数据段（Data Segment）**或者叫**静态存储**中即可。

   但也因此 `str`的数据内容是不可变的（数据存储在**只读内存**中，`&str`类型压根就没有修改数据的方法，`str`也不能直接赋给变量），故而 `&str`也是不可变引用。

**总结：**

* **String** ：字符串，内容可变、大小不固定、数据在堆上，该类型变量**自拥有所有权**。
* **slice** ：切片，是 `collection`中的一段连续元素，包括**数组、向量、字符串等集合**，切片提供一种借用集合中部分元素而不获取其**所有权**的方法。其长度在编译时也是未知的（针对切片类型而言，该类型的大小不固定）。字符串切片`str`是`slice`的一种。
* **str** ：字符串字面值（字符串切片），内容不可变、类型大小不固定。其中***字符串切片***是字符串的一段内存，***字符串字面值***是一段静态只读内存。
* **引用**和某些数据的类指针的数据结构是不同的，比如 `string`和 `Box`的栈上结构和 `string`的引用是不同的，引用只是一个指向 `string`的指针的指针，没有所有权；而 `string`的栈上数据就不一样了，它有所有权，数据还包括变量的长度和容量。

### **特性**

Rust的类型系统似乎抽象了具体的数据结构，使用 `type_name_of_val`测试变量的类型时如果：

* `&str`类型的变量的类型是 `str`，即变量指向的数据的类型，而不是变量本身的类型。
* 同样创建一个指向 `&str`类型的变量的引用时 `&(&str)`，其类型则是 `&str`，即其直接指向的数据的类型。
* 而如果是 `String`类型，直接检测其变量类型，会提示变量不是**引用类型**不能直接检测，而使用 `&String`类型的变量，则返回的类型是 `alloc::string::String`。

```Rust
//use std::mem::size_of_val;
use std::any::type_name_of_val;
use std::str;
fn main() {
    let sstring = String::from("Hello, world!");
    let sstr: &str = &sstring[2..6];
    let bytes = sstring.as_bytes();

    println!("{}", type_name_of_val(sstr));//str
    println!("{}", type_name_of_val(&sstr));//&str
    println!("{}", type_name_of_val(&sstring));//alloc::string::String
    println!("{}", type_name_of_val(&&sstring));//&alloc::string::String
    println!("{}", type_name_of_val(bytes));//[u8]
    println!("{:?}\t{:?}\t{}",sstr.as_bytes(),sstr.as_ptr(),sstr.len());
    //[108, 108, 111, 44]     0x23bc17db442   4
    println!("{:?}\t{:?}\t{}",sstring.as_bytes(),sstring.as_ptr(),sstring.len());
    //[72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33]   0x23bc17db440   13
}
```

### UTF-8编码文本

rust中，`String`是一种`Vec<T>`类型封装的以`UTF-8`编码字节存储字符串的数据类型。

UTF-8编码是一种可变长的字符编码，如字符`我`的编码为`E6 A0 84`，字符`A`的编码为`41`。

`我A`在String中便存储为`E6 A0 84 41`，那如何判断这一串字节是表示哪几个字符？

UFT-8编码的编码规则如下：

* 对于ASCII字符（即U+0000到U+007F），它们被编码为一个字节，格式为0xxxxxxx。
* 对于16位的Unicode字符（即U+0080到U+07FF），它们被编码为两个字节，格式为110xxxxx 10xxxxxx。
* 对于24位的Unicode字符（即U+0800到U+FFFF），它们被编码为三个字节，格式为1110xxxx 10xxxxxx 10xxxxxx。
* 更大的Unicode字符会被编码为更多字节，但在这里我们只关注到三个字节的情况。

当程序遇到字节序列e6 a0 84 41时，它是这样解析的：

* 第一个字节e6（二进制11100110）以1110开头，表明这是一个三个字节编码的字符的起始字节。
* 第二个字节a0（二进制10100000）以10开头，表明这是属于前一个字符的后续字节。
* 第三个字节84（二进制10000100）同样以10开头，进一步确认这是属于前一个字符的另一个后续字节。
* 第四个字节41（二进制01000001）以0开头，表明这是一个单独的ASCII字符。

三种理解字符串的方式：

1. 字节，即计算机中存储的8位二进制数。
2. 标量值，类似char，表示有意义的最小字符单位。
3. 字符簇，有些文字由多个字符表示一个真正意义上的**文字**，例如一些由发音符号和字母构成的文字。

### 连接String

1. 使用 `+`连接字符串时，左值必须自拥有所有权（即不能是引用等无所有权的类型），右值必须是引用类型。
2. 执行操作后左值会被消耗，即被 `move`到新的赋值语句左侧的变量。
3. 因为`+`运算符调用的函数签名为`fn add(self, s: &str) -> String {`。

```rust
fn main() {
    let s1 = String::from("Hello");
    let s2 = String::from(" world");
  
    let s3 = (&s1).as_str().to_owned() + &s2;
    //加号左侧为s1时无所有权，不行；
    //为(&s1).as_str()时物所有权，不行；
    //为(&s1).as_str().to_owned()时有所有权，可行。

    println!("{}",s3)
}
```

## 枚举

1. 只包含**基础类型**的枚举，可以将每个枚举转换为整数，如：

   ```rust
   enum IpAddr {
      V4,
      V6,
      V8,
   }
   fn main() {
      let v8 = IpAddr::V8 as u8;
      assert_eq!(v8,2);
      println!("{:?}",v8);//将输出 2
   }
   ```

   如果是非原始类型，则不能使用 `as`进行类型转换，比如：

   ```rust
   enum IpAddr {
      V4(String),
      V6,
      V8,
   }
   ```

2. `Enum`的特点是，它拥有多种变体，但却是同一种类型，相当于将多个不同的类型作为一个集合类型使用。

   与结构体的区别：相比同样包含多种类型的***结构体***，`Enum`变量只需初始化为其中一种变体，无需像***结构体***对每个字段进行初始化。

## 方法

方法即定义在 `结构体、枚举、trait`上下文的可被其**实例**调用的函数，方法的第一个参数一定是 `self`或其变体，使用 `self`关键词表示调用方法的实例。

1. 方法的 `self`关键词实际是 `self: Self`的语法糖

   同理 `&self`关键词实际是 `self: &Self`的语法糖

   ```rust
   fn gray(&self)
           -----
             | 等同于(self: &Self)
   ```

2. 首字母大写的 `Self`表示其类型的类型名。

## 关联函数

关联函数与方法类似，区别是其参数不包括 `self`

无论是方法还是关联函数，`Self`都表示其类型的类型名。

## 泛型

* 泛型使用符号 `T`表示类型参数，相当于类型名称的占位符。
* 在函数、结构体等名称后面添加的 `<T>`表示包含类型参数。后续在函数、结构体等内部使用的 `T`即为对应的类型名称，该名称由编译器推断出来，并在编译时填充为具体的类型。

  > 你可能会好奇使用泛型类型参数是否会有运行时消耗。好消息是泛型并不会使程序比具体类型运行得慢。
  > Rust 通过在编译时进行泛型代码的 单态化（monomorphization）来保证效率。单态化是一个通过填充编译时使用的具体类型，将通用代码转换为特定代码的过程。

* 使用多个类型参数与函数签名的参数类似，使用如 `<T,U>`的尖括号包裹多个类型参数名。
* 实现块 `impl`，后面跟随 `<T,U>`表示将 `T`和 `U`设为类型参数，使后续出现的 `T`、`U`都被视为类型参数，如果类型参数名是 `i32`，后续 `i32`也会变成类型参数。

## Trait

### 基本概念

Trait用于定义共同行为，类似于其他语言中的 `Interface`，各类型相约实现具有相同函数签名的函数，以供任意调用。

> 👋
> 一个类型的行为由其可供调用的方法构成如果可以对不同类型调用相同的方法的话，这些类型就可以共享相同的行为了。定义trait是一种将方法签名组合起来的方法，目的是定义一个实现某些目的所必需的行为的集合。
>
> 👋
> 上面所说的 `方法`是指 `method`，与 `associated function`相对立的 `method`

* trait可以作为参数的注解，如 `fn A(a: &impl Display)`，表示参数要求实现了指定的trait。
* **Trait bound**:通过注释泛型的的方式如 `<T:Display>`实现对**函数接收参数、类型方法、函数返回值**等的有条件执行，使以上各种实现只对实现了指定trait的类型生效。

  * **函数接收参数**即使用 `fn A<T:Display> (a: T)`代替 `fn A(a: impl display)`。
  * **类型方法**指通过注释有条件的实现某类型的方法，比如 `impl<T: Display + PartialOrd> Pair<T>`表示只为实现了指定trait的类型实现方法。
  * **函数返回值**的trait bound如 `fn A(a) -> impl Display`，表示要求返回值的类型实现了指定的trait（只适用与返回单一类型的情况，返回多种类型见[动态分发](#特征对象及动态分发dynamic-dispatch)。

#### 案例思考

1. E0282报错，rust编译器无法推断类型。
   首先分析*Example 1*和*Example 2*这种情况。

   ```rust
   //Example 1
   struct Foo<T> {
      num: T,
   }
   impl<T> Foo<T> {
      fn bar<W>(a:W) -> i32 {
            0
      }
      fn baz(b:T) {
         let number = Foo::bar(b);
         //此处必须添加::<T>，否则会报错E0282
         //修正后为 let number = Foo::<T>::bar(b);
      }
   }
   ```

   个人理解Rust编译器推断不出类型的原因是rust需要知道 `Foo::bar(b)`调用的是哪个 `impl`块的 `bar`方法。

   此处 `impl`是 `Foo<T>`，即带泛型参数的 `Foo类型`的实现，虽然我们是可以推断出来不轮 `Foo`的内部类型是什么，`bar`方法都肯定是调用这个 `impl`块的 `bar`方法，但是Rust不知道。

   这是因为 `impl`块是可能针对具体不同的类型实现的，比如：

   ```rust
   //Example 2
   impl Foo<i32> {
      fn bar<W>(a:W) -> i32 {
            0
      }
      fn baz<T>(b:T) {
            let number = Foo::<i32>::bar(b);
            //这时需要指定为Foo::<i32>是同样的道理
      }
   }
   impl Foo<u32> {
      fn bar<W>(a:W) -> i32 {
            0
      }
   }
   ```

   因此*Example 1*需要添加 `Foo::<T>`应该也是相同的原因，为了注明此处调用的是 `impl<T>`实现块的 `bar`方法（虽然个人觉得毫无必要，纯粹是Rust编译器太蠢）

   对于*Example 3*，无法推断出类型的原因是因为编译器不能从 `Trait名::Trait内的函数名`这种调用方法中推断出类型。修改方法见注释

   ```rust
   //Example 3
   struct Sheep { naked: bool, name: String }

   trait Animal {
      fn new(name: String) -> Self;
   }

   impl Animal for Sheep {
      fn new(name: String) -> Sheep {
         Sheep { name: name, naked: false }
      }
   }

   fn main() {
      let mut dolly = Animal::new("Dolly".to_string());
      //可修改为 dolly: Sheep
      //或 <Sheep as Animal>::new
      //或 Sheep::new
   }
   ```

### 特征对象及动态分发dynamic-dispatch

上节知道rust的泛型是静态分发的，也就是说编译时会为每种调用函数的类型生成对应的类型的函数代码。这是零成本的，因为在编译时就生成了。但是这样做的前提是函数的输入输出类型是编译时可推断的，而有些情况类型是无法在编译时确定的，这就要用到动态分发了。

```rust
//Example 1
struct Sheep {}
struct Cow {}

trait Animal {
    fn noise(&self) -> String;
}

impl Animal for Sheep {
    fn noise(&self) -> String {
        "baaaaah!".to_string()
    }
}
impl Animal for Cow {
    fn noise(&self) -> String {
        "moooooo!".to_string()
    }
}

fn random_animal(random_number: f64) -> impl Animal {
    if random_number < 0.5 {
        Sheep {}
    } else {
        Cow {}
    }//无法确定运行时每一次调用会输出哪种类型，因为每次输入的参数是无法推断的
}

fn main() {
    let random_number = 0.234;
    let animal = random_animal(random_number);
    println!("You've randomly chosen an animal, and it says {}", animal.noise());
}
```

观察*Example 1*。
使用*trait bound*语法指定返回的值的类型为实现了指定 `trait`的类型时，要求该函数在运行时（单态化之后）只能返回单一类型，因为如果返回多种类型，rust无法推断出实际返回哪种类型，也就无法在编译时计算其内存大小。

若要返回多种类型，可通过返回引用的方式，因为指针的大小是可推断为 `usize`类型的大小的，具体语法为：`-> &dyn TraitName`或 `BOX<dyn TraitName>`。

此外因为编译时无法确定**返回的类型**，因此，后续调用**返回的值**的方法编译器也无法推断，因为不能确定运行时调用的是哪个类型的方法。

**Rust的解决方案是：**

1. 返回值改为返回一个指针或引用类型的值 `A`，指向一块**堆**内存，用于存放返回的类型（被称为**特征对象***trait object*），这个类型名在运行时才能确定。也就是说函数返回的是类似 `String`等存放在堆上的变量，而变量的具体数据在运行时计算。
2. 同时还会获得一个指针 `B`，指向一个存放了所有类型实现的该trait的方法的**堆**内存。（我管这叫trait方法堆，也是在运行时创建）
3. 最后在其他地方调用该返回值的方法时，就可以在 `B`指向的方法的表里找到属于 `A`指向的类型的方法。
4. 但是这样返回的变量最终只是一个 `trait object`形如 `BOX<dyn TraitName>`，只能调用其 `trait`上实现的方法。不能调用原类型的自有方法。

同时 `BOX<dyn TraitName>`这种方法也可以用做函数的形参，使其成为动态分发模式，比如*Example 2*：

```rust
//Example 2
fn draw_with_box(x: Box<dyn Draw>) {
   //这样做可以传入不同的类型，只要它们都实现了Draw trait即可。
   //这会使类型推断和方法调用变成动态分发形式。
    x.draw();
}
```

这种用*trait object*的使用要求对应的trait必须是对象安全的，即：

* 返回类型不能是Self
* 不能使用泛型参数

### 关联类型associated-types

## 生命周期

生命周期注解是为了防止悬垂指针，因此生命周注解是对引用类型的注解，生命周期的限制是针对被引用数据的限制。如果是自拥有的类型，则无需生命周期注解。

```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {x} else {y}
}
```

观察上面的例子，这个函数会报错。因为返回的值是一个引用，而rust无法确定被这个引用所引用的值的生命周期，即无法判断这个引用返回给调用点后，被其引用的值是否还有效，是否会产生悬垂引用。
而且因为这个函数可能返回x,y中的任一个变量，所以甚至无法知道返回的引用是哪个变量的引用，更无法判断生命周期了。

### 生命周期注解

返回的值是引用类型，且包含输入函数的参数时，为了让rust知道**返回的值**的生命周期应该多长，需要添加生命周期注解，如：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {x} else {y}
}
```

通过添加 `'a`注解，rustb编译器便知道返回的值（引用指向的数据）的生命周期应该至少与变量 `x`和 `y`指向数据的生命周期较短（准确说是交集）的那一个相同（参考下面例子）。这样rust就知道该怎么去检查生命周期错误了。

同时该注解生命周期`'a`必须比函数的生命周期长，因为应保证函数处理该引用时是引用本身是有效的。

> 👋
> 请注意这里说的是“**应该**”，注解只是让编译器可以推断返回的引用的生命周期**应该**至少多长，而不是规定其生命周期。
> 后续是编译器通过将 `实际计算出的返回的值的生命周期`和 `通过注解推断“应该”至少多长的生命周期进`行比较，从而给出错误提示。

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {result}");
    \\报错，因为longest中注释了返回给result的值的生命周期与string2（短的）相同。
    \\而string2的生命周期只在内部作用域,所以result的生命周期也只在内部作用域。
}
```

**总结**：

* 生命周期注解不是为了修改生命周期，而是为了确定**返回的变量**的生命周期（同时也是获取该返回值的变量 `result`的生命周期，因为其他引用的生命周期rust都可以推断出来，只有返回值会有可能推断不出来），让编译可以进行生命周期检查或者说进行卡控，从而能够在编译时判断是否会产生**悬垂指针**。
* 生存周期注解是用来表示多个引用的生存周期之间的关系的，单个注解并没有什么意义
* 因为编译器不够聪明，如果它不知道 `result`的生命周期，它就没办法继进行检查引用是否失效、数据竞争、自动释放内存等操作了。
* 如果返回的引用与参数无关，那这个引用只可能指向函数内部创建的值，这个值的生命周期是可以推断的。

### T:'static

`T:'static`约束的理解很简单，即T不能是任何非 `'static`生命周期的引用类型。说明如果不是引用类型，那么就肯定符合约束；如果是引用类型，再检查生命周期是否是`static`。

```rust
use std::fmt::Display;

fn main() {
    let r3: &str = "String";
    let s1 = "String".to_string();

    static_bound(r3);
}
fn static_bound<T: Display + 'static>(t: T) {
  println!("{}", t);
}
```

```rust
// Example 1
use std::fmt::Debug;

fn print_it<T: Debug + 'static>( input: &T) {
    println!( "'static value passed in is: {:?}", input );
}

fn main() {
    let i = 5;

    print_it(&i);
}
```

《Rust圣经》中的一个例子[Example1](https://course.rs/advance/lifetime/static.html)，文章说 `原因在于我们约束的是 T，但是使用的却是它的引用 &T，换而言之，我们根本没有直接使用 T，因此编译器就没有去检查 T 的生命周期约束！它只要确保 &T 的生命周期符合规则即可，在上面代码中，它自然是符合的。`。

这是一个误解，实际上对函数传递`&i32`类型的参数，模式匹配会将`&i32`解构为`i32`，即`T`此时等于`i32`，这样 `T`就不是引用类型了。因为在rust中，**函数传参也是一种模式匹配**。

编译器针对类型 `T`检查发现输入的类型 `T`不是引用类型，而是一个自拥有的变量。

这也符合前面所说的 `T:'static`约束 `T`类型不包含非 `static`生命周期的引用（没有**引用**就更没有所谓**非 `'static`生命周期的引用**，这是包含关系）

### 类型转换

#### 基本类型转换

rust没有为基本类型提供隐式的自动类型转换，而是使用`as`进行显式的转换。

#### 自定义类型的转换

1. 非基本类型之间的转换，需要实现`From/Into`特征，标准库已经实现了部分`From`特征，比如从`&str`转换成`String`的`From`特征，因此可以使用`String::from(&str)`进行类型转换。
   该trait表示从**其他类型**转换成**本类型**。

   `From/Into`特征的函数签名为`fn from(value: T) -> Self`

2. 此外还有一个类型转换trait，其返回的是Result类型，以提供转换失败时抛出错误供程序员处理的能力。

   `TryFrom/Into`特征的函数签名为`fn try_from(value: T) -> Result<Self, Self::Error>`

## 闭包

闭包即rust的`函数式`编程的一种实现方式，闭包可以理解为函数的**封装**，闭包可以捕获保存外部变量、可以作为参数传递给其他函数、可以作为返回值返回。

* 闭包捕获变量时遵循所有权的规则，并且会用尽可能宽松的方式来捕获变量。
* rust的闭包可以不用类型注释，编译器会自动推导闭包的类型（特殊情况除外）。
* `Fn trait`是闭包的`trait bound`是自动实现的，依据闭包可以被调用次数的不同自动、渐进的实现`FnOnce、FnMut、Fn`三种trait。
  * FnMut要求闭包是`mut`的。
  * 如果闭包参数被注释了`FnOnce`，那它就可以捕获`不可变引用、可变引用和获取所有权`。因为`FnOnce`首先要求闭包获取所有权，如果实现闭包能获取所有权，那也能获取可变和不可变引用。相反，注释`Fn`的闭包则不能获取`不可变引用、可变引用和所有权`，因为它首先要求只捕获不可变引用。
* `move`关键词决定了闭包通过移动的`方式`捕获变量，但没有指定闭包实现的`trait`。闭包实现的`trait`由编译器根据闭包对捕获变量的使用方式自动推导，`Fn trait`只代表了闭包可以捕获变量的尽可能宽松的方式，这也说明，实现`Fn`trait的闭包并不一定没有捕获变量的所有权。

## 智能指针

### Deref解引用

1. 解引用操作不会获取数据的所有权。
2. 实现了`Deref` trait的类型还可以在传参时隐式转换类型。
3. 调用`&T`的方法时，如果`T`实现了该方法，会自动解引用。实现了`Deref` trait的也允许通过类似方式调用方法。

## Async和await

### Future

类似于JavaScript的`Promise`，rust中的`async`标记的代码块会被编译为一个实现了`Future`trait的数据类型，`async`标记的函数则会被编译为返回一个这种数据类型的普通函数。

对`future`调用`.await`会等待异步操作执行返回。但只能在异步函数或异步代码块(即async标记的)中调用`.await`，但不能将main函数标记为`async`，因此无法在main函数中`await`。

因此要`await`一个`future`需要一个异步运行时，常用的运行时有`Tokio`。运行时是通过轮询各个`future`实现异步管理的。

### await point

rust需要`await point`才能将控制权交还给运行时，运行时才能切换运行代码。

### future是线性的

`await`给定的`future`时，`future`内的所有操作都是线性发生的。

### pin

pin模块用于将数据固定在内存位置上。

满足以下点的值是`pinned`（固定）的。

1. `pining`的值无法被移动。
2. 确保该的内存位置始终有效。

直接`await`一个`future`会隐式的固定它。

通过`pin`固定的是指针指向的数据，如`Pin<Box<SomeType>>`固定的是`SomeType`。`Box`指针仍可移动。

#### 关于future

平时正常使用`future`时不会有任何报错，但想要移动`future`时（如移动到`vec`，`join_all()`中），就会提示需要实现`unpin`特征的问题。

这是因为`future`内部可能存在自引用，而默认情况下任何包含自引用的对象都是不能安全移动的，因为引用始终指向具体的内存地址。如果移动`future`，其包含的自引用在移动后仍会指向旧的位置。相当于说自引用类型都是`pinned`的，无法`move`的。

### unpin

`Unpin`是一个标记trait，类型实现`Unpin`，表示其可以被安全的移动，不论它是否被`pin`。

没有自引用的类型都会自动实现`Unpin`。

不能自动实现`Unpin`的则会实现`!Unpin`，也就是无法安全的移动。

### 总结

至此可以解释为什么把`future`放到`join_all()`中会报错了。因为：

因为`future`中可能包含自引用，因此其实现的是`!Unpin`，不能被安全的移动。所以需要`pin`住它，`future`被`pin`后，就不会被移动了，但其指针仍然可以移动，通过移动其指针仍可以实现创建`Vec`而不报错。

一般是通过创建`Pin<Box<T>>`的类型，保证`T`即`Future`不被移动，只移动`Pin`和`Box`。
