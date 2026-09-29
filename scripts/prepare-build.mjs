import { stash } from "./stash.mjs";

/**
 * 构建前把上次的产物挪出工作区。
 *
 * 框架构建时会清理 build 与 .react-router/types，而本机不允许删除工作区目录
 * （见 scripts/stash.mjs 的说明），提前挪走就不会走到那一步。
 */
stash("build");
stash(".react-router");

console.log("prepare-build: 上一次的构建产物已移出工作区");
