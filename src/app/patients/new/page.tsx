'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDemoContext } from '@/lib/demo-context';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateId } from '@/lib/utils';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = useDemoContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');

  const isValid = firstName.trim() !== '' && lastName.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const patientId = generateId('pat');
    const newCaseId = generateId('case');

    addPatient({
      id: patientId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName.trim())}+${encodeURIComponent(lastName.trim())}&background=1e293b&color=f8fafc&size=128`,
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    });

    router.push(`/capture/${newCaseId}`);
  }

  const inputClassName =
    'bg-white border border-brand-light-gray rounded-[14px] px-4 py-3 text-sm text-brand-black placeholder:text-brand-mid-gray/60 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors';

  return (
    <AppShell>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-brand-mid-gray hover:text-brand-gold transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Heading */}
      <h1 className="font-serif text-2xl text-brand-black tracking-wide uppercase mb-6">
        New Patient
      </h1>

      <Card className="max-w-2xl border border-brand-light-gray bg-white">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-brand-black">
            Patient Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First / Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                  First Name <span className="text-brand-gold">*</span>
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Isabella"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-brand-gold">*</span>
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Marchetti"
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            {/* Email / Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@email.com"
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(310) 555-0000"
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="max-w-xs">
              <label htmlFor="dob" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-brand-warm-gray uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, referral source, treatment interests..."
                rows={4}
                className={`${inputClassName} w-full resize-none`}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={!isValid} size="lg">
                Create Patient &amp; Start Case
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
