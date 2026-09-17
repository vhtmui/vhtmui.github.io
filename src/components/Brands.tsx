import { cn } from "@/lib/utils";

/**
 * 品牌标识（只负责画图，导航语义由调用方包裹 Link 决定）。
 * 颜色使用 shadcn 主题令牌，随明暗主题自动切换。
 */
export function Brands({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 100"
      role="img"
      aria-label="useless logo"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      {/* 图标：与 logo 同源 */}
      <g transform="translate(10 10) scale(0.5)">
        <rect width="160" height="160" rx="36" className="fill-primary" />
        <path
          d="M48 46 V88 A32 32 0 0 0 112 88 V46"
          fill="none"
          className="stroke-primary-foreground"
          strokeWidth={17}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="112" cy="46" r="12" className="fill-accent" />
      </g>

      {/* 品牌名 */}
      <text
        x="112"
        y="56"
        className="fill-primary"
        fontFamily="Geist, Arial, Helvetica, sans-serif"
        fontSize="56"
        fontWeight="700"
        letterSpacing="-1"
      >
        useless
      </text>

      {/* 副标题 */}
      <text
        x="119"
        y="84"
        className="fill-muted-foreground"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="600"
        letterSpacing="4"
      >
        TECHNOLOGY
      </text>
    </svg>
  );
}

export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      width="160"
      height="160"
      role="img"
      aria-label="useless 科技 logo"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E293B" />
          <stop offset="1" stopColor="#0B1120" />
        </linearGradient>
        <linearGradient id="mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      <rect width="160" height="160" rx="36" fill="url(#bg)" />

      <path
        d="M48 46 V88 A32 32 0 0 0 112 88 V46"
        fill="none"
        stroke="url(#mark)"
        strokeWidth={17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="112" cy="46" r="12" fill="#3B82F6" />
    </svg>
  );
}
