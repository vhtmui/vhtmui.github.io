import { cn } from "@/lib/utils";

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
        y="62"
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
        y="86"
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

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      role="img"
      aria-label="useless tech logo"
      className={cn("h-full w-full shrink-0", className)}
    >
      <g>
        <path
          d="M48 46 V88 A32 32 0 0 0 112 88 V46"
          fill="none"
          className="stroke-foreground"
          strokeWidth={17}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="112" cy="46" r="12" className="fill-accent" />
      </g>
    </svg>
  );
}
