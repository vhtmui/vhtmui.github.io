/**
 * 收掉一侧导航里那块会滑动的底色块（左侧目录树、右侧章节导航共用）。
 *
 * 只把 opacity 置 0 是不够的：色块是绝对定位的，残留的盒子仍然会被算进滚动容器的
 * 可滚动区域 —— 换一篇文章后目录变短，旧盒子还挂在原来的位置上，就会凭空多出一条
 * 滚动条（右侧章节导航最常见：容器只剩几十像素高，色块却还停在下方几百像素处）；
 * 鼠标移上去把色块挪回可视范围，滚动条又消失了。
 *
 * 所以这里连尺寸和位移一起归零：盒子回到容器左上角、面积为 0，不参与溢出计算。
 */
export function hideSlidePill(pill: HTMLElement) {
  // 归零要一步到位：留着过渡慢慢缩，中间那几帧旧盒子仍在撑高度，滚动条照样会闪一下
  pill.style.transition = "none";
  pill.style.opacity = "0";
  pill.style.width = "0px";
  pill.style.height = "0px";
  pill.style.transform = "translate(0px, 0px)";
  void pill.offsetHeight;
  pill.style.transition = "";
}
