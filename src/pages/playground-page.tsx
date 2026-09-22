import { useRef, useState } from "react";
import PageHeader from "@/components/custom/page-header";
import FlipChars, {
  type FlipAxis,
  type FlipCharsHandle,
} from "@/components/custom/flip-chars";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** 预设句子：之间只差个别字符，方便看清 diff 只翻有差异的那几个 */
const PRESETS = ["Character Flip", "Character Flow", "Characters Flip!"];

/** 原地翻转演示：改文字 / 连续删除 / 换翻转轴 */
function FlipDemo() {
  const chars = useRef<FlipCharsHandle>(null);
  const [text, setText] = useState(PRESETS[0]);
  const [axis, setAxis] = useState<FlipAxis>("x");

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="输入任意文字"
          className="h-8 w-56 rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setText((value) => PRESETS[(PRESETS.indexOf(value) + 1) % PRESETS.length])
          }
        >
          换一句
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => chars.current?.enter()}
        >
          重播翻入
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void chars.current?.remove(1)}
        >
          末尾删 1 个
        </Button>
        <span className="text-xs text-muted-foreground">
          在中间连续打字 / 退格看看
        </span>
      </div>

      <FlipChars
        ref={chars}
        text={text}
        as="p"
        flip={axis}
        stagger={0.05}
        simultaneous
        className="m-0 min-h-9 text-2xl leading-tight font-medium tracking-tight sm:text-3xl"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">flip=</span>
        {(["x", "y"] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={axis === item ? "default" : "outline"}
            onClick={() => setAxis(item)}
          >
            {item === "x" ? "上下翻转" : "左右翻转"}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground">
          新增先让位再翻入；删除先翻出、停下输入后再补位
        </span>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Playground"
        description="组件试验场，新的效果先在这里跑一跑。"
      />

      <Card>
        <CardHeader>
          <CardTitle>FlipChars</CardTitle>
          <CardDescription>
            文本变化时做字符级 diff：有差异的字符原地翻转切换，删掉的字符原位翻出后摘掉；
            新增时后续字符先让位、再翻入，删除时先翻出、等这一轮编辑结束再补位，
            避免移位和翻转叠在同一时段造成字符重叠。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlipDemo />
        </CardContent>
      </Card>
    </div>
  );
}
