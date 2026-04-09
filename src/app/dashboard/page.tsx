'use client';

import Link from 'next/link';
import { Briefcase, Camera, Clock, Heart, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DevIndicator } from '@/components/ui/dev-indicator';
import {
  mockCases,
  recentActivity,
  dashboardStats,
  mockPatients,
} from '@/lib/mock-data';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  cn,
} from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPatient(patientId: string) {
  return mockPatients.find((p) => p.id === patientId);
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`;
}

function activityDotColor(type: string) {
  if (type === 'case-completed') return 'bg-emerald-500';
  return 'bg-brand-gold';
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats = [
  {
    label: 'Active Cases',
    value: dashboardStats.activeCases,
    icon: Briefcase,
  },
  {
    label: 'Scans Today',
    value: dashboardStats.scansToday,
    icon: Camera,
  },
  {
    label: 'Avg. Case Time',
    value: dashboardStats.avgCaseTime,
    icon: Clock,
  },
  {
    label: 'Satisfaction',
    value: dashboardStats.satisfaction,
    icon: Heart,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <AppShell>
      <DevIndicator file="src/app/dashboard/page.tsx" section="Dashboard" />
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif uppercase tracking-[0.15em] text-brand-black text-2xl">
          Dashboard
        </h1>
        <Link href="/patients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </Link>
      </div>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.label} variant="light">
            <CardContent className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-2xl font-serif text-brand-black">
                  {stat.value}
                </p>
                <p className="text-sm text-brand-mid-gray">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Active Cases ---- */}
      <h2 className="font-serif uppercase tracking-[0.12em] text-brand-black text-lg mb-5">
        Active Cases
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {mockCases
          .filter((c) => c.status !== 'complete')
          .map((caseItem) => {
            const patient = getPatient(caseItem.patientId);
            if (!patient) return null;

            return (
              <Link
                key={caseItem.id}
                href={`/patients/${caseItem.patientId}`}
              >
                <Card
                  variant="light"
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30 flex items-center justify-center font-serif font-medium text-sm">
                        {getInitials(patient.firstName, patient.lastName)}
                      </div>
                      <div>
                        <p className="font-serif font-medium text-brand-black">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-brand-mid-gray capitalize">
                            {caseItem.treatment}
                          </span>
                          {caseItem.shade && (
                            <span className="text-xs font-sans px-1.5 py-0.5 rounded bg-brand-gold/10 text-brand-gold">
                              {caseItem.shade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-xs font-sans px-2.5 py-1 rounded-full',
                          getStatusColor(caseItem.status),
                        )}
                      >
                        {getStatusLabel(caseItem.status)}
                      </span>
                      <span className="text-xs text-brand-mid-gray">
                        Last updated: {formatDate(caseItem.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>

      {/* ---- Recent Activity ---- */}
      <h2 className="font-serif uppercase tracking-[0.12em] text-brand-black text-lg mb-5">
        Recent Activity
      </h2>

      <Card variant="light">
        <CardContent className="divide-y divide-brand-warm-gray/10">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  activityDotColor(item.type),
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-warm-gray leading-relaxed">
                  {item.message}
                </p>
                <p className="text-xs text-brand-mid-gray mt-0.5">
                  {formatDate(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
