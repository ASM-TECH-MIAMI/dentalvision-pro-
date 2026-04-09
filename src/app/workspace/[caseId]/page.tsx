'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  Grid3X3,
  Ruler,
  Palette,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertTriangle,
  Box,
  Pen,
  Shield,
  Smile,
  Crosshair,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoContext } from '@/lib/demo-context';
import { useClaudeAnalysis } from '@/hooks/use-claude-analysis';
import {
  mockCases,
  mockPatients,
  isabellaAnalysis,
  jonathanAnalysis,
  VITA_SHADES,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import DentalArch3D from '@/components/workspace/dental-arch-3d';
import SculptView from '@/components/workspace/sculpt-view';
import FrameworkView from '@/components/workspace/framework-view';
import VirtualTryIn from '@/components/workspace/virtual-tryin';

// ---------------------------------------------------------------------------
// Tab & CAD view definitions
// ---------------------------------------------------------------------------

const TABS = ['AI INSIGHTS', 'LANDMARKS', 'TEETH', 'PROPORTIONS', 'SHADE'] as const;
type Tab = (typeof TABS)[number];

type CADView = 'arch' | 'sculpt' | 'framework' | 'tryin';

const CAD_VIEWS: { id: CADView; label: string; icon: typeof Box }[] = [
  { id: 'arch',      label: 'Digital Wax-Up',         icon: Box },
  { id: 'sculpt',    label: 'Sculpt',                 icon: Pen },
  { id: 'framework', label: 'Framework',              icon: Shield },
  { id: 'tryin',     label: 'Virtual Try-In',         icon: Smile },
];

// ---------------------------------------------------------------------------
// Pre-filled AI analysis for case-002 demo (no API call needed)
// ---------------------------------------------------------------------------

const CASE_002_AI_INSIGHTS = {
  summary: 'Complex cosmetic rehabilitation case — upper anterior zone shows significant wear patterns and shade inconsistency across the smile zone. Implant sites #19 and #30 show adequate bone density for final restoration. Digital wax-up confirms optimal tooth proportions achievable with lithium disilicate veneers (BL2 target shade). Golden ratio analysis yields 1.61, near-ideal for Hollywood smile design.',
  confidence: 96,
  facial_analysis: {
    symmetry_score: 91,
    profile_type: 'straight',
    lip_line: 'medium',
    smile_line: 'consonant',
    symmetry_notes: 'Slight facial asymmetry noted in lower third — left commissure 1.2mm lower than right. Recommended: compensate with asymmetric gingival contouring on #6 and #11 margins.',
  },
  dental_observations: [
    { tooth_region: 'Upper Anteriors #6-#11', observation: 'Generalized enamel wear with loss of surface texture and translucency. Incisal edges show 1.2mm of attrition. Existing shade A2-A3 with cervical darkening.', severity: 'significant' as const },
    { tooth_region: 'Implant Site #19', observation: 'Osseointegration appears complete (4 months post-placement by Dr. Zadeh). Adequate keratinized tissue. Ready for final impression and crown fabrication.', severity: 'mild' as const },
    { tooth_region: 'Implant Site #30', observation: 'Healing abutment in place. Soft tissue contours favorable. Emergence profile will require custom abutment for optimal esthetics.', severity: 'mild' as const },
    { tooth_region: 'Lower Anteriors #22, #27', observation: 'Cuspid guidance compromised by wear. Veneer restorations planned to restore canine-protected occlusion scheme.', severity: 'moderate' as const },
  ],
  shade_assessment: {
    estimated_current_shade: 'A2/A3',
    recommended_target_shade: 'BL2',
    notes: 'Patient desires bright, natural-white result. BL2 recommended as target — provides Hollywood brightness while maintaining translucency depth. Recommend in-office whitening of non-restored teeth to achieve uniform result.',
  },
  treatment_suggestions: [
    { procedure: 'Lithium Disilicate Veneers', teeth: '#6-#11', rationale: 'Full upper anterior rehabilitation — correct wear, shade, and proportions', priority: 'high' as const },
    { procedure: 'Implant Crowns (Zirconia)', teeth: '#19, #30', rationale: 'Final restorations on osseointegrated fixtures — complete posterior occlusion', priority: 'high' as const },
    { procedure: 'Porcelain Veneers', teeth: '#22, #27', rationale: 'Restore canine guidance and symmetry in lower arch', priority: 'medium' as const },
    { procedure: 'In-Office Whitening', teeth: 'Full arch', rationale: 'Pre-treatment whitening to match non-restored teeth to BL2 target', priority: 'medium' as const },
  ],
  smile_design_notes: 'Digital wax-up confirms excellent proportions achievable. Central incisors designed at 8.6mm width × 10.8mm height (ratio 0.80 — within ideal range). Lateral incisors at 82% width of centrals. Smile arc follows consonant curve aligned with lower lip curvature. Buccal corridor at 10% — within the narrow/ideal aesthetic zone. Recommend layered lithium disilicate for optimal translucency at incisal third.',
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WorkspacePage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params.caseId;

  const { capturedPhotos, analysisResults } = useDemoContext();

  // Resolve data
  const caseData = mockCases.find((c) => c.id === caseId);
  const patient = mockPatients.find((p) => p.id === caseData?.patientId);
  const analysis = analysisResults[caseId] ?? (caseId === 'case-002' ? jonathanAnalysis : isabellaAnalysis);
  const photos = capturedPhotos[caseId] ?? [];
  const firstPhoto = photos[0]?.imageUrl || null;

  // Is this a CAD case (has no photo but has analysis — show CAD views)
  const isCADMode = !firstPhoto;

  // CAD view state
  const [cadView, setCadView] = useState<CADView>('arch');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showMargins, setShowMargins] = useState(true);

  // Overlay toggles (for photo mode)
  const [landmarksVisible, setLandmarksVisible] = useState(true);
  const [teethVisible, setTeethVisible] = useState(true);
  const [proportionsVisible, setProportionsVisible] = useState(true);
  const [shadeVisible, setShadeVisible] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('AI INSIGHTS');

  // Claude Vision AI analysis
  const {
    isAnalyzing: isClaudeAnalyzing,
    dentalAnalysis,
    error: claudeError,
    analyzeDentalPhoto,
  } = useClaudeAnalysis();

  // Use pre-filled insights for case-002, otherwise try Claude
  const isCase002 = caseId === 'case-002';
  const effectiveDentalAnalysis = isCase002 ? CASE_002_AI_INSIGHTS : dentalAnalysis;
  const effectiveIsAnalyzing = isCase002 ? false : isClaudeAnalyzing;
  const effectiveError = isCase002 ? null : claudeError;

  // Auto-run Claude analysis when we have a photo (non-case-002)
  const [claudeTriggered, setClaudeTriggered] = useState(false);
  useEffect(() => {
    if (firstPhoto && !claudeTriggered && !dentalAnalysis && !isCase002) {
      setClaudeTriggered(true);
      analyzeDentalPhoto(firstPhoto);
    }
  }, [firstPhoto, claudeTriggered, dentalAnalysis, analyzeDentalPhoto, isCase002]);

  // Landmark subset for rendering
  const landmarkDots = useMemo(
    () => analysis.facialLandmarks,
    [analysis.facialLandmarks],
  );

  // Measurements for landmarks tab
  const measurements = useMemo(() => {
    const lm = analysis.facialLandmarks;
    if (lm.length < 468) {
      return [
        { label: 'Interpupillary Distance', value: '64.8mm' },
        { label: 'Facial Width', value: '148mm' },
        { label: 'Smile Width', value: '62.1mm' },
        { label: 'Upper Lip Height', value: '9.4mm' },
        { label: 'Lower Face Third', value: '33.4%' },
      ];
    }
    const scale = 170;
    const ipd = Math.abs(lm[263].x - lm[33].x) * scale;
    const faceW = Math.abs(lm[454].x - lm[234].x) * scale;
    const smileW = Math.abs(lm[291].x - lm[61].x) * scale;
    const upperLipH = Math.abs(lm[13].y - lm[0].y) * scale * 0.3;
    const faceH = Math.abs(lm[152].y - lm[10].y);
    const lowerThird = ((lm[152].y - lm[1].y) / faceH * 100);
    return [
      { label: 'Interpupillary Distance', value: `${ipd.toFixed(1)}mm` },
      { label: 'Facial Width', value: `${faceW.toFixed(0)}mm` },
      { label: 'Smile Width', value: `${smileW.toFixed(1)}mm` },
      { label: 'Upper Lip Height', value: `${upperLipH.toFixed(1)}mm` },
      { label: 'Lower Face Third', value: `${lowerThird.toFixed(1)}%` },
    ];
  }, [analysis.facialLandmarks]);

  // Selected tooth info for sculpt view
  const selectedToothData = useMemo(() => {
    if (!selectedTooth) return null;
    return analysis.teethRegions.find((t) => t.toothNumber === selectedTooth);
  }, [selectedTooth, analysis.teethRegions]);

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* ---- Top bar ---------------------------------------------------- */}
      <header className="h-14 bg-brand-charcoal flex items-center justify-between px-6 shrink-0 border-b border-brand-warm-gray/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-brand-mid-gray hover:text-brand-gold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="w-px h-5 bg-brand-warm-gray/30" />
          <h1 className="font-serif text-brand-gold tracking-widest text-sm uppercase">
            {isCADMode ? 'AI Design Studio' : 'Analysis Workspace'}
          </h1>
          {isCADMode && (
            <>
              <div className="w-px h-5 bg-brand-warm-gray/30" />
              <span className="text-[10px] tracking-widest text-brand-mid-gray uppercase">
                {caseData?.treatment} — {analysis.teethRegions.length} restorations
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {patient && (
            <span className="text-brand-cream text-sm font-sans">
              {patient.firstName} {patient.lastName}
            </span>
          )}
          <span className="text-brand-mid-gray text-xs uppercase tracking-wider">
            {caseId}
          </span>
          {isCADMode && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 uppercase tracking-widest">
              {caseData?.shade}
            </span>
          )}
        </div>
      </header>

      {/* ---- Main area -------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- Canvas (left ~70%) --------------------------------------- */}
        <div className="flex-[7] relative bg-brand-black flex flex-col">
          {/* CAD view switcher bar */}
          {isCADMode && (
            <div className="flex items-center gap-1 px-4 py-2 bg-brand-charcoal/50 border-b border-brand-warm-gray/10">
              {CAD_VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setCadView(v.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                    cadView === v.id
                      ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30'
                      : 'text-brand-mid-gray hover:text-brand-cream hover:bg-brand-warm-gray/10',
                  )}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              ))}
              <div className="flex-1" />
              {/* Toggle controls */}
              <button
                onClick={() => setShowMeasurements((v) => !v)}
                title="Measurements"
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  showMeasurements ? 'text-brand-gold bg-brand-gold/10' : 'text-brand-mid-gray hover:text-brand-cream',
                )}
              >
                <Ruler className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowMargins((v) => !v)}
                title="Prep Margins"
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  showMargins ? 'text-red-400 bg-red-400/10' : 'text-brand-mid-gray hover:text-brand-cream',
                )}
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main canvas area */}
          <div className="flex-1 relative">
            {isCADMode ? (
              // ---- CAD visualization mode ----
              <motion.div
                key={cadView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {cadView === 'arch' && (
                  <DentalArch3D
                    activeView="arch"
                    selectedTooth={selectedTooth}
                    onSelectTooth={setSelectedTooth}
                    showMeasurements={showMeasurements}
                    showMargins={showMargins}
                  />
                )}
                {cadView === 'sculpt' && (
                  <SculptView
                    toothNumber={selectedTooth ?? 8}
                    shade={selectedToothData?.shade ?? 'BL2'}
                  />
                )}
                {cadView === 'framework' && <FrameworkView />}
                {cadView === 'tryin' && <VirtualTryIn />}
              </motion.div>
            ) : (
              // ---- Photo mode (existing behavior) ----
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={firstPhoto}
                  alt="Patient capture"
                  className="w-full h-full object-contain"
                />

                {/* Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  {landmarksVisible && (
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      {(() => {
                        const lm = landmarkDots;
                        if (lm.length < 100) return null;
                        const contourPairs: [number, number][] = [];
                        for (let i = 0; i < 32; i++) contourPairs.push([i, i + 1]);
                        for (let i = 33; i < 41; i++) contourPairs.push([i, i + 1]);
                        for (let i = 42; i < 50; i++) contourPairs.push([i, i + 1]);
                        for (let i = 51; i < 60; i++) contourPairs.push([i, i + 1]);
                        for (let i = 61; i < 80; i++) contourPairs.push([i, i + 1]);
                        contourPairs.push([61, 80]);
                        for (let i = 81; i < 95; i++) contourPairs.push([i, i + 1]);
                        contourPairs.push([81, 95]);
                        return contourPairs
                          .filter(([a, b]) => a < lm.length && b < lm.length)
                          .map(([a, b], idx) => (
                            <line
                              key={`conn-${idx}`}
                              x1={`${lm[a].x * 100}%`}
                              y1={`${lm[a].y * 100}%`}
                              x2={`${lm[b].x * 100}%`}
                              y2={`${lm[b].y * 100}%`}
                              stroke="#C4A265"
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                          ));
                      })()}
                      {landmarkDots.map((lm) => (
                        <circle
                          key={lm.id}
                          cx={`${lm.x * 100}%`}
                          cy={`${lm.y * 100}%`}
                          r="1.5"
                          fill="#C4A265"
                          opacity="0.7"
                        />
                      ))}
                    </svg>
                  )}

                  {teethVisible &&
                    analysis.teethRegions.map((t) => (
                      <div
                        key={t.toothNumber}
                        className="absolute rounded-[3px] flex items-start justify-start"
                        style={{
                          left: `${t.x * 100}%`,
                          top: `${t.y * 100}%`,
                          width: `${t.width * 100}%`,
                          height: `${t.height * 100}%`,
                          border: '1.5px solid rgba(196, 162, 101, 0.8)',
                          boxShadow: '0 0 6px rgba(196, 162, 101, 0.3)',
                        }}
                      >
                        <span className="text-[9px] text-brand-gold font-mono bg-brand-black/70 px-1 py-px leading-tight rounded-br-sm">
                          #{t.toothNumber}
                        </span>
                      </div>
                    ))}

                  {proportionsVisible && (
                    <>
                      <div className="absolute top-0 bottom-0 border-l border-dashed border-brand-gold/50" style={{ left: '50%' }} />
                      <div className="absolute left-0 right-0 border-t border-dashed border-brand-gold/40" style={{ top: '33.3%' }} />
                      <div className="absolute left-0 right-0 border-t border-dashed border-brand-gold/40" style={{ top: '66.6%' }} />
                      <div className="absolute top-4 right-4 bg-brand-black/70 px-3 py-1.5 rounded-[10px]">
                        <span className="text-brand-gold text-xs font-mono">
                          Golden Ratio: {analysis.proportions.goldenRatio}
                        </span>
                      </div>
                    </>
                  )}

                  {shadeVisible &&
                    analysis.teethRegions.map((t) => {
                      const shade = VITA_SHADES[t.shade];
                      return (
                        <div
                          key={`shade-${t.toothNumber}`}
                          className="absolute rounded-[3px]"
                          style={{
                            left: `${t.x * 100}%`,
                            top: `${t.y * 100}%`,
                            width: `${t.width * 100}%`,
                            height: `${t.height * 100}%`,
                            backgroundColor: shade?.hex ?? '#EEDBB5',
                            opacity: 0.3,
                            border: `1px solid ${shade?.hex ?? '#EEDBB5'}`,
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* ---- Toolbar at bottom of canvas ---- */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-brand-charcoal/90 backdrop-blur-sm p-2 rounded-full border border-brand-warm-gray/20"
            >
              {isCADMode ? (
                // CAD mode bottom bar
                <>
                  {selectedTooth && (
                    <div className="flex items-center gap-2 px-3">
                      <span className="text-brand-gold text-xs font-mono">#{selectedTooth}</span>
                      <span className="text-brand-mid-gray text-[10px]">selected</span>
                      <button
                        onClick={() => {
                          setCadView('sculpt');
                        }}
                        className="text-brand-gold text-[10px] hover:underline"
                      >
                        Sculpt
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedTooth(null)}
                    title="Deselect"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-brand-mid-gray hover:text-brand-cream bg-brand-charcoal transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                // Photo mode overlay toggles
                [
                  { icon: Eye, label: 'Landmarks', active: landmarksVisible, toggle: () => setLandmarksVisible((v) => !v) },
                  { icon: Grid3X3, label: 'Teeth', active: teethVisible, toggle: () => setTeethVisible((v) => !v) },
                  { icon: Ruler, label: 'Proportions', active: proportionsVisible, toggle: () => setProportionsVisible((v) => !v) },
                  { icon: Palette, label: 'Shade', active: shadeVisible, toggle: () => setShadeVisible((v) => !v) },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.toggle}
                    title={btn.label}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      btn.active
                        ? 'bg-brand-gold text-brand-black'
                        : 'bg-brand-charcoal text-brand-mid-gray hover:text-brand-cream',
                    )}
                  >
                    <btn.icon className="w-4 h-4" />
                  </button>
                ))
              )}
            </motion.div>
          </div>

          {/* ---- Thumbnail strip (CAD mode) ---- */}
          {isCADMode && (
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal/30 border-t border-brand-warm-gray/10">
              {CAD_VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setCadView(v.id)}
                  className={cn(
                    'relative w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0',
                    cadView === v.id
                      ? 'border-brand-gold ring-1 ring-brand-gold/30'
                      : 'border-brand-warm-gray/20 hover:border-brand-warm-gray/40 opacity-60 hover:opacity-80',
                  )}
                >
                  <div className="w-full h-full bg-brand-charcoal flex items-center justify-center">
                    <v.icon className={cn('w-5 h-5', cadView === v.id ? 'text-brand-gold' : 'text-brand-mid-gray')} />
                  </div>
                  <span className="absolute bottom-0 inset-x-0 bg-brand-black/80 text-[7px] text-center py-0.5 text-brand-mid-gray tracking-wider uppercase">
                    {v.label}
                  </span>
                </button>
              ))}
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-brand-mid-gray text-[10px] tracking-widest uppercase">Material</p>
                <p className="text-brand-cream text-xs">Lithium Disilicate e.max</p>
              </div>
            </div>
          )}
        </div>

        {/* ---- Right panel (30%) --------------------------------------- */}
        <div className="flex-[3] bg-brand-charcoal flex flex-col border-l border-brand-warm-gray/20">
          {/* Tab buttons */}
          <div className="flex border-b border-brand-warm-gray/20">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-3 text-[10px] tracking-widest font-sans uppercase transition-colors',
                  activeTab === tab
                    ? 'text-brand-gold border-b-2 border-brand-gold'
                    : 'text-brand-mid-gray hover:text-brand-cream',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* ---- AI INSIGHTS tab ---- */}
            {activeTab === 'AI INSIGHTS' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <h3 className="font-serif text-sm uppercase tracking-[0.12em] text-brand-gold">
                    AI Clinical Analysis
                  </h3>
                </div>

                {effectiveIsAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    <p className="text-brand-mid-gray text-sm">Claude is analyzing the photo...</p>
                    <p className="text-brand-mid-gray/50 text-xs">This takes a few seconds</p>
                  </div>
                )}

                {effectiveError && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-[14px]">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm font-medium">Analysis Failed</p>
                      <p className="text-red-400/70 text-xs mt-1">{effectiveError}</p>
                      <button
                        onClick={() => firstPhoto && analyzeDentalPhoto(firstPhoto)}
                        className="text-brand-gold text-xs mt-2 hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {!effectiveIsAnalyzing && !effectiveDentalAnalysis && !effectiveError && (
                  <div className="text-center py-8">
                    <Sparkles className="w-10 h-10 text-brand-mid-gray/30 mx-auto mb-3" />
                    <p className="text-brand-mid-gray text-sm">No photo to analyze</p>
                    <p className="text-brand-mid-gray/50 text-xs mt-1">Capture photos first to get AI insights</p>
                  </div>
                )}

                {effectiveDentalAnalysis && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-[14px]">
                      <p className="text-brand-cream text-sm leading-relaxed">{effectiveDentalAnalysis.summary}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-1.5 flex-1 bg-brand-warm-gray rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${effectiveDentalAnalysis.confidence}%` }} />
                        </div>
                        <span className="text-brand-gold text-xs font-mono">{effectiveDentalAnalysis.confidence}%</span>
                      </div>
                    </div>

                    {/* Facial Analysis */}
                    <div>
                      <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">Facial Analysis</h4>
                      <div className="space-y-2">
                        {[
                          ['Symmetry', `${effectiveDentalAnalysis.facial_analysis.symmetry_score}/100`],
                          ['Profile', effectiveDentalAnalysis.facial_analysis.profile_type],
                          ['Lip Line', effectiveDentalAnalysis.facial_analysis.lip_line],
                          ['Smile Line', effectiveDentalAnalysis.facial_analysis.smile_line],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center py-1.5 border-b border-brand-warm-gray/10">
                            <span className="text-brand-mid-gray text-xs">{label}</span>
                            <span className="text-brand-cream text-xs font-medium capitalize">{value}</span>
                          </div>
                        ))}
                        <p className="text-brand-mid-gray/70 text-xs italic mt-2">{effectiveDentalAnalysis.facial_analysis.symmetry_notes}</p>
                      </div>
                    </div>

                    {/* Dental Observations */}
                    {effectiveDentalAnalysis.dental_observations?.length > 0 && (
                      <div>
                        <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">Clinical Observations</h4>
                        <div className="space-y-2">
                          {effectiveDentalAnalysis.dental_observations.map((obs, i) => (
                            <div key={i} className="p-3 bg-brand-warm-gray/10 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-brand-gold text-[10px] uppercase tracking-wider">{obs.tooth_region}</span>
                                <span className={cn(
                                  'text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider',
                                  obs.severity === 'significant' ? 'bg-red-500/15 text-red-400' :
                                  obs.severity === 'moderate' ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-brand-gold/10 text-brand-gold'
                                )}>{obs.severity}</span>
                              </div>
                              <p className="text-brand-cream text-xs leading-relaxed">{obs.observation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shade Assessment */}
                    <div>
                      <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">AI Shade Assessment</h4>
                      <div className="flex gap-3">
                        <div className="flex-1 p-3 bg-brand-warm-gray/10 rounded-lg text-center">
                          <p className="text-brand-mid-gray text-[10px] uppercase tracking-wider">Current</p>
                          <p className="text-brand-cream text-lg font-serif mt-1">{effectiveDentalAnalysis.shade_assessment.estimated_current_shade}</p>
                        </div>
                        <div className="flex items-center text-brand-gold">&rarr;</div>
                        <div className="flex-1 p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-center">
                          <p className="text-brand-gold text-[10px] uppercase tracking-wider">Target</p>
                          <p className="text-brand-gold text-lg font-serif mt-1">{effectiveDentalAnalysis.shade_assessment.recommended_target_shade}</p>
                        </div>
                      </div>
                      <p className="text-brand-mid-gray/70 text-xs mt-2 italic">{effectiveDentalAnalysis.shade_assessment.notes}</p>
                    </div>

                    {/* Treatment Suggestions */}
                    {effectiveDentalAnalysis.treatment_suggestions?.length > 0 && (
                      <div>
                        <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">Recommended Treatments</h4>
                        <div className="space-y-2">
                          {effectiveDentalAnalysis.treatment_suggestions.map((sug, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-brand-warm-gray/10 rounded-lg">
                              <span className={cn(
                                'mt-0.5 w-2 h-2 rounded-full shrink-0',
                                sug.priority === 'high' ? 'bg-brand-gold' :
                                sug.priority === 'medium' ? 'bg-brand-gold-light' : 'bg-brand-mid-gray'
                              )} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-brand-cream text-xs font-medium">{sug.procedure}</span>
                                  <span className="text-brand-mid-gray text-[10px]">&middot; {sug.teeth}</span>
                                </div>
                                <p className="text-brand-mid-gray/70 text-xs mt-0.5">{sug.rationale}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Smile Design Notes */}
                    {effectiveDentalAnalysis.smile_design_notes && (
                      <div>
                        <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">Smile Design Notes</h4>
                        <p className="text-brand-cream/80 text-xs leading-relaxed">{effectiveDentalAnalysis.smile_design_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---- LANDMARKS tab ---- */}
            {activeTab === 'LANDMARKS' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-brand-gold text-sm mb-1">
                    478 Facial Landmarks Detected
                  </h3>
                  <p className="text-brand-mid-gray text-xs">
                    MediaPipe Face Mesh — full density mapping
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                    Key Measurements
                  </h4>
                  {measurements.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between py-2 border-b border-brand-warm-gray/10"
                    >
                      <span className="text-brand-mid-gray text-sm">
                        {m.label}
                      </span>
                      <span className="text-brand-cream text-sm font-mono">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CAD-specific measurements */}
                {isCADMode && (
                  <div className="space-y-3">
                    <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                      CAD Measurements
                    </h4>
                    {[
                      { label: 'Central Incisor Width', value: '8.6mm' },
                      { label: 'Central Incisor Height', value: '10.8mm' },
                      { label: 'W/H Ratio', value: '0.80' },
                      { label: 'Lateral/Central Ratio', value: '0.82' },
                      { label: 'Canine/Central Ratio', value: '0.77' },
                      { label: 'Anterior Span (#6-#11)', value: '52.3mm' },
                      { label: 'Overjet', value: '2.1mm' },
                      { label: 'Overbite', value: '2.8mm' },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between py-2 border-b border-brand-warm-gray/10">
                        <span className="text-brand-mid-gray text-sm">{m.label}</span>
                        <span className="text-brand-cream text-sm font-mono">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---- TEETH tab ---- */}
            {activeTab === 'TEETH' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="font-serif text-brand-gold text-sm">
                  {analysis.teethRegions.length} Restorations Designed
                </h3>

                <div className="text-[10px] uppercase tracking-widest text-brand-mid-gray grid grid-cols-4 gap-2 pb-2 border-b border-brand-warm-gray/20">
                  <span>Tooth #</span>
                  <span>VITA Shade</span>
                  <span>Type</span>
                  <span>Material</span>
                </div>

                {analysis.teethRegions.map((t, i) => {
                  const shade = VITA_SHADES[t.shade];
                  const isImplant = t.toothNumber === 19 || t.toothNumber === 30;
                  const isSelected = selectedTooth === t.toothNumber;
                  return (
                    <button
                      key={t.toothNumber}
                      onClick={() => {
                        setSelectedTooth(isSelected ? null : t.toothNumber);
                        if (!isSelected) setCadView('sculpt');
                      }}
                      className={cn(
                        'w-full grid grid-cols-4 gap-2 py-2 rounded-lg px-2 text-sm text-left transition-colors',
                        isSelected
                          ? 'bg-brand-gold/10 ring-1 ring-brand-gold/30'
                          : i % 2 === 1 ? 'bg-brand-warm-gray/10 hover:bg-brand-warm-gray/20' : 'hover:bg-brand-warm-gray/10',
                      )}
                    >
                      <span className="text-brand-cream font-mono">
                        #{t.toothNumber}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-brand-warm-gray/30"
                          style={{ backgroundColor: shade?.hex ?? '#EEDBB5' }}
                        />
                        <span className="text-brand-cream text-xs">{t.shade}</span>
                      </span>
                      <span className="text-brand-cream text-xs">
                        {isImplant ? 'Implant' : 'Veneer'}
                      </span>
                      <span className="text-brand-mid-gray text-xs">
                        {isImplant ? 'Zirconia' : 'e.max'}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* ---- PROPORTIONS tab ---- */}
            {activeTab === 'PROPORTIONS' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Golden Ratio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand-mid-gray text-sm">Golden Ratio</span>
                    <span className="text-brand-cream font-mono text-lg">{analysis.proportions.goldenRatio}</span>
                  </div>
                  <div className="h-2 bg-brand-warm-gray/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gold rounded-full transition-all"
                      style={{ width: `${Math.min(100, (analysis.proportions.goldenRatio / 1.618) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-brand-mid-gray text-[10px]">1.0</span>
                    <span className="text-brand-gold text-[10px] font-mono">Ideal: 1.618</span>
                  </div>
                </div>

                {/* Smile Arc */}
                <div className="flex items-center justify-between py-3 border-b border-brand-warm-gray/10">
                  <span className="text-brand-mid-gray text-sm">Smile Arc</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-brand-cream text-sm capitalize">{analysis.proportions.smileArc} (ideal)</span>
                  </span>
                </div>

                {/* Buccal Corridor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand-mid-gray text-sm">Buccal Corridor</span>
                    <span className="text-brand-cream font-mono">{analysis.proportions.buccalCorridor}%</span>
                  </div>
                  <div className="h-2 bg-brand-warm-gray/30 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gold rounded-full" style={{ width: `${analysis.proportions.buccalCorridor}%` }} />
                  </div>
                </div>

                {/* Facial Thirds */}
                <div>
                  <h4 className="text-brand-mid-gray text-sm mb-3">Facial Thirds</h4>
                  <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                    {analysis.proportions.facialThirds.map((val, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center text-[10px] font-mono text-brand-black"
                        style={{
                          width: `${val}%`,
                          backgroundColor: i === 0 ? '#C6A962' : i === 1 ? '#D4B978' : '#B89A50',
                        }}
                      >
                        {val}%
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-brand-mid-gray">
                    <span>Upper</span>
                    <span>Middle</span>
                    <span>Lower</span>
                  </div>
                </div>

                {/* Tooth proportion details (CAD mode) */}
                {isCADMode && (
                  <div>
                    <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">Tooth Width Proportions</h4>
                    <div className="space-y-2">
                      {[
                        { label: '#6 Cuspid', width: 77, ideal: 77 },
                        { label: '#7 Lateral', width: 82, ideal: 82 },
                        { label: '#8 Central', width: 100, ideal: 100 },
                        { label: '#9 Central', width: 100, ideal: 100 },
                        { label: '#10 Lateral', width: 82, ideal: 82 },
                        { label: '#11 Cuspid', width: 77, ideal: 77 },
                      ].map((t) => (
                        <div key={t.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-brand-mid-gray">{t.label}</span>
                            <span className="text-brand-cream font-mono">{t.width}%</span>
                          </div>
                          <div className="h-1.5 bg-brand-warm-gray/20 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-gold"
                              style={{ width: `${t.width}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ---- SHADE tab ---- */}
            {activeTab === 'SHADE' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Overall match */}
                <div className="text-center py-4">
                  <p className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-2">
                    Target Shade
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="w-12 h-12 rounded-[10px] border border-brand-warm-gray/30"
                      style={{
                        backgroundColor: VITA_SHADES[analysis.shadeMatch.overall]?.hex ?? '#EEDBB5',
                      }}
                    />
                    <span className="text-brand-cream font-serif text-3xl">
                      {analysis.shadeMatch.overall}
                    </span>
                  </div>
                </div>

                {/* Individual tooth shades */}
                <div>
                  <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">
                    Individual Tooth Shades
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(analysis.shadeMatch.individual).map(([tooth, shade]) => {
                      const vitaShade = VITA_SHADES[shade];
                      return (
                        <div key={tooth} className="flex flex-col items-center gap-1">
                          <span
                            className="w-8 h-8 rounded-lg border border-brand-warm-gray/30"
                            style={{ backgroundColor: vitaShade?.hex ?? '#EEDBB5' }}
                          />
                          <span className="text-brand-cream text-[10px] font-mono">#{tooth}</span>
                          <span className="text-brand-mid-gray text-[9px]">{shade}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VITA scale reference */}
                <div>
                  <h4 className="text-brand-mid-gray text-[10px] uppercase tracking-widest mb-3">
                    VITA Scale Reference
                  </h4>
                  <div className="flex gap-0.5 overflow-x-auto pb-2">
                    {Object.entries(VITA_SHADES).map(([key, shade]) => (
                      <div
                        key={key}
                        className={cn(
                          'flex flex-col items-center gap-1 shrink-0',
                          key === analysis.shadeMatch.overall && 'ring-2 ring-brand-gold rounded-lg',
                        )}
                      >
                        <span className="w-6 h-8 rounded-sm" style={{ backgroundColor: shade.hex }} />
                        <span className="text-brand-mid-gray text-[8px]">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ---- Bottom action bar ---- */}
          <div className="p-4 border-t border-brand-warm-gray/20 space-y-2">
            <Button
              className="w-full"
              onClick={() => router.push(`/treatment/${caseId}`)}
            >
              View Treatment Plan
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (isCADMode) {
                  setCadView(cadView === 'tryin' ? 'arch' : 'tryin');
                }
              }}
            >
              {isCADMode ? 'Before / After Simulation' : 'Before / After'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
