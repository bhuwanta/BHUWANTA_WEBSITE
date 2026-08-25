'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, CheckCircle2, Clock, Ban, AlertCircle, Search, ArrowUp, ArrowDown, ArrowUpDown, BellOff, XCircle, Trash2 } from 'lucide-react';
import { getRegistrationsAction, markRegistrationDoneAction, cancelRegistrationAction, markRegistrationsReadAction, markOneRegistrationReadAction, deleteRegistrationAction } from './actions';
import { notifyRegistrationsChanged } from '../registrations-notify';
import { getSalesRoleOrderAction } from '../admin/commission-rates/actions';
import { ROLE_LABELS, type RealEstateRole } from '../permissions';

interface RegistrationsPageProps {
  currentUserRole: RealEstateRole;
  currentUserId: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending_registration: 'bg-amber-50 text-amber-600',
  registration_done: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const STATUS_LABEL: Record<string, string> = {
  pending_registration: 'Pending',
  registration_done: 'Registration Done',
  cancelled: 'Cancelled',
};

type SortCol = 'srno' | 'project' | 'customer' | 'plotSize' | 'basePrice' | 'soldBy' | 'role' | 'payment' | 'status';

export default function RegistrationsPage({ currentUserRole, currentUserId }: RegistrationsPageProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [canMarkDone, setCanMarkDone] = useState(false);
  const [companyWide, setCompanyWide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_registration' | 'registration_done' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>('srno');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  // ROLE_LABELS only covers the 5 fixed roles + the 8 built-in
  // sales-tier ones — a role renamed (or newly created) via the Roles/
  // Commissions page isn't reflected there, so every label lookup on
  // this page falls back to this dynamic map via roleLabel().
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});
  const roleLabel = (role: string): string => dynamicLabels[role] || ROLE_LABELS[role as RealEstateRole] || role;

  const load = async () => {
    setLoading(true);
    const [res, roleOrderRes] = await Promise.all([getRegistrationsAction(), getSalesRoleOrderAction()]);
    if (res.success) {
      setRegistrations(res.data);
      setCanMarkDone(res.canMarkDone);
      setCompanyWide(res.companyWide);
    } else if (res.error) {
      setError(res.error);
    }
    setDynamicLabels(Object.fromEntries(roleOrderRes.data.map((r) => [r.role_code, r.label])));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkDone = async (id: string) => {
    const confirmed = window.confirm('Mark this registration as done? This starts the 48-hour commission payout clock and cannot be undone.');
    if (!confirmed) return;

    setMarkingId(id);
    const res = await markRegistrationDoneAction(id);
    if (res.success) {
      load();
      notifyRegistrationsChanged();
    } else {
      alert(res.error);
    }
    setMarkingId(null);
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm('Cancel this registration? This cannot be undone.');
    if (!confirmed) return;

    setMarkingId(id);
    const res = await cancelRegistrationAction(id);
    if (res.success) {
      load();
      notifyRegistrationsChanged();
    } else {
      alert(res.error);
    }
    setMarkingId(null);
  };

  // IT-only, permanent — see deleteRegistrationAction's comment for why
  // this is the one place CEO/Governing Council don't share the same
  // capability as IT on this page. Two-step confirm when payouts exist:
  // the first attempt always runs WITHOUT deletePayoutsToo, so the
  // server can tell us exactly how many payout rows (and how many are
  // already paid) are in the way before IT decides whether to take them
  // down too — never silently cascades on the first click.
  const handleDelete = async (id: string, customerName: string) => {
    const confirmed = window.confirm(`Permanently delete the registration for "${customerName}"? This removes it from the database entirely and cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    let res = await deleteRegistrationAction(id);

    if (!res.success && (res as any).blockedByPayouts) {
      const proceedWithPayouts = window.confirm(
        `${res.error}\n\nDelete the registration AND all ${(res as any).payoutCount} of its payout records? This cannot be undone.`
      );
      if (proceedWithPayouts) {
        res = await deleteRegistrationAction(id, true);
      } else {
        setDeletingId(null);
        return;
      }
    }

    if (res.success) {
      load();
      notifyRegistrationsChanged();
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    const res = await markRegistrationsReadAction();
    if (res.success) {
      // "Read" is an acknowledgement, not a status change — the row
      // stays exactly where it is, only the unread dot and the sidebar
      // badge change.
      setRegistrations((prev) => prev.map((r) => ({ ...r, isRead: true })));
      notifyRegistrationsChanged();
    } else {
      alert(res.error);
    }
    setMarkingRead(false);
  };

  /** Acknowledges one row — drops the sidebar badge by exactly one. */
  const handleMarkOneRead = async (id: string) => {
    // Optimistic: the dot disappears immediately, restored on failure.
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)));
    const res = await markOneRegistrationReadAction(id);
    if (res.success) {
      notifyRegistrationsChanged();
    } else {
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: false } : r)));
      alert(res.error);
    }
  };

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline" /> : <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const byStatus = statusFilter === 'all' ? registrations : registrations.filter((r) => r.status === statusFilter);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? byStatus.filter((r) =>
        [
          r.s_projects?.name,
          r.s_areas?.name,
          r.customer_name,
          r.customer_phone,
          r.seller?.full_name,
          r.seller?.role ? roleLabel(r.seller.role) : '',
        ]
          .filter(Boolean)
          .some((field: string) => String(field).toLowerCase().includes(q))
      )
    : byStatus;

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case 'srno':
        // Default order is newest-first from the server; Sr. No. sorts
        // by that same submission time so the numbering stays meaningful.
        cmp = new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
        break;
      case 'project':
        cmp = (a.s_projects?.name || '').localeCompare(b.s_projects?.name || '');
        break;
      case 'customer':
        cmp = (a.customer_name || '').localeCompare(b.customer_name || '');
        break;
      case 'plotSize':
        cmp = Number(a.plot_size_sqyd) - Number(b.plot_size_sqyd);
        break;
      case 'basePrice':
        cmp = Number(a.base_price_at_submission) - Number(b.base_price_at_submission);
        break;
      case 'soldBy':
        cmp = (a.seller?.full_name || '').localeCompare(b.seller?.full_name || '');
        break;
      case 'role':
        cmp = (a.seller?.role ? roleLabel(a.seller.role) : '').localeCompare(
          b.seller?.role ? roleLabel(b.seller.role) : ''
        );
        break;
      case 'payment':
        cmp = (a.payment_status || '').localeCompare(b.payment_status || '');
        break;
      case 'status':
        cmp = (a.status || '').localeCompare(b.status || '');
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const unreadCount = registrations.filter((r) => !r.isRead).length;

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#c4a55a]" />
            Registrations
          </h1>
          <p className="text-[#5a6a82] text-sm mt-1">
            {canMarkDone
              ? 'Company-wide oversight of every New Registration. Marking one done starts the 48-hour commission payout clock.'
              : companyWide
                ? 'Company-wide, read-only view of every New Registration. Only the Operation Manager can mark one done.'
                : 'Status of every New Registration submitted by you or your team — read-only.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
            <input
              type="text"
              placeholder="Search project, customer, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
            />
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingRead}
              title="Clears your sidebar notification badge — does not change any registration's status"
              className="shrink-0 flex items-center gap-2 bg-white border border-[#e8ecf2] text-[#0f1d33] px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#f3f5f8] transition-colors text-sm disabled:opacity-50"
            >
              {markingRead ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 max-w-xl">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 bg-white p-1.5 rounded-xl border border-[#e8ecf2] w-fit shadow-sm shrink-0">
        {(['all', 'pending_registration', 'registration_done', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === s ? 'bg-[#1e3a5f] text-white shadow' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
          >
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl flex-1 overflow-auto min-h-0">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-[#f7f8fa] sticky top-0 z-10 shadow-[0_1px_0_#e8ecf2]">
            <tr className="text-[12px] uppercase tracking-wider text-[#5a6a82]">
              <th className="py-3 px-2 font-semibold w-10 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('srno')}>
                # <SortIcon col="srno" />
              </th>
              <th className="py-3 px-2 font-semibold w-[13%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('project')}>
                Project <SortIcon col="project" />
              </th>
              <th className="py-3 px-2 font-semibold w-[12%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('customer')}>
                Customer <SortIcon col="customer" />
              </th>
              <th className="py-3 px-2 font-semibold w-[7%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('plotSize')}>
                Plot <SortIcon col="plotSize" />
              </th>
              <th className="py-3 px-2 font-semibold w-[8%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('basePrice')}>
                Base Price <SortIcon col="basePrice" />
              </th>
              <th className="py-3 px-2 font-semibold w-[13%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('soldBy')}>
                Sold By <SortIcon col="soldBy" />
              </th>
              <th className="py-3 px-2 font-semibold w-[7%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('payment')}>
                Pay <SortIcon col="payment" />
              </th>
              <th className="py-3 px-2 font-semibold w-[10%] cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('status')}>
                Status <SortIcon col="status" />
              </th>
              <th className="py-3 px-2 font-semibold text-right w-[24%]">Action</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#0f1d33] divide-y divide-[#e8ecf2]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a] mx-auto mb-2" />
                  <p className="text-[#5a6a82] text-sm">Loading registrations...</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#5a6a82]">
                  <ClipboardList className="w-10 h-10 text-[#e8ecf2] mx-auto mb-3" />
                  {searchQuery
                    ? 'No registrations match your search.'
                    : 'No registrations yet. This fills up once sales-tier “New Registration” submissions start coming in.'}
                </td>
              </tr>
            ) : (
              sorted.map((reg, index) => (
                <tr key={reg.id} className={`hover:bg-[#f3f5f8] transition-colors ${!reg.isRead ? 'bg-[#c4a55a]/[0.04]' : ''}`}>
                  <td className="py-2.5 px-2 text-[#5a6a82]">
                    <div className="flex items-center gap-1.5">
                      {!reg.isRead && <span title="Unread" className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-semibold truncate" title={reg.s_projects?.name}>
                    {reg.s_projects?.name || '—'}
                    {reg.s_areas?.name && <div className="text-[11px] font-normal text-[#5a6a82] truncate">{reg.s_areas.name}</div>}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate" title={reg.customer_name}>{reg.customer_name}</span>
                      <span className="text-[11px] text-[#5a6a82] truncate">{reg.customer_phone}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">{reg.plot_size_sqyd}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap">{formatCurrency(reg.base_price_at_submission)}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium truncate" title={reg.seller?.full_name}>{reg.seller?.full_name || '—'}</span>
                      {reg.seller?.role && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1e3a5f]/10 text-[#1e3a5f]">{roleLabel(reg.seller.role)}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${reg.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {reg.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${STATUS_BADGE[reg.status]}`}>
                      {reg.status === 'registration_done' && <CheckCircle2 className="w-3 h-3" />}
                      {reg.status === 'pending_registration' && <Clock className="w-3 h-3" />}
                      {reg.status === 'cancelled' && <Ban className="w-3 h-3" />}
                      {STATUS_LABEL[reg.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {reg.status === 'pending_registration' && (
                        <>
                          {!reg.isRead && (
                            <button
                              onClick={() => handleMarkOneRead(reg.id)}
                              title="Clears this from your notification count — doesn't change its status"
                              className="text-[#1e3a5f] text-xs font-semibold px-2 py-1.5 rounded-lg border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10 transition-colors inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                            >
                              <BellOff className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}
                          {reg.submitted_by === currentUserId && (
                            <button
                              onClick={() => handleCancel(reg.id)}
                              disabled={markingId === reg.id}
                              title="Cancel"
                              className="text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canMarkDone && (
                            <button
                              onClick={() => handleMarkDone(reg.id)}
                              disabled={markingId === reg.id || reg.payment_status !== 'paid'}
                              title={reg.payment_status !== 'paid' ? 'Waiting on customer payment' : 'Mark Done'}
                              className="gradient-gold text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 shrink-0"
                            >
                              {markingId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Done
                            </button>
                          )}
                        </>
                      )}
                      {/* IT-only, works regardless of status — the server
                          blocks it if the sale already has payout rows,
                          so this is safe to always show rather than
                          gating by status here too. */}
                      {currentUserRole === 'it' && (
                        <button
                          onClick={() => handleDelete(reg.id, reg.customer_name)}
                          disabled={deletingId === reg.id}
                          title="Permanently delete from the database"
                          className="text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {deletingId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
