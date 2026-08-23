'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Loader2, MapPin, Ruler, IndianRupee, ClipboardList } from 'lucide-react';
import { getMyRegistrationsAction } from './actions';
import { STATUS_BADGE, STATUS_LABEL } from './status';

export default function CustomerDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getMyRegistrationsAction();
      if (res.success) setRegistrations(res.data);
      setLoading(false);
    })();
  }, []);

  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f1d33]">Welcome back</h1>
        <p className="text-[#5a6a82] text-sm mt-1">Here&apos;s an overview of your booked plot(s).</p>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center text-[#5a6a82]">
          <Building2 className="w-10 h-10 text-[#e8ecf2] mx-auto mb-3" />
          No bookings yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#0f1d33]">{reg.s_projects?.name || '—'}</h3>
                  <p className="text-xs text-[#5a6a82] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {reg.s_areas?.name || '—'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${STATUS_BADGE[reg.status]}`}>{STATUS_LABEL[reg.status]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e8ecf2]">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Plot Size
                  </p>
                  <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{reg.plot_size_sqyd} sq.yd</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> Total Amount
                  </p>
                  <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{formatPrice(reg.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#e8ecf2] flex items-center gap-2 text-xs text-[#5a6a82]">
                <ClipboardList className="w-3.5 h-3.5" />
                Payment: <span className={reg.payment_status === 'paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{reg.payment_status === 'paid' ? 'Paid' : 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
