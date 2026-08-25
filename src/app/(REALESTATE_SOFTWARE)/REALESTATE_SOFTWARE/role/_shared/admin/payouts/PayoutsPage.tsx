'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Loader2, Clock, CheckCircle2, RefreshCw, XCircle, ChevronDown, ChevronRight, User, MapPin, Ruler, ShoppingBag, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { getAllPayoutsAction, markPayoutCompletedAction, type SaleTotals } from './actions';
import { getSalesRoleOrderAction } from '../commission-rates/actions';
import { ROLE_LABELS, type RealEstateRole } from '../../permissions';

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600', icon: Clock },
  processing: { label: 'Processing', className: 'bg-blue-50 text-blue-600', icon: RefreshCw },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600', icon: XCircle },
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [saleTotals, setSaleTotals] = useState<Record<string, SaleTotals>>({});
  const [canApprove, setCanApprove] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  // Bottom-to-top rank of the commission chain — used to order each
  // sale's payout lines seller-first-up-to-CEO regardless of the order
  // rows happened to be inserted/returned in, so the tree always reads
  // as a real flow: whoever closed the sale at the bottom, CEO at the
  // top. Built from the real, current sales-tier cascade (built-in +
  // any admin-created roles) via getSalesRoleOrderAction — that order
  // is top-to-bottom (Director-first), so it's reversed here and
  // governing_council/ceo appended, same shape as the old hardcoded
  // CHAIN_RANK array this replaces.
  const [chainRank, setChainRank] = useState<string[]>([]);
  // ROLE_LABELS only covers the 5 fixed roles + the 8 built-in
  // sales-tier ones — a role created via Commission Rates isn't in it,
  // so every label lookup in this file falls back to this dynamic map
  // (populated from the same getSalesRoleOrderAction call) via the
  // roleLabel() helper below.
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const [payoutsRes, roleOrderRes] = await Promise.all([getAllPayoutsAction(), getSalesRoleOrderAction()]);
    if (payoutsRes.success) {
      setPayouts(payoutsRes.data);
      setSaleTotals(payoutsRes.saleTotals);
      setCanApprove(payoutsRes.canApprove);
    } else if (payoutsRes.error) {
      setError(payoutsRes.error);
    }
    setChainRank([...roleOrderRes.data.map((r) => r.role_code)].reverse().concat(['governing_council', 'ceo']));
    setDynamicLabels(Object.fromEntries(roleOrderRes.data.map((r) => [r.role_code, r.label])));
    setLoading(false);
  };

  // dynamicLabels checked first — see the identical comment in
  // CommissionRatesPage.tsx's roleLabel(): the 8 built-in sales-tier
  // roles already have a static ROLE_LABELS entry, which would
  // otherwise always shadow a rename made on the Roles/Commissions page.
  const roleLabel = (role: string): string => dynamicLabels[role] || ROLE_LABELS[role as RealEstateRole] || role;

  useEffect(() => {
    load();
  }, []);

  const handleMarkPaid = async (id: string) => {
    const confirmed = window.confirm('Confirm this payout has actually been transferred? This marks it completed and cannot be undone.');
    if (!confirmed) return;
    setMarkingId(id);
    const res = await markPayoutCompletedAction(id);
    if (res.success) load();
    else alert(res.error);
    setMarkingId(null);
  };

  const toggleExpanded = (regId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(regId)) next.delete(regId);
      else next.add(regId);
      return next;
    });
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  // Group every payout line by the sale (registration) it came from — a
  // sale is one seller closing one plot; the whole upline chain that
  // gets paid on it (seller through CEO) belongs together, not scattered
  // across unrelated flat rows.
  type SaleGroup = { registration: any; lines: any[] };
  const groupsMap = new Map<string, SaleGroup>();
  payouts.forEach((p) => {
    const reg = p.s_new_registrations;
    const regId = reg?.id || 'unknown';
    if (!groupsMap.has(regId)) groupsMap.set(regId, { registration: reg, lines: [] });
    groupsMap.get(regId)!.lines.push(p);
  });

  const matchesFilter = (status: string) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return status === 'pending' || status === 'processing';
    return status === 'completed';
  };

  const saleGroups = Array.from(groupsMap.values())
    .map((group) => {
      // Seller's own line is always rank 0 in their own chain by
      // definition (everyone else present outranks them) — so after this
      // sort, index 0 is always the seller, and the list reads bottom-up
      // through the real hierarchy ending at CEO. previousRoleLabel is
      // attached here so the "X% − Y%" caption can name the real role
      // compared against, straight from the DB role field.
      //
      // IMPORTANT: this full chain is never filtered down by status — a
      // sale's tree always shows every real participant. The status
      // filter only decides which SALES appear in the list below (a sale
      // shows under "Completed" once at least one of its lines is), never
      // which lines within an already-expanded sale are visible. Hiding
      // individual lines by status broke "who's the seller" (whichever
      // line happened to survive the filter became index 0), so identity
      // is now read from previous_tier_percentage === 0 — a real DB fact,
      // not an array position — and every line always renders.
      const lines = group.lines
        .slice()
        .sort((a, b) => chainRank.indexOf(a.role) - chainRank.indexOf(b.role))
        .map((p, i, arr) => ({ ...p, previousRoleLabel: i === 0 ? null : roleLabel(arr[i - 1].role) }));

      return {
        ...group,
        lines,
        matchesCurrentFilter: lines.some((p) => matchesFilter(p.payout_status)),
        // Both figures come straight from the server (getAllPayoutsAction's
        // saleTotals) — never summed/counted here.
        totals: saleTotals[group.registration?.id] || { totalDistributed: 0, pendingCount: 0, lineCount: group.lines.length },
      };
    })
    .filter((g) => g.matchesCurrentFilter)
    .filter((g) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const reg = g.registration;
      // Matches on the sale itself OR on anyone in its payout chain, so
      // searching a payee's name surfaces the sale they were paid on.
      return [
        reg?.s_projects?.name,
        reg?.s_areas?.name,
        reg?.seller?.full_name,
        reg?.seller?.role ? roleLabel(reg.seller.role) : '',
        ...g.lines.map((p: any) => p.payee?.full_name),
        ...g.lines.map((p: any) => roleLabel(p.role)),
      ]
        .filter(Boolean)
        .some((field: string) => String(field).toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const cmp = new Date(b.registration?.submitted_at || 0).getTime() - new Date(a.registration?.submitted_at || 0).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#c4a55a]" />
            Payouts
          </h1>
          <p className="text-[#5a6a82] text-sm mt-1">
            {canApprove
              ? "Every sale, grouped with the whole commission chain it triggered. Click a sale to see who's getting paid and mark each line paid once transferred."
              : "Every sale, grouped with the whole commission chain it triggered — read-only. Only the Operation Manager can mark a payout paid."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
            <input
              type="text"
              placeholder="Search project, seller, payee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
            />
          </div>
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            title={sortDir === 'asc' ? 'Newest sales first — click for oldest first' : 'Oldest sales first — click for newest first'}
            className="shrink-0 flex items-center gap-2 bg-white border border-[#e8ecf2] text-[#0f1d33] px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#f3f5f8] transition-colors text-sm"
          >
            {sortDir === 'asc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
            Date
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 max-w-xl shrink-0">{error}</div>}

      <div className="flex items-center gap-2 mb-4 bg-white p-1.5 rounded-xl border border-[#e8ecf2] w-fit shadow-sm shrink-0">
        {(['pending', 'completed', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${statusFilter === s ? 'bg-[#1e3a5f] text-white shadow' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
          >
            {s === 'pending' ? 'Pending / Processing' : s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden">
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
        </div>
      ) : saleGroups.length === 0 ? (
        <div className="p-12 text-center text-[#5a6a82]">
          <Landmark className="w-10 h-10 text-[#e8ecf2] mx-auto mb-3" />
          {searchQuery ? 'No sales match your search.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="flex-1 overflow-auto min-h-0 p-3 space-y-3">
          {saleGroups.map((group, index) => {
            const reg = group.registration;
            const isOpen = expanded.has(reg?.id);
            return (
              <div key={reg?.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden">
                <button onClick={() => toggleExpanded(reg?.id)} className="w-full flex items-center justify-between gap-4 p-4 hover:bg-[#f7f8fa] transition-colors text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-[#5a6a82] bg-[#f3f5f8] rounded w-6 h-6 flex items-center justify-center shrink-0">{index + 1}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-[#5a6a82] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#5a6a82] shrink-0" />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0f1d33]">{reg?.s_projects?.name || 'Unknown project'}</span>
                        <span className="text-xs text-[#5a6a82] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {reg?.s_areas?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#5a6a82]">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Sold by <span className="font-medium text-[#0f1d33]">{reg?.seller?.full_name || '—'}</span> ({reg?.seller?.role ? roleLabel(reg.seller.role) : '—'})
                        </span>
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          {reg?.plot_size_sqyd} sq.yd
                        </span>
                        <span>{reg?.submitted_at ? new Date(reg.submitted_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#0f1d33]">{formatCurrency(group.totals.totalDistributed)}</p>
                    <p className="text-xs text-[#5a6a82]">
                      {group.totals.lineCount} in chain{group.totals.pendingCount > 0 ? ` · ${group.totals.pendingCount} pending` : ''}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#e8ecf2] bg-[#fafbfc] p-4 md:p-5">
                    {/* Root of the tree: the sale itself. Everything below
                        branches off this one event. */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center w-7 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="w-0.5 flex-1 bg-[#e8ecf2] my-1 min-h-[16px]" />
                      </div>
                      <div className="flex-1 pb-1 pt-1">
                        <p className="text-sm font-bold text-[#0f1d33]">
                          {reg?.seller?.full_name} sold {reg?.plot_size_sqyd} sq.yd at {reg?.s_projects?.name}
                        </p>
                        <p className="text-xs text-[#5a6a82]">This is the sale every line below is paid on.</p>
                      </div>
                    </div>

                    {group.lines.map((p, i) => {
                      const statusMeta = STATUS_META[p.payout_status] || STATUS_META.pending;
                      const StatusIcon = statusMeta.icon;
                      const wasRounded = Number(p.amount) !== Number(p.computed_amount);
                      const isPending = p.payout_status === 'pending' || p.payout_status === 'processing';
                      const isLast = i === group.lines.length - 1;
                      // A real DB fact (nobody below them in this chain),
                      // not an array position — stays correct regardless
                      // of which lines are pending/completed/filtered.
                      const isSeller = Number(p.previous_tier_percentage) === 0;

                      // The tree always shows the whole real chain (see
                      // note above) — a line that doesn't match the
                      // active status tab is dimmed rather than hidden,
                      // so it's visible why it's still here.
                      const dimmed = !matchesFilter(p.payout_status);

                      return (
                        <div key={p.id} className={`flex gap-3 ${dimmed ? 'opacity-50' : ''}`}>
                          <div className="flex flex-col items-center w-7 shrink-0">
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow shrink-0 ${isSeller ? 'bg-[#c4a55a]' : 'bg-[#1e3a5f]'}`} />
                            {!isLast && <div className="w-0.5 flex-1 bg-[#e8ecf2] my-1 min-h-[16px]" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-[11px] text-[#a0abbb] italic mb-1.5">
                              {isSeller ? (
                                <>Made the sale — earns their full {Number(p.tier_percentage)}% {roleLabel(p.role)} rate</>
                              ) : (
                                <>
                                  {roleLabel(p.role)} rate {Number(p.tier_percentage)}% − {p.previousRoleLabel} rate {Number(p.previous_tier_percentage)}% = <span className="font-semibold not-italic text-[#5a6a82]">{Number(p.commission_percentage)}%</span>
                                </>
                              )}
                            </p>
                            <div className="bg-white border border-[#e8ecf2] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <User className="w-4 h-4 text-[#5a6a82] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#0f1d33] truncate">{p.payee?.full_name || '—'}</p>
                                  <p className="text-xs text-[#5a6a82]">
                                    {roleLabel(p.role)} · {Number(p.commission_percentage)}%
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="font-bold text-[#0f1d33]">{formatCurrency(Number(p.amount))}</p>
                                  {wasRounded && <p className="text-[11px] text-[#a0abbb]">rounded up from {formatCurrency(Number(p.computed_amount))}</p>}
                                </div>
                                <span className={`px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${statusMeta.className}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusMeta.label}
                                </span>
                                {isPending && canApprove && (
                                  <button
                                    onClick={() => handleMarkPaid(p.id)}
                                    disabled={markingId === p.id}
                                    className="gradient-gold text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
                                  >
                                    {markingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
