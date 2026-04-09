'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDemoContext } from '@/lib/demo-context';
import { mockCases } from '@/lib/mock-data';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DevIndicator } from '@/components/ui/dev-indicator';
import { formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Case Timeline — Visit-based checklist
// ---------------------------------------------------------------------------

interface TimelineItem {
  label: string;
  children: string[];
}

const VISIT_TIMELINE: TimelineItem[] = [
  {
    label: 'Visit One: Consultation',
    children: [
      'X-Ray',
      'Exam',
      'Photograph',
      'Presentation',
      'Address Your Questions',
      'Fee Proposal',
      'Impression for Wax Design',
      'Creation of Design and Wax',
    ],
  },
  {
    label: 'Visit Two: Design Review',
    children: [
      'Discuss and answer all questions regarding design',
      'Preparation of tooth structure',
      'Placement of provisionals to show aesthetic outcome',
      'Review results and make any modifications needed',
    ],
  },
  {
    label: 'Visit Three: Final Placement',
    children: [
      'Custom crafting of final porcelain restorations',
      'Placed initially with temporary cement to preview',
      'Photographs taken',
      'Approval obtained for final placement',
      'Final permanent cementation of restorations',
      'Review',
    ],
  },
];

// Build a flat key for each checkbox: "caseId:visitIdx:childIdx"
function buildKey(caseId: string, visitIdx: number, childIdx: number) {
  return `${caseId}:${visitIdx}:${childIdx}`;
}

// LocalStorage key
const LS_TIMELINE_KEY = 'dv-pro:timeline-checks';

function readChecks(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_TIMELINE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeChecks(checks: Record<string, string>) {
  localStorage.setItem(LS_TIMELINE_KEY, JSON.stringify(checks));
}

// ---------------------------------------------------------------------------
// Timeline Component
// ---------------------------------------------------------------------------

function CaseTimeline({ caseId }: { caseId: string }) {
  const [checks, setChecks] = useState<Record<string, string>>({});

  useEffect(() => {
    setChecks(readChecks());
  }, []);

  const toggle = useCallback(
    (key: string) => {
      setChecks((prev) => {
        const next = { ...prev };
        if (next[key]) {
          delete next[key];
        } else {
          next[key] = new Date().toISOString();
        }
        writeChecks(next);
        return next;
      });
    },
    [],
  );

  // Check if all children in a visit are complete
  function isVisitComplete(visitIdx: number) {
    return VISIT_TIMELINE[visitIdx].children.every(
      (_, childIdx) => !!checks[buildKey(caseId, visitIdx, childIdx)],
    );
  }

  // Get latest completion date for a visit
  function visitCompletedDate(visitIdx: number): string | null {
    const dates = VISIT_TIMELINE[visitIdx].children
      .map((_, childIdx) => checks[buildKey(caseId, visitIdx, childIdx)])
      .filter(Boolean);
    if (dates.length === 0) return null;
    if (dates.length < VISIT_TIMELINE[visitIdx].children.length) return null;
    return dates.sort().pop() ?? null;
  }

  // Count completed items in a visit
  function visitProgress(visitIdx: number) {
    const total = VISIT_TIMELINE[visitIdx].children.length;
    const done = VISIT_TIMELINE[visitIdx].children.filter(
      (_, childIdx) => !!checks[buildKey(caseId, visitIdx, childIdx)],
    ).length;
    return { done, total };
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1">
        Case Timeline
      </p>
      {VISIT_TIMELINE.map((visit, visitIdx) => {
        const complete = isVisitComplete(visitIdx);
        const completedAt = visitCompletedDate(visitIdx);
        const { done, total } = visitProgress(visitIdx);
        const prevComplete = visitIdx === 0 || isVisitComplete(visitIdx - 1);

        return (
          <div key={visitIdx} className="relative">
            {/* Visit header */}
            <div className={cn(
              'flex items-center justify-between py-2 px-3 rounded-lg transition-colors',
              complete
                ? 'bg-brand-gold/10'
                : 'bg-brand-cream/50',
            )}>
              <div className="flex items-center gap-2.5">
                {/* Visit status icon */}
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold',
                  complete
                    ? 'bg-brand-gold text-white'
                    : done > 0
                      ? 'bg-brand-gold/30 text-brand-gold border border-brand-gold/50'
                      : 'bg-white border-2 border-brand-light-gray text-brand-mid-gray',
                )}>
                  {complete ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{visitIdx + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  complete ? 'text-brand-gold' : 'text-brand-black',
                )}>
                  {visit.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress */}
                <span className="text-[10px] font-mono text-brand-mid-gray">
                  {done}/{total}
                </span>
                {/* Completion date */}
                {completedAt && (
                  <span className="text-[10px] text-brand-gold font-mono">
                    {formatDate(completedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Checklist items */}
            <div className="ml-6 mt-1 space-y-0.5">
              {visit.children.map((child, childIdx) => {
                const key = buildKey(caseId, visitIdx, childIdx);
                const isChecked = !!checks[key];
                const checkedAt = checks[key] ?? null;

                return (
                  <label
                    key={childIdx}
                    className={cn(
                      'flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors group',
                      isChecked
                        ? 'hover:bg-brand-gold/5'
                        : 'hover:bg-brand-cream',
                    )}
                  >
                    {/* Checkbox */}
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key)}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all',
                        isChecked
                          ? 'bg-brand-gold border-brand-gold'
                          : 'bg-white border-brand-light-gray group-hover:border-brand-gold/50',
                      )}>
                        {isChecked && (
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Label */}
                    <span className={cn(
                      'text-sm flex-1 transition-colors',
                      isChecked
                        ? 'text-brand-mid-gray line-through decoration-brand-gold/40'
                        : 'text-brand-black',
                    )}>
                      {child}
                    </span>

                    {/* Completed date */}
                    {checkedAt && (
                      <span className="text-[9px] font-mono text-brand-mid-gray/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatDate(checkedAt)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Connecting line between visits */}
            {visitIdx < VISIT_TIMELINE.length - 1 && (
              <div className="ml-[21px] mt-1 mb-1">
                <div className={cn(
                  'w-0.5 h-3',
                  complete ? 'bg-brand-gold' : 'bg-brand-light-gray',
                )} />
              </div>
            )}
          </div>
        );
      })}

      {/* Overall progress bar */}
      {(() => {
        const totalItems = VISIT_TIMELINE.reduce((sum, v) => sum + v.children.length, 0);
        const doneItems = VISIT_TIMELINE.reduce(
          (sum, v, vi) =>
            sum + v.children.filter((_, ci) => !!checks[buildKey(caseId, vi, ci)]).length,
          0,
        );
        const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
        return (
          <div className="mt-3 pt-3 border-t border-brand-light-gray/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-brand-mid-gray font-medium">
                Overall Progress
              </span>
              <span className="text-xs font-mono text-brand-black">{pct}%</span>
            </div>
            <div className="h-1.5 bg-brand-light-gray/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getPatientById } = useDemoContext();

  const patient = getPatientById(id);
  const patientCases = mockCases.filter((c) => c.patientId === id);

  if (!patient) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-serif text-2xl text-brand-black mb-2">Patient Not Found</p>
          <p className="text-brand-mid-gray mb-6">
            We could not locate a patient with that ID.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <AppShell>
      <DevIndicator file="src/app/patients/[id]/page.tsx" section="Patient Detail" />
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-brand-mid-gray hover:text-brand-gold transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center shrink-0">
            <span className="font-serif text-2xl text-brand-gold">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl text-brand-black mb-1">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-brand-mid-gray mb-2">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4l6 4 6-4M2 4v8a1 1 0 001 1h10a1 1 0 001-1V4M2 4a1 1 0 011-1h10a1 1 0 011 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {patient.email}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3.654 1.328a.678.678 0 00-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 004.168 6.608 17.569 17.569 0 006.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 00-.063-1.015l-2.307-1.794a.678.678 0 00-.58-.122l-2.19.547a1.745 1.745 0 01-1.657-.459L5.482 8.062a1.745 1.745 0 01-.46-1.657l.548-2.19a.678.678 0 00-.122-.58L3.654 1.328z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {patient.phone}
              </span>
            </div>
            <p className="text-xs text-brand-mid-gray">
              Patient since {formatDate(patient.createdAt)}
            </p>
            {patient.notes && (
              <p className="mt-3 text-sm italic text-brand-mid-gray max-w-2xl leading-relaxed">
                &ldquo;{patient.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Cases */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-10">
        <h2 className="font-serif text-lg text-brand-black mb-4 tracking-wide uppercase">
          Cases
        </h2>

        {patientCases.length === 0 ? (
          <Card className="border border-brand-light-gray bg-white">
            <CardContent className="py-12 text-center">
              <p className="text-brand-mid-gray mb-4">No cases yet for this patient.</p>
              <Button
                onClick={() => {
                  const newCaseId = `case-new-${Date.now().toString(36)}`;
                  router.push(`/capture/${newCaseId}`);
                }}
              >
                Start New Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {patientCases.map((c) => (
              <Card key={c.id} className="border border-brand-light-gray bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-base text-brand-black">
                      {c.treatment.charAt(0).toUpperCase() + c.treatment.slice(1)} Case
                    </CardTitle>
                    <Badge className={cn('text-xs font-sans', getStatusColor(c.status))}>
                      {getStatusLabel(c.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-brand-mid-gray mb-4">
                    {c.shade && (
                      <span>
                        <span className="text-brand-warm-gray">Shade:</span>{' '}
                        <span className="text-brand-black font-medium">{c.shade}</span>
                      </span>
                    )}
                    <span>
                      <span className="text-brand-warm-gray">Created:</span>{' '}
                      {formatDate(c.createdAt)}
                    </span>
                    <span>
                      <span className="text-brand-warm-gray">Updated:</span>{' '}
                      {formatDate(c.updatedAt)}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    {(c.status === 'consultation' || c.status === 'capture') && (
                      <Link href={`/capture/${c.id}`}>
                        <Button size="sm">Start Capture</Button>
                      </Link>
                    )}
                    {(c.status === 'analysis' || c.status === 'design') && (
                      <Link href={`/workspace/${c.id}`}>
                        <Button size="sm">View Workspace</Button>
                      </Link>
                    )}
                    {c.treatmentPlan && (
                      <Link href={`/treatment/${c.id}`}>
                        <Button variant="outline" size="sm">
                          View Treatment Plan
                        </Button>
                      </Link>
                    )}
                    <Link href={`/consult/${c.id}`}>
                      <Button variant="outline" size="sm">
                        Virtual Consult
                      </Button>
                    </Link>
                  </div>
                </CardContent>

                {/* Timeline */}
                <CardFooter className="pt-4 border-t border-brand-light-gray">
                  <CaseTimeline caseId={c.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Start New Case button when all existing cases are complete */}
      {patientCases.length > 0 &&
        patientCases.every((c) => c.status === 'complete') && (
          <div className="text-center">
            <Button
              onClick={() => {
                const newCaseId = `case-new-${Date.now().toString(36)}`;
                router.push(`/capture/${newCaseId}`);
              }}
            >
              Start New Case
            </Button>
          </div>
        )}
    </AppShell>
  );
}
