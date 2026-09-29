import { existsSync, mkdirSync, renameSync } from "node:fs";
import { basename, resolve } from "node:path";

/**
 * 把不需要的目录挪到暂存区，而不是删掉。
 *
 * 本机（CodeBuddy 沙箱）给 node 注入了 safe-delete：工作区里的**目录**删除会被
 * 改写成"移入回收站"，而回收站对这些目录会失败，于是框架构建时的清理
 * （删 build、删 .react-router/types）会直接把构建打断。移动不受影响，
 * 所以统一用移动代替删除。
 *
 * 暂存区与项目同级（同盘，重命名是瞬时的），换到普通环境后可以忽略；
 * 想清理直接删 ../my_site-stale 即可。
 */

/** 暂存目录：与项目同级，避免跨盘重命名失败 */
export const STAGING = resolve("../my_site-stale");

let counter = 0;

/** 把 target 挪进暂存区；target 不存在时什么也不做 */
export function stash(target) {
  const from = resolve(target);
  if (!existsSync(from)) return;

  mkdirSync(STAGING, { recursive: true });

  const name = `${basename(from)}-${Date.now().toString(36)}-${counter++}`;
  renameSync(from, resolve(STAGING, name));
}
