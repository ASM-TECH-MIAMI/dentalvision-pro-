'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDemoContext } from '@/lib/demo-context';
import { mockCases } from '@/lib/mock-data';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import type { CaseStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Timeline helpers
// ---------------------------------------------------------------------------

const STATUS_PROGRESSION: CaseStatus[] = [
  'consultation',
  'capture',
  'analysis',
  'design',
  'treatment',
  'complete',
];

const TIMELINE_LABELS: Record<CaseStatus, string> = {
  consultation: 'Case Created',
  capture: 'Photos Captured',
  analysis: 'Analysis Complete',
  design: 'Design Review',
  treatment: 'Treatment Plan',
  complete: 'Complete',
};

function getCompletedIndex(status: CaseStatus): number {
  return STATUS_PROGRESSION.indexOf(status);
}

function getMockTimestamp(caseCreated: string, stepIndex: number): string {
  const base = new Date(caseCreated);
  base.setDate(base.getDate() + stepIndex);
  return base.toISOString();
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
                  <div className="w-full">
                    <p className="text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-3">
                      Case Timeline
                    </p>
                    <div className="relative pl-6">
                      {STATUS_PROGRESSION.map((step, i) => {
                        const completedIdx = getCompletedIndex(c.status);
                        const isCompleted = i <= completedIdx;
                        const isLast = i === STATUS_PROGRESSION.length - 1;

                        return (
                          <div key={step} className="relative pb-4 last:pb-0">
                            {/* Connecting line */}
                            {!isLast && (
                              <div
                                className={cn(
                                  'absolute left-[-18px] top-3 w-0.5 h-full',
                                  i < completedIdx ? 'bg-brand-gold' : 'bg-brand-light-gray'
                                )}
                              />
                            )}
                            {/* Dot */}
                            <div
                              className={cn(
                                'absolute left-[-22px] top-1 w-2.5 h-2.5 rounded-full border-2',
                                isCompleted
                                  ? 'bg-brand-gold border-brand-gold'
                                  : 'bg-white border-brand-light-gray'
                              )}
                            />
                            {/* Content */}
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  'text-sm',
                                  isCompleted ? 'text-brand-black font-medium' : 'text-brand-mid-gray'
                                )}
                              >
                                {TIMELINE_LABELS[step]}
                              </span>
                              {isCompleted && (
                                <span className="text-xs text-brand-mid-gray">
                                  {formatDate(getMockTimestamp(c.createdAt, i))}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
