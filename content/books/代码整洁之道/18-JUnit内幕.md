# 第15章 JUnit内幕

JUnit是最有名的Java 框架之一。就像别的框架一样，它概念简单，定义精确，实现优雅。但它的代码是怎样的呢？本章将研判来自JUnit框架的一个代码例子。

## 15.1 JUnit框架

JUnit有很多位作者，但它始于Kent Beck和Eric Gamma一次去亚特兰大的飞行旅程。Kent想学Java，而Eric则打算学习Kent的Smalltalk测试框架。“对于两个身处狭窄空间的奇客，还有什么会比拿出笔记本电脑开始编码来得更自然呢？[^120]”经过3小时高海拔工作，他们写出了JUnit的基础代码。

我们要查看的模块，是用来帮忙鉴别字符串比较错误的一段聪明代码。该模块被命名为ComparisonCompactor。对于两个不同的字符串，例如 ABCDE和ABXDE，它将用形如<…B[X]D…>的字符串来曝露两者的不同之处。

我可以做进一步解释，但测试用例会更有说服力。看看代码清单15-1，你将深入了解到该模块满足的需求。边看代码，边研究该测试的结构。它们能变得更简洁或更明确吗？

**代码清单15-1 ComparisonCompactorTest.java**

```java
package junit.tests.framework;
import junit.framework.ComparisonCompactor;
import junit.framework.TestCase;
public class ComparisonCompactorTest extends TestCase {
    public void testMessage() {
        String failure= new ComparisonCompactor(0, "b", "c").compact("a");
        assertTrue("a expected:<[b]> but was:<[c]>".equals(failure));
    }
    public void testStartSame() {
        String failure= new ComparisonCompactor(1, "ba", "bc").compact(null);
        assertEquals("expected:<b[a]> but was:<b[c]>", failure);
    }
    public void testEndSame() {
        String failure= new ComparisonCompactor(1, "ab", "cb").compact(null);
        assertEquals("expected:<[a]b> but was:<[c]b>", failure);
    }
    public void testSame() {
        String failure= new ComparisonCompactor(1, "ab", "ab").compact(null);
        assertEquals("expected:<ab> but was:<ab>", failure);
    }
    public void testNoContextStartAndEndSame() {
        String failure= new ComparisonCompactor(0, "abc", "adc").compact(null);
    assertEquals("expected:<...[b]...> but was:<...[d]...>", failure);
}
public void testStartAndEndContext() {
    String failure= new ComparisonCompactor(1, "abc", "adc").compact(null);
    assertEquals("expected:<a[b]c> but was:<a[d]c>", failure);
}
public void testStartAndEndContextWithEllipses() {
    String failure=
        new ComparisonCompactor(1, "abcde", "abfde").compact(null);
    assertEquals("expected:<...b[c]d...> but was:<...b[f]d...>", failure);
}
public void testComparisonErrorStartSameComplete() {
    String failure= new ComparisonCompactor(2, "ab", "abc").compact(null);
    assertEquals("expected:<ab[]> but was:<ab[c]>", failure);
}
public void testComparisonErrorEndSameComplete() {
    String failure= new ComparisonCompactor(0, "bc", "abc").compact(null);
    assertEquals("expected:<[]...> but was:<[a]...>", failure);
}
public void testComparisonErrorEndSameCompleteContext() {
    String failure= new ComparisonCompactor(2, "bc", "abc").compact(null);
    assertEquals("expected:<[]bc> but was:<[a]bc>", failure);
}
public void testComparisonErrorOverlapingMatches() {
    String failure= new ComparisonCompactor(0, "abc", "abbc").compact(null);
    assertEquals("expected:<...[]...> but was:<...[b]...>", failure);
}
public void testComparisonErrorOverlapingMatchesContext() {
    String failure= new ComparisonCompactor(2, "abc", "abbc").compact(null);
    assertEquals("expected:<ab[]c> but was:<ab[b]c>", failure);
}
public void testComparisonErrorOverlapingMatches2() {
    String failure= new ComparisonCompactor(0, "abcdde",
    "abcde").compact(null);
    assertEquals("expected:<...[d]...> but was:<...[]...>", failure);
}
public void testComparisonErrorOverlapingMatches2Context() {
    String failure=
        new ComparisonCompactor(2, "abcdde", "abcde").compact(null);
    assertEquals("expected:<...cd[d]e> but was:<...cd[]e>", failure);
}
public void testComparisonErrorWithActualNull() {
    String failure= new ComparisonCompactor(0, "a", null).compact(null);
    assertEquals("expected:<a> but was:<null>", failure);
    }
    public void testComparisonErrorWithActualNullContext() {
        String failure= new ComparisonCompactor(2, "a", null).compact(null);
        assertEquals("expected:<a> but was:<null>", failure);
    }
    public void testComparisonErrorWithExpectedNull() {
        String failure= new ComparisonCompactor(0, null, "a").compact(null);
        assertEquals("expected:<null> but was:<a>", failure);
    }
    public void testComparisonErrorWithExpectedNullContext() {
        String failure= new ComparisonCompactor(2, null, "a").compact(null);
        assertEquals("expected:<null> but was:<a>", failure);
    }
    public void testBug609972() {
        String failure= new ComparisonCompactor(10, "S&P500", "0").compact(null);
        assertEquals("expected:<[S&P50]0> but was:<[]0>", failure);
    }
}
```

我对用到这些测试的ComparisonCompactor进行了代码覆盖分析。代码被100%覆盖了。每行代码、每个if语句和for循环都被测试执行了。于是我对代码的工作能力有了极高的信心，也对代码作者们的技艺产生了极高的尊敬。

ComparisonCompactor的代码如代码清单15-2所示。

**代码清单15-2 ComparisonCompactor.java（原始版本）**

```java
package junit.framework;
public class ComparisonCompactor {
    private static final String ELLIPSIS = "...";
    private static final String DELTA_END = "]";
    private static final String DELTA_START = "[";
    private int fContextLength;
    private String fExpected;
    private String fActual;
    private int fPrefix;
    private int fSuffix;
    public ComparisonCompactor(int contextLength,
                                                    String expected,
                                                        String actual) {
    fContextLength = contextLength;
    fExpected = expected;
    fActual = actual;
    }
    public String compact(String message) {
        if (fExpected == null || fActual == null || areStringsEqual())
        return Assert.format(message, fExpected, fActual);
    findCommonPrefix();
    findCommonSuffix();
    String expected = compactString(fExpected);
    String actual = compactString(fActual);
    return Assert.format(message, expected, actual);
}
private String compactString(String source) {
    String result = DELTA_START +
                                source.substring(fPrefix, source.length() -
                                    fSuffix + 1) + DELTA_END;
    if (fPrefix > 0)
        result = computeCommonPrefix() + result;
    if (fSuffix > 0)
        result = result + computeCommonSuffix();
    return result;
}
private void findCommonPrefix() {
    fPrefix = 0;
    int end = Math.min(fExpected.length(), fActual.length());
    for (; fPrefix < end; fPrefix++) {
        if (fExpected.charAt(fPrefix) != fActual.charAt(fPrefix))
            break;
    }
}
private void findCommonSuffix() {
    int expectedSuffix = fExpected.length() - 1;
    int actualSuffix = fActual.length() - 1;
    for (;
        actualSuffix >= fPrefix && expectedSuffix >= fPrefix;
            actualSuffix--, expectedSuffix--) {
        if (fExpected.charAt(expectedSuffix) != fActual.charAt(actualSuffix))
            break;
    }
    fSuffix = fExpected.length() - expectedSuffix;
}
private String computeCommonPrefix() {
    return (fPrefix > fContextLength ? ELLIPSIS : "") +
                fExpected.substring(Math.max(0, fPrefix - fContextLength),
                                                                                fPrefix);
}
private String computeCommonSuffix() {
    int end = Math.min(fExpected.length() - fSuffix + 1 + fContextLength,
                                        fExpected.length());
    return fExpected.substring(fExpected.length() - fSuffix + 1, end) +
            (fExpected.length() - fSuffix + 1 < fExpected.length() -
                    fContextLength ? ELLIPSIS : "");
}
    private boolean areStringsEqual() {
        return fExpected.equals(fActual);
    }
}
```

你可能会对这个模块有所抱怨。里面有些长表达式，有些奇怪的+1操作，如此等等。不过，总的来说，这个模块很不错。毕竟它原本可能被写成如代码清单15-3中的样子。

**代码清单15-3 ComparisonCompator.java（背离版本）**

```java
package junit.framework;
public class ComparisonCompactor {
    private int ctxt;
    private String s1;
    private String s2;
    private int pfx;
    private int sfx;
    public ComparisonCompactor(int ctxt, String s1, String s2) {
        this.ctxt = ctxt;
        this.s1 = s1;
        this.s2 = s2;
    }
    public String compact(String msg) {
        if (s1 == null || s2 == null || s1.equals(s2))
            return Assert.format(msg, s1, s2);
        pfx = 0;
        for (; pfx < Math.min(s1.length(), s2.length()); pfx++) {
            if (s1.charAt(pfx) != s2.charAt(pfx))
                break;
        }
        int sfx1 = s1.length() - 1;
        int sfx2 = s2.length() - 1;
        for (; sfx2 >= pfx && sfx1 >= pfx; sfx2--, sfx1--) {
            if (s1.charAt(sfx1) != s2.charAt(sfx2))
                break;
        }
        sfx = s1.length() - sfx1;
        String cmp1 = compactString(s1);
        String cmp2 = compactString(s2);
        return Assert.format(msg, cmp1, cmp2);
    }
    private String compactString(String s) {
        String result =
            "[" + s.substring(pfx, s.length() - sfx + 1) + "]";
        if (pfx > 0)
            result = (pfx > ctxt ? "..." : "") +
            s1.substring(Math.max(0, pfx - ctxt), pfx) + result;
        if (sfx > 0) {
            int end = Math.min(s1.length() - sfx + 1 + ctxt, s1.length());
            result = result + (s1.substring(s1.length() - sfx + 1, end) +
                    (s1.length() - sfx + 1 < s1.length() - ctxt ? "..." : ""));
        }
        return result;
    }
}
```

即便作者们把这个模块写得已经很棒，但童子军军规[^121]却告诉我们，离时要比来时整洁。所以，我们怎样才能改进代码清单15-2中的原始代码呢？

我首先看到的是成员变量的f 前缀[N6]。在现今的运行环境中，这类范围性编码纯属多余。所以，先删除所有的f前缀。

```java
private int contextLength;
private String expected;
private String actual;
private int prefix;
private int suffix;
```

下一步，在compact函数开始处，有一个未封装的条件判断[G28]。

```java
public String compact(String message) {
    if (expected == null || actual == null || areStringsEqual())
        return Assert.format(message, expected, actual);
    findCommonPrefix();
    findCommonSuffix();
    String expected = compactString(this.expected);
    String actual = compactString(this.actual);
    return Assert.format(message, expected, actual);
}
```

这个条件判断应当封装起来，从而更清晰地表达代码的意图。我们拆解出一个方法，解释这个条件判断。

```java
public String compact(String message) {
    if (shouldNotCompact())
        return Assert.format(message, expected, actual);
    findCommonPrefix();
    findCommonSuffix();
    String expected = compactString(this.expected);
    String actual = compactString(this.actual);
    return Assert.format(message, expected, actual);
}
private boolean shouldNotCompact() {
    return expected == null || actual == null || areStringsEqual();
}
```

我也不太喜欢compact函数中的this.expected和this.actual符号。这个是我们把fExpected改为expected时发生的。为什么函数中的变量会与成员变量同名呢？它们不是该表示其他意思吗[N4]？我们应该区分这些名称。

```java
String compactExpected = compactString(expected);
String compactActual = compactString(actual);
```

否定式稍微比肯定式难理解一些[G29]。我们把if语句放到上头，调转条件判断。

```java
public String compact(String message) {
    if (canBeCompacted()) {
        findCommonPrefix();
        findCommonSuffix();
        String compactExpected = compactString(expected);
        String compactActual = compactString(actual);
        return Assert.format(message, compactExpected, compactActual);
    } else {
        return Assert.format(message, expected, actual);
    }
}
private boolean canBeCompacted() {
    return expected != null && actual != null && !areStringsEqual();
}
```

函数名很奇怪[N7]。尽管它的确会压缩字符串，但如果 canBeCompact 为false，它实际上就不会压缩字符串。用compact来命名，隐藏了错误检查的副作用。注意，该函数返回一条格式化后的消息，而不仅仅只是压缩后的字符串。所以，函数名其实应该是formatCompacted Comparison。在用以下参数调用时，读起来会好很多：

```java
public String formatCompactedComparison(String message) {
```

两个字符串是在if语句体中压缩的。我们应当拆分出一个名为compactExpectedAndActual的方法。然而，我们希望formatCompactComparison函数完成所有的格式化工作。而compact…函数除了压缩之外什么都不做[G30]。所以，做如下拆分：

...

```java
private String compactExpected;
private String compactActual;
```

...

```java
    public String formatCompactedComparison(String message) {
        if (canBeCompacted()) {
            compactExpectedAndActual();
            return Assert.format(message, compactExpected, compactActual);
        } else {
            return Assert.format(message, expected, actual);
        }
    }
    private void compactExpectedAndActual() {
        findCommonPrefix();
    findCommonSuffix();
    compactExpected = compactString(expected);
    compactActual = compactString(actual);
}
```

注意，这要求我们向成员变量举荐compactExpected和compactActual。我不喜欢新函数最后两行返回变量的方式，但前两个可不是这样。它们没采用一以贯之的约定[G11]。我们应该修改findCommonPrefix和findCommonSuffix，返回前缀和后缀值。

```java
private void compactExpectedAndActual() {
    prefixIndex = findCommonPrefix();
    suffixIndex = findCommonSuffix();
    compactExpected = compactString(expected);
    compactActual = compactString(actual);
}
private int findCommonPrefix() {
    int prefixIndex = 0;
    int end = Math.min(expected.length(), actual.length());
    for (; prefixIndex < end; prefixIndex++) {
        if (expected.charAt(prefixIndex) != actual.charAt(prefixIndex))
            break;
    return prefixIndex;
    }
}
private int findCommonSuffix() {
    int expectedSuffix = expected.length() - 1;
    int actualSuffix = actual.length() - 1;
    for (; actualSuffix >= prefixIndex && expectedSuffix >= prefixIndex;
                actualSuffix--, expectedSuffix--) {
        if (expected.charAt(expectedSuffix) != actual.charAt(actualSuffix))
            break;
    return expected.length() - expectedSuffix;
    }
}
```

我们还应该修改成员变量的名称，使之更准确一点[N1]；毕竟它们都是索引。

仔细检查 findCommonSuffix，其中藏了个时序性耦合[G31]；它依赖于 prefixIndex是由findCommonSuffix计算得来的事实。如果这两个方法不是按这样的顺序调用，调试就会变得困难。为了暴露这个时序性耦合，我们将prefixIndex做成find的参数。

```java
private void compactExpectedAndActual() {
    prefixIndex = findCommonPrefix();
    suffixIndex = findCommonSuffix(prefixIndex);
    compactExpected = compactString(expected);
    compactActual = compactString(actual);
}
private int findCommonSuffix(int prefixIndex) {
    int expectedSuffix = expected.length() - 1;
    int actualSuffix = actual.length() - 1;
    for (; actualSuffix >= prefixIndex && expectedSuffix >= prefixIndex;
            actualSuffix--, expectedSuffix--) {
    if (expected.charAt(expectedSuffix) != actual.charAt(actualSuffix))
        break;
    }
    return expected.length() - expectedSuffix;
}
```

我对这样的方式不太满意。传递 prefixIndex 参数有些随意[G32]。它成功维持了执行次序，但对于解释排序的需要却毫无作用。其他程序员可能会抹杀我们刚完成的工作，因为并没有迹象说明该参数确属必要。还是采取别的做法吧。

```java
private void compactExpectedAndActual() {
    findCommonPrefixAndSuffix();
    compactExpected = compactString(expected);
    compactActual = compactString(actual);
}
private void findCommonPrefixAndSuffix() {
    findCommonPrefix();
    int expectedSuffix = expected.length() - 1;
    int actualSuffix = actual.length() - 1;
    for (;
                actualSuffix >= prefixIndex && expectedSuffix >= prefixIndex;
                actualSuffix--, expectedSuffix--
    ) {
        if (expected.charAt(expectedSuffix) != actual.charAt(actualSuffix))
            break;
    }
    suffixIndex = expected.length() - expectedSuffix;
}
private void findCommonPrefix() {
    prefixIndex = 0;
    int end = Math.min(expected.length(), actual.length());
    for (; prefixIndex < end; prefixIndex++)
        if (expected.charAt(prefixIndex) != actual.charAt(prefixIndex))
            break;
}
```

我们恢复findCommonPreffix和findCommonSuffix的原样，把findCommonSuffix的名称改为findCommonPrefixAndSuffix，让它在执行其他操作之前，先调用findCommonPrefix。这样一来，就以一种相比前种手段更为有效的方式建立了两个函数之间的时序关系。

```java
private void findCommonPrefixAndSuffix() {
    findCommonPrefix();
    int suffixLength = 1;
    for (; !suffixOverlapsPrefix(suffixLength); suffixLength++) {
        if (charFromEnd(expected, suffixLength) !=
                    charFromEnd(actual, suffixLength))
            break;
    }
    suffixIndex = suffixLength;
}
private char charFromEnd(String s, int i) {
    return s.charAt(s.length()-i);
}
private boolean suffixOverlapsPrefix(int suffixLength) {
    return actual.length() - suffixLength < prefixLength ||
        expected.length() - suffixLength < prefixLength;
}
```

这样就好多了。它暴露出suffixIndex其实是后缀的长度，而且名字没取好。对于 prefix也是如此。虽然在那样一种情形下index和length是同义的，但使用length一词却更有一贯性。问题在于，suffixIndex变量并不从0开始，它从1开始，所以并非真正的长度。这也是computeCommonSuffix中那些+1存在的原因[G33]。来修正它们吧。结果就是代码清单15-4。

**代码清单15-4 ComparisonCompactor.java（过渡版本）**

```java
public class ComparisonCompactor {
```

...

```java
private int suffixLength;
```

...

```java
private void findCommonPrefixAndSuffix() {
    findCommonPrefix();
    suffixLength = 0;
    for (; !suffixOverlapsPrefix(suffixLength); suffixLength++) {
        if (charFromEnd(expected, suffixLength) !=
            charFromEnd(actual, suffixLength))
        break;
    }
}
private char charFromEnd(String s, int i) {
    return s.charAt(s.length() - i - 1);
}
private boolean suffixOverlapsPrefix(int suffixLength) {
    return actual.length() - suffixLength <= prefixLength ||
        expected.length() - suffixLength <= prefixLength;
}
```

...

```java
private String compactString(String source) {
    String result =
```

DELTA_START +

```java
        source.substring(prefixLength, source.length() - suffixLength) +
        DELTA_END;
    if (prefixLength > 0)
        result = computeCommonPrefix() + result;
    if (suffixLength > 0)
        result = result + computeCommonSuffix();
    return result;
}
```

...

```java
private String computeCommonSuffix() {
    int end = Math.min(expected.length() - suffixLength +
        contextLength, expected.length()
    );
    return
    expected.substring(expected.length() - suffixLength, end) +
    (expected.length() - suffixLength <
```

expected.length() - contextLength ?

```java
        ELLIPSIS : "");
}
```

我们用charFromEnd中的那个-1替代了computeCommonSuffix中的一堆+1，前者更为合情合理，suffixOverlapsPrefix中的两个“<=”操作符也同理。这样我们就能修改 suffixIndex和suffixLength的名称，极大地提升了代码的可读性。

不过还有一个问题。在消灭那些+1时，我注意到compactString中的以下代码：

```java
if (suffixLength > 0)
```

看看代码清单15-4中的这行代码。因为suffixLength现在要比原本少1，我应该把“>”操作符改为“>=”操作符。那本无道理，不过现在却有意义！这表示这么做没道理，而且可能是个缺陷。嗯，也不算是个缺陷。从之前的分析中我们可以看到，if 语句现在会放置添加长度为零的后缀。在作出修改之前，if语句没有作用，因为suffixIndex永不会小于1。

这说明compactString中的两个if语句都有问题！看起来它们都该删除。所以，我们将其注释掉，运行测试。测试通过了！那就重新构架compactString，删除没用的if语句，将函数改得更加简洁[G9]。

```java
private String compactString(String source) {
    return
        computeCommonPrefix() +
```

DELTA_START +

source.substring(prefixLength, source.length() - suffixLength) +

DELTA_END +

```java
        computeCommonSuffix();
}
```

这样就好多了！现在我们看到，compactString函数只是把片段组合起来。我们甚至可以让它更清晰。有许多细微的整理工作可做。与其拖着你遍历剩下的那些修改，我更愿意直接展示代码清单15-5中的结果。

**代码清单15-5 ComparisonCompactor.java（最终版）**

```java
package junit.framework;
public class ComparisonCompactor {
    private static final String ELLIPSIS = "...";
    private static final String DELTA_END = "]";
    private static final String DELTA_START = "[";
private int contextLength;
private String expected;
private String actual;
private int prefixLength;
private int suffixLength;
public ComparisonCompactor(
        int contextLength, String expected, String actual
) {
    this.contextLength = contextLength;
    this.expected = expected;
    this.actual = actual;
}
public String formatCompactedComparison(String message) {
    String compactExpected = expected;
    String compactActual = actual;
    if (shouldBeCompacted()) {
        findCommonPrefixAndSuffix();
        compactExpected = compact(expected);
        compactActual = compact(actual);
    }
    return Assert.format(message, compactExpected, compactActual);
}
private boolean shouldBeCompacted() {
    return !shouldNotBeCompacted();
}
private boolean shouldNotBeCompacted() {
    return expected == null ||
```

actual == null ||

```java
                expected.equals(actual);
}
private void findCommonPrefixAndSuffix() {
    findCommonPrefix();
    suffixLength = 0;
    for (; !suffixOverlapsPrefix(); suffixLength++) {
        if (charFromEnd(expected, suffixLength) !=
            charFromEnd(actual, suffixLength)
        )
            break;
    }
}
private char charFromEnd(String s, int i) {
    return s.charAt(s.length() - i - 1);
}
private boolean suffixOverlapsPrefix() {
    return actual.length() - suffixLength <= prefixLength ||
    expected.length() - suffixLength <= prefixLength;
    }
    private void findCommonPrefix() {
        prefixLength = 0;
        int end = Math.min(expected.length(), actual.length());
        for (; prefixLength < end; prefixLength++)
            if (expected.charAt(prefixLength) != actual.charAt (prefixLength))
                break;
    }
    private String compact(String s) {
        return new StringBuilder()
        .append(startingEllipsis())
        .append(startingContext())
        .append(DELTA_START)
        .append(delta(s))
        .append(DELTA_END)
        .append(endingContext())
        .append(endingEllipsis())
        .toString();
    }
    private String startingEllipsis() {
        return prefixLength > contextLength ? ELLIPSIS : "";
    }
    private String startingContext() {
        int contextStart = Math.max(0, prefixLength - contextLength);
        int contextEnd = prefixLength;
        return expected.substring(contextStart, contextEnd);
    }
    private String delta(String s) {
        int deltaStart = prefixLength;
        int deltaEnd = s.length() - suffixLength;
        return s.substring(deltaStart, deltaEnd);
    }
    private String endingContext() {
        int contextStart = expected.length() - suffixLength;
        int contextEnd =
            Math.min(contextStart + contextLength, expected.length());
        return expected.substring(contextStart, contextEnd);
    }
    private String endingEllipsis() {
        return (suffixLength > contextLength ? ELLIPSIS : "");
    }
}
```

这的确很漂亮。模块分解成了一组分析函数和一组合成函数。它们以一种拓扑方式排序，每个函数的定义都正好在其被调用的位置后面。所有的分析函数都先出现，而所有的合成函数都最后出现。

仔细阅读，你会发现我推翻了在本章较前位置做出的几个决定。例如，我将几个分解出来的方法重新内联为formatCompactComparison，我修改了souldNotBeCompacted表达式的意思。这种做法很常见。重构常会导致另一次推翻此次重构的重构。重构是一种不停试错的迭代过程，不可避免地集中于我们认为是专业人员该做的事。

## 15.2 小结

如此我们遵循了童子军军规。模块比我们发现它时更整洁了。不是说它原本不整洁。作者们做了卓越的工作。但模块都能再改进，我们每个人也有责任把模块改进得比发现时更整洁。

---

[^120]: 原注：JUnit Pocket Guide，Kent Beck，O’Reilly，2004，P.43。
[^121]: 原注：见前文有关章节。
