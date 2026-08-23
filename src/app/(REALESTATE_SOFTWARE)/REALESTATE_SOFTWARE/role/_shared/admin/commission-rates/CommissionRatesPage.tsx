'use client';

import React, { useState, useEffect } from 'react';
import { Percent, Loader2, Edit2, Check, X, AlertCircle, Trash2, Plus, Download, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { getCommissionRatesAction, updateCommissionRateAction, createCommissionRateAction, deleteCommissionRateAction } from './actions';
import { ROLE_LABELS, SALES_RANK_ORDER, type RealEstateRole } from '../../permissions';

// Display order: LIA (bottom) up to CEO (top), ascending by rate —
// matches every worked example in HIERARCHY.md §3a/§3b. SALES_RANK_ORDER
// is director..lia (top-to-bottom); reverse to lia..director, then
// append governing_council/ceo to complete the commission chain.
const DISPLAY_ORDER: RealEstateRole[] = [...SALES_RANK_ORDER].reverse().concat(['governing_council', 'ceo']) as RealEstateRole[];

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
  const [addingRole, setAddingRole] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<'index' | 'role' | 'percentage' | 'updatedBy' | 'updatedAt'>('index');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const load = async () => {
    setLoading(true);
    const res = await getCommissionRatesAction();
    if (res.success) {
      const map: typeof rates = {};
      res.data.forEach((r: any) => {
        map[r.role] = { percentage: r.percentage, updatedBy: r.updater?.full_name, updatedAt: r.updated_at };
      });
      setRates(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (role: string) => {
    setEditingRole(role);
    setEditValue(String(rates[role]?.percentage ?? ''));
    setError('');
  };

  const saveEdit = async (role: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) {
      setError('Enter a valid number.');
      return;
    }
    setSaving(true);
    setError('');
    const res = await updateCommissionRateAction(role, value);
    if (res.success) {
      setEditingRole(null);
      load();
    } else {
      setError(res.error || 'Failed to save.');
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
      `Remove the commission rate for ${ROLE_LABELS[role as RealEstateRole]}?\n\nThis role will be excluded from every future commission calculation until a rate is set again. This does not affect payouts already made.`
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
    const rows = DISPLAY_ORDER.map((role) => {
      const rate = rates[role];
      return [ROLE_LABELS[role], rate ? `${rate.percentage}%` : 'Not set', rate?.updatedBy || '', rate?.updatedAt || ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
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
    ? DISPLAY_ORDER.filter((role) => ROLE_LABELS[role].toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : DISPLAY_ORDER;

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
        cmp = DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(b);
        break;
      case 'role':
        cmp = ROLE_LABELS[a].localeCompare(ROLE_LABELS[b]);
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

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#c4a55a]" />
            Commission Rates
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
                  return (
                    <tr key={role} className="hover:bg-[#f7f8fa] transition-colors">
                      <td className="p-4 text-[#5a6a82] text-sm">{index + 1}</td>
                      <td className="p-4 font-semibold text-[#0f1d33]">{ROLE_LABELS[role]}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
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
                            <button onClick={() => startEdit(role)} className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-colors" title="Edit rate">
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
    </div>
  );
}
