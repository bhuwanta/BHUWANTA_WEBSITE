'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, Loader2, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { getMyRegistrationsAction } from './actions';
import { markPaymentPaidAction, cancelRegistrationAction } from '../registrations/actions';

export default function PaymentPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await getMyRegistrationsAction();
    if (res.success) setRegistrations(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handlePay = async (id: string) => {
    const confirmed = window.confirm('This is a manual payment confirmation — no real gateway is charged. Confirm that payment has been made outside this app?');
    if (!confirmed) return;
    setBusyId(id);
    setMessage(null);
    const res = await markPaymentPaidAction(id);
    setMessage(res.success ? { type: 'success', text: res.message! } : { type: 'error', text: res.error! });
    if (res.success) load();
    setBusyId(null);
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm('Cancel this registration? This cannot be undone.');
    if (!confirmed) return;
    setBusyId(id);
    setMessage(null);
    const res = await cancelRegistrationAction(id);
    setMessage(res.success ? { type: 'success', text: res.message! } : { type: 'error', text: res.error! });
    if (res.success) load();
    setBusyId(null);
  };

  const pending = registrations.filter((r) => r.status === 'pending_registration');

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-[#c4a55a]" />
            Payment
          </h1>
          <p className="text-[#5a6a82] text-sm mt-1">Confirm payment for your booking(s) — this must be done before your registration can be finalized.</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center text-[#5a6a82]">Nothing awaiting payment right now.</div>
        ) : (
          <div className="space-y-4">
            {pending.map((reg) => (
              <div key={reg.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#0f1d33]">{reg.s_projects?.name}</h3>
                    <p className="text-xs text-[#5a6a82] mt-0.5">
                      {reg.plot_size_sqyd} sq.yd @ {formatPrice(reg.mrp_at_submission)}/sq.yd
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${reg.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {reg.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#e8ecf2]">
                  <p className="text-lg font-bold text-[#0f1d33]">{formatPrice(reg.totalAmount)}</p>
                  <div className="flex items-center gap-2">
                    {reg.payment_status !== 'paid' && (
                      <>
                        <button
                          onClick={() => handleCancel(reg.id)}
                          disabled={busyId === reg.id}
                          className="text-red-500 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePay(reg.id)}
                          disabled={busyId === reg.id}
                          className="gradient-gold text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {busyId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                          Mark as Paid
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
