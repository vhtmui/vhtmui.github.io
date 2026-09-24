import { useEffect, useMemo, useRef, useState } from "react";
import ClipboardJS from "clipboard";
import { Check, Copy } from "lucide-react";
import FlipChars from "@/components/custom/flip-chars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** 复制成功后对勾停留时长（ms） */
const COPY_DELAY = 750;

/** 支持的书写格式：每段位数 + 段间分隔符 */
const MAC_FORMATS = [
  { name: "Hyphen-Hex", nums: 2, symbol: "-" },
  { name: "Colon-Hex", nums: 2, symbol: ":" },
  { name: "CiscoLike-Hyphen-Hex", nums: 4, symbol: "-" },
  { name: "CiscoLike-Colon-Hex", nums: 4, symbol: ":" },
];

/** 一个 MAC 地址的十六进制位数 */
const MAC_DIGITS = 12;

/** 剥掉非十六进制字符、统一大写，最多保留 12 位 */
function cleanMac(value: string) {
  return value
    .replace(/[^A-Fa-f0-9]/g, "")
    .slice(0, MAC_DIGITS)
    .toUpperCase();
}

/** 把连续十六进制按 eachCounts 分组，组间插入 separator */
function formatMac(mac: string, eachCounts: number, separator: string) {
  let output = "";

  for (let i = 0; i < mac.length; i += 1) {
    output += mac[i];
    if (i % eachCounts === eachCounts - 1 && i !== mac.length - 1) {
      output += separator;
    }
  }

  return output;
}

export default function MacConverterPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const [raw, setRaw] = useState("");
  const [copiedText, setCopiedText] = useState("");

  const mac = cleanMac(raw);
  const expanded = mac.length > 0;

  const rows = useMemo(
    () =>
      MAC_FORMATS.map((format) => ({
        name: format.name,
        text: formatMac(mac, format.nums, format.symbol),
      })),
    [mac],
  );

  // Ctrl+K 聚焦并全选输入框
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || event.key.toLowerCase() !== "k") return;

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clipboard.js 在 document 上统一委托 click：按钮带 data-copy-text 即可复制，旧浏览器走它的降级实现
  useEffect(() => {
    const clipboard = new ClipboardJS("[data-copy-text]", {
      text: (trigger) => trigger.getAttribute("data-copy-text") ?? "",
    });

    clipboard.on("success", (event) => {
      if (copiedTimerRef.current !== null)
        window.clearTimeout(copiedTimerRef.current);

      setCopiedText(event.text);
      copiedTimerRef.current = window.setTimeout(() => {
        copiedTimerRef.current = null;
        setCopiedText("");
      }, COPY_DELAY);
    });

    clipboard.on("error", (event) => {
      console.error("Failed to copy text: ", event.text);
    });

    return () => {
      clipboard.destroy();
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-70 items-center gap-2">
        <Input
          ref={inputRef}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Ctrl+K"
          className=""
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          valid: {mac.length}
        </span>
      </div>

      {/* 无有效输入时整块折叠收起；有值时展开 */}
      <div
        inert={!expanded}
        className={cn(
          "w-full max-w-64 overflow-hidden transition-all duration-300 ease-out",
          expanded ? "max-h-72 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="flex flex-col gap-2 px-1 py-1">
          {rows.map((row, index) => {
            const copied = copiedText !== "" && copiedText === row.text;

            return (
              <li key={row.name} className="flex flex-col gap-2">
                <div className="flex min-h-8 items-center gap-2">
                  <FlipChars
                    text={row.text}
                    stagger={0}
                    className="mr-auto font-mono text-sm"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    data-copy-text={row.text}
                    aria-label={copied ? "已复制" : "复制"}
                    disabled={copied || row.text.length === 0}
                  >
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </div>
                {index < rows.length - 1 ? <Separator /> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
