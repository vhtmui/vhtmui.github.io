import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";

/**
 * 构建后整理产物（`pnpm build` 在 react-router build 之后自动调用）。
 *
 * 做两件事：
 * 1. 子路径部署时，框架把页面写到 <build>/client/<basename>/，而 Vite 的 assets 与
 *    public 资源落在 <build>/client 根下；两者 URL 前缀都带 basename，分开部署会 404，
 *    所以统一归到 basename 目录里，让它直接就是站点根。
 *    根路径部署（SITE_BASE=/）时前缀是 "/"，产物本来就在正确位置，不用搬。
 * 2. 预渲染直接把 URL 片段当目录名，中文会保留成 %E5%85%B6%E4%BB%96 这种编码形式，
 *    而 nginx / GitHub Pages 会先把请求 URL 解码再找文件，对不上就 404，这里还原成中文。
 *
 * 注意：不能用 reactRouterConfig 的 buildEnd 做这些 —— 它在预渲染之前就触发了，
 * 那时文档目录还没生成。
 */

/** 与 site.config.ts 的 SITE_BASE 同一个约定；这里跑在纯 Node 下，只能照抄一行 */
const SITE_NAME = (process.env.SITE_BASE ?? "/my_site_zzy/").trim().replace(/^\/+|\/+$/g, "");
/** 空串 = 部署在根路径 */
const AT_ROOT = SITE_NAME === "";

const CLIENT_DIR = resolve("build/client");
const SITE_DIR = AT_ROOT ? CLIENT_DIR : resolve(CLIENT_DIR, SITE_NAME);

/** 构建脚本里同步等一会儿就行，不值得为几百毫秒的退避把整段改成异步 */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Windows 上"路径被占用"的几个错误码 */
const BUSY_CODES = new Set(["EPERM", "EACCES", "EBUSY"]);

/**
 * 逐层复制文件树。
 *
 * 不用 fs.cpSync：它在某些环境下遇到非 ASCII 目录名（content 里的「其他」「ai问答」
 * 会在产物里原样出现）会直接把进程搞崩，而且崩之前已经复制了一半。自己递归只用
 * mkdirSync / readdirSync / copyFileSync，这三者对中文路径是可靠的。
 */
function copyTree(source, target) {
  if (!statSync(source).isDirectory()) {
    copyFileSync(source, target);
    return;
  }

  mkdirSync(target, { recursive: true });
  for (const name of readdirSync(source)) copyTree(resolve(source, name), resolve(target, name));
}

/**
 * 移动一个文件或目录，搬不动就退化成「复制 + 尽力删除」。
 *
 * 优先 rename：同一分区里只是改目录项，最快。但 Windows 上只要目录被别的进程开了
 * 句柄（杀毒、搜索索引、编辑器的预览/监听，甚至上一次构建残留的 watcher），rename
 * 就会 EPERM —— 而且这种占用常常几百毫秒就没了，所以先重试几次。
 *
 * 重试还不行就复制过去：复制只要求读权限，基本不会再失败；源目录删不掉也只是在
 * 站点根之外多留一份，不影响部署（只打一行警告）。
 */
function moveEntry(source, target) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      renameSync(source, target);
      return;
    } catch (error) {
      if (!BUSY_CODES.has(error.code)) throw error;
      if (attempt < 2) sleepSync(150 * (attempt + 1));
    }
  }

  copyTree(source, target);
  try {
    rmSync(source, { recursive: true, force: true });
  } catch (error) {
    // 细节可能是长长一段（各种 shim / 系统错误），截断一下
    const reason = error.code ?? String(error.message).split("\n")[0].slice(0, 80);
    console.warn(`postbuild: ${source} 被占用没能删掉（${reason}），留着不影响部署`);
  }
}

/** 把 URL 编码的目录名还原成原文，自底向上处理 */
function decodeDirNames(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) decodeDirNames(full);

    let decoded = entry.name;
    try {
      decoded = decodeURIComponent(entry.name);
    } catch {
      // 名字里出现裸 % 时保持原样
    }

    if (decoded !== entry.name) moveEntry(full, resolve(dir, decoded));
  }
}

if (!AT_ROOT) {
  for (const entry of readdirSync(CLIENT_DIR, { withFileTypes: true })) {
    if (entry.name === SITE_NAME) continue;

    // index.html 是未预渲染路径的 SPA 兜底，改名后由服务器按 try_files 兜底
    const target = resolve(
      SITE_DIR,
      entry.name === "index.html" ? "__spa-fallback.html" : entry.name,
    );

    // 关掉 emptyOutDir 后这里可能残留上一次的同名内容，直接清掉再放新的；
    // 清不掉也不要紧，后面的搬移会覆盖同名文件（moveEntry 里还有复制兜底）
    try {
      rmSync(target, { recursive: true, force: true });
    } catch {
      // 被占用就交给 moveEntry
    }
    moveEntry(resolve(CLIENT_DIR, entry.name), target);
  }
}

decodeDirNames(SITE_DIR);

/*
  GitHub Pages 没有 nginx 的 try_files：对未知路径回落到站点根的 404.html。
  框架已经把「根路由空壳」写在 __spa-fallback.html（不是预渲染过的首页），复制成
  404.html 即可，访问不存在的文档时由客户端路由接管、落进应用自己的 404。
  nginx 部署用不上它，留着也无害。
*/
{
  const source = ["__spa-fallback.html", "index.html"]
    .map((name) => resolve(SITE_DIR, name))
    .find((file) => existsSync(file));

  if (source) {
    const fallback = resolve(SITE_DIR, "404.html");
    // copyFileSync 本来就会覆盖同名文件，旧的那个删不掉也无所谓
    try {
      rmSync(fallback, { force: true });
    } catch {
      // 忽略：下面直接覆盖
    }
    copyFileSync(source, fallback);
  }
}

console.log(`postbuild: 产物已整理到 ${SITE_DIR}${AT_ROOT ? "（根路径部署）" : ""}`);
