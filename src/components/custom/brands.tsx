import { cn } from "@/lib/utils";

export function Brands({
  showName = true,
  className,
}: {
  showName?: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showName ? "0 0 360 100" : "0 0 100 100"}
      role="img"
      aria-label="useless logo"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      {/* 图标：与 logo 同源 */}
      <g transform="translate(10 15) scale(0.6)">
        <rect width="120" height="120" rx="28" fill="#8b008b" />

        <path
          d="M 38 34 V 66 A 22 22 0 0 0 82 66 V 60"
          stroke="#FFFFFF"
          stroke-width="12"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />

        <rect x="76" y="28" width="12" height="20" rx="6" fill="#111111" />
      </g>

      {showName && (
        <>
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
            className="fill-primary"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="14"
            fontWeight="600"
            letterSpacing="4"
          >
            TECHNOLOGY
          </text>
        </>
      )}
    </svg>
  );
}
