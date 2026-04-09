'use client';

// ---------------------------------------------------------------------------
// Framework Verification View
// Shows the surgical guide / framework fitting over the dental model
// Simulates Ceramill Mind framework design verification
// ---------------------------------------------------------------------------

export default function FrameworkView() {
  return (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 500 480" className="w-full h-full">
        <defs>
          {/* Grid */}
          <pattern id="fw-grid" width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(100,200,255,0.04)" strokeWidth="0.3" />
          </pattern>
          <pattern id="fw-grid-major" width="75" height="75" patternUnits="userSpaceOnUse">
            <path d="M 75 0 L 0 0 0 75" fill="none" stroke="rgba(100,200,255,0.08)" strokeWidth="0.5" />
          </pattern>

          {/* Titanium material gradient */}
          <linearGradient id="titanium-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8B4C0" />
            <stop offset="30%" stopColor="#8C9CAC" />
            <stop offset="60%" stopColor="#7A8A9A" />
            <stop offset="100%" stopColor="#6B7B8B" />
          </linearGradient>

          {/* Zirconia framework gradient */}
          <linearGradient id="zirconia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8E4DD" />
            <stop offset="50%" stopColor="#D8D2C8" />
            <stop offset="100%" stopColor="#C8C0B4" />
          </linearGradient>

          {/* Model stone gradient */}
          <radialGradient id="stone-grad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#E8DFD2" />
            <stop offset="60%" stopColor="#D4C8B8" />
            <stop offset="100%" stopColor="#BFB3A2" />
          </radialGradient>

          {/* Implant metal */}
          <linearGradient id="implant-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B0B8C4" />
            <stop offset="30%" stopColor="#D0D8E0" />
            <stop offset="50%" stopColor="#C0C8D0" />
            <stop offset="70%" stopColor="#D0D8E0" />
            <stop offset="100%" stopColor="#B0B8C4" />
          </linearGradient>

          {/* Shadow */}
          <filter id="fw-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
            <feOffset dy="3" />
            <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
          </filter>

          {/* Wireframe glow */}
          <filter id="wire-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in="SourceGraphic" in2="" operator="over" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="500" height="480" fill="url(#fw-grid)" />
        <rect width="500" height="480" fill="url(#fw-grid-major)" />

        {/* ---- Stone model base (horseshoe shape) ---- */}
        <g transform="translate(250, 260)" filter="url(#fw-shadow)">
          {/* Outer arch of stone model */}
          <path
            d={`M -180 40
              C -180 -20, -160 -80, -120 -120
              C -80 -160, -30 -180, 0 -185
              C 30 -180, 80 -160, 120 -120
              C 160 -80, 180 -20, 180 40
              L 150 40
              C 150 -5, 135 -55, 100 -95
              C 65 -135, 25 -150, 0 -155
              C -25 -150, -65 -135, -100 -95
              C -135 -55, -150 -5, -150 40
              Z`}
            fill="url(#stone-grad)"
            stroke="rgba(160,148,128,0.5)"
            strokeWidth="1"
          />

          {/* Die spacer regions (individual tooth stumps) */}
          {[
            { cx: -120, cy: -60, angle: -25, w: 28, h: 32 },
            { cx: -95,  cy: -95, angle: -15, w: 26, h: 30 },
            { cx: -62,  cy: -120, angle: -8, w: 28, h: 34 },
            { cx: -28,  cy: -138, angle: -3, w: 30, h: 36 },
            { cx: 0,    cy: -142, angle: 0,  w: 34, h: 38 },
            { cx: 28,   cy: -138, angle: 3,  w: 30, h: 36 },
            { cx: 62,   cy: -120, angle: 8,  w: 28, h: 34 },
            { cx: 95,   cy: -95, angle: 15,  w: 26, h: 30 },
            { cx: 120,  cy: -60, angle: 25,  w: 28, h: 32 },
          ].map((stump, i) => (
            <g key={i} transform={`translate(${stump.cx}, ${stump.cy}) rotate(${stump.angle})`}>
              {/* Stump body */}
              <rect
                x={-stump.w / 2}
                y={-stump.h / 2}
                width={stump.w}
                height={stump.h}
                rx={4}
                fill="#C4B898"
                stroke="#B0A480"
                strokeWidth="0.8"
              />
              {/* Chamfer margin (red line) */}
              <rect
                x={-stump.w / 2 - 1}
                y={-stump.h / 2 - 1}
                width={stump.w + 2}
                height={stump.h + 2}
                rx={5}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="0.8"
                strokeDasharray="3 2"
                opacity="0.6"
              />
            </g>
          ))}

          {/* Implant fixtures (#19 and #30 positions) */}
          {[
            { cx: -145, cy: 10, angle: 30 },
            { cx: 145,  cy: 10, angle: -30 },
          ].map((impl, i) => (
            <g key={`impl-${i}`} transform={`translate(${impl.cx}, ${impl.cy}) rotate(${impl.angle})`}>
              {/* Fixture body */}
              <rect x={-6} y={-18} width={12} height={36} rx={3} fill="url(#implant-metal)" stroke="#8090A0" strokeWidth="0.8" />
              {/* Thread detail */}
              {[-12, -6, 0, 6, 12].map((ty) => (
                <line key={ty} x1={-6} y1={ty} x2={6} y2={ty + 2} stroke="rgba(128,144,160,0.4)" strokeWidth="0.5" />
              ))}
              {/* Abutment */}
              <rect x={-4} y={-24} width={8} height={8} rx={2} fill="#C0C8D0" stroke="#A0A8B0" strokeWidth="0.5" />
              {/* Screw access */}
              <circle cx={0} cy={-20} r={1.5} fill="#8090A0" />
              {/* Label */}
              <text x={0} y={-32} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(100,200,255,0.7)">
                {i === 0 ? '#19' : '#30'}
              </text>
            </g>
          ))}
        </g>

        {/* ---- Framework wireframe overlay ---- */}
        <g transform="translate(250, 260)" opacity="0.7" filter="url(#wire-glow)">
          {/* Framework outline — follows the arch */}
          <path
            d={`M -130 -45
              C -115 -85, -80 -118, -55 -132
              C -30 -146, -10 -152, 0 -155
              C 10 -152, 30 -146, 55 -132
              C 80 -118, 115 -85, 130 -45`}
            fill="none"
            stroke="rgba(100,200,255,0.5)"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />

          {/* Connector bars */}
          {[
            { x1: -90, y1: -80, x2: -60, y2: -110 },
            { x1: -30, y1: -130, x2: 30, y2: -130 },
            { x1: 60, y1: -110, x2: 90, y2: -80 },
          ].map((bar, i) => (
            <line
              key={i}
              x1={bar.x1}
              y1={bar.y1}
              x2={bar.x2}
              y2={bar.y2}
              stroke="rgba(100,200,255,0.4)"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          ))}

          {/* Fit verification dots — green = good fit */}
          {[
            { cx: -120, cy: -60 },
            { cx: -62, cy: -120 },
            { cx: 0, cy: -142 },
            { cx: 62, cy: -120 },
            { cx: 120, cy: -60 },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r="4" fill="none" stroke="#34D399" strokeWidth="1" />
              <circle cx={pt.cx} cy={pt.cy} r="1.5" fill="#34D399" />
            </g>
          ))}
        </g>

        {/* ---- Status readout ---- */}
        <g transform="translate(380, 60)">
          <rect x={-55} y={-15} width={110} height={130} rx={6} fill="rgba(15,15,15,0.85)" stroke="rgba(100,200,255,0.2)" strokeWidth="0.5" />
          <text x={0} y={0} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(100,200,255,0.7)" letterSpacing="1.5">FIT CHECK</text>

          {[
            { label: 'Marginal Gap', value: '28μm', status: 'pass' },
            { label: 'Occlusal', value: '42μm', status: 'pass' },
            { label: 'Axial', value: '35μm', status: 'pass' },
            { label: 'Internal', value: '55μm', status: 'pass' },
            { label: 'Contacts', value: 'OK', status: 'pass' },
          ].map((item, i) => (
            <g key={i} transform={`translate(0, ${i * 20 + 18})`}>
              <text x={-45} y={0} fontSize="7" fontFamily="monospace" fill="#888">{item.label}</text>
              <text x={40} y={0} textAnchor="end" fontSize="7" fontFamily="monospace" fill={item.status === 'pass' ? '#34D399' : '#F87171'}>{item.value}</text>
              <circle cx={48} cy={-3} r={2.5} fill={item.status === 'pass' ? '#34D399' : '#F87171'} />
            </g>
          ))}
        </g>

        {/* ---- Gap analysis color map ---- */}
        <g transform="translate(35, 420)">
          <rect x={0} y={0} width={120} height={40} rx={4} fill="rgba(15,15,15,0.85)" stroke="rgba(100,200,255,0.15)" strokeWidth="0.5" />
          <text x={60} y={12} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(100,200,255,0.6)" letterSpacing="1">GAP MAP (μm)</text>
          {/* Color scale */}
          {[
            { color: '#22C55E', label: '0' },
            { color: '#84CC16', label: '25' },
            { color: '#EAB308', label: '50' },
            { color: '#F97316', label: '75' },
            { color: '#EF4444', label: '100' },
          ].map((c, i) => (
            <g key={i} transform={`translate(${i * 22 + 8}, 20)`}>
              <rect width={18} height={8} rx={1} fill={c.color} opacity="0.7" />
              <text x={9} y={18} textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#888">{c.label}</text>
            </g>
          ))}
        </g>

        {/* Title */}
        <text x="250" y="22" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(100,200,255,0.5)" letterSpacing="3">
          FRAMEWORK VERIFICATION — FIT ANALYSIS
        </text>
        <text x="250" y="36" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(100,200,255,0.3)">
          ZIRCONIA FRAMEWORK | 9 UNITS + 2 IMPLANT ABUTMENTS
        </text>

        {/* Pass/fail badge */}
        <g transform="translate(250, 460)">
          <rect x={-50} y={-12} width={100} height={24} rx={12} fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1" />
          <circle cx={-32} cy={0} r={4} fill="#22C55E" />
          <text x={6} y={4} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#22C55E" letterSpacing="1">PASS</text>
        </g>
      </svg>
    </div>
  );
}
