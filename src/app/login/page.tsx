'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDemoContext } from '@/lib/demo-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useDemoContext();

  const [email, setEmail] = useState('dr.saleh@dentalvisual.pro');
  const [password, setPassword] = useState('••••••••');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* ---- Left hero (55%) ---- */}
      <div className="hidden lg:flex w-[55%] bg-brand-black items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif uppercase tracking-[0.2em] text-brand-gold text-3xl">
            DENTALVISION PRO
          </h1>
          <p className="text-brand-mid-gray text-lg font-sans mt-3">
            AI Smile Design Studio
          </p>

          <div className="w-24 h-[1px] bg-brand-gold mx-auto my-8" />

          <p className="italic font-serif text-brand-cream/60 text-lg">
            Where AI Meets Artistry
          </p>
        </div>
      </div>

      {/* ---- Right form (45%) ---- */}
      <div className="flex w-full lg:w-[45%] bg-brand-cream items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-serif uppercase tracking-[0.2em] text-brand-gold text-2xl">
              DENTALVISION PRO
            </h1>
          </div>

          <h2 className="font-serif text-2xl text-brand-black">
            Welcome Back
          </h2>
          <p className="text-brand-mid-gray mt-1 mb-8">
            Sign in to your practice
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-sans text-brand-warm-gray mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-[14px] border border-brand-warm-gray/20 bg-white px-4 text-sm font-sans text-brand-warm-gray placeholder:text-brand-mid-gray focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-sans text-brand-warm-gray mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-[14px] border border-brand-warm-gray/20 bg-white px-4 text-sm font-sans text-brand-warm-gray placeholder:text-brand-mid-gray focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" rounded="card">
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-brand-mid-gray mt-8">
            Ora Dentistry Spa &middot; Beverly Hills
          </p>
        </div>
      </div>
    </div>
  );
}
