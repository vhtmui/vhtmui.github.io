import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { inflateRawSync } from "node:zlib";

/**
 * 把一本 epub 拆成 content/ 下的一章一个 markdown 文件（一次性迁移脚本，跑完就不用再动）。
 *
 *   node scripts/epub-to-markdown.mjs "src/assets/代码整洁之道.epub"
 *
 * 这本书（图灵版《代码整洁之道》）的 xhtml 有几个特点，转换全靠它们：
 * - 标题是真标签：h1 / h2.secondTitle / h3.thirdTitle；
 * - 正文 `<p class="content">`，整段缩进/强调用 `content_1xx`，**类名不区分代码和正文**
 *   （第一章的名家语录也在 content_106 里），所以代码块只能按文本内容判断；
 * - 代码按行拆成一串 `<p class="content_1xx">`，缩进由 css 里的 margin-left 给出；
 * - 注释是行内 `<span id="refN">` + 文末 `<p id="annotN">`，正好对应 GFM 脚注。
 *
 * 用法：脚本会就地写 content/books/代码整洁之道/ 与 public/books/clean-code/，
 * 重跑是幂等的（覆盖同名文件）。
 */

const BOOK_DIR = "content/books/代码整洁之道";
const IMAGE_DIR = "public/books/clean-code";
/** 图片在正文里的引用路径，站内绝对路径，构建时由 markdown.server 补上 base */
const IMAGE_URL = "/books/clean-code";

/* ------------------------------- 最小 zip 解析 ------------------------------ */

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;

/** 读出 zip 里的全部条目：名字 → 解压后的内容（够用即可，不做 zip64） */
function readZip(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 66000); i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("不是有效的 zip / epub 文件");

  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();

  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_SIG) break;

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf-8", offset + 46, offset + 46 + nameLength);

    // 本地头里的文件名/扩展区长度可能与中央目录不同，以本地头为准
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);

    if (!name.endsWith("/")) {
      entries.set(name, method === 0 ? raw : inflateRawSync(raw));
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

/* --------------------------------- 文本处理 -------------------------------- */

const ENTITIES = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/g, (_, name) => ENTITIES[name]);
}

const stripTags = (html) => decodeEntities(html.replace(/<[^>]+>/g, ""));

/** 段落内联标记 → markdown（脚注、加粗、斜体、外链），其余标签一律脱掉 */
function inlineToMarkdown(html) {
  return stripTags(
    html
      .replace(/<span id="ref(\d+)"[^>]*>[\s\S]*?<\/span>/g, (_, n) => `[^${n}]`)
      .replace(/<span[^>]*class="bold"[^>]*>/g, "**")
      .replace(/<span[^>]*class="italic"[^>]*>/g, "*")
      .replace(/<\/span>/g, "")
      .replace(/<br\s*\/?>/g, " ")
      .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) =>
        /^https?:/i.test(href) ? `[${text}](${href})` : text,
      ),
  )
    .replace(/[ \t\u00a0]+/g, " ")
    .trim();
}

/** 代码行的原始文本：只脱标签、还原实体，保留内部空格 */
function codeLineText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\u00a0/g, " ").trimEnd();
}

/** 中文/全角标点；不含 U+3000（全角空格在代码里是缩进，得留着） */
const CJK = /[\u3001-\u303f\u4e00-\u9fff\uff01-\uff60]/;

/**
 * 代码行的缩进有两个来源：css 里的 margin-left（一层记 4 空格），
 * 以及行首的全角空格 —— 附录的整段清单是「行号 + 全角空格」排缩进的。
 */
function splitIndent(raw, em) {
  const leading = /^[\s\u3000]*/.exec(raw)[0];
  const width = [...leading].reduce((sum, ch) => sum + (ch === "\u3000" ? 2 : 1), 0);

  return {
    text: raw
      .slice(leading.length)
      .replace(/\u3000/g, "  ")
      // 电子版个别地方丢了类型和变量名之间的空格（intport、Stringdirectory），补回来
      .replace(
        /\b(int|long|float|double|boolean|char|byte|short|String|Object|Integer|Boolean|StringBuffer)([a-z][A-Za-z0-9_]*)(?=\s*[=;,)])/g,
        "$1 $2",
      )
      .trimEnd(),
    indent: Math.round(em * 4) + width,
  };
}

/** 像代码的强信号：行首关键字、注释、分号花括号、明显是调用或声明 */
function strongCode(text) {
  const t = text.trim();
  if (!t) return false;
  // 中文只在注释里出现，正文段落里出现中文就基本不是代码
  if (CJK.test(t)) return /^(\/\/|\/\*|\*)/.test(t);
  // 书里带行号的清单（附录 B、第 14 章的部分代码）；空行也只剩一个行号
  if (/^\d+[\s\u3000]/.test(t) || /^\d{1,4}$/.test(t)) return true;
  if (/^(\/\/|\/\*|\*\/|\*|\}|{|@|<\/?[a-zA-Z])/.test(t)) return true;
  if (/^[\w<>[\].$]+\s*;$/.test(t)) return true;
  if (/[={]$/.test(t)) return true;
  if (/^[a-zA-Z_$][\w$.]*\s*\(.*\)\s*[;{]?$/.test(t)) return true;
  if (
    /^(public|private|protected|static|final|abstract|synchronized|class|interface|enum|import|package|return|throws|extends|implements|if|else|for|while|do|switch|case|default|try|catch|finally|new|void|int|long|double|float|boolean|char|byte|String)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/^[A-Za-z_$][\w$.<>[\]]*\s+\w+\s*=\s*.+$/.test(t)) return true;
  if (/^[A-Za-z_$][\w$.]*(\s*,\s*[A-Za-z_$][\w$.]*)+[,)]?$/.test(t)) return true;
  return false;
}

/**
 * 弱信号：一行里出现代码标点且不像句子。
 * 单独出现不认（英文引文里也有逗号括号），只有和相邻行成串时才认。
 */
function weakCode(text) {
  const t = text.trim();
  if (!t || CJK.test(t)) return false;
  if (/[。，！？；：、]/.test(t)) return false;
  if (/[.!?]$/.test(t)) return false;
  // 单独一个标识符/表达式（续行的 `wikiPage` 之类），凑成串才算代码
  if (t.length <= 40 && /^[A-Za-z_$][\w$.]*$/.test(t)) return true;
  return /[(),;{}[\]]/.test(t) && t.length <= 100;
}

/* -------------------------------- 单章转换 -------------------------------- */

/** css 里 content_1xx 的 margin-left，用来还原代码缩进（1em 记作一层，一层 4 空格） */
function readIndentMap(css) {
  const map = new Map();
  for (const m of css.matchAll(/\.content_(\d+)\s*\{([^}]*)\}/g)) {
    const em = Number(/margin-left:\s*([\d.]+)em/.exec(m[2])?.[1] ?? 0);
    const bold = /font-weight:\s*bold/.test(m[2]);
    map.set(Number(m[1]), { em, bold });
  }
  return map;
}

const BLOCK_RE = /<(h[1-6]|p)([^>]*)>([\s\S]*?)<\/\1>|<img([^>]*?)\/?>|<hr[^>]*\/?>/g;

function convertPart(html, indents) {
  const head = html.slice(0, html.indexOf("<body>"));
  const partTitle = stripTags(/<title>([\s\S]*?)<\/title>/.exec(head)?.[1] ?? "").trim();
  const body = html.slice(html.indexOf("<body>")).replace(/<\/?div[^>]*>/g, "");

  /** 先摊平成有序的块序列，再合并代码行、挂脚注 */
  const blocks = [];
  /** h1 之后、正文之前的那张图是章首装饰图，跳过 */
  let proseSeen = false;

  for (const m of body.matchAll(BLOCK_RE)) {
    if (m[4] !== undefined) {
      const src = /src="([^"]*)"/.exec(m[4])?.[1];
      if (src && proseSeen) blocks.push({ kind: "img", src });
      continue;
    }

    if (!m[1]) {
      blocks.push({ kind: "hr" });
      continue;
    }

    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const inner = m[3];
    const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? "";
    const id = /id="([^"]*)"/.exec(attrs)?.[1];

    if (tag.startsWith("h")) {
      const level = Number(tag[1]);
      const text = inlineToMarkdown(inner);
      if (text) blocks.push({ kind: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text });
      continue;
    }

    // 文末注释：转成脚注定义，最后统一附在文末
    if (id?.startsWith("annot")) {
      blocks.push({
        kind: "note",
        id: id.slice("annot".length),
        text: inlineToMarkdown(inner.replace(/<a\s[^>]*>[\s\S]*?<\/a>/, "")),
      });
      continue;
    }

    if (/<img/i.test(inner)) {
      const src = /src="([^"]*)"/.exec(inner)?.[1];
      if (src && proseSeen) blocks.push({ kind: "img", src });
      continue;
    }

    const num = /^content_(\d+)$/.exec(cls)?.[1];
    const meta = num ? indents.get(Number(num)) : undefined;
    const raw = codeLineText(inner);
    const text = inlineToMarkdown(inner);

    if (!text) {
      // 代码块里的空行要留着，其它地方的空段落直接丢
      blocks.push({ kind: "blank" });
      continue;
    }

    if (cls === "imgtitle") {
      blocks.push({ kind: "caption", text });
      continue;
    }

    // 代码行：强信号直接认，弱信号等合并时看邻居
    if (num && Number(num) >= 106) {
      const strong = strongCode(raw);
      if (strong || weakCode(raw)) {
        const { text: line, indent } = splitIndent(raw, meta?.em ?? 0);
        blocks.push({ kind: "code", text: line, indent, strong });
        continue;
      }
    }

    // 清单标题（代码清单 3-1 …）保持加粗，方便和正文分开
    if (meta?.bold && /^代码清单/.test(text)) {
      blocks.push({ kind: "p", text: `**${text}**` });
      continue;
    }

    // 小节内的粗体小标题（如「代码块和缩进」）：短、无句末标点才算
    if (meta?.bold && text.length <= 24 && !/[。！？；：]$/.test(text)) {
      blocks.push({ kind: "h3", text });
      continue;
    }

    blocks.push({ kind: "p", text });
    proseSeen = true;
  }

  /* 代码串：相邻的 code / blank 合成一块，单个弱信号行退回正文 */
  const merged = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind !== "code") {
      if (block.kind === "blank" && merged.at(-1)?.kind === "code") continue;
      merged.push(block);
      continue;
    }

    // 往后吃掉连续的代码行和中间的空行
    const run = [block];
    let j = i + 1;
    while (j < blocks.length && (blocks[j].kind === "code" || blocks[j].kind === "blank")) {
      if (blocks[j].kind === "code") run.push(blocks[j]);
      else run.push({ kind: "code", text: "", indent: null, strong: true });
      j++;
    }
    // 末尾多吃的空行还回去
    while (run.length && run.at(-1).text === "") run.pop();

    const hasStrongNeighbor = run.some((line) => line.strong);
    if (run.length === 1 && !block.strong) {
      merged.push({ kind: "p", text: blocks[i].text });
      i = j - 1;
      continue;
    }
    if (!hasStrongNeighbor) {
      for (const line of run) merged.push({ kind: "p", text: line.text });
      i = j - 1;
      continue;
    }

    merged.push({ kind: "fence", lines: run });
    i = j - 1;
  }

  /**
   * 电子版里有几处脚注引用被单独放飞成一个空段落（例如标题后面孤零零一个 [13]），
   * 直接输出会变成文末一条没人引用的定义，这里把它接回前面最近的一段正文。
   */
  const reattached = [];
  for (const block of merged) {
    const orphan = block.kind === "p" ? /^(\[\^\d+\])$/.exec(block.text.trim()) : null;
    if (!orphan) {
      reattached.push(block);
      continue;
    }

    const host = [...reattached].reverse().find((item) => item.kind === "p");
    const next = merged[merged.indexOf(block) + 1];
    if (host) host.text += orphan[1];
    else if (next?.kind === "p") next.text = orphan[1] + next.text;
  }

  return { partTitle, blocks: reattached };
}

/* --------------------------------- 输出组装 -------------------------------- */

/** 判断代码块语言：这本书几乎全是 Java，零星几段是 XML / SQL */
function fenceLang(lines) {
  const text = lines.map((line) => line.text).join("\n");
  if (/<\?xml|<html|<beans|xmlns=/.test(text)) return "xml";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE)\b/im.test(text) && /\bFROM\b/i.test(text)) return "sql";
  return "java";
}

function blocksToMarkdown(blocks, images) {
  const out = [];
  const notes = [];

  for (const block of blocks) {
    switch (block.kind) {
      case "h1":
        out.push(`# ${block.text}`, "");
        break;
      case "h2":
        out.push(`## ${block.text}`, "");
        break;
      case "h3":
        out.push(`### ${block.text}`, "");
        break;
      case "p":
        out.push(block.text, "");
        break;
      case "caption":
        out.push(`*${block.text}*`, "");
        break;
      case "hr":
        out.push("---", "");
        break;
      case "img": {
        const name = block.src.split("/").pop();
        images.add(name);
        out.push(`![](${IMAGE_URL}/${name})`, "");
        break;
      }
      case "fence": {
        const indent = Math.min(
          ...block.lines.filter((line) => line.text).map((line) => line.indent ?? 0),
        );
        const body = block.lines
          .map((line) => (line.text ? " ".repeat(Math.max(0, (line.indent ?? 0) - indent)) + line.text : ""))
          .join("\n");
        out.push("```" + fenceLang(block.lines), body, "```", "");
        break;
      }
      case "note":
        notes.push(`[^${block.id}]: ${block.text}`);
        break;
      default:
        break;
    }
  }

  if (notes.length) out.push(...notes, "");
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/* ---------------------------------- 主流程 --------------------------------- */

/** 页面表：先按书的阅读顺序排好，文件名前缀只用来保证排序 */
const PAGES = [
  { part: "part0004", file: "01-序" },
  { part: "part0006", file: "02-代码猴子与童子军军规" },
  { part: "part0007", file: "03-前言" },
  { part: "part0008", file: "04-整洁代码" },
  { part: "part0009", file: "05-有意义的命名" },
  { part: "part0010", file: "06-函数" },
  { part: "part0011", file: "07-注释" },
  { part: "part0012", file: "08-格式" },
  { part: "part0013", file: "09-对象和数据结构" },
  { part: "part0014", file: "10-错误处理" },
  { part: "part0015", file: "11-边界" },
  { part: "part0016", file: "12-单元测试" },
  { part: "part0017", file: "13-类" },
  { part: "part0018", file: "14-系统" },
  { part: "part0019", file: "15-迭进" },
  { part: "part0020", file: "16-并发编程" },
  { part: "part0021", file: "17-逐步改进" },
  { part: "part0022", file: "18-JUnit内幕" },
  { part: "part0023", file: "19-重构SerialDate" },
  { part: "part0024", file: "20-味道与启发" },
  { part: "part0025", file: "21-附录A-并发编程II" },
  { part: "part0026", file: "22-附录B-SerialDate" },
  { part: "part0027", file: "23-结束语" },
];

const epubPath = resolve(process.argv[2] ?? "src/assets/代码整洁之道.epub");
const entries = readZip(readFileSync(epubPath));

const styleEntry = [...entries.keys()].find((name) => /Styles\/.*\.css$/.test(name));
const indents = readIndentMap(entries.get(styleEntry).toString("utf-8"));

mkdirSync(BOOK_DIR, { recursive: true });
mkdirSync(IMAGE_DIR, { recursive: true });

const images = new Set();
const pages = [];

for (const page of PAGES) {
  const entry = [...entries.keys()].find((name) => name.includes(`/${page.part}.xhtml`));
  if (!entry) throw new Error(`epub 里找不到 ${page.part}`);

  const { blocks } = convertPart(entries.get(entry).toString("utf-8"), indents);
  const markdown = blocksToMarkdown(blocks, images);
  const target = join(BOOK_DIR, `${page.file}.md`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, markdown, "utf-8");

  pages.push({
    file: page.file,
    title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? page.file,
    fences: (markdown.match(/^```/gm) ?? []).length / 2,
  });
}

/* 目录页：一章一条，链到对应路由（站内绝对路径，由浏览器编码中文） */
const toc = [
  "# 目录",
  "",
  "《代码整洁之道》按章拆页，左侧目录树可以直接跳转；每一页的右侧还有本章的章节导航。",
  "",
  ...pages.map((page) => `- [${page.title}](/docs/books/代码整洁之道/${page.file})`),
  "",
];
writeFileSync(join(BOOK_DIR, "00-目录.md"), toc.join("\n"), "utf-8");

/* 只搬正文引用到的图片 */
for (const name of images) {
  const entry = [...entries.keys()].find((key) => key.endsWith(`/Images/${name}`));
  if (!entry) {
    console.warn(`图片缺失：${name}`);
    continue;
  }
  writeFileSync(join(IMAGE_DIR, name), entries.get(entry));
}

console.log(`已生成 ${pages.length + 1} 个页面 → ${BOOK_DIR}`);
console.log(`图片 ${images.size} 张 → ${IMAGE_DIR}`);
for (const page of pages) {
  console.log(`  ${page.file}.md\t代码块 ${page.fences}\t${page.title}`);
}
