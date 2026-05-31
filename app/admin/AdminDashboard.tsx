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

interface Subscriber {
  id: string;
  email: string;
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

const SUBMISSION_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'created_at',          label: 'Date' },
  { key: 'email',               label: 'Email' },
  { key: 'age',                 label: 'Age' },
  { key: 'contribution_amount', label: 'Contribution' },
  { key: 'projected_value',     label: 'Projected' },
  { key: 'risk_profile',        label: 'Risk' },
  { key: 'years',               label: 'Years' },
];

export default function AdminDashboard({
  submissions,
  subscribers,
}: {
  submissions: Submission[];
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'leads' | 'subscribers'>('leads');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [subSearch, setSubSearch] = useState('');

  // ── Stats ──────────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr  = now.toDateString();
  const weekAgo   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const statsToday = submissions.filter(s => new Date(s.created_at).toDateString() === todayStr).length;
  const statsWeek  = submissions.filter(s => new Date(s.created_at) >= weekAgo).length;
  const statsMonth = submissions.filter(s => new Date(s.created_at) >= monthStart).length;
  const avgProjected = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.projected_value || 0), 0) / submissions.length)
    : 0;

  const subToday = subscribers.filter(s => new Date(s.created_at).toDateString() === todayStr).length;
  const subWeek  = subscribers.filter(s => new Date(s.created_at) >= weekAgo).length;

  const riskCounts = {
    conservative: submissions.filter(s => s.risk_profile === 'conservative').length,
    moderate:     submissions.filter(s => s.risk_profile === 'moderate').length,
    growth:       submissions.filter(s => s.risk_profile === 'growth').length,
  };

  // ── Simulator leads table ───────────────────────────────────────────────
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

  // ── Newsletter subscribers table ────────────────────────────────────────
  const subRows = useMemo(() => {
    const q = subSearch.toLowerCase();
    return q
      ? subscribers.filter(s => s.email.toLowerCase().includes(q))
      : subscribers;
  }, [subscribers, subSearch]);

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
            { label: 'Simulator leads', value: submissions.length },
            { label: 'Newsletter subs',  value: subscribers.length },
            { label: 'Leads this week',  value: statsWeek },
            { label: 'Subs this week',   value: subWeek },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">{label}</p>
              <p className="text-[30px] font-medium text-[#111] leading-none tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">Avg projected value</p>
            <p className="text-[26px] font-medium text-[#00C896] leading-none tracking-tight font-tabular">{fmt(avgProjected)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">Leads today</p>
            <p className="text-[26px] font-medium text-[#111] leading-none tracking-tight">{statsToday}</p>
            <p className="text-[11px] text-[#bbb] mt-1">{statsMonth} this month</p>
          </div>
          <div className="bg-white rounded-xl border border-[#f3f4f6] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-3">Risk profile breakdown</p>
            <div className="flex flex-wrap gap-4">
              {(['conservative', 'moderate', 'growth'] as const).map((r) => {
                const s = RISK_STYLE[r];
                return (
                  <div key={r} className="flex items-center gap-2">
                    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>
                      {s.label}
                    </span>
                    <span className="text-[16px] font-medium text-[#111]">{riskCounts[r]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab switcher + table */}
        <div className="bg-white rounded-xl border border-[#f3f4f6] overflow-hidden">

          {/* Tabs + search */}
          <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTab('leads')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  tab === 'leads'
                    ? 'bg-[#f3f4f6] text-[#111]'
                    : 'text-[#888] hover:text-[#111] hover:bg-[#f9f9f9]'
                }`}
              >
                Simulator leads
                <span className="ml-1.5 text-[11px] text-[#aaa]">({submissions.length})</span>
              </button>
              <button
                onClick={() => setTab('subscribers')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  tab === 'subscribers'
                    ? 'bg-[#f3f4f6] text-[#111]'
                    : 'text-[#888] hover:text-[#111] hover:bg-[#f9f9f9]'
                }`}
              >
                Newsletter subscribers
                <span className="ml-1.5 text-[11px] text-[#aaa]">({subscribers.length})</span>
              </button>
            </div>
            {tab === 'leads' ? (
              <input
                type="text"
                placeholder="Search by email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full max-w-[240px]"
              />
            ) : (
              <input
                type="text"
                placeholder="Search by email…"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full max-w-[240px]"
              />
            )}
          </div>

          {/* ── Simulator leads table ── */}
          {tab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    {SUBMISSION_COLUMNS.map(({ key, label }) => (
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
                      <td colSpan={SUBMISSION_COLUMNS.length} className="px-5 py-16 text-center text-[14px] text-[#ccc]">
                        {search ? `No results matching "${search}"` : 'No submissions yet.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((s) => {
                      const rs = RISK_STYLE[s.risk_profile] ?? RISK_STYLE.conservative;
                      return (
                        <tr key={s.id} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                          <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">{fmtDate(s.created_at)}</td>
                          <td className="px-5 py-3.5 text-[13px] font-medium text-[#111]">{s.email}</td>
                          <td className="px-5 py-3.5 text-[13px] text-[#555]">{s.age}</td>
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
                          <td className="px-5 py-3.5 text-[13px] text-[#555]">{s.years}yr</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Newsletter subscribers table ── */}
          {tab === 'subscribers' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#aaa] whitespace-nowrap">Date</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#aaa]">Email</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#aaa]">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {subRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-16 text-center text-[14px] text-[#ccc]">
                        {subSearch ? `No results matching "${subSearch}"` : 'No subscribers yet.'}
                      </td>
                    </tr>
                  ) : (
                    subRows.map((s) => {
                      // If email also exists in submissions, they came from the simulator
                      const isSimulator = submissions.some(sub => sub.email === s.email);
                      return (
                        <tr key={s.id} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                          <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">{fmtDate(s.created_at)}</td>
                          <td className="px-5 py-3.5 text-[13px] font-medium text-[#111]">{s.email}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={isSimulator
                                ? { background: '#E6FAF5', color: '#00C896' }
                                : { background: '#f3f4f6', color: '#888' }}
                            >
                              {isSimulator ? 'Simulator' : 'Newsletter'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer row count */}
          <div className="px-5 py-3 border-t border-[#f3f4f6]">
            {tab === 'leads' ? (
              <p className="text-[12px] text-[#bbb]">
                {search
                  ? `Showing ${rows.length} of ${submissions.length} leads matching "${search}"`
                  : `${submissions.length} lead${submissions.length !== 1 ? 's' : ''} total`}
              </p>
            ) : (
              <p className="text-[12px] text-[#bbb]">
                {subSearch
                  ? `Showing ${subRows.length} of ${subscribers.length} subscribers matching "${subSearch}"`
                  : `${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''} total · ${subToday} joined today`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
