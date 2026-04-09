'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  FileDown,
  Calendar,
  Clock,
  FileText,
  CreditCard,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { useDemoContext } from '@/lib/demo-context';
import {
  mockCases,
  mockPatients,
  mockUser,
  isabellaTreatmentPlan,
} from '@/lib/mock-data';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

export default function TreatmentPlanPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params.caseId;

  const { capturedPhotos } = useDemoContext();

  // Resolve data
  const caseData = mockCases.find((c) => c.id === caseId);
  const patient = mockPatients.find((p) => p.id === caseData?.patientId);
  const plan = isabellaTreatmentPlan;
  const photos = capturedPhotos[caseId] ?? [];
  const photoSrc = photos[0]?.imageUrl || null;

  // Group procedures by category
  const grouped = plan.procedures.reduce<
    Record<string, typeof plan.procedures>
  >((acc, proc) => {
    const cat = proc.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(proc);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    veneers: 'Porcelain Veneers',
    whitening: 'Whitening',
    periodontics: 'Periodontics / Gum Contouring',
    implants: 'Implant Restorations',
  };

  // ---- Before/After slider state ----------------------------------------
  const [clipPercent, setClipPercent] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setClipPercent(pct);
  }, []);

  const onPointerDown = useCallback(() => {
    dragging.current = true;
  }, []);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (dragging.current) handleMove(e.clientX);
    };
    const onPointerUp = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [handleMove]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ---- Header --------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => router.push(`/workspace/${caseId}`)}
            className="flex items-center gap-1.5 text-brand-mid-gray hover:text-brand-gold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl text-brand-black tracking-tight">
                Treatment Plan
              </h1>
              {patient && (
                <p className="text-brand-mid-gray text-sm mt-1">
                  {patient.firstName} {patient.lastName} &middot; {caseId}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-serif text-brand-black text-sm">
                {mockUser.practice}
              </p>
              <p className="text-brand-mid-gray text-xs">
                9735 Wilshire Blvd, Suite 220, Beverly Hills, CA 90212
              </p>
              <p className="text-brand-mid-gray text-xs mt-1">
                {formatDate(plan.createdAt)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-brand-gold via-brand-gold-light to-transparent" />
        </motion.div>

        {/* ---- Procedure Table ------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Procedures</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {/* Table header */}
              <div className="grid grid-cols-[100px_120px_1fr_100px] gap-4 px-8 py-3 border-b border-brand-warm-gray/20">
                <span className="text-brand-mid-gray uppercase text-[10px] tracking-widest font-sans">
                  CDT Code
                </span>
                <span className="text-brand-mid-gray uppercase text-[10px] tracking-widest font-sans">
                  Tooth / Region
                </span>
                <span className="text-brand-mid-gray uppercase text-[10px] tracking-widest font-sans">
                  Procedure
                </span>
                <span className="text-brand-mid-gray uppercase text-[10px] tracking-widest font-sans text-right">
                  Fee
                </span>
              </div>

              {/* Grouped rows */}
              {Object.entries(grouped).map(([category, procedures]) => (
                <div key={category}>
                  {/* Category header */}
                  <div className="px-8 py-2 bg-brand-light-gray/50">
                    <span className="text-brand-mid-gray text-[10px] uppercase tracking-widest font-sans font-medium">
                      {categoryLabels[category] ?? category}
                    </span>
                  </div>

                  {procedures.map((proc, i) => (
                    <div
                      key={`${proc.code}-${proc.tooth}-${i}`}
                      className={cn(
                        'grid grid-cols-[100px_120px_1fr_100px] gap-4 px-8 py-3 text-sm',
                        i % 2 === 0 ? 'bg-white' : 'bg-brand-light-gray',
                      )}
                    >
                      <span className="text-brand-charcoal font-mono text-xs">
                        {proc.code}
                      </span>
                      <span className="text-brand-charcoal">{proc.tooth}</span>
                      <span className="text-brand-charcoal">
                        {proc.description}
                      </span>
                      <span className="text-brand-charcoal text-right font-mono">
                        {formatCurrency(proc.fee)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Total row */}
              <div className="grid grid-cols-[100px_120px_1fr_100px] gap-4 px-8 py-4 border-t-2 border-brand-gold/30 bg-white">
                <span />
                <span />
                <span className="font-serif font-bold text-brand-black text-right">
                  TOTAL
                </span>
                <span className="text-brand-gold text-xl font-serif font-bold text-right">
                  {formatCurrency(plan.totalFee)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- Summary Card --------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Treatment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                      Estimated Visits
                    </p>
                    <p className="text-brand-black font-serif text-lg">
                      {plan.estimatedVisits}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                      Timeline
                    </p>
                    <p className="text-brand-black font-serif text-lg">
                      6 weeks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                      Total Investment
                    </p>
                    <p className="text-brand-gold font-serif text-lg">
                      {formatCurrency(plan.totalFee)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-brand-mid-gray" />
                    <span className="text-brand-mid-gray text-[10px] uppercase tracking-widest">
                      Notes
                    </span>
                  </div>
                  <p className="text-brand-charcoal text-sm leading-relaxed">
                    {plan.notes}
                  </p>
                </div>

                <div className="bg-brand-light-gray rounded-[14px] p-4">
                  <p className="text-brand-mid-gray text-sm">
                    Payment plans available. Contact our office for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- Before / After ------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Before &amp; After Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={sliderRef}
                className="relative w-full aspect-video rounded-[14px] overflow-hidden bg-brand-light-gray select-none touch-none cursor-col-resize"
                onPointerDown={(e) => {
                  onPointerDown();
                  handleMove(e.clientX);
                }}
              >
                {/* AFTER image (bottom layer) */}
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoSrc}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      filter: 'brightness(1.1) saturate(1.2)',
                    }}
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-warm-gray/40 to-brand-gold/10 flex items-center justify-center">
                    <span className="text-brand-mid-gray text-sm">
                      After Preview
                    </span>
                  </div>
                )}

                {/* BEFORE image (top layer, clipped) */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - clipPercent}% 0 0)` }}
                >
                  {photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoSrc}
                      alt="Before"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-mid-gray/30 to-brand-warm-gray/20 flex items-center justify-center">
                      <span className="text-brand-mid-gray text-sm">
                        Before Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Slider line + handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-brand-gold pointer-events-none"
                  style={{ left: `${clipPercent}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-gold border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-white rounded-full" />
                      <div className="w-0.5 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute top-3 left-4 text-white text-[10px] uppercase tracking-widest font-sans bg-brand-black/40 px-2 py-1 rounded">
                  Before
                </span>
                <span className="absolute top-3 right-4 text-white text-[10px] uppercase tracking-widest font-sans bg-brand-black/40 px-2 py-1 rounded">
                  After
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- Action buttons ------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 pb-8"
        >
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Patient
          </Button>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(`/workspace/${caseId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
}
