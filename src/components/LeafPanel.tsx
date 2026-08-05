export default function LeafPanel({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 760"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="leafDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c3a2b" />
          <stop offset="100%" stopColor="#0f261b" />
        </linearGradient>
        <linearGradient id="leafMid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2f5c42" />
          <stop offset="100%" stopColor="#1e4230" />
        </linearGradient>
        <linearGradient id="leafLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f7a5c" />
          <stop offset="100%" stopColor="#365f45" />
        </linearGradient>
      </defs>

      <rect width="520" height="760" fill="#f6f7f4" />

      {/* Torn-paper ribbon layers for depth */}
      <path
        d="M120,-20 C40,90 210,150 150,260 C90,370 230,430 170,540 C120,630 220,690 190,780 L520,780 L520,-20 Z"
        fill="#dcdedb"
      />
      <path
        d="M175,-20 C90,100 250,170 195,280 C140,390 265,450 210,560 C165,650 250,700 225,780 L520,780 L520,-20 Z"
        fill="#c7cbc6"
      />
      <path
        d="M230,-20 C150,110 300,190 245,300 C195,405 300,460 250,570 C210,655 275,705 255,780 L520,780 L520,-20 Z"
        fill="url(#leafDark)"
      />

      {/* Large palm frond */}
      <g fill="url(#leafMid)">
        <path d="M260,720 C300,600 330,520 460,430 C440,470 400,500 370,540 C420,500 460,470 500,420 C480,470 440,510 400,550 C450,520 490,490 520,440 C500,500 450,540 400,580 C440,560 470,540 500,500 C480,550 430,590 380,610 C300,650 280,680 260,720 Z" />
      </g>

      {/* Monstera-style leaf */}
      <path
        d="M300,780 C280,660 310,560 400,500 C460,460 500,470 520,440 C510,500 470,540 420,570 C450,570 480,555 505,530 C485,580 440,610 390,615 C420,625 450,615 470,595 C440,650 380,660 345,650 C365,690 340,740 320,780 Z"
        fill="url(#leafLight)"
        opacity="0.9"
      />

      {/* Small fern fronds bottom-left of the green mass */}
      <g stroke="#0f261b" strokeWidth="3" fill="none" opacity="0.5">
        <path d="M245,760 C260,700 250,660 290,610" />
        <path d="M255,690 L285,670 M258,670 L292,655 M262,650 L295,638" />
      </g>
    </svg>
  );
}
