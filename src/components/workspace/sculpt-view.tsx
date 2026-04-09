'use client';

import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Sculpt View — Close-up single tooth with sculpting detail
// Simulates Ceramill Mind free-form sculpting of a veneer
// ---------------------------------------------------------------------------

interface Props {
  toothNumber: number;
  shade: string;
}

const SHADE_HEX: Record<string, string> = {
  BL2: '#FCF8EC',
  BL1: '#FEFCF5',
  A1: '#F5E6C8',
  A2: '#EEDBB5',
};

export default function SculptView({ toothNumber, shade }: Props) {
  const color = SHADE_HEX[shade] ?? '#EEDBB5';

  // Determine tooth shape parameters
  const isCentral = toothNumber === 8 || toothNumber === 9;
  const isLateral = toothNumber === 7 || toothNumber === 10;
  const isCuspid = toothNumber === 6 || toothNumber === 11;

  const { w, h, label } = useMemo(() => {
    if (isCentral) return { w: 120, h: 160, label: 'Central Incisor' };
    if (isLateral) return { w: 100, h: 150, label: 'Lateral Incisor' };
    if (isCuspid) return { w: 105, h: 155, label: 'Cuspid' };
    return { w: 110, h: 150, label: `Tooth #${toothNumber}` };
  }, [isCentral, isLateral, isCuspid, toothNumber]);

  return (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 400 500" className="w-full h-full">
        <defs>
          {/* Grid */}
          <pattern id="sculpt-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(196,162,101,0.05)" strokeWidth="0.3" />
          </pattern>
          <pattern id="sculpt-grid-major" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(196,162,101,0.1)" strokeWidth="0.5" />
          </pattern>

          {/* Tooth gradient - buccal view */}
          <linearGradient id="sculpt-tooth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="30%" stopColor={color} stopOpacity="0.95" />
            <stop offset="60%" stopColor={`${color}DD`} />
            <stop offset="100%" stopColor={`${color}BB`} />
          </linearGradient>

          {/* Translucency gradient for incisal edge */}
          <linearGradient id="incisal-trans" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(200,210,220,0.15)" />
            <stop offset="100%" stopColor="rgba(200,210,220,0)" />
          </linearGradient>

          {/* Enamel reflection */}
          <radialGradient id="enamel-reflect" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="sculpt-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Shadow */}
          <filter id="sculpt-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
            <feOffset dy="4" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
          </filter>

          {/* Prep stump gradient */}
          <linearGradient id="prep-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B08A" />
            <stop offset="50%" stopColor="#B5A07A" />
            <stop offset="100%" stopColor="#A8936D" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="400" height="500" fill="url(#sculpt-grid)" />
        <rect width="400" height="500" fill="url(#sculpt-grid-major)" />

        {/* Crosshair */}
        <line x1="200" y1="0" x2="200" y2="500" stroke="rgba(196,162,101,0.06)" strokeWidth="0.5" />
        <line x1="0" y1="250" x2="400" y2="250" stroke="rgba(196,162,101,0.06)" strokeWidth="0.5" />

        {/* ---- Prep stump (behind the veneer) ---- */}
        <g transform="translate(200, 260)">
          {/* Prep stump body - slightly smaller than veneer */}
          <path
            d={`M ${-w * 0.35} ${-h * 0.42}
              C ${-w * 0.42} ${-h * 0.3} ${-w * 0.45} ${-h * 0.1} ${-w * 0.45} ${0}
              C ${-w * 0.45} ${h * 0.15} ${-w * 0.42} ${h * 0.35} ${-w * 0.3} ${h * 0.45}
              L ${w * 0.3} ${h * 0.45}
              C ${w * 0.42} ${h * 0.35} ${w * 0.45} ${h * 0.15} ${w * 0.45} ${0}
              C ${w * 0.45} ${-h * 0.1} ${w * 0.42} ${-h * 0.3} ${w * 0.35} ${-h * 0.42}
              Z`}
            fill="url(#prep-grad)"
            stroke="#A89070"
            strokeWidth="0.8"
            opacity="0.5"
          />
        </g>

        {/* ---- Designed veneer (main tooth) ---- */}
        <g transform="translate(200, 250)" filter="url(#sculpt-shadow)">
          {/* Main body */}
          <path
            d={`M ${-w * 0.3} ${-h * 0.48}
              C ${-w * 0.48} ${-h * 0.4} ${-w * 0.5} ${-h * 0.2} ${-w * 0.5} ${0}
              C ${-w * 0.5} ${h * 0.2} ${-w * 0.46} ${h * 0.42} ${-w * 0.25} ${h * 0.48}
              L ${w * 0.25} ${h * 0.48}
              C ${w * 0.46} ${h * 0.42} ${w * 0.5} ${h * 0.2} ${w * 0.5} ${0}
              C ${w * 0.5} ${-h * 0.2} ${w * 0.48} ${-h * 0.4} ${w * 0.3} ${-h * 0.48}
              Z`}
            fill="url(#sculpt-tooth-grad)"
            stroke="rgba(196,162,101,0.6)"
            strokeWidth="1.5"
          />

          {/* Enamel reflection highlight */}
          <path
            d={`M ${-w * 0.2} ${-h * 0.45}
              C ${-w * 0.35} ${-h * 0.35} ${-w * 0.38} ${-h * 0.1} ${-w * 0.35} ${h * 0.1}
              C ${-w * 0.3} ${h * 0.2} ${-w * 0.15} ${h * 0.15} ${0} ${-h * 0.1}
              C ${w * 0.1} ${-h * 0.25} ${-w * 0.05} ${-h * 0.42} ${-w * 0.2} ${-h * 0.45}
              Z`}
            fill="url(#enamel-reflect)"
          />

          {/* Incisal translucency zone */}
          <rect
            x={-w * 0.4}
            y={-h * 0.48}
            width={w * 0.8}
            height={h * 0.15}
            rx={8}
            fill="url(#incisal-trans)"
          />

          {/* Surface texture lines - developmental lobes */}
          <path
            d={`M ${-w * 0.12} ${-h * 0.4} C ${-w * 0.14} ${-h * 0.2} ${-w * 0.12} ${h * 0.1} ${-w * 0.1} ${h * 0.35}`}
            fill="none"
            stroke="rgba(180,170,150,0.12)"
            strokeWidth="0.8"
          />
          <path
            d={`M ${w * 0.12} ${-h * 0.4} C ${w * 0.14} ${-h * 0.2} ${w * 0.12} ${h * 0.1} ${w * 0.1} ${h * 0.35}`}
            fill="none"
            stroke="rgba(180,170,150,0.12)"
            strokeWidth="0.8"
          />

          {/* Mamelons at incisal edge */}
          {[- w * 0.18, 0, w * 0.18].map((mx, i) => (
            <ellipse
              key={i}
              cx={mx}
              cy={-h * 0.38}
              rx={w * 0.08}
              ry={h * 0.06}
              fill="none"
              stroke="rgba(180,170,150,0.1)"
              strokeWidth="0.6"
            />
          ))}

          {/* CEJ line (cervical margin) */}
          <path
            d={`M ${-w * 0.35} ${h * 0.4}
              C ${-w * 0.2} ${h * 0.46} ${0} ${h * 0.48} ${w * 0.2} ${h * 0.46}
              C ${w * 0.32} ${h * 0.43} ${w * 0.38} ${h * 0.4} ${w * 0.35} ${h * 0.38}`}
            fill="none"
            stroke="#E88B95"
            strokeWidth="1"
            opacity="0.5"
            strokeDasharray="3 2"
          />

          {/* Margin line */}
          <path
            d={`M ${-w * 0.42} ${h * 0.44}
              C ${-w * 0.25} ${h * 0.5} ${0} ${h * 0.52} ${w * 0.25} ${h * 0.5}
              C ${w * 0.38} ${h * 0.47} ${w * 0.44} ${h * 0.42} ${w * 0.42} ${h * 0.38}`}
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.7"
          />
        </g>

        {/* ---- Sculpting control points ---- */}
        <g transform="translate(200, 250)" opacity="0.6">
          {[
            { x: -w * 0.5, y: 0, label: 'B' },
            { x: w * 0.5, y: 0, label: 'L' },
            { x: 0, y: -h * 0.48, label: 'I' },
            { x: 0, y: h * 0.48, label: 'G' },
            { x: -w * 0.35, y: -h * 0.35, label: '' },
            { x: w * 0.35, y: -h * 0.35, label: '' },
            { x: -w * 0.35, y: h * 0.35, label: '' },
            { x: w * 0.35, y: h * 0.35, label: '' },
          ].map((cp, i) => (
            <g key={i}>
              <circle cx={cp.x} cy={cp.y} r={cp.label ? 6 : 3.5} fill="none" stroke="#C4A265" strokeWidth="1" />
              <circle cx={cp.x} cy={cp.y} r="1.5" fill="#C4A265" />
              {cp.label && (
                <text x={cp.x} y={cp.y + 3} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#C4A265">
                  {cp.label}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* ---- Dimension annotations ---- */}
        <g transform="translate(200, 250)" opacity="0.6">
          {/* Width */}
          <line x1={-w * 0.5} y1={-h * 0.56} x2={w * 0.5} y2={-h * 0.56} stroke="#C4A265" strokeWidth="0.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <line x1={-w * 0.5} y1={-h * 0.52} x2={-w * 0.5} y2={-h * 0.58} stroke="#C4A265" strokeWidth="0.5" />
          <line x1={w * 0.5} y1={-h * 0.52} x2={w * 0.5} y2={-h * 0.58} stroke="#C4A265" strokeWidth="0.5" />
          <rect x={-18} y={-h * 0.56 - 8} width={36} height={14} rx={3} fill="rgba(20,20,20,0.9)" stroke="rgba(196,162,101,0.3)" strokeWidth="0.5" />
          <text x={0} y={-h * 0.56 + 2} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#C4A265">
            {isCentral ? '8.6mm' : isLateral ? '6.8mm' : '7.5mm'}
          </text>

          {/* Height */}
          <line x1={w * 0.58} y1={-h * 0.48} x2={w * 0.58} y2={h * 0.48} stroke="#C4A265" strokeWidth="0.5" />
          <line x1={w * 0.54} y1={-h * 0.48} x2={w * 0.62} y2={-h * 0.48} stroke="#C4A265" strokeWidth="0.5" />
          <line x1={w * 0.54} y1={h * 0.48} x2={w * 0.62} y2={h * 0.48} stroke="#C4A265" strokeWidth="0.5" />
          <g transform={`translate(${w * 0.58}, 0) rotate(90)`}>
            <rect x={-20} y={-9} width={40} height={14} rx={3} fill="rgba(20,20,20,0.9)" stroke="rgba(196,162,101,0.3)" strokeWidth="0.5" />
            <text x={0} y={1} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#C4A265">
              {isCentral ? '10.8mm' : isLateral ? '9.2mm' : '10.0mm'}
            </text>
          </g>
        </g>

        {/* Title */}
        <g transform="translate(200, 28)">
          <text textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(196,162,101,0.5)" letterSpacing="3">
            SCULPT — #{toothNumber} {label.toUpperCase()}
          </text>
          <text textAnchor="middle" y="16" fontSize="8" fontFamily="monospace" fill="rgba(196,162,101,0.3)">
            SHADE: {shade} | MATERIAL: LITHIUM DISILICATE
          </text>
        </g>

        {/* Tool palette indicator */}
        <g transform="translate(20, 60)">
          <rect width="36" height="180" rx="6" fill="rgba(20,20,20,0.6)" stroke="rgba(196,162,101,0.15)" strokeWidth="0.5" />
          {['M18 9 L18 27', 'M12 18 C12 14 24 14 24 18', 'M14 18 L22 18 M18 14 L18 22', 'M18 12 A6 6 0 1 1 18 24', 'M12 15 L24 21 M12 21 L24 15'].map((d, i) => (
            <g key={i} transform={`translate(0, ${i * 34 + 8})`}>
              <rect x={4} y={0} width={28} height={28} rx={4} fill={i === 0 ? 'rgba(196,162,101,0.15)' : 'transparent'} stroke={i === 0 ? 'rgba(196,162,101,0.4)' : 'transparent'} strokeWidth="0.5" />
              <path d={d} fill="none" stroke={i === 0 ? '#C4A265' : '#666'} strokeWidth="1.2" strokeLinecap="round" transform="translate(-4, -4) scale(0.78)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
