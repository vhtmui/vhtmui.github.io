export function Brands({href = ""}) {
  return (
    <a href={href}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 100"
        role="img"
        aria-label="useless logo"
        className="h-10 w-auto shrink-0"
      >
        {/* 图标：与 logo 同源 */}
        <g transform="translate(10 10) scale(0.5)">
          <rect width="160" height="160" rx="36" className="fill-primary" />
          <path
            d="M48 46 V88 A32 32 0 0 0 112 88 V46"
            fill="none"
            className="stroke-primary-content"
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
          className="fill-base-content"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="14"
          fontWeight="600"
          letterSpacing="4"
        >
          TECHNOLOGY
        </text>
      </svg>
    </a>
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
          <stop offset="0" stop-color="#1E293B" />
          <stop offset="1" stop-color="#0B1120" />
        </linearGradient>
        <linearGradient id="mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" />
          <stop offset="1" stop-color="#CBD5E1" />
        </linearGradient>
      </defs>

      <rect width="160" height="160" rx="36" fill="url(#bg)" />

      <path
        d="M48 46 V88 A32 32 0 0 0 112 88 V46"
        fill="none"
        stroke="url(#mark)"
        stroke-width="17"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <circle cx="112" cy="46" r="12" fill="#3B82F6" />
    </svg>
  );
}
