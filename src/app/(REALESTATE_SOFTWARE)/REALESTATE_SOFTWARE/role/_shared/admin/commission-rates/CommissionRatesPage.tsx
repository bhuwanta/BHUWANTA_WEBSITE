'use client';

import React, { useState, useEffect } from 'react';
import { Percent, Loader2, Edit2, Check, X, AlertCircle, Trash2, Plus, Download, Search, ArrowUp, ArrowDown, ArrowUpDown, UserPlus } from 'lucide-react';
import { getCommissionRatesAction, updateCommissionRateAction, createCommissionRateAction, deleteCommissionRateAction, getSalesRoleOrderAction, createSalesRoleAction, renameSalesRoleAction } from './actions';
import { getFixedRoleLabelsAction, renameFixedRoleAction } from './fixed-role-actions';
import { ROLE_LABELS, type RealEstateRole } from '../../permissions';

interface RateRow {
  percentage: number;
  updatedBy?: string;
  updatedAt?: string;
}

export default function CommissionRatesPage() {
  const [rates, setRates] = useState<Record<string, RateRow>>({});
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNameValue, setEditNameValue] = useState('');
  const [addingRole, setAddingRole] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<'index' | 'role' | 'percentage' | 'updatedBy' | 'updatedAt'>('index');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Display order: CEO/Governing Council always on top (fixed, never
  // rank-compared — see permissions.ts), then the real, current
  // sales-tier cascade — built-in roles (Director..LIA) plus any
  // admin-created role, in whatever order they've been placed
  // (including above Director). Fetched via getSalesRoleOrderAction
  // (S_role_definitions, migration 008) rather than a hardcoded array,
  // so a role created on this page shows up here immediately.
  const [displayOrder, setDisplayOrder] = useState<string[]>([]);
  // ROLE_LABELS only covers the 5 fixed roles + the 8 built-in
  // sales-tier ones — an admin-created role isn't in it, so every label
  // lookup on this page falls back to this dynamic map via roleLabel().
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRolePercentage, setNewRolePercentage] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // dynamicLabels checked FIRST, not ROLE_LABELS — all 8 built-in
  // sales-tier roles (director..lia) already have a static entry in
  // ROLE_LABELS, which would otherwise always shadow a rename (the DB
  // write succeeds, but the UI would keep showing the old hardcoded
  // name forever). dynamicLabels only has no entry for the 5 truly
  // fixed roles (it/ceo/governing_council/operation_manager/customer —
  // never rows in S_role_definitions), which is exactly when the
  // ROLE_LABELS fallback should apply.
  const roleLabel = (role: string): string => dynamicLabels[role] || ROLE_LABELS[role as RealEstateRole] || role;
  const salesTierOrder = displayOrder.filter((r) => r !== 'ceo' && r !== 'governing_council');

  const load = async () => {
    setLoading(true);
    const [ratesRes, roleOrderRes, fixedLabelsRes] = await Promise.all([getCommissionRatesAction(), getSalesRoleOrderAction(), getFixedRoleLabelsAction()]);
    if (ratesRes.success) {
      const map: typeof rates = {};
      ratesRes.data.forEach((r: any) => {
        map[r.role] = { percentage: r.percentage, updatedBy: r.updater?.full_name, updatedAt: r.updated_at };
      });
      setRates(map);
    }
    setDisplayOrder(['ceo', 'governing_council', ...roleOrderRes.data.map((r) => r.role_code)]);
    const mergedLabels: Record<string, string> = {};
    roleOrderRes.data.forEach((r) => {
      mergedLabels[r.role_code] = r.label;
    });
    fixedLabelsRes.data.forEach((r) => {
      mergedLabels[r.role_code] = r.label;
    });
    setDynamicLabels(mergedLabels);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // One Edit button drives both fields at once — the name and the
  // percentage, for every row on this page. The name write is routed to
  // one of two tables depending on the role (see saveEdit's isFixedRole
  // branch below): S_role_definitions for the 8 sales tiers + any
  // admin-created role, or S_role_labels for CEO/Governing Council.
  const startEdit = (role: string) => {
    setEditingRole(role);
    setEditValue(String(rates[role]?.percentage ?? ''));
    setEditNameValue(roleLabel(role));
    setError('');
  };

  const saveEdit = async (role: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) {
      setError('Enter a valid number.');
      return;
    }
    // Every row on this page can be renamed now — the 8 sales tiers via
    // S_role_definitions, and CEO/Governing Council via the separate
    // S_role_labels table (fixed-role-actions.ts) since they were never
    // rows in S_role_definitions (no rank concept for them). Kept as an
    // explicit gate rather than assumed-true so a future non-renameable
    // row type on this page fails safe.
    const canRename = displayOrder.includes(role);
    const isFixedRole = role === 'ceo' || role === 'governing_council';
    if (canRename && !editNameValue.trim()) {
      setError('Enter a role name.');
      return;
    }
    setSaving(true);
    setError('');

    if (canRename && editNameValue.trim() !== roleLabel(role)) {
      const renameRes = isFixedRole ? await renameFixedRoleAction(role, editNameValue.trim()) : await renameSalesRoleAction(role, editNameValue.trim());
      if (!renameRes.success) {
        setError(renameRes.error || 'Failed to save the name.');
        setSaving(false);
        return;
      }
    }

    const res = await updateCommissionRateAction(role, value);
    if (res.success) {
      setEditingRole(null);
      load();
    } else {
      setError(res.error || 'Failed to save the percentage.');
    }
    setSaving(false);
  };

  const startAdd = (role: string) => {
    setAddingRole(role);
    setAddValue('');
    setError('');
  };

  const saveAdd = async (role: string) => {
    const value = parseFloat(addValue);
    if (isNaN(value)) {
      setError('Enter a valid number.');
      return;
    }
    setSaving(true);
    setError('');
    const res = await createCommissionRateAction(role, value);
    if (res.success) {
      setAddingRole(null);
      load();
    } else {
      setError(res.error || 'Failed to add.');
    }
    setSaving(false);
  };

  const handleDelete = async (role: string) => {
    const confirmed = window.confirm(
      `Remove the commission rate for ${roleLabel(role)}?\n\nThis role will be excluded from every future commission calculation until a rate is set again. This does not affect payouts already made.`
    );
    if (!confirmed) return;
    const res = await deleteCommissionRateAction(role);
    if (res.success) {
      load();
    } else {
      alert(res.error);
    }
  };

  const handleExport = () => {
    const header = 'Role,Percentage,Last Updated By,Last Updated At';
    const rows = displayOrder.map((role) => {
      const rate = rates[role];
      return [roleLabel(role), rate ? `${rate.percentage}%` : 'Not set', rate?.updatedBy || '', rate?.updatedAt || ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-rates-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredRoles = searchQuery.trim()
    ? displayOrder.filter((role) => roleLabel(role).toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : displayOrder;

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case 'index':
        cmp = displayOrder.indexOf(a) - displayOrder.indexOf(b);
        break;
      case 'role':
        cmp = roleLabel(a).localeCompare(roleLabel(b));
        break;
      case 'percentage':
        cmp = (rates[a]?.percentage ?? -1) - (rates[b]?.percentage ?? -1);
        break;
      case 'updatedBy':
        cmp = (rates[a]?.updatedBy || '').localeCompare(rates[b]?.updatedBy || '');
        break;
      case 'updatedAt':
        cmp = new Date(rates[a]?.updatedAt || 0).getTime() - new Date(rates[b]?.updatedAt || 0).getTime();
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: typeof sortCol }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline" /> : <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const openCreateModal = () => {
    setNewRoleLabel('');
    setNewRolePercentage('');
    setCreateError('');
    setIsCreateOpen(true);
  };

  // Auto-placement preview: where would this percentage land among the
  // current sales-tier roles, top (highest %) to bottom (lowest %)?
  // Scans from the top and keeps the last role whose rate is still >=
  // the entered percentage — the new role slots in right below it (or
  // at the very top, above Director, if it outranks everyone). This is
  // exactly what createSalesRoleAction is told to insert after; shown
  // here so the admin sees where it'll land before confirming. Manual
  // rearrangement afterward uses the ↑/↓ buttons already on each row.
  const previewPercentage = parseFloat(newRolePercentage);
  const previewValid = !isNaN(previewPercentage);
  let previewInsertAfter: string | null = null;
  if (previewValid) {
    for (const r of salesTierOrder) {
      const pct = rates[r]?.percentage;
      if (pct != null && pct >= previewPercentage) {
        previewInsertAfter = r;
      } else {
        break;
      }
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(newRolePercentage);
    if (!newRoleLabel.trim()) {
      setCreateError('Enter a role name.');
      return;
    }
    if (isNaN(value)) {
      setCreateError('Enter a valid percentage.');
      return;
    }
    setCreating(true);
    setCreateError('');
    const res = await createSalesRoleAction({ label: newRoleLabel.trim(), percentage: value, insertAfterRoleCode: previewInsertAfter });
    if (res.success) {
      setIsCreateOpen(false);
      load();
    } else {
      setCreateError(res.error || 'Failed to create role.');
    }
    setCreating(false);
  };

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#c4a55a]" />
            Roles / Commissions
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
            <input
              type="text"
              placeholder="Search role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-[#e8ecf2] text-[#0f1d33] px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#f3f5f8] transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 gradient-gold text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:opacity-90 transition-opacity text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create New Role
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f3f5f8] text-[#5a6a82] text-xs uppercase tracking-wider font-semibold border-b border-[#e8ecf2]">
                  <th className="p-4 w-16 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('index')}>
                    Sr. No. <SortIcon col="index" />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('role')}>
                    Role <SortIcon col="role" />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('percentage')}>
                    Percentage <SortIcon col="percentage" />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('updatedBy')}>
                    Last Updated By <SortIcon col="updatedBy" />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#e8ecf2] transition-colors select-none" onClick={() => handleSort('updatedAt')}>
                    Last Updated At <SortIcon col="updatedAt" />
                  </th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {sortedRoles.map((role, index) => {
                  const rate = rates[role];
                  const isEditing = editingRole === role;
                  const isAdding = addingRole === role;
                  const canRename = displayOrder.includes(role);
                  return (
                    <tr key={role} className="hover:bg-[#f7f8fa] transition-colors">
                      <td className="p-4 text-[#5a6a82] text-sm">{index + 1}</td>
                      <td className="p-4 font-semibold text-[#0f1d33]">
                        {isEditing && canRename ? (
                          <input
                            type="text"
                            autoFocus
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(role);
                              if (e.key === 'Escape') setEditingRole(null);
                            }}
                            className="w-40 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-2 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
                          />
                        ) : (
                          roleLabel(role)
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              autoFocus={!canRename}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(role);
                                if (e.key === 'Escape') setEditingRole(null);
                              }}
                              className="w-24 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-2 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
                            />
                            <span className="text-[#5a6a82] text-sm">%</span>
                          </div>
                        ) : isAdding ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              placeholder="e.g. 15"
                              value={addValue}
                              onChange={(e) => setAddValue(e.target.value)}
                              className="w-24 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-2 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
                            />
                            <span className="text-[#5a6a82] text-sm">%</span>
                          </div>
                        ) : rate ? (
                          <span className="text-[#0f1d33] font-bold">{rate.percentage}%</span>
                        ) : (
                          <span className="text-[#a0abbb] italic text-sm">Not set</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[#5a6a82]">{rate?.updatedBy || '—'}</td>
                      <td className="p-4 text-sm text-[#5a6a82]">{rate?.updatedAt ? new Date(rate.updatedAt).toLocaleString() : '—'}</td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => saveEdit(role)} disabled={saving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setEditingRole(null)} className="p-1.5 text-[#5a6a82] hover:bg-[#f3f5f8] rounded transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : isAdding ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => saveAdd(role)} disabled={saving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setAddingRole(null)} className="p-1.5 text-[#5a6a82] hover:bg-[#f3f5f8] rounded transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : rate ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(role)} className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-colors" title={displayOrder.includes(role) ? 'Edit name and percentage' : 'Edit percentage'}>
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(role)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete rate">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startAdd(role)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1 text-xs font-semibold" title="Add rate">
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1d33]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h3 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1e3a5f]" />
                Create New Role
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors rounded-full p-1 hover:bg-[#e8ecf2]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{createError}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  placeholder="e.g. Senior RM"
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                  Commission Percentage <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newRolePercentage}
                    onChange={(e) => setNewRolePercentage(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 pr-9 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a6a82] text-sm">%</span>
                </div>
              </div>

              <div className="mb-6 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg p-3">
                <p className="text-xs font-semibold text-[#0f1d33] mb-1">Where this lands in the chain</p>
                {!previewValid ? (
                  <p className="text-xs text-[#5a6a82]">Enter a percentage to see where it'll be placed.</p>
                ) : previewInsertAfter === null ? (
                  <p className="text-xs text-[#5a6a82]">
                    At the very top of the sales chain — above <span className="font-semibold text-[#0f1d33]">{salesTierOrder[0] ? roleLabel(salesTierOrder[0]) : 'everyone'}</span>.
                  </p>
                ) : (
                  <p className="text-xs text-[#5a6a82]">
                    Right below <span className="font-semibold text-[#0f1d33]">{roleLabel(previewInsertAfter)}</span> ({rates[previewInsertAfter]?.percentage}%).
                  </p>
                )}
                <p className="text-[11px] text-[#a0abbb] mt-2">Placed automatically by percentage — use the ↑/↓ arrows on the table afterward if you want it somewhere else.</p>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="gradient-gold text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
