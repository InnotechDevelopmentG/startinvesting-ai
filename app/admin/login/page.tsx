'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Incorrect password.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="flex justify-center mb-8">
          <Logo size={32} />
        </div>
        <div className="bg-white rounded-2xl border border-[#f3f4f6] p-8 shadow-sm">
          <h1 className="text-[20px] font-medium text-[#111] tracking-tight mb-1">Admin access</h1>
          <p className="text-[13px] text-[#888] mb-6">Enter your admin password to continue.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3.5 text-[15px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors"
            />
            {error && <p className="text-[13px] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
