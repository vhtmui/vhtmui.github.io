# PowerShell

## 关于编码

vscode中默认使用UTF8编码，powershell旧版本中默认使用系统编码，且旧版windows powershell对文本编码的判断要通过其BOM判断，然后通常UTF8文件都是不带BOM的。

因此在使用powershell旧版本运行UTF8编码的脚本时，会因为无法判断其编码，而使用系统默认的编码格式，导致其中文乱码。
解决方法是保存文件时将其保存为带BOM的UTF8编码。

**参考链接：**
[Windows Powershell 和CMD显示中文乱码的真实原因和解决方法](https://www.cnblogs.com/ABuSiDeLuoYin/p/18083425)

## Get-help

输入Get-Help查找帮助时

```Powershell
Get-Help Get-FTPChildItem
```

输出内容信息大多为空，此时应先导入PSFTP模块

```Powershell
Import-Module PSFTP
```

## 关于Write-Error

抛出错误默认显示powershell自动构建的位置和信息，如

```Plain
CheckMaterial: 
Line |
   3 |  CheckMaterial 'hhhh'
     |  ~~~~~~~~~~~~~~~~~~~~
     | Exception calling ".ctor" with "2" argument(s): "Cannot process argument because the value of argument "password" is null. Change the value of argument "password" to a non-null value." 
```

通过传参可以显示其他消息，但前面的位置信息不会改变，如如下代码：

```Plain
Write-Error -Message "`n{InvocationPosition}:`n$($_.InvocationInfo.PositionMessage)`n{Message}:`n$($_.Exception.Message)`n{ErrorId}:`n$($_.FullyQualifiedErrorId)" -ErrorAction Stop
```

显示的错误如下：

```Plain
CheckMaterial: 
Line |
   3 |  CheckMaterial 'hhhh'
     |  ~~~~~~~~~~~~~~~~~~~~
     | 
{InvocationPosition}:
At I:\my_git\PowerShell\Project\MaterialCheck\MaterialCheck.psm1:21 char:23
+ … redential = New-Object System.Management.Automation.PSCredential('SHM …
+               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{Message}:
Exception calling ".ctor" with "2" argument(s): "Cannot process argument because the value of argument "password" is null. Change the value of argument "password" to a non-null value."
{ErrorId}:
ConstructorInvokedThrowException,Microsoft.PowerShell.Commands.NewObjectCommand 
```

## PSFTP

一个关于FTP的简单命令工具集

- **安装**

```powershell
install-module -Name PSFTP
```

- **导入模块**

```powershell
Import-Module PSFTP
```

## 对象

类似结构体，一个对象包含**对象类型、方法、属性**三种数据。
类型表示其类型，如FileInfo对象表示文件对象；
方法表示可以对对象执行的操作；
属性用于存储信息。

对象可以存储在变量中，多个对象存储在变量中使用 `$a[n]`的形式调用。

## 脚本内调用其他脚本

使用相对路径或绝对路径调用其他脚本

## 性能分析

使用脚本执行时间的倒数的商计算运行速度差距

### FileInfo获取方法

```powershell
(IO.DirectoryInfo.EnumerateFiles + Collections.ArrayList) / Get-ChildItem = 1.15
(IO.DirectoryInfo.EnumerateFiles + Collections.Generic.List<T>)  / Get-ChildItem = 7~8
Collections.Generic.List<T> / Collections.ArrayList = 5~7
```

### 通配符递归获取文件信息

```powershell
IO.DirectoryInfo.EnumerateFiles("*.csv", 1) / Where-Object {$_.Name -Like '*.csv'} =  2~3
```

### 通配符和正则匹配

简单匹配

```powershell
(EnumerateFiles("DA35*.csv", 1) + -match .*) / (EnumerateFiles("*.csv", 1) + -match "DA35" )= 1~2
```

### Function和Class

测试一个构建时间变量的函数，运行速度慢于用 `class`构建的类和方法。位于模块 `FileTransToolBox`的 `FileTransToolBox\1.0\FileTransToolBox.psm1`文件中。

## 多线程异步

### Powershell中的Start_Thread

用于启动后台异步Job。
Job会在新的会话中运行，环境变量会重置，导入的模块会根据环境变量导入，但注册的类型加速器不会重置。

### .Net异步编程模型(APM)

使用Begin、End关键字的方法均为实施异步操作的方法

## 静态方法和动态方法

### 静态方法（Static Method）

- 静态方法是属于类的，而不是类的实例。
- 它们在程序加载时就被创建，并且在整个程序运行期间都存在。
- 静态方法不依赖于类的实例，可以直接通过类名来调用，不需要创建类的实例。
- 静态方法不能访问非静态成员（如实例变量），因为这些成员需要具体的对象实例才能存在。

### 实例方法（Instance Method 或 Non-Static Method）

- 动态方法是属于类的实例的，它们与特定的对象关联。
- 每个类的实例都有自己的方法副本，因此不同对象可以有不同的方法状态。
- 动态方法可以通过类的实例来调用，需要先创建类的实例对象。
- 动态方法可以访问类的所有成员（包括静态和非静态成员）。

在 PowerShell 中，调用静态方法和动态方法的语法不同，主要是因为 PowerShell 是基于 .NET的，它遵循 .NET 的语法规则：

1. 调用静态方法：使用 `<.NET类名>::<方法名>`的语法，例如:`[System.Threading.Thread]::Sleep(1000)`
2. 调用动态方法：首先需要创建类的实例，然后通过点运算符来调用实例的方法，例如：

```powershell
$thread = [System.Threading.Thread]::new()
$thread.Start()
```

这里，`Start()`是 `System.Threading.Thread`类的一个动态方法，我们首先使用构造函数 `::new()`创建了一个新的线程实例，然后通过点运算符调用了 `Start()`方法。

这种语法差异反映了静态方法和动态方法在内存分配、生命周期和访问权限等方面的本质区别。静态方法是全局可用的，而动态方法则与特定的对象实例相关联。

## FTP响应流读取

1. 创建FTP请求

   ```powerhsell
   [System.Net.FtpWebRequest]$Request = [System.Net.WebRequest]::Create($FTP_Uri)
   ```

2. 设置请求方法，ftp是嵌套类，需要用+号引用

   ```powershell
   $Request.Method = [System.Net.WebRequestMethods+ftp]::ListDirectoryDetails
   ```

3. 使用FtpWebRequest.GetResponse方法获取响应实例

   ```powershell
   $Response = $Request.GetResponse()
   ```

4. WebResponse.GetResponseStream方法获取响应流

   ```powershell
   [System.IO.Stream]$ReceiveStream = $Response.GetResponseStream()
   ```

5. 使用StreamReader类构造响应流的文本读取器(TextReader)，同时指定编码

   ```powershell
   [System.IO.StreamReader]$ReceiveStreamReader = [System.IO.StreamReader]::new($ReceiveStream,[System.Text.Encoding]::Default)
   ```

6. 使用[System.IO.StreamReader]类的实例方法读取具体内容

## 正则匹配捕获组

正则表达式匹配出结果会自动填充到捕获组，每匹配一段字符就填充一个，这个称为未命名捕获组。
也可以手动指定 `(?<name>pattern)`显式捕获组

```powershell
# 假设我们有一个字符串
$string = "Hello, my name is Alice and I am 30 years old."
# 定义一个包含捕获组的正则表达式
$regexPattern = 'my name is (?<name>\w+) and I am (?<age>\d+) years old'
# 使用正则表达式进行匹配并获取匹配对象
$match = [regex]::Match($string, $regexPattern)
# 检查是否匹配成功
if ($match.Success) {
    # 使用捕获组名称或编号访问捕获的内容
    $name = $match.Groups['name'].Value
    $age = $match.Groups['age'].Value Write-Host "Name:
    $name" Write-Host "Age: $age"
}
# 未命名捕获组的示例
$regexPattern = 'my name is (\w+) and I am (\d+) years old'
$match = [regex]::Match($string, $regexPattern)
if ($match.Success) {
$name = $match.Groups[1].Value
$age = $match.Groups[2].Value
}  
```

需使用match方法，使用matches方法无法通过名称索引访问。

## 对象的引用

## Powershell添加跨脚本的类

```powershell
# Define the types to export with type accelerators
$ExportableTypes =@(
    [MyDateTimeConverter]
)
# Get the internal TypeAccelerators class to use its static methods
$TypeAcceleratorsClass = [psobject].Assembly.GetType(
    'System.Management.Automation.TypeAccelerators'
)
# Ensure none of the types would clobber an existing type accelerator
# If a type accelerator with the same name exists, throw an exception
$ExistingTypeAccelerators = $TypeAcceleratorsClass::Get
:out foreach ($Type in $ExportableTypes) {
    if ($Type.FullName -in $ExistingTypeAccelerators.Keys) {
        break out
    }
    else {
        # Add type accelerators for every exportable type.
        $TypeAcceleratorsClass::Add($Type.FullName, $Type)
    }
}
# Remove type accelerators when the module is removed
$MyInvocation.MyCommand.ScriptBlock.Module.OnRemove = {
    foreach($Type in $ExportableTypes) {
        $TypeAcceleratorsClass::Remove($Type.FullName)
    }
}.GetNewClosure()
```

## 导入模块

使用 `Import-module`会在 `$env:PSModulePath`下的文件中寻找 `module`，但不会递归查找该 `module`。
模块脚本文件中有异常导致终止时会导入失败。
`throw`抛出异常会导致函数退出，所以在 `.psm1`文件中使用并触发了 `throw`会导致模块导入失败。

## 关于赋值

在当前作用域内对多个哈希表键赋值时，如果指向的是作用域外的变量，会导致这多个键指向同一个变量。如：

```powershell
$Objects
$CellDictionary= [System.Collections.Generic.List[hashtable]]::new()
for ($i = 0; $i -lt $Ranges.Count; $i += 4) {
    $Object = [PSCustomObject]@{
     ColumnToCompared = $ColumnToCompared
     CellDictionary   = $CellDictionary
    }
    $Objects.Add($Object)
}
```

这段代码会导致 `$objects`中的所有 `$Object`的 `CellDictionary`键指向同一个变量。
更改方法是，在循环内初始化 ``$CellDictionary``。

```powershell
$Objects
for ($i = 0; $i -lt $Ranges.Count; $i += 4) {
    //在循环内初始化$CellDictionary
    $CellDictionary= [System.Collections.Generic.List[hashtable]]::new()
    $Object = [PSCustomObject]@{
        ColumnToCompared = $ColumnToCompared
        CellDictionary   = $CellDictionary
    }
    $Objects.Add($Object)
}
```

这是因为在PowerShell 中，赋值默认只复制**引用**，若变量作用域在循环外，会导致每次给 `CellDictionary`赋予的值都是指向同一个变量的引用，因为该变量 `$CellDictionary`的生命周期比循环块长，循环结束$CellDictionary还在，还可以被下一次循环访问。

## 文件动词

```powershell
PS C:\Users\Administrator> [System.Diagnostics.ProcessStartInfo]::new('C:\Users\Administrator\Desktop\韶华晶圆鉴定数据导入-用户测试报告.doc').Verbs
edit
open
print
```
