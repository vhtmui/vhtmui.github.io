import {
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ComponentType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/* ---------------------------------- 类型 ---------------------------------- */

/** 翻转轴：x = 上下翻转，y = 左右翻转 */
export type FlipAxis = "x" | "y";

/** 可作为外壳的标签 */
export type FlipCharsTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div";

export interface FlipCharsHandle {
  /** 全部字符翻入（重播）；chars 省略时表示当前在场的全部字符 */
  enter: (chars?: HTMLElement[]) => void;
  /** 字符原地翻出后再从 DOM 删除：count 省略或 ≤0 表示删光，否则从末尾删 count 个 */
  remove: (count?: number) => Promise<HTMLElement[]>;
  /** 不播放动画，直接删除：count 省略或 ≤0 表示删光，否则从末尾删 count 个 */
  clear: (count?: number) => HTMLElement[];
  /** 当前仍在场的字符（不含正在离场的） */
  getChars: () => HTMLElement[];
}

export interface FlipCharsProps {
  /** 文本内容：变化时做字符级 diff，只让有差异的字符原地翻转切换 */
  text: string;
  /** 样式外壳：传一个元素则原样接管（其内容会被忽略），否则用 as 指定的标签 */
  children?: ReactNode;
  /** 未给单个元素外壳时使用的标签，默认 span */
  as?: FlipCharsTag;
  /** 翻转轴，默认 "x"（上下翻转） */
  flip?: FlipAxis;
  /** 单个字符翻转的时长（秒） */
  flipDuration?: number;
  /**
   * 布局被牵动时（新增占位、换字换宽）未变字符让位的时长（秒），默认 0.18。
   * 让位要比翻转快，配合"先让位再翻入"，重合的时段几乎为零；传 0 表示瞬间到位（不做滑移）。
   */
  shiftDuration?: number;
  /**
   * 离场字符摘除后，后面字符滑过去补位的时长（秒），默认 0.6。
   * 此时离场字符已经翻到看不见，所以可以放慢，让"合拢"看起来更从容。
   */
  collapseDuration?: number;
  /** 翻转的透视距离（px），越小越夸张 */
  perspective?: number;
  /** 字符之间的错峰（秒） */
  stagger?: number;
  /** 全部字符同时播放动画（忽略 stagger），默认 false */
  simultaneous?: boolean;
  /** 翻入的起始延迟（秒） */
  delay?: number;
  /** 挂载后自动翻入，默认 true */
  autoPlay?: boolean;
  /** 单个元素外壳时合并进该元素自身（DOM 元素），否则用在兜底包裹的标签上 */
  className?: string;
  /** 翻入播放完成回调 */
  onEnterComplete?: () => void;
  /** 字符被删除后回调（removed 为本次删除的字符，remaining 为剩余字符数） */
  onRemove?: (removed: HTMLElement[], remaining: number) => void;
  ref?: Ref<FlipCharsHandle>;
}

/* ---------------------------------- 常量 ---------------------------------- */

/** 字符槽位类名 */
const CHARS_CLASS = "flip-chars-char";
/** 单词包裹类名：inline-block，避免在单词中间断行 */
const WORDS_CLASS = "flip-chars-word";

/** 翻到 ±90° 时字符正好看不见，换字 / 换向都发生在这一刻 */
const FLIP_HIDDEN = 90;

/* ---------------------------------- 翻转 ---------------------------------- */

interface FlipAnim {
  axis: "rotateX" | "rotateY";
  duration: number;
  easeIn: string;
  easeOut: string;
  perspective: number;
}

/**
 * 注意：翻转（rotateX/rotateY）和位移滑移（x/y）共用同一个 transform，
 * GSAP 内部把它当作一个属性，所以这里**不能**用 overwrite / killTweensOf 去"抢"，
 * 否则会把同时进行的滑移补间一起杀掉，字符会永久停在旧的排版位置上。
 * 两个动画族各写各的分量、各自收敛（旋转到 0，位移到 0），互不打断。
 */

/** 翻入：从看不见的一侧转回 0 */
function flipIn(el: HTMLElement, anim: FlipAnim) {
  return gsap.fromTo(
    el,
    { [anim.axis]: FLIP_HIDDEN, transformPerspective: anim.perspective },
    {
      [anim.axis]: 0,
      duration: anim.duration,
      ease: anim.easeOut,
    },
  );
}

/** 翻出：从 0 转到看不见的一侧 */
function flipOut(el: HTMLElement, anim: FlipAnim, onComplete?: () => void) {
  return gsap.to(el, {
    [anim.axis]: -FLIP_HIDDEN,
    transformPerspective: anim.perspective,
    duration: anim.duration,
    ease: anim.easeIn,
    onComplete,
  });
}

/**
 * 原地换字：翻出旧字 → 在看不见的一瞬换内容并换向 → 翻入新字。
 * 换内容会改宽度、牵动后面的字符，所以这一步交给 swap 包一层（通常配 FLIP 滑移）。
 */
function flipSwap(
  el: HTMLElement,
  next: string,
  anim: FlipAnim,
  swap: (mutate: () => void) => void,
) {
  const half = anim.duration / 2;
  const tl = gsap.timeline();
  tl.to(
    el,
    {
      [anim.axis]: -FLIP_HIDDEN,
      transformPerspective: anim.perspective,
      duration: half,
      ease: anim.easeIn,
    },
    0,
  );
  tl.call(
    () =>
      swap(() => {
        el.textContent = next;
      }),
    undefined,
    half,
  );
  // immediateRender: false —— 让它在半个时长处才生效（此刻正好看不见）
  tl.fromTo(
    el,
    { [anim.axis]: FLIP_HIDDEN, transformPerspective: anim.perspective },
    {
      [anim.axis]: 0,
      duration: half,
      ease: anim.easeOut,
      immediateRender: false,
    },
    half,
  );
  return tl;
}

/* --------------------------------- 字符 diff -------------------------------- */

/** 一次槽位操作：keep / replace 复用旧槽位，insert 新建槽位，delete 让旧槽位留在原处翻出 */
type CharOp =
  | { type: "keep"; char: string; el: HTMLElement }
  | { type: "replace"; char: string; el: HTMLElement }
  | { type: "insert"; char: string }
  | { type: "delete"; el: HTMLElement };

const isBlank = (ch: string) => /\s/.test(ch);

/** 中段 LCS 对齐；区间过长时放弃对齐，退化为按位配对 */
function alignMiddle(prev: string[], next: string[]) {
  const n = prev.length;
  const m = next.length;
  const pairs: { prev: number; next: number }[] = [];
  if (!n || !m || n * m > 40000) return pairs;

  const width = m + 1;
  const dp = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        prev[i] === next[j]
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (prev[i] === next[j]) {
      pairs.push({ prev: i, next: j });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

/**
 * 字符级 diff：先削公共前后缀，中段用 LCS 对齐，区段内按位配对成 replace，
 * 多出来的旧字符算删除、新字符算插入。删除项也按次序交错在结果里，
 * 这样它能留在原来的位置上翻出（不会和挤过来的字符叠在一起）。
 */
function diffChars(prevChars: string[], prevEls: HTMLElement[], nextChars: string[]) {
  const ops: CharOp[] = [];

  let head = 0;
  while (
    head < prevChars.length &&
    head < nextChars.length &&
    prevChars[head] === nextChars[head]
  ) {
    head++;
  }
  let tail = 0;
  while (
    tail < prevChars.length - head &&
    tail < nextChars.length - head &&
    prevChars[prevChars.length - 1 - tail] === nextChars[nextChars.length - 1 - tail]
  ) {
    tail++;
  }

  for (let i = 0; i < head; i++) {
    ops.push({ type: "keep", char: prevChars[i], el: prevEls[i] });
  }

  const midPrev = prevChars.slice(head, prevChars.length - tail);
  const midNext = nextChars.slice(head, nextChars.length - tail);
  const midEls = prevEls.slice(head, prevChars.length - tail);

  let pi = 0;
  let ni = 0;
  const flush = (pe: number, ne: number) => {
    const pair = Math.min(pe - pi, ne - ni);
    for (let k = 0; k < pair; k++) {
      ops.push({ type: "replace", char: midNext[ni + k], el: midEls[pi + k] });
    }
    for (let k = pair; k < pe - pi; k++) {
      ops.push({ type: "delete", el: midEls[pi + k] });
    }
    for (let k = pair; k < ne - ni; k++) {
      ops.push({ type: "insert", char: midNext[ni + k] });
    }
    pi = pe;
    ni = ne;
  };

  for (const match of alignMiddle(midPrev, midNext)) {
    flush(match.prev, match.next);
    ops.push({ type: "keep", char: midPrev[match.prev], el: midEls[match.prev] });
    pi = match.prev + 1;
    ni = match.next + 1;
  }
  flush(midPrev.length, midNext.length);

  for (let i = 0; i < tail; i++) {
    const idx = prevChars.length - tail + i;
    ops.push({ type: "keep", char: prevChars[idx], el: prevEls[idx] });
  }

  return ops;
}

/* -------------------------------- DOM 小工具 ------------------------------- */

/**
 * 造一个单词包裹（inline-block，内部字符不会在单词中间断行）。
 * 这里不 aria-hide：外壳可能是不支持 aria-label 的 p / span，
 * 藏掉字符会让读屏完全读不到文字；标签仍写在 aria-label 上，支持时以它为准。
 */
function makeWord() {
  const word = document.createElement("span");
  word.className = WORDS_CLASS;
  word.style.display = "inline-block";
  return word;
}

/** 造一个字符槽位（backface 隐藏，翻转时不会露出镜像字形） */
function makeSlot(char: string) {
  const slot = document.createElement("span");
  slot.className = CHARS_CLASS;
  slot.textContent = char;
  slot.dataset.char = char;
  slot.style.display = "inline-block";
  slot.style.backfaceVisibility = "hidden";
  return slot;
}

/* --------------------------------- 组件 ---------------------------------- */

/**
 * 把 text 拆成字符：内容变化时做字符级 diff，只让有差异的字符原地翻转切换，
 * 删掉的字符原位翻出后摘掉；被牵动位置的其余字符用 FLIP 滑过去。
 * 换行 / 排版仍由浏览器负责（空格只决定分组，不参与动画）。
 *
 * 时序（避免"翻转"和"移位"叠在同一时段造成字符重叠）：
 * - 新增：新字先占位，后面的字符快速让位（shiftDuration），让位结束才开始翻入；
 * - 删除：字符在原位翻出（继续占位），翻完后先不摘除，等这一轮编辑结束
 *   （没有新输入）再统一摘除并用较慢的滑移补位（collapseDuration）；
 * - 连续编辑期间，上一轮的离场字符会继续占住自己的位置，不会被下一次重建挤走。
 *
 * @example
 * <FlipChars text={label} as="h1" className="text-4xl" />
 * <FlipChars text={label}><h1 className="text-4xl" /></FlipChars>
 */
export default function FlipChars({
  text,
  children,
  as,
  flip = "x",
  flipDuration = 0.45,
  shiftDuration = 0.18,
  collapseDuration = 0.6,
  perspective = 600,
  stagger = 0.035,
  simultaneous = false,
  delay = 0,
  autoPlay = true,
  className,
  onEnterComplete,
  onRemove,
  ref,
}: FlipCharsProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  /** 仍在场的字符 / 槽位，按文档顺序 */
  const charsRef = useRef<HTMLElement[]>([]);
  /** 正在离场、尚未从 DOM 摘掉的字符 */
  const leavingRef = useRef<HTMLElement[]>([]);
  /** 等待离场动画结束的调用，卸载时统一放行，避免 Promise 悬挂 */
  const waitersRef = useRef(new Set<() => void>());
  /**
   * 整段离场的旧单词包裹 → 随它一起搬回来的空格节点。
   * 这些空格是为了让离场字符（和它后面的字符）保持原来的排版位置而临时补的，
   * 所以单词摘除时必须一起摘掉，否则合拢后会多出空格。
   */
  const wordGapRef = useRef(new Map<HTMLElement, ChildNode[]>());
  const aliveRef = useRef(true);
  /** 已经渲染到 DOM 上的文本 */
  const appliedRef = useRef<string | null>(null);
  const enterDoneRef = useRef(true);
  const enterKilledRef = useRef(false);
  const enterCbRef = useRef(onEnterComplete);
  const removeCbRef = useRef(onRemove);

  useEffect(() => {
    enterCbRef.current = onEnterComplete;
  }, [onEnterComplete]);

  useEffect(() => {
    removeCbRef.current = onRemove;
  }, [onRemove]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  /** 字符之间的实际错峰：simultaneous 时归零，全部字符一起动 */
  const gap = simultaneous ? 0 : stagger;

  /** 让位时长（新增占位 / 换字换宽时，未变字符挪开的时长） */
  const shiftTime = shiftDuration;
  /** 补位时长（离场字符摘除后，后面字符滑过去合拢的时长） */
  const collapseTime = shiftTime > 0 ? collapseDuration : 0;

  const flipAnim = useMemo<FlipAnim>(
    () => ({
      axis: flip === "y" ? "rotateY" : "rotateX",
      duration: flipDuration,
      easeIn: "power2.in",
      easeOut: "power2.out",
      perspective,
    }),
    [flip, flipDuration, perspective],
  );

  /**
   * 同步外壳的 aria-label（传 value 用它的文本，否则按当前 DOM 拼）。
   * 拼的时候跳过仍在占位的离场字符、并用槽位的逻辑字符（换字瞬间可见字形还是旧的），
   * 所以标签始终等于"应该看到的文本"。
   */
  const syncLabel = useCallback((value?: string) => {
    const el = targetRef.current;
    if (!el) return;
    if (value !== undefined) {
      el.setAttribute("aria-label", value.trim());
      return;
    }
    if (!el.hasAttribute("aria-label")) return;
    const leaving = new Set(leavingRef.current);
    let text = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
        return;
      }
      const child = node as HTMLElement;
      if (leaving.has(child)) return;
      const char = child.dataset?.char;
      if (char !== undefined) {
        text += char;
        return;
      }
      child.childNodes.forEach(walk);
    };
    el.childNodes.forEach(walk);
    el.setAttribute("aria-label", text.replace(/\s+/g, " ").trim());
  }, []);

  /* ------------------------------ 布局 FLIP ------------------------------ */

  /**
   * 记下当前所有槽位的布局位置。用 offsetLeft / offsetTop 而不是 getBoundingClientRect：
   * 前者不受自身 transform 影响，字符正翻到一半时量出来的位置也准。
   */
  const measure = useCallback(
    () =>
      [...charsRef.current, ...leavingRef.current].map((el) => ({
        el,
        x: el.offsetLeft,
        y: el.offsetTop,
      })),
    [],
  );

  /**
   * 兜底清扫：把「没有动画在跑却还留着位移」的槽位复位。
   * 位移滑移和翻转共用同一个 transform，个别滑移补间被中断时字符会停在旧的排版位置上；
   * 这里在每次切换前和收尾各扫一遍，保证不会永久错位（正在跑的补间会被 isTweening 跳过）。
   */
  const settleResiduals = useCallback(() => {
    for (const el of [...charsRef.current, ...leavingRef.current]) {
      if (!el.isConnected || gsap.isTweening(el)) continue;
      const x = Number(gsap.getProperty(el, "x") ?? 0);
      const y = Number(gsap.getProperty(el, "y") ?? 0);
      if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) {
        gsap.set(el, { clearProps: "x,y" });
      }
    }
  }, []);

  /** 切换收尾后延迟清扫一次，覆盖晚一点才会跑完的离场滑移 */
  const scheduleSettle = useCallback(
    (wait: number) => {
      if (shiftTime <= 0) return;
      gsap.delayedCall(wait, settleResiduals);
    },
    [settleResiduals, shiftTime],
  );

  /**
   * 包住一次会改动布局的操作（写回新子树 / 换字 / 摘掉离场字符）：
   * 改动后把被挪动的槽位先摆回改动前的位置，再滑回原位，避免整行"跳"一下。
   * duration 不传时用「让位时长」；补位（塌陷）时会传更慢的时长。
   */
  const glide = useCallback(
    (
      marks: { el: HTMLElement; x: number; y: number }[],
      mutate: () => void,
      duration = shiftTime,
    ) => {
      mutate();
      if (duration <= 0) return;
      // 先把所有位移量读完再写，避免读-写交替触发多次重排
      const moves = marks
        .filter((mark) => mark.el.isConnected)
        .map((mark) => ({
          el: mark.el,
          // 接上尚未跑完的滑移残留，连续改字时不会跳
          dx: mark.x - mark.el.offsetLeft + Number(gsap.getProperty(mark.el, "x") ?? 0),
          dy: mark.y - mark.el.offsetTop + Number(gsap.getProperty(mark.el, "y") ?? 0),
        }))
        .filter((move) => Math.abs(move.dx) > 0.1 || Math.abs(move.dy) > 0.1);

      for (const move of moves) {
        // 先把视觉位置钉在改动前（FLIP），再滑回 0。
        // 不 kill 任何补间：位移补间全都收敛到 0，被后起的补间"接力"也不会留下错位。
        gsap.set(move.el, { x: move.dx, y: move.dy });
        gsap.to(move.el, {
          x: 0,
          y: 0,
          duration,
          ease: "power2.out",
          immediateRender: true,
        });
      }
    },
    [shiftTime],
  );

  /* -------------------------------- 构建 / 切换 ------------------------------- */

  /** 首次构建：把文本拆成 单词包裹 + 字符槽位 */
  const build = useCallback(
    (value: string) => {
      const shell = targetRef.current;
      if (!shell) return;
      const frag = document.createDocumentFragment();
      const els: HTMLElement[] = [];
      for (const token of value.match(/\s+|\S+/g) ?? []) {
        if (isBlank(token[0])) {
          frag.append(document.createTextNode(" "));
          continue;
        }
        const word = makeWord();
        for (const ch of token) {
          const slot = makeSlot(ch);
          word.append(slot);
          els.push(slot);
        }
        frag.append(word);
      }
      shell.replaceChildren(frag);
      syncLabel(value);
      charsRef.current = els;
      appliedRef.current = value;
    },
    [syncLabel],
  );

  /** 全部字符错峰翻入 */
  const flipInAll = useCallback(
    (els?: HTMLElement[]) => {
      const targets = (els?.length ? els : charsRef.current).filter(Boolean);
      if (!targets.length) return;
      enterDoneRef.current = false;
      enterKilledRef.current = false;
      const tl = gsap.timeline({
        delay,
        onComplete: () => {
          enterDoneRef.current = true;
          enterCbRef.current?.();
        },
      });
      targets.forEach((el, i) => tl.add(flipIn(el, flipAnim), i * gap));
      return tl;
    },
    [delay, flipAnim, gap],
  );

  /** 摘掉一个字符，并顺手清掉空掉的单词包裹（含为它临时补回的空格） */
  const drop = useCallback((char: HTMLElement) => {
    const parent = char.parentElement;
    gsap.killTweensOf(char);
    char.remove();
    leavingRef.current = leavingRef.current.filter((el) => el !== char);
    if (parent?.classList.contains(WORDS_CLASS) && parent.childNodes.length === 0) {
      parent.remove();
      const gaps = wordGapRef.current.get(parent);
      if (gaps) {
        wordGapRef.current.delete(parent);
        gaps.forEach((gap) => gap.remove());
      }
    }
  }, []);

  /* --------------------------- 离场后的补位（塌陷） --------------------------- */

  /**
   * 已经翻到看不见、但还留在原位占空间的离场字符。
   * 摘除它们会让后面的字符整体挪位，所以统一攒起来，等这一轮编辑结束（没有新输入）之后
   * 再一次性摘除并补位 —— 这样"翻转删除"和"移位补位"永远不在同一时段发生。
   */
  const pendingRef = useRef<HTMLElement[]>([]);
  const collapseCallRef = useRef<gsap.core.Tween | null>(null);

  /** 排一次补位；期间只要还有新的编辑，就会被重新推迟 */
  const scheduleCollapse = useCallback(
    (wait = flipDuration + 0.12) => {
      collapseCallRef.current?.kill();
      collapseCallRef.current = gsap.delayedCall(Math.max(0.05, wait), () => {
        collapseCallRef.current = null;
        const pending = pendingRef.current;
        if (!pending.length) return;
        pendingRef.current = [];
        // 此刻它们都已经翻到看不见了，慢慢合拢不会和任何翻转重叠
        glide(
          measure(),
          () => {
            pending.forEach(drop);
          },
          collapseTime,
        );
      });
    },
    [collapseTime, drop, flipDuration, glide, measure],
  );

  /** 内容变化：diff 后只让有差异的字符原地翻转切换 */
  const applyText = useCallback(
    (next: string) => {
      const shell = targetRef.current;
      if (!shell) return;

      settleResiduals();
      const prevEls = charsRef.current;
      const ops = diffChars(
        prevEls.map((el) => el.dataset.char ?? ""),
        prevEls,
        [...next].filter((ch) => !isBlank(ch)),
      );

      // 「离场字符」必须继续占住它原来的位置，而且位置要精确 —— 它的宽度落在哪儿，决定了
      // 它后面所有字符的排版位置。重建时旧子树会被丢掉，所以这里在重建前把每个字符的
      // 「排版顺序 + 左右兄弟元素」记下来：兄弟要么是复用的槽位、要么是同样离场的字符，
      // 重建后都还在树里，于是可以原样复原前后关系（含空格两侧的正确归属）。
      const pos = (el: HTMLElement) => el.offsetTop * 100000 + el.offsetLeft;
      // 这一轮重建后仍会复用的槽位（diff 里 keep / replace 用到的元素）
      const kept = new Set<HTMLElement>();
      for (const op of ops) {
        if (op.type === "keep" || op.type === "replace") kept.add(op.el);
      }
      const slots = new Map<
        HTMLElement,
        {
          at: number;
          left: Element | null;
          right: Element | null;
          /** 旧单词包裹；离场字符直接挂在外壳上时为 null */
          word: HTMLElement | null;
          /** 旧单词包裹前后的空格节点，整段离场时随单词一起搬回来 */
          gapBefore: ChildNode | null;
          gapAfter: ChildNode | null;
        }
      >();
      for (const el of [...prevEls, ...leavingRef.current]) {
        // 只认同一个单词包裹内的邻居：nextElementSibling / previousElementSibling 不会跨过空格，
        // 于是离场字符正好停回它原来那一侧（跨空格会被贴到空格另一侧，看起来像自己往右跑）。
        let right: Element | null = el.nextElementSibling;
        while (right && !kept.has(right as HTMLElement)) right = right.nextElementSibling;
        let left: Element | null = el.previousElementSibling;
        while (left && !kept.has(left as HTMLElement)) left = left.previousElementSibling;
        const parent = el.parentElement;
        const word =
          parent && parent !== shell && parent.classList.contains(WORDS_CLASS) ? parent : null;
        slots.set(el, {
          at: pos(el),
          left,
          right,
          word,
          gapBefore: word?.previousSibling ?? null,
          gapAfter: word?.nextSibling ?? null,
        });
      }

      // 重建会把复用中的槽位摘进 fragment（此时 offsetLeft 会变成 0），所以旧位置必须在这之前量好。
      const marks = measure();

      const frag = document.createDocumentFragment();
      const nextEls: HTMLElement[] = [];
      const tl = gsap.timeline();
      let cursor = 0;
      let step = 0;
      let word: HTMLElement | null = null;

      /**
       * 删掉的字符留在原处继续占位，翻出结束后进入「待补位」队列。
       * 真正摘除（空间塌陷 + 后面字符补位）由 scheduleCollapse 统一在"这一轮编辑结束"后做，
       * 这样翻转删除和移位补位永远不会落在同一时段。
       */
      const retire = (el: HTMLElement) => {
        leavingRef.current.push(el);
        tl.add(
          flipOut(el, flipAnim, () => {
            pendingRef.current.push(el);
          }),
          step * gap,
        );
        step++;
      };

      /** 取出游标前的删除项（离场字符由 placeLeavers 统一贴回原位，这里只管动画） */
      const takeDeletes = () => {
        while (ops[cursor]?.type === "delete") {
          retire((ops[cursor++] as { type: "delete"; el: HTMLElement }).el);
        }
      };

      // 按新文本重建子树：未变的复用、变化的原地翻转、新增的翻入、删除的原地翻出
      for (const token of next.match(/\s+|\S+/g) ?? []) {
        if (isBlank(token[0])) {
          word = null;
          frag.append(document.createTextNode(" "));
          continue;
        }
        word = makeWord();
        for (const ch of token) {
          takeDeletes();
          const raw = ops[cursor++];
          const op: CharOp =
            raw && raw.type !== "delete" ? raw : { type: "insert", char: ch };
          let slot: HTMLElement;
          if (op.type === "insert") {
            slot = makeSlot(ch);
            // 先让位、再翻入：新字要等邻居让开（让位滑移结束）才开始翻转，避免叠在一起
            tl.add(flipIn(slot, flipAnim), step * gap + shiftTime);
            step++;
          } else {
            slot = op.el;
            if (slot.dataset.char !== op.char) {
              slot.dataset.char = op.char;
              tl.add(
                flipSwap(slot, op.char, flipAnim, (mutate) => glide(measure(), mutate)),
                step * gap,
              );
              step++;
            }
          }
          word.append(slot);
          nextEls.push(slot);
        }
        frag.append(word);
      }

      // 末尾还剩下的删除项
      while (cursor < ops.length) {
        const op = ops[cursor++];
        if (op.type === "delete") retire(op.el);
      }

      /**
       * 把离场字符贴回它原来的位置，让它们继续占住原来的空间。
       * 必须在读新布局（FLIP 的第二次测量）之前完成：否则这些"洞"会被算成位移量，
       * 右边的字符会被多推出去一段，换行点变化时下面整行还会被推下去。
       *
       * 分三类贴回（同一处的多个离场字符仍按原顺序排列）：
       * 1. 旧单词里还有复用的槽位：「这一轮会复用的槽位」一定在新树里、一定连在树上，
       *    以它为锚点插回去即可，没有先后依赖；
       * 2. 旧单词整段都离场了（一个复用槽位都没有）：旧单词在重建后根本不存在，
       *    没有锚点可贴。这时按旧坐标把整个「旧单词包裹」连它两侧的空格搬回新树里对应的
       *    空档 —— 否则只能随便找个地方塞，看起来就像离场字符先跑到整段文字末尾再翻转；
       * 3. 连旧坐标都没得用时兜底追加。
       */
      const placeLeavers = () => {
        const at = (el: HTMLElement) => slots.get(el)?.at ?? 0;
        const byAt = (a: HTMLElement, b: HTMLElement) => at(a) - at(b);
        const leaving = [...leavingRef.current];
        /** 已经回到新树里、并且带着旧坐标的元素，供整段离场的旧单词找落点 */
        const anchors = [...kept].map((el) => ({ el, at: at(el) }));

        // 有右侧锚点的：从左到右依次插到锚点之前 → 天然保持原顺序
        for (const el of leaving.filter((item) => slots.get(item)?.right).sort(byAt)) {
          slots.get(el)?.right?.before(el);
          anchors.push({ el, at: at(el) });
        }
        // 只剩左侧锚点（原本在包裹末尾）的：从右到左贴在锚点之后 → 同样保持原顺序
        for (const el of leaving
          .filter((item) => !slots.get(item)?.right)
          .sort((a, b) => byAt(b, a))) {
          const left = slots.get(el)?.left;
          if (!left?.isConnected) continue;
          left.after(el);
          anchors.push({ el, at: at(el) });
        }

        // 整段离场的旧单词：按旧坐标搬到新树里对应的空档上
        const ghosts = new Map<HTMLElement, HTMLElement[]>();
        for (const el of leaving) {
          const slot = slots.get(el);
          if (!slot || slot.right || slot.left?.isConnected) continue;
          // 离场字符直接挂在外壳上时（没有单词包裹）就搬它自己
          const unit = slot.word?.contains(el) ? slot.word : el;
          const group = ghosts.get(unit);
          if (group) group.push(el);
          else ghosts.set(unit, [el]);
        }
        const ordered = [...ghosts].sort(
          (a, b) => Math.min(...a[1].map(at)) - Math.min(...b[1].map(at)),
        );
        for (const [ghost, items] of ordered) {
          const index = Math.min(...items.map(at));
          const { gapBefore = null, gapAfter = null } = slots.get(items[0]) ?? {};
          /** 为了对齐排版临时插入的空格，单词摘除时要一起摘掉（见 drop） */
          const gaps: ChildNode[] = [];
          // 紧跟其后的那个元素（复用槽位或已贴回的离场字符）在新树里的位置就是落点
          let next: { el: HTMLElement; at: number } | null = null;
          for (const anchor of anchors) {
            if (anchor.at > index && (!next || anchor.at < next.at)) next = anchor;
          }
          if (next) {
            // 贴到锚点所在单词之前：前面的空格沿用新树里的，后面的空格随旧单词一起补回
            const box = next.el.parentElement;
            const before = box && box !== shell ? box : next.el;
            before.before(ghost);
            if (gapAfter) {
              before.before(gapAfter);
              gaps.push(gapAfter);
            }
          } else {
            // 后面没有锚点了（原本就在末尾）：跟在最后一格之后，前面的空格按需补回
            const tail = shell.lastChild;
            if (gapBefore && tail && tail.nodeType !== Node.TEXT_NODE) {
              shell.append(gapBefore);
              gaps.push(gapBefore);
            }
            shell.append(ghost);
            if (gapAfter) {
              shell.append(gapAfter);
              gaps.push(gapAfter);
            }
          }
          if (gaps.length) wordGapRef.current.set(ghost, gaps);
          anchors.push({ el: ghost, at: index });
        }
      };

      glide(marks, () => {
        shell.replaceChildren(frag);
        charsRef.current = nextEls;
        placeLeavers();
      });

      appliedRef.current = next;
      syncLabel(next);
      scheduleSettle(tl.duration() + shiftTime + 0.2);
      // 这一轮编辑结束之后再统一摘除离场字符并补位（连续输入时会被不断推迟）
      scheduleCollapse(tl.duration() + 0.12);
    },
    [
      flipAnim,
      gap,
      glide,
      measure,
      scheduleCollapse,
      scheduleSettle,
      settleResiduals,
      shiftTime,
      syncLabel,
    ],
  );

  /* ----------------------------- 离场 / 删除 ----------------------------- */

  /** 离场动画：原地翻出；Promise 在动画结束后 resolve */
  const animateOut = useCallback(
    (targets: HTMLElement[]) =>
      new Promise<void>((resolve) => {
        const done = () => {
          waitersRef.current.delete(done);
          resolve();
        };
        waitersRef.current.add(done);
        const tl = gsap.timeline({ onComplete: done });
        targets.forEach((el, i) => tl.add(flipOut(el, flipAnim), i * gap));
      }),
    [flipAnim, gap],
  );

  /** 取出待删除的字符，同时把它们移出「在场队列」，并发调用不会重复选中 */
  const take = useCallback((count?: number) => {
    const all = charsRef.current;
    const targets = count && count > 0 ? all.slice(-count) : all.slice();
    if (!targets.length) return [];
    const leaving = new Set(targets);
    charsRef.current = all.filter((char) => !leaving.has(char));
    leavingRef.current.push(...targets);
    return targets;
  }, []);

  const remove = useCallback(
    async (count?: number) => {
      if (!aliveRef.current) return [];
      const targets = take(count);
      if (!targets.length) return targets;
      await animateOut(targets);
      if (!aliveRef.current) return targets;
      // 翻完只是"看不见"，先留在原位继续占位，等这一轮结束再统一摘除 + 补位
      pendingRef.current.push(...targets);
      syncLabel();
      scheduleCollapse(0.1);
      removeCbRef.current?.(targets, charsRef.current.length);
      return targets;
    },
    [animateOut, scheduleCollapse, syncLabel, take],
  );

  const clear = useCallback(
    (count?: number) => {
      const targets = take(count);
      if (!targets.length) return targets;
      glide(
        measure(),
        () => {
          targets.forEach(drop);
        },
        collapseTime,
      );
      syncLabel();
      scheduleSettle(collapseTime + 0.2);
      removeCbRef.current?.(targets, charsRef.current.length);
      return targets;
    },
    [collapseTime, drop, glide, measure, scheduleSettle, syncLabel, take],
  );

  const getChars = useCallback(() => charsRef.current.slice(), []);

  useImperativeHandle(
    ref,
    () => ({ enter: flipInAll, remove, clear, getChars }),
    [clear, flipInAll, getChars, remove],
  );

  /* --------------------------------- 生命周期 -------------------------------- */

  useGSAP(
    () => {
      const shell = targetRef.current;
      if (!shell) return;

      if (appliedRef.current === null) {
        build(text);
        if (autoPlay) flipInAll();
      } else if (appliedRef.current !== text) {
        applyText(text);
      } else if (enterKilledRef.current) {
        // 开发环境下 StrictMode 的模拟卸载会打断首次翻入，这里补播一次
        enterKilledRef.current = false;
        if (autoPlay) flipInAll();
      }

      return () => {
        if (!enterDoneRef.current) enterKilledRef.current = true;
        collapseCallRef.current?.kill();
        collapseCallRef.current = null;
        pendingRef.current = [];
        gsap.killTweensOf([...charsRef.current, ...leavingRef.current]);
        leavingRef.current = [];
        waitersRef.current.forEach((done) => done());
        waitersRef.current.clear();
      };
    },
    {
      dependencies: [text, autoPlay, applyText, build, flipInAll],
      scope: targetRef,
    },
  );

  /* ---------------------------------- 渲染 --------------------------------- */

  const setTarget = useCallback((node: HTMLElement | null) => {
    targetRef.current = node;
  }, []);

  if (isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const Shell = child.type as ComponentType<Record<string, unknown>>;
    const shellProps: Record<string, unknown> = { ...child.props };
    // 外壳只负责样式，内容由组件接管
    delete shellProps.children;
    if (className && typeof child.type === "string") {
      shellProps.className = cn(child.props.className as string | undefined, className);
    }
    return <Shell {...shellProps} ref={setTarget} />;
  }

  const tag = as ?? "span";
  const Tag = tag as unknown as ComponentType<Record<string, unknown>>;
  return (
    <Tag
      ref={setTarget}
      className={tag === "span" ? cn("inline-block", className) : className}
    />
  );
}
