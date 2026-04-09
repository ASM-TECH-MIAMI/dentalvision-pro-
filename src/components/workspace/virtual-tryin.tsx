'use client';

// ---------------------------------------------------------------------------
// Virtual Try-In View
// Shows the designed restorations composited onto a patient face silhouette
// Simulates the Ceramill Mind virtual try-in step
// ---------------------------------------------------------------------------

export default function VirtualTryIn() {
  return (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 500 600" className="w-full h-full">
        <defs>
          {/* Skin tone gradient */}
          <radialGradient id="skin-grad" cx="50%" cy="40%" r="48%">
            <stop offset="0%" stopColor="#E8C8A0" />
            <stop offset="50%" stopColor="#D8B890" />
            <stop offset="80%" stopColor="#C8A880" />
            <stop offset="100%" stopColor="#B89870" />
          </radialGradient>

          {/* Lip gradient */}
          <radialGradient id="lip-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4737E" />
            <stop offset="50%" stopColor="#C4636E" />
            <stop offset="100%" stopColor="#B4535E" />
          </radialGradient>

          {/* Lower lip */}
          <radialGradient id="lower-lip-grad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#D8808A" />
            <stop offset="100%" stopColor="#C06070" />
          </radialGradient>

          {/* Eye */}
          <radialGradient id="iris-grad" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#6B8E5A" />
            <stop offset="70%" stopColor="#4A6B3A" />
            <stop offset="100%" stopColor="#3A5530" />
          </radialGradient>

          {/* Hair */}
          <linearGradient id="hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A2A1A" />
            <stop offset="50%" stopColor="#2A1A0A" />
            <stop offset="100%" stopColor="#1A0A00" />
          </linearGradient>

          {/* Tooth enamel — BL2 shade */}
          <linearGradient id="tryin-enamel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEFCF5" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FCF8EC" />
            <stop offset="100%" stopColor="#F0E8D8" />
          </linearGradient>

          {/* Subtle face shadow */}
          <filter id="face-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="8" />
            <feOffset dy="4" />
            <feComponentTransfer><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
          </filter>

          {/* Soft blur for skin */}
          <filter id="skin-smooth">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>

          {/* Grid */}
          <pattern id="tryin-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(196,162,101,0.03)" strokeWidth="0.3" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="500" height="600" fill="url(#tryin-grid)" />

        {/* ---- Face silhouette ---- */}
        <g transform="translate(250, 270)" filter="url(#face-shadow)">
          {/* Hair */}
          <ellipse cx={0} cy={-120} rx={140} ry={100} fill="url(#hair-grad)" />
          <rect x={-140} y={-120} width={280} height={60} fill="url(#hair-grad)" />

          {/* Face oval */}
          <path
            d={`M 0 -175
              C 75 -175, 130 -140, 130 -80
              C 130 -20, 125 40, 105 80
              C 85 120, 55 150, 0 160
              C -55 150, -85 120, -105 80
              C -125 40, -130 -20, -130 -80
              C -130 -140, -75 -175, 0 -175
              Z`}
            fill="url(#skin-grad)"
            filter="url(#skin-smooth)"
          />

          {/* Forehead highlight */}
          <ellipse cx={-15} cy={-130} rx={60} ry={30} fill="rgba(255,255,255,0.08)" />

          {/* Eyes */}
          {[-50, 50].map((ex) => (
            <g key={ex} transform={`translate(${ex}, -70)`}>
              {/* Eye white */}
              <ellipse cx={0} cy={0} rx={22} ry={12} fill="#F5F0EA" />
              {/* Iris */}
              <circle cx={0} cy={0} r={10} fill="url(#iris-grad)" />
              {/* Pupil */}
              <circle cx={0} cy={0} r={5} fill="#1A1A1A" />
              {/* Catchlight */}
              <circle cx={3} cy={-3} r={2} fill="rgba(255,255,255,0.7)" />
              {/* Eyelid line */}
              <path
                d={`M -22 0 C -15 -14, 15 -14, 22 0`}
                fill="none"
                stroke="rgba(100,70,50,0.5)"
                strokeWidth="1"
              />
              {/* Lower lid */}
              <path
                d={`M -20 2 C -10 10, 10 10, 20 2`}
                fill="none"
                stroke="rgba(100,70,50,0.2)"
                strokeWidth="0.5"
              />
              {/* Eyebrow */}
              <path
                d={`M ${ex < 0 ? -28 : -22} -22 C ${ex < 0 ? -10 : -5} -30, ${ex < 0 ? 10 : 15} -28, ${ex < 0 ? 22 : 28} -20`}
                fill="none"
                stroke="rgba(60,40,25,0.6)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Nose */}
          <path
            d={`M -2 -50 C -2 -30, -3 -10, -4 10
              C -15 18, -18 22, -12 28
              C -5 32, 5 32, 12 28
              C 18 22, 15 18, 4 10
              C 3 -10, 2 -30, 2 -50`}
            fill="none"
            stroke="rgba(160,120,80,0.25)"
            strokeWidth="1"
          />
          {/* Nostrils */}
          <ellipse cx={-10} cy={25} rx={6} ry={3.5} fill="rgba(140,100,70,0.2)" />
          <ellipse cx={10} cy={25} rx={6} ry={3.5} fill="rgba(140,100,70,0.2)" />

          {/* ---- Mouth / Smile (open smile showing designed teeth) ---- */}
          {/* Upper lip */}
          <path
            d={`M -60 55
              C -50 48, -25 42, -8 40
              C -3 36, 0 34, 3 36
              C 8 40, 25 42, 50 48
              C 55 50, 60 55, 60 55`}
            fill="url(#lip-grad)"
            stroke="rgba(180,80,90,0.3)"
            strokeWidth="0.5"
          />

          {/* Lower lip */}
          <path
            d={`M -58 56
              C -40 78, -20 88, 0 90
              C 20 88, 40 78, 58 56`}
            fill="url(#lower-lip-grad)"
            stroke="rgba(180,80,90,0.3)"
            strokeWidth="0.5"
          />

          {/* Mouth opening (dark cavity behind teeth) */}
          <path
            d={`M -55 55
              C -40 50, -20 46, 0 45
              C 20 46, 40 50, 55 55
              L 55 58
              C 40 72, 20 78, 0 80
              C -20 78, -40 72, -55 58
              Z`}
            fill="#2A1A15"
          />

          {/* ---- Upper teeth (designed veneers — BL2 shade) ---- */}
          {[
            { x: -46, w: 11, h: 13, label: '#6' },
            { x: -34, w: 12, h: 14, label: '#7' },
            { x: -20, w: 15, h: 16, label: '#8' },
            { x: -4,  w: 15, h: 16, label: '#9' },
            { x: 12,  w: 12, h: 14, label: '#10' },
            { x: 25,  w: 11, h: 13, label: '#11' },
          ].map((tooth, i) => (
            <g key={i}>
              <rect
                x={tooth.x}
                y={48}
                width={tooth.w}
                height={tooth.h}
                rx={2}
                fill="url(#tryin-enamel)"
                stroke="rgba(220,215,200,0.5)"
                strokeWidth="0.3"
              />
              {/* Subtle tooth separator */}
              {i < 5 && (
                <line
                  x1={tooth.x + tooth.w}
                  y1={49}
                  x2={tooth.x + tooth.w}
                  y2={48 + tooth.h - 1}
                  stroke="rgba(200,190,170,0.3)"
                  strokeWidth="0.3"
                />
              )}
              {/* Incisal edge translucency */}
              <rect
                x={tooth.x + 1}
                y={48}
                width={tooth.w - 2}
                height={3}
                rx={1}
                fill="rgba(200,210,220,0.15)"
              />
            </g>
          ))}

          {/* Lower teeth (partially visible) */}
          {[
            { x: -40, w: 10, h: 8 },
            { x: -29, w: 11, h: 9 },
            { x: -16, w: 13, h: 10 },
            { x: -2,  w: 13, h: 10 },
            { x: 12,  w: 11, h: 9 },
            { x: 24,  w: 10, h: 8 },
          ].map((tooth, i) => (
            <rect
              key={`lower-${i}`}
              x={tooth.x}
              y={66}
              width={tooth.w}
              height={tooth.h}
              rx={1.5}
              fill="#F0E8D8"
              stroke="rgba(220,215,200,0.3)"
              strokeWidth="0.2"
              opacity="0.8"
            />
          ))}

          {/* Nasolabial folds */}
          <path d="M -45 20 C -48 35, -55 48, -62 58" fill="none" stroke="rgba(160,120,80,0.12)" strokeWidth="1" />
          <path d="M 45 20 C 48 35, 55 48, 62 58" fill="none" stroke="rgba(160,120,80,0.12)" strokeWidth="1" />

          {/* Chin */}
          <ellipse cx={0} cy={130} rx={35} ry={20} fill="rgba(255,255,255,0.04)" />
        </g>

        {/* ---- Overlay guides ---- */}
        <g opacity="0.4">
          {/* Facial midline */}
          <line x1="250" y1="60" x2="250" y2="480" stroke="#C4A265" strokeWidth="0.5" strokeDasharray="6 4" />

          {/* Smile arc guide */}
          <path
            d={`M 195 322 C 210 320, 240 318, 250 318 C 260 318, 290 320, 305 322`}
            fill="none"
            stroke="#C4A265"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />
          <text x="315" y="325" fontSize="7" fontFamily="monospace" fill="#C4A265">SMILE ARC</text>

          {/* Interpupillary line */}
          <line x1="175" y1="200" x2="325" y2="200" stroke="#C4A265" strokeWidth="0.5" strokeDasharray="4 4" />
          <text x="335" y="203" fontSize="7" fontFamily="monospace" fill="#C4A265">IPL</text>

          {/* Lip line */}
          <line x1="185" y1="318" x2="315" y2="318" stroke="rgba(100,200,255,0.4)" strokeWidth="0.5" strokeDasharray="3 3" />
          <text x="325" y="320" fontSize="7" fontFamily="monospace" fill="rgba(100,200,255,0.5)">LIP LINE</text>
        </g>

        {/* ---- Before/After comparison guide ---- */}
        <g transform="translate(250, 540)">
          <rect x={-120} y={-14} width={240} height={28} rx={14} fill="rgba(20,20,20,0.8)" stroke="rgba(196,162,101,0.2)" strokeWidth="0.5" />
          <text x={-80} y={4} fontSize="8" fontFamily="monospace" fill="#888">BEFORE</text>
          <line x1={0} y1={-8} x2={0} y2={8} stroke="rgba(196,162,101,0.4)" strokeWidth="0.5" />
          <text x={30} y={4} fontSize="8" fontFamily="monospace" fill="#C4A265">AFTER (BL2)</text>
          {/* Shade swatches */}
          <rect x={80} y={-5} width={14} height={10} rx={2} fill="#EEDBB5" stroke="rgba(196,162,101,0.3)" strokeWidth="0.5" />
          <text x={87} y={16} textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#888">A2</text>
          <text x={100} y={4} fontSize="8" fill="#C4A265">→</text>
          <rect x={105} y={-5} width={14} height={10} rx={2} fill="#FCF8EC" stroke="rgba(196,162,101,0.4)" strokeWidth="0.5" />
          <text x={112} y={16} textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#C4A265">BL2</text>
        </g>

        {/* Title */}
        <text x="250" y="25" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(196,162,101,0.5)" letterSpacing="3">
          VIRTUAL TRY-IN — SMILE SIMULATION
        </text>
        <text x="250" y="40" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(196,162,101,0.3)">
          JONATHAN CARDENES | 8 VENEERS + 2 IMPLANT CROWNS | SHADE BL2
        </text>

        {/* Confidence badge */}
        <g transform="translate(440, 570)">
          <rect x={-40} y={-10} width={80} height={20} rx={10} fill="rgba(196,162,101,0.1)" stroke="rgba(196,162,101,0.3)" strokeWidth="0.5" />
          <text x={0} y={4} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#C4A265">AI 96.2%</text>
        </g>
      </svg>
    </div>
  );
}
