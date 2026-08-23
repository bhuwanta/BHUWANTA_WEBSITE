'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardPlus, Loader2, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import { getMyProjectsAction } from '../my-projects/actions';
import { createRegistrationAction } from '../../registrations/actions';
import { notifyRegistrationsChanged } from '../../registrations-notify';

export default function NewRegistrationPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [areaId, setAreaId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [mrpOverride, setMrpOverride] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingProjects(true);
      const res = await getMyProjectsAction();
      if (res.success) setProjects(res.data);
      setLoadingProjects(false);
    })();
  }, []);

  // Areas derived from the seller's actually-assigned projects only —
  // never a company-wide area list, since a seller can only ever pick a
  // project their Director is assigned to (§5).
  const areas = Array.from(new Map(projects.filter((p) => p.s_areas).map((p) => [p.s_areas.id, p.s_areas])).values());
  const projectsInArea = projects.filter((p) => p.s_areas?.id === areaId);
  const selectedProject = projects.find((p) => p.id === projectId);

  const resetForm = () => {
    setAreaId('');
    setProjectId('');
    setPlotSize('');
    setMrpOverride('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !plotSize) {
      setMessage({ type: 'error', text: 'Select a Project and enter the plot size.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await createRegistrationAction({
      areaId,
      projectId,
      plotSizeSqyd: parseFloat(plotSize),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim() || undefined,
      mrpOverride: mrpOverride ? parseFloat(mrpOverride) : undefined,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      resetForm();
      notifyRegistrationsChanged();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const formatPrice = (v: number | null) => (v == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v));

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <ClipboardPlus className="w-6 h-6 text-[#c4a55a]" />
            New Registration
          </h1>
          <p className="text-[#5a6a82] text-sm mt-1">Submit a new plot sale. It goes to your Director&apos;s queue while the property registration happens externally.</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {loadingProjects ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-amber-800 text-sm">
            Your Director isn&apos;t assigned to any Project yet — ask IT, CEO, or Governing Council to assign one before you can submit a New Registration.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                  Area <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    setProjectId('');
                  }}
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                >
                  <option value="" disabled>
                    Select an Area
                  </option>
                  {areas.map((area: any) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!areaId}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] disabled:opacity-50"
                >
                  <option value="" disabled>
                    {areaId ? 'Select a Project' : 'Select an Area first'}
                  </option>
                  {projectsInArea.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProject && (
              <div className="grid grid-cols-2 gap-4 bg-[#f7f8fa] border border-[#e8ecf2] rounded-lg p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold">Base Price (fixed)</p>
                  <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{formatPrice(selectedProject.base_price)}/sq.yd</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold">Default MRP</p>
                  <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{formatPrice(selectedProject.mrp_default)}/sq.yd</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                  Plot Size (sq.yards) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={plotSize}
                  onChange={(e) => setPlotSize(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">MRP for this sale (optional)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-[#5a6a82]" />
                  <input
                    type="number"
                    step="0.01"
                    value={mrpOverride}
                    onChange={(e) => setMrpOverride(e.target.value)}
                    placeholder={selectedProject?.mrp_default != null ? String(selectedProject.mrp_default) : 'Uses project default'}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e8ecf2]">
              <p className="text-sm font-bold text-[#0f1d33] mb-3">Customer Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-[#5a6a82] mb-2">Used to create their Customer Dashboard login.</p>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Address (optional)</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardPlus className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
