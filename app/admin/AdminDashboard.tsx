'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

interface Submission {
  id: string;
  email: string;
  age: number;
  starting_amount: number;
  frequency: string;
  contribution_amount: number;
  years: number;
  risk_profile: string;
  projected_value: number;
  savings_benchmark: number;
  created_at: string;
}

type SortKey = keyof Submission;

const RISK_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  conservative: { bg: '#f3f4f6', text: '#555', label: 'Steady' },
  moderate:     { bg: '#E6FAF5', text: '#00C896', label: 'Builder' },
  growth:       { bg: '#fff7ed', text: '#f97316', label: 'Accelerator' },
};

const FREQ_SUFFIX: Record<string, string> = {
  weekly: '/wk',
  biweekly: '/2wk',
  monthly: '/mo',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'created_at',         label: 'Date' },
  { key: 'email',              label: 'Email' },
  { key: 'age',                label: 'Age' },
  { key: 'contribution_amount', label: 'Contribution' },
  { key: 'projected_value',    label: 'Projected' },
  { key: 'risk_profile',       label: 'Risk' },
  { key: 'years',              label: 'Years' },
];

export default function AdminDashboard({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // ── Stats ──────────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const statsToday = submissions.filter(s => new Date(s.created_at).toDateString() === todayStr).length;
  const statsWeek  = submissions.filter(s => new Date(s.created_at) >= weekAgo).length;
  const statsMonth = submissions.filter(s => new Date(s.created_at) >= monthStart).length;
  const avgProjected = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.projected_value || 0), 0) / submissions.length)
    : 0;

  const riskCounts = {
    conservative: submissions.filter(s => s.risk_profile === 'conservative').length,
    moderate:     submissions.filter(s => s.risk_profile === 'moderate').length,
    growth:       submissions.filter(s => s.risk_profile === 'growth').length,
  };

  // ── Table ──────────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    let list = search
      ? submissions.filter(s => s.email.toLowerCase().includes(q))
      : submissions;

    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [submissions, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Header */}
      <div className="bg-white border-b border-[#f3f4f6] px-6 md:px-10 sticky top-0 z-10" style={{ height: '60px' }}>
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[11px] font-semibold tracking-wide text-white bg-[#00C896] px-2 py-0.5 rounded-full uppercase">
              admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/export"
              className="px-4 py-2 text-[13px] font-medium rounded-lg border border-[#e5e7eb] text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors"
            >
              Export CSV
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[13px] font-medium rounded-lg border border-[#e5e7eb] text-[#888] hover:text-[#111] hover:border-[#d1d5db] transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total leads',  value: submissions.length },
            { label: 'Today',        value: statsToday },
            { label: 'This week',    value: statsWeek },
            { label: 'This month',   value: statsMonth },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">{label}</p>
              <p className="text-[30px] font-medium text-[#111] leading-none tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">Avg projected value</p>
            <p className="text-[26px] font-medium text-[#00C896] leading-none tracking-tight font-tabular">{fmt(avgProjected)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-3">Risk profile breakdown</p>
            <div className="flex flex-wrap gap-4">
              {(['conservative', 'moderate', 'growth'] as const).map((r) => {
                const s = RISK_STYLE[r];
                return (
                  <div key={r} className="flex items-center gap-2">
                    <span
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: s.bg, color: s.text }}
                    >
                      {s.label}
                    </span>
                    <span className="text-[16px] font-medium text-[#111]">{riskCounts[r]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl border border-[#f3f4f6] overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between gap-4">
            <h2 className="text-[14px] font-medium text-[#111] flex-shrink-0">
              All leads
              <span className="ml-2 text-[#aaa] font-normal">({submissions.length})</span>
            </h2>
            <input
              type="text"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full max-w-[240px]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {COLUMNS.map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#aaa] cursor-pointer hover:text-[#555] select-none whitespace-nowrap"
                    >
                      {label}
                      {sortKey === key
                        ? <span className="ml-1 text-[#00C896]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        : <span className="ml-1 text-[#e5e7eb]">↕</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-5 py-16 text-center text-[14px] text-[#ccc]">
                      {search ? `No results matching "${search}"` : 'No submissions yet.'}
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => {
                    const rs = RISK_STYLE[s.risk_profile] ?? RISK_STYLE.conservative;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">
                          {fmtDate(s.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-[#111]">
                          {s.email}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#555]">
                          {s.age}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#555] font-tabular whitespace-nowrap">
                          ${(s.contribution_amount ?? 0).toLocaleString()}
                          <span className="text-[#bbb]">{FREQ_SUFFIX[s.frequency] ?? ''}</span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#00C896] font-tabular whitespace-nowrap">
                          {fmt(s.projected_value)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{ background: rs.bg, color: rs.text }}
                          >
                            {rs.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#555]">
                          {s.years}yr
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="px-5 py-3 border-t border-[#f3f4f6]">
              <p className="text-[12px] text-[#bbb]">
                {search
                  ? `Showing ${rows.length} of ${submissions.length} leads matching "${search}"`
                  : `${submissions.length} lead${submissions.length !== 1 ? 's' : ''} total`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
