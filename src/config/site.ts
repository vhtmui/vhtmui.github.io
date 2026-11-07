/** 站点名：所有页面的 title 都以它收尾 */
export const SITE_NAME = "Useless";

/** 站点默认描述：首页这类没有具体正文的页面用它 */
export const SITE_DESCRIPTION = "个人站点：文档、小工具与组件试验场。";

/**
 * 子页标题：`页面名 | 站点名`，不传页面名就是站点名本身（首页）。
 * 每个路由的 meta 都过这一道，标题格式才不会各写各的。
 */
export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}
