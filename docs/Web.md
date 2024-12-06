# Web

## JS

### 模版

模版字面量使用反引号包围`string-literal`。

带标签的模版形式如：

```js
  `我需要做：
  ${todos}
  当前进度为：${progress}
  `;
```

带标签的模板字面量是一个函数调用的语法糖，上文语法表示实际如下：

```js
  fn`我需要做：
  ${todos}
  当前进度为：${progress}
  `;

  function fn(literals, ...substitutions) {}
```

* 传入fn的参数分两部分，第一部分为模版字面量的静态字符串数组，第二部分为模版字面量的每个标签。  
* 参数会按其在模板中出现的顺序进行排列。
  > 其中第一个变量必定是静态字符串，如果模板中先出现的是标签如：`${var}hello`，那静态字符串数组的第一个值会是一个**空字符串**。

### 键值缩写

当键的名称与作为键的值的变量的名称相同时，可以省略值的书写。如下例：

```html
<script>
  {
    description: description
    //等同于
    description
  }
</script>
```

### 可迭代对象

* 可迭代对象必须实现`Symbol.iterator`方法，该方法返回一个迭代器对象
* **迭代器对象**必须实现`next()`方法
  * `next()`方法返回一个对象，对象必须包含一个属性`done`，表示是否迭代完成，如果迭代完成则返回一个对象`{done: true}`，否则返回一个对象`{done: false, value: 值}`。
* 可使用生成器函数快速创建一个 可迭代对象。如：

  ```js
  //生成器生成可迭代对象
  function* generator(i) {
    yield i;
    yield i + 10;
  }
  const gen = generator(10);
  const gen2 = generator(10)[Symbol.iterator]();
  //迭代器，可以使用next()方法迭代，但不是可迭代对象。因此仅实现迭代器的作用较小。
  gen = {
    next() {
      return {done: false, value: 10};
    }
  }
  //实现Symbol.iterator方法后就是可迭代的迭代器了，也是可迭代对象。
  gen = {
    i: 0,
    next() {
      if (i >= 10) { return { done: true } } 
      else{
        return { done:false, value: i++ };
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
  ```

可迭代对象可以使用多种方法遍历，如：`for-of`方法，`[...var]`展开。

### 闭包

在嵌套的函数中，内部函数可以访问外部函数的变量，外部函数却不能访问内部函数的变量，这就形成了闭包。
其重要特性是：

1. 内部函数如果访问了外部函数的变量，该变量会被保存在闭包中，可以超出函数的生命周期，直到引用该变量的对象被销毁。相当于一个仅限于函数内作用域的**状态**指示。

### 异步JS

JS异步函数会立刻返回一个 `promise`，`promise`拥有一个状态。可以对返回的 `promise`对象调用 `then()`方法，`then()`方法接收一个函数，`promise`会调用这个函数。如*Example 1*：

```js
//Example 1
const fetchPromise = fetch(
  "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json",
);
console.log(fetchPromise);
//fetchPromis是一个promise对象
fetchPromise.then((response) => {
  console.log(`已收到响应：${response.status}`);
});
//给then方法传入一个函数，promise内部会调用这个函数
console.log("已发送请求……")
```

使用 `asycn`关键字表示异步函数，随后可以在函数内部使用 `await`使异步函数直接返回 `promise`内部调用函数传的参数，而不是先返回 `promise`对象。如*Example 1*:

```js
//Example 2
function alarm(person, delay) {
  return new Promise((resolve, reject) => {
    if (delay < 0) {
      throw new Error("Alarm delay must not be negative");
    }
    window.setTimeout(() => {
      resolve(`Wake up, ${person}!`);
      //resolve()的参数将直接返回给await alarm的调用者
    }, delay);
  });
}
button.addEventListener("click", async () => {//使用async关键字
  try {
    const message = await alarm(name.value, delay.value);
    //将直接返回`Wake up, ${person}!`
    output.textContent = message;
  } catch (error) {
    output.textContent = `Couldn't set alarm: ${error}`;
  }
});
```

### IndexedDB

浏览器数据库的使用。

1. 创建数据库请求对象，`const openRequest = window.indexedDB.open("notes_db", 1);`

   1. `"note"`为数据库名称
   2. `1`为版本号
   3. 函数是异步的，返回一个request对象。可以通过侦听其 `sucess`或 `error`事件执行后续操作。
2. 请求成功时存储数据库对象 `db = openRequest.result;`
3. 创建数据库表，新建自增列：

   ```JS
    const objectStore = db.createObjectStore("notes_os", {//创建一个新表命名为notes_os
      keyPath: "id",//创建自增列
      autoIncrement: true,
    });
   ```

4. 创建新的列字段,创建了 `title`和 `body`字段（列）。

   ```js
   objectStore.createIndex("title", "title", { unique: false });
   objectStore.createIndex("body", "body", { unique: false });
   ```

5. 添加数据

   1. 先创建键值对 `const newItem = { title: titleInput.value, body: bodyInput.value };`
   2. 再打开一个数据库读写事务 `const transaction = db.transaction(["notes_os"], "readwrite");`
   3. 打开指定表的存储对象 `const objectStore = transaction.objectStore("notes_os");`
   4. 调用存储对象的 `add`方法添加数据 `const addRequest = objectStore.add(newItem);`该异步方法返回一个request对象。可在上面添加侦听器侦听成功错误事件。
   5. 读写事务对象 `transaction`同样也有完成和错误事件。

### 事件dispatch

用于使指定目标触发事件，语法是 `object.dispatchEvent(event)`。

触发事件后便会触发事件侦听器，并触发事件处理函数。但与原生的侦听器的事件处理函数会异步执行不同，dispatchEvent触发的事件处理函数会同步执行，即会阻塞后续代码的执行直到事件处理函数执行完毕。

## CSS

### 选择器

选择器相连使用表示同一个元素内的属性，如 `.a.b`表示 `class = "a b"`

如中间带空格，则表示父子节点的属性，如 `.a .b`表示父元素的 `class = "a"`，子元素的 `class = "b"`

### 嵌套选择器 &

#### 组合选择器

```CSS
.a{
  .b {} /* 相当于 .a .b 即属于class="a"的子元素，且自身class="b"的元素 */
  &.b {} /* 相当于 .a.b 即class="a b"或"b a" */

  h2 {} /* 相当于 .a h2 即属于class="a"的子元素，且是h2元素的元素*/
  &h2 {} /* 无效语法*/
  & h2 {} /* 相当于 .a h2 即与上面第三项相同*/
}
```

#### 后附嵌套选择器

```CSS
.a{
  .b& {} /* 相当于 .b.a 即class="a b"或"b a" */
  .b & {} /* 相当于 .b .a 即属于class="b"的子元素，且自身class="a"的元素 */

  h2 & {} /* 相当于 h2 .a 即属于h2元素的的子元素，且自身class="a"的元素*/
  h2& {} /* 相当于 h2.a 即class="a"的h2元素*/
}
```

### 优先级

一条CSS声明的优先级分三层判断

* 来源，用户代理、用户样式、作者样式优先级从低到高按如下排序。
  1. 用户代理普通样式
  2. 用户普通样式
  3. 作者普通样式
  4. 正在动画的样式
  5. 作者重要样式
  6. 用户重要样式
  7. 用户代理重要样式
  8. 正在过渡的样式
* 所属层叠层
  * 普通层叠层越晚创建优先级越高，匿名层为第二高，内联样式为最高。
  * `!important`的声明，层叠层越早创建优先级越高，匿名层优先级最低，内联样式最高。
* 所属选择器
  * 按权重计算，`id-类-元素`，每有一个加一分。如 `h2#cid.haha`的权重为 `1-1-1`。

### 盒子

盒子分为块级盒子和行级盒子。盒子的范围大小一般指包括 `border`在内的范围大小。

* 块级盒子
  * 块级盒子会和前后文元素换行
  * 会把其他元素推出 `margin`的范围
  * `width`和 `height`属性可以生效
* 行级盒子
  * 行级盒子不会和前后元素换行
  * 会左右推出其它元素到 `border`范围，上下推出到 `content`范围
  * `width`和 `height`属性不生效

其他已知特点：

1. 行级盒子内包含块级盒子会导致整个盒子展现出块级盒子的表现，比如换行。

### 基线

基线（baseline）是指欧洲和西亚文字排版中，字体中大多数文字坐落在其上的一条假想线。

1. 东亚文字没有基线，所有字形（glyph）坐落在一个方框中，既没有升部（ascender）也没有降部（descender）。当与有低基线的文字混排时，东亚文字应该坐落在有低基线的文字的基线与降部高度的中间。

2. 不同的字体基线不同，因此会导致如图片、`svg`等内联元素的垂直对齐位置和使用其他字体时的对齐位置不同。即呈现出高度不在一个水平线的情况。

### img

&lt;img&gt; 没有[基线](#基线)（baseline），这意味着，当在一个内联格式化上下文（inline formatting context）中使用 `vertical-align: baseline`时，图像的底部将会与容器的文字基线对齐。也就是说会与下一行的元素留有空隙。

#### object-fit

对 `img`元素使用 `object-fit`前需指定 `img`元素的长宽，随后浏览器才能基于 `img`元素长宽的盒子应用 `object-fit`的效果。

### 溢出内容

元素内容的溢出是指某个盒子，其内容溢出其本身的大小。

控制溢出内容的属性 `overflow`是针对被内容溢出的盒子的，而非内容本身。如*Example1*：

```html
<!-- Example1 -->
<article>
  <img src="images/top-image.png" alt="top-image" id="top-image">
</article>
<!-- 假设图片宽度比article宽度要大 -->
```

此处发生内容溢出的是 `<article>`元素，而非 `<img>`元素，因而需要对 `<article>`使用 `overflow`

### 文本内容排布

`content`中的文本从内容盒子的左上角开始排布，因而可能导致文本在盒子不居中显示。

可以通过设置行距 `line-height`使文本在内容盒子里居中。

### display: float

float使盒子浮动，其他元素的内容会环绕浮动的盒子。浮动盒子不在正常文档流，原正常文档流的元素会保有其位置和宽度。

其他元素环绕的做法为：

* 增加其内容的宽度或高度，使其在与浮动的盒子重叠的区域留白，在超出浮动盒子的区域显示内容。
* 表现为，先假设浮动盒子不存在时的布局，加入浮动盒子后，浮动盒子会挤开其所在位置的原有元素的内容，但不会挤开该位置的盒子，而是会使这些盒子变长或变宽、内容偏离原位置。
* 正常盒子在html文档中的位置在浮动盒子后面时，一定会把正常盒子的内容挤开。在浮动盒子前面时，如果正常盒子不是 `block`状态，其内容也会被挤开。

### display: float-root

`float-root`值的主要作用是使，元素中的所有内容参与到块中，防止浮动元素溢出。

### position: sticky

* 要使 `<img>`元素正确地使用 sticky 定位，通常需要将它放在一个具有`明确高度和宽度`的容器中。
* 子元素会相对于最近可滚动的父元素进行`sticky`，因此如果其可滚动的父元素不是通常的body元素，就会造成其看起来没黏住的情况。因为实际它时黏在了某个可滚动的祖先元素上，而该祖先元素相对于body元素又没有`sticky`。此时应该滚动该可滚动祖先元素的滚动条，才能发现子元素黏在了该祖先元素上。
* 父元素 `display`属性为 `flex`,`grid`时，子元素无法黏住。
* 父元素离开 `viewport`时，`sticky`的子元素也会跟随离开。
* 子元素高度大于视口高度时，会在滚动到子元素底部出现在视口时，才会`sticky`。

### font

关于 `@font-face`，经测试只能引入 `woff2`类型的字体文件，`ttf`的无效。

### transition

过渡动画通常要求源和目的状态的相关属性都要有**明确的值**，比如`width`，必须是具体的值，不能是`max-content`之类的值。又如`border`，两种状态都至少要指定边框宽度和风格，才有效果，不指定值或设置为`none`，则无效果。

### 实践经验

1. 对元素使用 `scale`放大动画，可能会导致元素暂时溢出屏幕，可能会因此导致滚动条出现，使得画面因大小变化而闪动。
   可以通过设置元素或父元素的内外边，使其与视口边缘保持一定距离解决。

## SVELTE

### 基本语法

* 不带引号的字符串都表示变量、函数、属性、props等。

### tick

svelte组件状态更新时，DOM不会立即更新，而会等到所有其他需要更新DOM的任务执行完后一同更新DOM，`await tick`会等待前面的代码更新应用到DOM后，再执行后续的代码。

```html
<script>
 import {tick} from "svelte";
 
 let text = `Select some text and hit the tab key to toggle uppercase`;

 async function handleKeydown(event) {
  if (event.key !== 'Tab') return;

  event.preventDefault();

  const { selectionStart, selectionEnd, value } = this;
  const selection = value.slice(selectionStart, selectionEnd);

  const replacement = /[a-z]/.test(selection)
   ? selection.toUpperCase()
   : selection.toLowerCase();

  text =
   value.slice(0, selectionStart) +
   replacement +
   value.slice(selectionEnd);

  // 这里如果不加await tick()，后续更改光标选择范围不会生效，
  // 因为按了TAB键后原内容已经被清除，新内容由于svelte的更新机制导致DOM还未更新，
  // 因为指定光标选择范围不起作用。
  await tick();
  this.selectionStart = selectionStart;
  this.selectionEnd = selectionEnd;
 }
</script>

<textarea
 value={text}
 on:keydown={handleKeydown}
></textarea>

<style>
 textarea {
  width: 100%;
  height: 100%;
  resize: none;
 }
</style>

```

### 生命周期

对于组件的生命周期函数，必须在组件初始化期间调用，因此不能封装在其他函数中在web程序中多次不定时调用。否则可能出现`Function called outside component initialization`报错。

调用一次之后就会在特定时机永久生效。

#### onMount

onMount不能在服务器端运行，因此某些浏览器api如 `window`,`doccument`无法在服务器端运行，可以使用 `onMount`确保其只在浏览器端运行。

### stores

`stores`对象通过 `subscribe`函数进行订阅，订阅方法为 `stores.subscribe()`，`subscribe`方法接受一个函数作为参数，`stores`会传入其当前值给该函数，同时 `subscribe`方法返回一个 `unsubscribe`方法用于取消订阅。

* 直接使用 `stores`对象无法获取其值
* 需要通过传入的函数获取其值，如：

  ```html
  <script>
  stores.subscribe((value) => { //每次stores状态变化后便会调用此函数，将其值传入该函数。
    my_value = value;
  });
  </script>
  ```

* `subscribe`函数返回一个 `count.subscribe`方法，可以使用该方法取消订阅。
* 也可以使用 `$stores`语法获得自动订阅及取消订阅的变量 `stores`的引用。

#### writable stores

一个可写的跨组件同步的对象，拥有 `set`和 `update`方法，以设置或更新值。对象的值在不同组件同步，可以类比为全局变量。

### transitions

过渡模块，用于控制元素加入或移出DOM时的过渡动画，可以自定义过渡。

自定义过渡函数如下：

```html
<script>
function fade(node, { delay = 0, duration = 400 }) {//node为自动传入的当前元素
 
 return {
  delay, //动画开始的延迟时间
  duration, //动画执行的时长

  //此处函数的参数t均表示一个随着时间duration从0增长到1或从1减少至0的数（取决于动画是in还是out）。
  //通过这个会随事件变化的数，可以实现一些动画随事件变化
  css: (t) => `opacity: ${t * o}`
  tick: (t) => {} 
 };
}
</script>
```

1. 过渡`position: sticky`的元素时，内部元素的`margin`会影响动画开始和结束后的高度。  
    >具体表现为，在动画开始时，元素会偏移父元素`top`减去子元素`margin-top`的高度，因此需要设置`css`函数变量的`top`值为其差值。或不要在内部元素设置`margin-top`属性，改为在外部元素设置。

### Key blocks

Key块,即 `{#kye 表达式}{/key}`，使其内表达式发生变化时会销毁并重新创建其包含的元素。此功能可用于触发 `in`和 `out`动画。

### bind:this = `{var}`

将变量 `var`绑定到组件本身，随后可以通过 `var.foo()`的语法调用组件 `export`的函数。

### slot props

使子组件通过props向slot传递数据，随后父组件通过let:语句获取这些数据

```html
<script>
<!-- FancyList.svelte --> //子组件
<ul>
 {#each items as item}
  <li class="fancy">
   <slot prop = {item} /> //此处将item数据传递给每个slot的properties即prop
  </li>
 {/each}
</ul>

<!-- App.svelte --> //父组件
<FancyList 
  {items}
  let:prop = {thing} //父组件获取prop的值，并赋给thing。相当于倒装赋值写法。
>
 <div>{thing.text}</div>
</FancyList>
<script>
```

* 在副组件中，`<slot />`表示父组件插入的内容，如果子组件有多个匿名的 `<slot />`，就相当于把父组件的插槽内容复制多次
* 但显示多个相同的内容意义不大，于是有了通过props向父组件传递数据的功能，使每个重复的 `<slot />`传递的数据不一样，这样传递给父组件的数据也不一样，父组件再在插入子组件的内容中使用子组件传递过来的变量，便可以使每次重复的内容数据不一样了。

### setContext and getContext

用于存储对象、函数等任何东西，供组件之间直接交互，而无需导入props或分配事件

### \<script context="module"\>

标记了 `context="module"`属性的 `<script>`块使其内的代码在模块首次运行时执行，而非在组件初始化时执行。

这样不同的组件就可以通过这个代码内的变量、函数互相传递信息，但是其中的代码不是响应式的。

### 类切换

切换类需使用如下方法：

```html
<script>
  class:flipped={flipped}
  on:click={() => flipped = !flipped}
</script>
```

### 响应式

变量通过赋值语句自动实现响应式，但如果变量的值的变化依赖于其他变量的变化，则需在前面添加`$:`，使整个语句变成响应式语句。

如果发生变化的是对象的某个属性，不会触发响应式更新`dom`；

### 组件prop

若`prop`的值一直为`undefined`，`prop`的值似乎就不会传入到组件，从而导致页面无法更新。

同时在组件初始化时，若`prop`没有初始值，即初始值为`undefined`，而直接读取其某个属性，则会发生错误。

## SVELTEKIT

sveltekit完成一次任务需要经过如下三步

1. 路由 - 匹配请求的页面，基于文件系统路由
2. 加载 - 加载数据，约等于执行`+*.js`文件中的`load`函数
3. 渲染 - 服务端生成HTML或在浏览器中更新DOM

### 路由参数

可以设置方括号文件夹名如：`src/routes/blog/[slug]/`，此时 `[slug]`的值将为你访问的URL名的对应位置的字符串。

例如，你访问 `src/routes/blog/welcome`，此时 `[slug]`的值就是字符串 `welcome`。

可以在服务端即`*server.js`中，使用`params.slug`获取路由参数的值。

### 静态网页构建

预渲染构建静态网页时，kit会检查页面的各种链接是否指向未知的链接，如果有未知链接则会构建失败，参考文档[prerender!](https://kit.svelte.dev/docs/configuration#prerender)

可以通过设置忽略检查错误，具体构建步骤如下：

1. 安装静态设配器 `npm i -D @sveltejs/adapter-static`
2. 配置根目录的svelte.config.js文件:

   ```js
   import adapter from '@sveltejs/adapter-static';

   /** @type {import('@sveltejs/kit').Config} */
   const config = {
   kit: {
     // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
     // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
     // See https://kit.svelte.dev/docs/adapters for more information about adapters.
     adapter: adapter({
     pages: 'build',
     assets: 'build',
     fallback: false,
     precompress: false,
     strict: false
     }),
     prerender: {
     //忽略检查
     handleHttpError: 'ignore',
     handleMissingId: 'ignore'
     }
   }
   };

   export default config;
   ```

3. 配置src文件夹下的+layout.js文件

   ```js
   export const prerender = true;
   ```

4. 构建项目 `npm run build`

### load

在`+*.js`或`+*.server.js`文件中，可以使用导出一个`load`函数，该`load`函数的返回值可以被同级或子级路由页面`+*.svelte`中通过`let { data } = $props()`获取。

如果是在服务端运行，load获取的数据是实时的。如果是静态构建后只在客户端运行，那`load`获取的数据是构建时获取的。

### actions

* 可以在`+page.svelte.js`中导出`actions`函数用来处理`+page.svelte`中的`from`元素提交的表单。
* `actions`函数可以返回值，返回值可以在`+page.svelte`中用`form`接口来获取，`form`只在提交表单后填充值。

注意：`sveltekit`不能预渲染`actions`，否则会导致错误。

### enhance

`enhance`可以增强form表单的行为，类似于`sveltekit`对`<a>`元素的优化，防止页面刷新，变为更新页面。

同时还能触发一系列行为，比如：

* 更新`form`接口数据。
* 服务端成功返回时，清除原有数据使`load`函数重新运行。
* 受到重定向回复时导航到新页面。
* 渲染最近的错误页面。

因此，使用自定义`enhance`时如果仍需要上述功能，需要在返回的函数中调用`update`函数。

自定义`enhance`中返回的的函数会在服务端响应后运行。

### GET/POST/Others

可以在`+server.js`中导出`GET`,`POST`,`PUT`,`DELETE`等函数以实现webAPI。

可以同时使用路由参数实现响应不同的API请求。

### $app/stores

`sveltekit`内置的三个`stores`:

1. `page`拥有以下属性：
   * url - 当前页面的URL
   * params - 路由参数
   * route - 一个对象拥有一个`id`属性，表示相对根的路由
   * status - HTTP状态码
   * error - 当前页的错误对象
   * data - 当前页的数据，包含所有load函数的返回值
   * form - 服务端的form action的返回值

2. `navigating`表示当前导航，当导航开始时（如前进后退，点击链接），`navigating`才有值，导航结束后值被清除。
    拥有以下属性：
    * from & to - 两个都是拥有`prarms`,`route`,`url`属性的对象
    * type - 导航的类型，如`link`,`popstate`,`goto`（即`goto()`函数，用于跳转到指定页面）

3. `update`表示网页版本是否有更新。

### 错误

* 使用`error`方法抛出预期内的错误，可以附带信息，该错误不会触发`sveltekit`调用`handleError`
* `+error.sve;te`组件可以渲染错误页，会嵌入到`+layout.svelte`中
* 如果渲染error页和layout页都出错可以使用静态错误页，通过创建一个`src/error.html`文件

### event对象

`event`对象是`RequestEvent`的实例，它会被传入到`+server.js`文件的API路由函数、`+page.server.js`文件的表单处理函数、`+page.server.js`以及`+layout.server.js`文件的`load`函数中。

一般使用`{ PropertyName }`模式匹配获取部分属性方法，也可以直接获取整个对象。

包含有许多属性和方法如：`cookies`,`fetch`,`getClientAddress`,`isDataRequest`,`locals`,`param`,`request`,`route`,`setHeaders`,`url`

### Hooks

#### handle

在sveltekit服务器收到请求时运行。

函数如下，函数接受`event`对象，`resolve`函数。返回一个`Response`。

```js
  export async function handle({ event, resolve }) {
    return await resolve(event);
  }
```

#### locals

用来设置自定义数据，会随`event`对象传入到`+server.js`的`handler`和`load`函数中。

### prerender

sveltekit预渲染需要通过所有预渲染的界面中获取显式的链接，从而抓取预渲染页面。对于动态路由参数，需要有对应动态路由的链接，才能预渲染。

需要有类似`<a></a>`这样的链接出现在某些可预渲染的页面上，才能预渲染动态路由页面。使用其他组件生成的链接无法被爬取。

#### entries

若所有可预渲染的页面都没有动态路由的链接。可以通过指定`entries`参数来帮助`sveltekit`发现页面。

参考：[prerender](https://svelte.dev/docs/kit/page-options#prerender)
