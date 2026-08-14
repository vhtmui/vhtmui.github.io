---
title: 为什么rust需要Pin?
date: 2026-07-31
---

## Pin的产生

rust中有些数据结构可能会携带指向自身的指针，比如：

```rust
struct A {
    data: 1, 
    ptr: 0x01, //data字段内存地址
}
```

特别是rust异步函数编译生成的代码就可能会有这种结构（其实基本也就跟异步编程有关）。

这种结构的数据如果被移动了（通过获取其可变引用，再mem::replace等等），那其字段`data`也被移动了，但字段`ptr`还指向原来的值，这个ptr就坏了，变成了悬垂指针。

所以需要一个标识来保证某些数据不会被移动，不然future的实现不能使用这些内存不安全数据， 这个标识就是类型`Pin`。

## Pin的原理

```rust
pub const fn get_mut(self) -> &'a mut T
where T: Unpin
```

`Pin<T>`通过带`Unpin`约束的`get_mut`方法来限制用户获取类型`T`的可变引用，从而保证被`Pin`包裹的数据不会被移动。
