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

interface Opportunity {
  id: string;
  post_id: string;
  subreddit: string;
  title: string;
  url: string;
  body_snippet: string;
  drafted_reply: string;
  created_at: string;
  addressed?: boolean;
}

type SortKey = keyof Submission;
type Tab = 'leads' | 'subscribers' | 'reddit';

const RISK_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  conservative: { bg: '#f3f4f6', text: '#555', label: 'Steady' },
  moderate:     { bg: '#E6FAF5', text: '#00C896', label: 'Builder' },
  growth:       { bg: '#fff7ed', text: '#f97316', label: 'Accelerator' },
};

const FREQ_SUFFIX: Record<string, string> = {
  weekly: '/wk', biweekly: '/2wk', monthly: '/mo',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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
  opportunities,
  addressed,
}: {
  submissions: Submission[];
  subscribers: Subscriber[];
  opportunities: Opportunity[];
  addressed: Opportunity[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('leads');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [subSearch, setSubSearch] = useState('');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [addressedIds, setAddressedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // ── Stats ───────────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr   = now.toDateString();
  const weekAgo    = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const statsToday = submissions.filter(s => new Date(s.created_at).toDateString() === todayStr).length;
  const statsWeek  = submissions.filter(s => new Date(s.created_at) >= weekAgo).length;
  const statsMonth = submissions.filter(s => new Date(s.created_at) >= monthStart).length;
  const avgProjected = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.projected_value || 0), 0) / submissions.length)
    : 0;
  const subWeek = subscribers.filter(s => new Date(s.created_at) >= weekAgo).length;
  const subToday = subscribers.filter(s => new Date(s.created_at).toDateString() === todayStr).length;

  const riskCounts = {
    conservative: submissions.filter(s => s.risk_profile === 'conservative').length,
    moderate:     submissions.filter(s => s.risk_profile === 'moderate').length,
    growth:       submissions.filter(s => s.risk_profile === 'growth').length,
  };

  // ── Leads table ─────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    let list = search ? submissions.filter(s => s.email.toLowerCase().includes(q)) : submissions;
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [submissions, search, sortKey, sortDir]);

  // ── Subscribers table ────────────────────────────────────────────────────
  const subRows = useMemo(() => {
    const q = subSearch.toLowerCase();
    return q ? subscribers.filter(s => s.email.toLowerCase().includes(q)) : subscribers;
  }, [subscribers, subSearch]);

  // ── Reddit opportunities ─────────────────────────────────────────────────
  const visibleOpps = useMemo(
    () => opportunities.filter(o => !dismissed.has(o.id) && !addressedIds.has(o.id)),
    [opportunities, dismissed, addressedIds]
  );

  const completedOpps = useMemo(
    () => [...addressed, ...opportunities.filter(o => addressedIds.has(o.id))],
    [addressed, opportunities, addressedIds]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function handleDismiss(id: string) {
    setDismissed(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
    await fetch('/api/admin/reddit-dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  async function handleAddress(id: string) {
    setAddressedIds(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
    await fetch('/api/admin/reddit-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  async function handleCopy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    handleAddress(id);
  }

  async function handleScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/admin/reddit-scan', { method: 'POST' });
      const data = await res.json() as { success?: boolean; inserted?: number; found?: number; fetched?: number; unique?: number; error?: string };
      if (!res.ok || data.error) {
        setScanResult(`Error: ${data.error ?? 'scan failed'}`);
      } else {
        const fetched = data.fetched ?? data.found ?? 0;
        const unique = data.unique ?? fetched;
        setScanResult(`Fetched ${fetched} posts · ${unique} unique · added ${data.inserted} new opportunit${data.inserted !== 1 ? 'ies' : 'y'}`);
        router.refresh();
      }
    } catch {
      setScanResult('Error: could not reach scan endpoint');
    } finally {
      setScanning(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Header */}
      <div className="bg-white border-b border-[#f3f4f6] px-6 md:px-10 sticky top-0 z-10" style={{ height: '60px' }}>
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[11px] font-semibold tracking-wide text-white bg-[#00C896] px-2 py-0.5 rounded-full uppercase">admin</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/admin/export" className="px-4 py-2 text-[13px] font-medium rounded-lg border border-[#e5e7eb] text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors">
              Export CSV
            </a>
            <button onClick={handleLogout} className="px-4 py-2 text-[13px] font-medium rounded-lg border border-[#e5e7eb] text-[#888] hover:text-[#111] hover:border-[#d1d5db] transition-colors">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Simulator leads',  value: submissions.length },
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
                    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    <span className="text-[16px] font-medium text-[#111]">{riskCounts[r]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab container */}
        <div className="bg-white rounded-xl border border-[#f3f4f6] overflow-hidden">

          {/* Tab bar */}
          <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              {([
                { key: 'leads',       label: 'Simulator leads',        count: submissions.length },
                { key: 'subscribers', label: 'Newsletter subscribers',  count: subscribers.length },
                { key: 'reddit',      label: 'Reddit opportunities',    count: visibleOpps.length },
              ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                    tab === key ? 'bg-[#f3f4f6] text-[#111]' : 'text-[#888] hover:text-[#111] hover:bg-[#f9f9f9]'
                  }`}
                >
                  {label}
                  <span className="ml-1.5 text-[11px] text-[#aaa]">({count})</span>
                </button>
              ))}
            </div>

            {tab === 'leads' && (
              <input type="text" placeholder="Search by email…" value={search} onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full max-w-[240px]" />
            )}
            {tab === 'subscribers' && (
              <input type="text" placeholder="Search by email…" value={subSearch} onChange={e => setSubSearch(e.target.value)}
                className="px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full max-w-[240px]" />
            )}
            {tab === 'reddit' && (
              <div className="flex items-center gap-3">
                {scanResult && (
                  <span className={`text-[12px] ${scanResult.startsWith('Error') ? 'text-red-500' : 'text-[#00C896]'}`}>
                    {scanResult}
                  </span>
                )}
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg bg-[#111] text-white hover:bg-[#333] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {scanning ? 'Scanning Reddit…' : 'Scan Reddit now'}
                </button>
              </div>
            )}
          </div>

          {/* ── Simulator leads ── */}
          {tab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    {SUBMISSION_COLUMNS.map(({ key, label }) => (
                      <th key={key} onClick={() => toggleSort(key)}
                        className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#aaa] cursor-pointer hover:text-[#555] select-none whitespace-nowrap">
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
                    <tr><td colSpan={7} className="px-5 py-16 text-center text-[14px] text-[#ccc]">
                      {search ? `No results matching "${search}"` : 'No submissions yet.'}
                    </td></tr>
                  ) : rows.map((s) => {
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
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#00C896] font-tabular whitespace-nowrap">{fmt(s.projected_value)}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: rs.bg, color: rs.text }}>
                            {rs.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#555]">{s.years}yr</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-[#f3f4f6]">
                <p className="text-[12px] text-[#bbb]">
                  {search ? `Showing ${rows.length} of ${submissions.length} matching "${search}"` : `${submissions.length} lead${submissions.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
            </div>
          )}

          {/* ── Newsletter subscribers ── */}
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
                    <tr><td colSpan={3} className="px-5 py-16 text-center text-[14px] text-[#ccc]">
                      {subSearch ? `No results matching "${subSearch}"` : 'No subscribers yet.'}
                    </td></tr>
                  ) : subRows.map((s) => {
                    const isSimulator = submissions.some(sub => sub.email === s.email);
                    return (
                      <tr key={s.id} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                        <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">{fmtDate(s.created_at)}</td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-[#111]">{s.email}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={isSimulator ? { background: '#E6FAF5', color: '#00C896' } : { background: '#f3f4f6', color: '#888' }}>
                            {isSimulator ? 'Simulator' : 'Newsletter'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-[#f3f4f6]">
                <p className="text-[12px] text-[#bbb]">
                  {subSearch ? `Showing ${subRows.length} of ${subscribers.length} matching "${subSearch}"` : `${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''} total · ${subToday} joined today`}
                </p>
              </div>
            </div>
          )}

          {/* ── Reddit opportunities ── */}
          {tab === 'reddit' && (
            <div className="p-5">
              {visibleOpps.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#d1d5db" strokeWidth="1.5"/>
                      <path d="M13.5 7.5a3.5 3.5 0 00-7 0c0 2 1.5 3 3.5 3.5" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="10" cy="15" r="1" fill="#d1d5db"/>
                    </svg>
                  </div>
                  <p className="text-[15px] font-medium text-[#111]">No opportunities yet</p>
                  <p className="text-[13px] text-[#888]">Click "Scan Reddit now" to find relevant posts, or wait for the daily scan at 10am.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleOpps.map((opp) => (
                    <div key={opp.id} className="rounded-xl border border-[#f3f4f6] p-5 hover:border-[#e5e7eb] transition-colors">

                      {/* Post header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-[#ff4500] bg-[#fff1ee] px-2.5 py-1 rounded-full">
                            r/{opp.subreddit}
                          </span>
                          <span className="text-[11px] text-[#bbb]">{timeAgo(opp.created_at)}</span>
                        </div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1 text-[12px] text-[#888] hover:text-[#00C896] transition-colors"
                        >
                          Open thread
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 9L9 1M9 1H4M9 1v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>

                      {/* Post title */}
                      <p className="text-[14px] font-semibold text-[#111] leading-snug mb-2">{opp.title}</p>

                      {/* Post snippet */}
                      {opp.body_snippet && (
                        <p className="text-[12px] text-[#888] leading-relaxed mb-4 line-clamp-2">{opp.body_snippet}</p>
                      )}

                      {/* Divider */}
                      <div className="border-t border-[#f3f4f6] mb-4" />

                      {/* Drafted reply */}
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">Drafted reply</p>
                      <div className="bg-[#fafafa] rounded-lg px-4 py-3 mb-4">
                        <p className="text-[13px] text-[#444] leading-relaxed whitespace-pre-wrap">{opp.drafted_reply}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(opp.id, opp.drafted_reply)}
                          className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
                        >
                          {copied === opp.id ? 'Copied!' : 'Copy reply'}
                        </button>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleAddress(opp.id)}
                          className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#e5e7eb] text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors"
                        >
                          Go post it →
                        </a>
                        <button
                          onClick={() => handleDismiss(opp.id)}
                          className="ml-auto px-4 py-2 rounded-lg text-[13px] text-[#bbb] hover:text-[#888] transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Completed section */}
              {completedOpps.length > 0 && (
                <div className="mt-6 border-t border-[#f3f4f6] pt-4">
                  <button
                    onClick={() => setShowCompleted(v => !v)}
                    className="flex items-center gap-2 text-[12px] font-medium text-[#aaa] hover:text-[#555] transition-colors mb-3"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{ transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Completed ({completedOpps.length})
                  </button>
                  {showCompleted && (
                    <div className="flex flex-col gap-3">
                      {completedOpps.map(opp => (
                        <div key={opp.id} className="rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-4 opacity-60">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-[#ff4500] bg-[#fff1ee] px-2 py-0.5 rounded-full">r/{opp.subreddit}</span>
                              <span className="text-[11px] text-[#bbb]">{timeAgo(opp.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                <path d="M1 5l3.5 3.5L11 1" stroke="#00C896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-[11px] text-[#00C896] font-medium">Posted</span>
                            </div>
                          </div>
                          <p className="text-[13px] text-[#555] mt-2 leading-snug">{opp.title}</p>
                          <a href={opp.url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-[#bbb] hover:text-[#00C896] transition-colors mt-1 inline-block">
                            View thread →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
                <p className="text-[12px] text-[#bbb]">
                  {visibleOpps.length} to action · {completedOpps.length} completed · Auto-scans daily at 10am UTC · Always review before posting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
