'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToothModel {
  id: number;
  label: string;
  cx: number;
  cy: number;
  angle: number;
  width: number;
  height: number;
  type: 'veneer' | 'implant-crown' | 'natural' | 'prep';
  shade: string;
}

interface Props {
  activeView: 'arch' | 'sculpt' | 'framework' | 'tryin';
  selectedTooth: number | null;
  onSelectTooth: (id: number | null) => void;
  showMeasurements: boolean;
  showMargins: boolean;
}

// ---------------------------------------------------------------------------
// Tooth data for Jonathan Cardenes case: 8 veneers + 2 implant crowns
// Upper arch: #3-#14, Lower: #19-#30
// ---------------------------------------------------------------------------

const UPPER_TEETH: ToothModel[] = [
  { id: 3,  label: '#3',  cx: 98,  cy: 225, angle: -35, width: 42, height: 48, type: 'natural', shade: 'A2' },
  { id: 4,  label: '#4',  cx: 120, cy: 190, angle: -28, width: 36, height: 42, type: 'natural', shade: 'A2' },
  { id: 5,  label: '#5',  cx: 140, cy: 160, angle: -20, width: 34, height: 40, type: 'natural', shade: 'A2' },
  { id: 6,  label: '#6',  cx: 162, cy: 132, angle: -12, width: 36, height: 44, type: 'veneer',  shade: 'BL2' },
  { id: 7,  label: '#7',  cx: 192, cy: 112, angle: -6,  width: 34, height: 46, type: 'veneer',  shade: 'BL2' },
  { id: 8,  label: '#8',  cx: 228, cy: 102, angle: 0,   width: 40, height: 50, type: 'veneer',  shade: 'BL2' },
  { id: 9,  label: '#9',  cx: 272, cy: 102, angle: 0,   width: 40, height: 50, type: 'veneer',  shade: 'BL2' },
  { id: 10, label: '#10', cx: 308, cy: 112, angle: 6,   width: 34, height: 46, type: 'veneer',  shade: 'BL2' },
  { id: 11, label: '#11', cx: 338, cy: 132, angle: 12,  width: 36, height: 44, type: 'veneer',  shade: 'BL2' },
  { id: 12, label: '#12', cx: 360, cy: 160, angle: 20,  width: 34, height: 40, type: 'natural', shade: 'A2' },
  { id: 13, label: '#13', cx: 380, cy: 190, angle: 28,  width: 36, height: 42, type: 'natural', shade: 'A2' },
  { id: 14, label: '#14', cx: 402, cy: 225, angle: 35,  width: 42, height: 48, type: 'natural', shade: 'A2' },
];

const LOWER_TEETH: ToothModel[] = [
  { id: 19, label: '#19', cx: 108, cy: 360, angle: 35,  width: 42, height: 48, type: 'implant-crown', shade: 'BL2' },
  { id: 20, label: '#20', cx: 128, cy: 330, angle: 28,  width: 36, height: 42, type: 'natural', shade: 'A2' },
  { id: 21, label: '#21', cx: 148, cy: 305, angle: 20,  width: 34, height: 40, type: 'natural', shade: 'A2' },
  { id: 22, label: '#22', cx: 168, cy: 285, angle: 12,  width: 34, height: 42, type: 'veneer',  shade: 'BL2' },
  { id: 23, label: '#23', cx: 198, cy: 272, angle: 6,   width: 30, height: 40, type: 'natural', shade: 'A2' },
  { id: 24, label: '#24', cx: 228, cy: 266, angle: 0,   width: 26, height: 38, type: 'natural', shade: 'A2' },
  { id: 25, label: '#25', cx: 272, cy: 266, angle: 0,   width: 26, height: 38, type: 'natural', shade: 'A2' },
  { id: 26, label: '#26', cx: 302, cy: 272, angle: -6,  width: 30, height: 40, type: 'natural', shade: 'A2' },
  { id: 27, label: '#27', cx: 332, cy: 285, angle: -12, width: 34, height: 42, type: 'veneer',  shade: 'BL2' },
  { id: 28, label: '#28', cx: 352, cy: 305, angle: -20, width: 34, height: 40, type: 'natural', shade: 'A2' },
  { id: 29, label: '#29', cx: 372, cy: 330, angle: -28, width: 36, height: 42, type: 'natural', shade: 'A2' },
  { id: 30, label: '#30', cx: 392, cy: 360, angle: -35, width: 42, height: 48, type: 'implant-crown', shade: 'BL2' },
];

const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];

// ---------------------------------------------------------------------------
// Shade colors
// ---------------------------------------------------------------------------

const SHADE_COLORS: Record<string, { fill: string; highlight: string; shadow: string }> = {
  BL2: { fill: '#FCF8EC', highlight: '#FEFCF5', shadow: '#E8E0CC' },
  BL1: { fill: '#FEFCF5', highlight: '#FFFFFF', shadow: '#EDE5D5' },
  A1:  { fill: '#F5E6C8', highlight: '#FAF0DA', shadow: '#DDD0B0' },
  A2:  { fill: '#EEDBB5', highlight: '#F5E8CA', shadow: '#D4C49A' },
  A3:  { fill: '#E5CFA0', highlight: '#EEDBB5', shadow: '#CCB888' },
};

// ---------------------------------------------------------------------------
// Anatomical tooth path generator (occlusal / buccal view)
// ---------------------------------------------------------------------------

function toothPath(w: number, h: number, type: 'anterior' | 'premolar' | 'molar'): string {
  const hw = w / 2;
  const hh = h / 2;

  if (type === 'anterior') {
    // Incisor/canine shape: rounded rectangle with incisal edge detail
    return `M ${-hw * 0.3} ${-hh}
      C ${-hw * 0.8} ${-hh * 0.9} ${-hw} ${-hh * 0.5} ${-hw} ${0}
      C ${-hw} ${hh * 0.5} ${-hw * 0.8} ${hh * 0.85} ${-hw * 0.3} ${hh}
      L ${hw * 0.3} ${hh}
      C ${hw * 0.8} ${hh * 0.85} ${hw} ${hh * 0.5} ${hw} ${0}
      C ${hw} ${-hh * 0.5} ${hw * 0.8} ${-hh * 0.9} ${hw * 0.3} ${-hh}
      Z`;
  }
  if (type === 'premolar') {
    return `M ${-hw * 0.4} ${-hh}
      C ${-hw * 0.9} ${-hh * 0.8} ${-hw} ${-hh * 0.3} ${-hw} ${0}
      C ${-hw} ${hh * 0.4} ${-hw * 0.85} ${hh * 0.9} ${-hw * 0.3} ${hh}
      L ${hw * 0.3} ${hh}
      C ${hw * 0.85} ${hh * 0.9} ${hw} ${hh * 0.4} ${hw} ${0}
      C ${hw} ${-hh * 0.3} ${hw * 0.9} ${-hh * 0.8} ${hw * 0.4} ${-hh}
      Z`;
  }
  // Molar
  return `M ${-hw * 0.5} ${-hh}
    C ${-hw} ${-hh * 0.7} ${-hw} ${-hh * 0.3} ${-hw} ${0}
    C ${-hw} ${hh * 0.4} ${-hw * 0.9} ${hh * 0.9} ${-hw * 0.4} ${hh}
    L ${hw * 0.4} ${hh}
    C ${hw * 0.9} ${hh * 0.9} ${hw} ${hh * 0.4} ${hw} ${0}
    C ${hw} ${-hh * 0.3} ${hw} ${-hh * 0.7} ${hw * 0.5} ${-hh}
    Z`;
}

function getToothType(id: number): 'anterior' | 'premolar' | 'molar' {
  const absId = id;
  if ((absId >= 6 && absId <= 11) || (absId >= 22 && absId <= 27)) return 'anterior';
  if ((absId >= 4 && absId <= 5) || (absId >= 12 && absId <= 13) || (absId >= 20 && absId <= 21) || (absId >= 28 && absId <= 29)) return 'premolar';
  return 'molar';
}

// ---------------------------------------------------------------------------
// Occlusal surface detail (cusps, grooves)
// ---------------------------------------------------------------------------

function occlusialDetail(w: number, h: number, type: 'anterior' | 'premolar' | 'molar'): JSX.Element[] {
  const details: JSX.Element[] = [];
  const hw = w / 2;
  const hh = h / 2;

  if (type === 'anterior') {
    // Mamelons on incisal edge
    details.push(
      <line key="ml" x1={-hw * 0.25} y1={-hh * 0.6} x2={-hw * 0.25} y2={hh * 0.3} stroke="currentColor" strokeWidth="0.5" opacity="0.15" />,
      <line key="mr" x1={hw * 0.25} y1={-hh * 0.6} x2={hw * 0.25} y2={hh * 0.3} stroke="currentColor" strokeWidth="0.5" opacity="0.15" />,
      // Cingulum
      <ellipse key="cing" cx={0} cy={hh * 0.5} rx={hw * 0.35} ry={hh * 0.25} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
    );
  } else if (type === 'premolar') {
    // Central fissure
    details.push(
      <line key="cf" x1={0} y1={-hh * 0.5} x2={0} y2={hh * 0.5} stroke="currentColor" strokeWidth="0.7" opacity="0.15" />,
      // Buccal and lingual cusps
      <circle key="bc" cx={-hw * 0.3} cy={0} r={hw * 0.25} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
      <circle key="lc" cx={hw * 0.3} cy={0} r={hw * 0.22} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
    );
  } else {
    // Molar: cross-shaped fissure with 4 cusps
    details.push(
      <line key="cf1" x1={-hw * 0.1} y1={-hh * 0.6} x2={-hw * 0.1} y2={hh * 0.6} stroke="currentColor" strokeWidth="0.7" opacity="0.15" />,
      <line key="cf2" x1={-hw * 0.6} y1={-hh * 0.05} x2={hw * 0.6} y2={-hh * 0.05} stroke="currentColor" strokeWidth="0.7" opacity="0.15" />,
      <circle key="mb" cx={-hw * 0.35} cy={-hh * 0.35} r={hw * 0.22} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
      <circle key="db" cx={-hw * 0.35} cy={hh * 0.3} r={hw * 0.20} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
      <circle key="ml2" cx={hw * 0.25} cy={-hh * 0.3} r={hw * 0.20} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
      <circle key="dl" cx={hw * 0.25} cy={hh * 0.3} r={hw * 0.18} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />,
    );
  }
  return details;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DentalArch3D({ activeView, selectedTooth, onSelectTooth, showMeasurements, showMargins }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  // Render a single tooth
  const renderTooth = useCallback((tooth: ToothModel) => {
    const ttype = getToothType(tooth.id);
    const colors = SHADE_COLORS[tooth.shade] ?? SHADE_COLORS.A2;
    const isSelected = selectedTooth === tooth.id;
    const isHovered = hoveredTooth === tooth.id;
    const isDesigned = tooth.type === 'veneer' || tooth.type === 'implant-crown';
    const gradId = `tooth-grad-${tooth.id}`;
    const glowId = `tooth-glow-${tooth.id}`;

    return (
      <g
        key={tooth.id}
        transform={`translate(${tooth.cx}, ${tooth.cy}) rotate(${tooth.angle})`}
        onClick={() => onSelectTooth(isSelected ? null : tooth.id)}
        onMouseEnter={() => setHoveredTooth(tooth.id)}
        onMouseLeave={() => setHoveredTooth(null)}
        className="cursor-pointer"
        style={{ transition: 'transform 0.2s ease' }}
      >
        {/* Definitions for this tooth */}
        <defs>
          <radialGradient id={gradId} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="50%" stopColor={colors.fill} />
            <stop offset="100%" stopColor={colors.shadow} />
          </radialGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="1" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shadow under tooth */}
        <ellipse
          cx={2}
          cy={3}
          rx={tooth.width / 2 - 2}
          ry={tooth.height / 2 - 2}
          fill="rgba(0,0,0,0.25)"
          filter="url(#blur-shadow)"
        />

        {/* Main tooth body */}
        <path
          d={toothPath(tooth.width, tooth.height, ttype)}
          fill={`url(#${gradId})`}
          stroke={isDesigned ? (isSelected ? '#C4A265' : 'rgba(196,162,101,0.6)') : 'rgba(180,170,150,0.4)'}
          strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
          filter={`url(#${glowId})`}
        />

        {/* Occlusal anatomy */}
        <g className="text-brand-warm-gray">
          {occlusialDetail(tooth.width, tooth.height, ttype)}
        </g>

        {/* Veneer overlay effect — translucent layer showing designed restoration */}
        {isDesigned && activeView === 'arch' && (
          <path
            d={toothPath(tooth.width - 4, tooth.height - 4, ttype)}
            fill="none"
            stroke="rgba(196,162,101,0.4)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
        )}

        {/* Implant fixture indicator */}
        {tooth.type === 'implant-crown' && (
          <g opacity="0.5">
            <line x1={0} y1={tooth.height / 2 + 2} x2={0} y2={tooth.height / 2 + 16} stroke="#8B8B8B" strokeWidth="3" strokeLinecap="round" />
            {/* Thread lines */}
            {[4, 7, 10, 13].map((dy) => (
              <line key={dy} x1={-4} y1={tooth.height / 2 + dy} x2={4} y2={tooth.height / 2 + dy + 1.5} stroke="#999" strokeWidth="0.7" />
            ))}
          </g>
        )}

        {/* Preparation margin line */}
        {showMargins && isDesigned && (
          <path
            d={toothPath(tooth.width + 3, tooth.height + 3, ttype)}
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.6"
          />
        )}

        {/* Tooth number label */}
        <text
          x={0}
          y={-tooth.height / 2 - 8}
          textAnchor="middle"
          fontSize="9"
          fontFamily="monospace"
          fill={isDesigned ? '#C4A265' : '#888'}
          opacity={isHovered || isSelected ? 1 : 0.6}
        >
          {tooth.label}
        </text>

        {/* Shade indicator */}
        {isDesigned && (isHovered || isSelected) && (
          <g>
            <rect
              x={-16}
              y={tooth.height / 2 + 6}
              width={32}
              height={16}
              rx={4}
              fill="rgba(30,30,30,0.85)"
              stroke="rgba(196,162,101,0.4)"
              strokeWidth="0.5"
            />
            <text
              x={0}
              y={tooth.height / 2 + 18}
              textAnchor="middle"
              fontSize="8"
              fontFamily="monospace"
              fill="#C4A265"
            >
              {tooth.shade}
            </text>
          </g>
        )}

        {/* Selection ring */}
        {isSelected && (
          <path
            d={toothPath(tooth.width + 8, tooth.height + 8, ttype)}
            fill="none"
            stroke="#C4A265"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
          </path>
        )}
      </g>
    );
  }, [selectedTooth, hoveredTooth, activeView, onSelectTooth, showMargins]);

  // Measurement lines between key teeth
  const renderMeasurements = useCallback(() => {
    if (!showMeasurements) return null;
    const measurements = [
      { from: UPPER_TEETH[5], to: UPPER_TEETH[6], label: '8.6mm', type: 'width' }, // #8 to #9
      { from: UPPER_TEETH[3], to: UPPER_TEETH[8], label: '52.3mm', type: 'span' }, // #6 to #11
    ];
    return (
      <g opacity="0.7">
        {measurements.map((m, i) => (
          <g key={i}>
            <line
              x1={m.from.cx}
              y1={m.from.cy - m.from.height / 2 - 18}
              x2={m.to.cx}
              y2={m.to.cy - m.to.height / 2 - 18}
              stroke="#C4A265"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            {/* Endpoints */}
            <circle cx={m.from.cx} cy={m.from.cy - m.from.height / 2 - 18} r="2" fill="#C4A265" />
            <circle cx={m.to.cx} cy={m.to.cy - m.to.height / 2 - 18} r="2" fill="#C4A265" />
            {/* Label */}
            <rect
              x={(m.from.cx + m.to.cx) / 2 - 18}
              y={Math.min(m.from.cy, m.to.cy) - m.from.height / 2 - 30}
              width={36}
              height={14}
              rx={3}
              fill="rgba(30,30,30,0.9)"
              stroke="rgba(196,162,101,0.3)"
              strokeWidth="0.5"
            />
            <text
              x={(m.from.cx + m.to.cx) / 2}
              y={Math.min(m.from.cy, m.to.cy) - m.from.height / 2 - 20}
              textAnchor="middle"
              fontSize="8"
              fontFamily="monospace"
              fill="#C4A265"
            >
              {m.label}
            </text>
          </g>
        ))}
      </g>
    );
  }, [showMeasurements]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        viewBox="0 0 500 480"
        className="w-full h-full"
        style={{ maxHeight: '100%' }}
      >
        {/* Global defs */}
        <defs>
          <filter id="blur-shadow">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          {/* Grid pattern */}
          <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(196,162,101,0.06)" strokeWidth="0.5" />
          </pattern>
          <pattern id="cad-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(196,162,101,0.12)" strokeWidth="0.5" />
          </pattern>
          {/* Gingiva gradient */}
          <radialGradient id="gingiva-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E88B95" />
            <stop offset="60%" stopColor="#D4737E" />
            <stop offset="100%" stopColor="#B8616B" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <rect width="500" height="480" fill="url(#cad-grid)" />
        <rect width="500" height="480" fill="url(#cad-grid-major)" />

        {/* Center crosshair */}
        <line x1="250" y1="0" x2="250" y2="480" stroke="rgba(196,162,101,0.08)" strokeWidth="0.5" />
        <line x1="0" y1="240" x2="500" y2="240" stroke="rgba(196,162,101,0.08)" strokeWidth="0.5" />

        {/* Gingival contour - upper arch */}
        <path
          d={`M 80 240 C 100 210, 130 175, 160 148 C 180 128, 200 115, 228 108 C 245 104, 255 104, 272 108 C 300 115, 320 128, 340 148 C 370 175, 400 210, 420 240`}
          fill="url(#gingiva-grad)"
          opacity="0.15"
          stroke="rgba(232,139,149,0.3)"
          strokeWidth="1"
        />

        {/* Gingival contour - lower arch */}
        <path
          d={`M 90 340 C 110 315, 135 295, 165 280 C 185 270, 210 262, 228 258 C 245 255, 255 255, 272 258 C 290 262, 315 270, 335 280 C 365 295, 390 315, 410 340`}
          fill="url(#gingiva-grad)"
          opacity="0.12"
          stroke="rgba(232,139,149,0.3)"
          strokeWidth="1"
        />

        {/* Arch centerline */}
        <path
          d={`M 85 235 C 120 170, 180 105, 250 95 C 320 105, 380 170, 415 235`}
          fill="none"
          stroke="rgba(196,162,101,0.12)"
          strokeWidth="0.5"
          strokeDasharray="6 4"
        />

        {/* Render teeth */}
        {ALL_TEETH.map(renderTooth)}

        {/* Measurements overlay */}
        {renderMeasurements()}

        {/* Title overlay */}
        <g transform="translate(250, 20)">
          <text
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            fill="rgba(196,162,101,0.5)"
            letterSpacing="3"
          >
            {activeView === 'arch' ? 'DIGITAL WAX-UP — OCCLUSAL VIEW' :
             activeView === 'sculpt' ? 'FREE-FORM SCULPTING MODE' :
             activeView === 'framework' ? 'FRAMEWORK VERIFICATION' :
             'VIRTUAL TRY-IN'}
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(15, 440)">
          <rect width="180" height="32" rx="4" fill="rgba(20,20,20,0.8)" stroke="rgba(196,162,101,0.2)" strokeWidth="0.5" />
          {[
            { color: '#FCF8EC', label: 'Veneer / Crown', x: 12 },
            { color: '#EEDBB5', label: 'Natural', x: 100 },
          ].map((item) => (
            <g key={item.label} transform={`translate(${item.x}, 16)`}>
              <rect x={0} y={-5} width={10} height={10} rx={2} fill={item.color} stroke="rgba(196,162,101,0.4)" strokeWidth="0.5" />
              <text x={14} y={3} fontSize="8" fontFamily="sans-serif" fill="#888">{item.label}</text>
            </g>
          ))}
        </g>

        {/* Coordinate display */}
        <text x="485" y="470" textAnchor="end" fontSize="8" fontFamily="monospace" fill="rgba(196,162,101,0.3)">
          DV-CAD v1.0 | 500×480
        </text>
      </svg>
    </div>
  );
}
