'use client';

// Per-transaction payout visualizer — opened from one specific sale card
// on the Payouts page (?registrationId=...), not a generic "if this role
// sells" hypothetical. Highlights exactly who was actually paid on THAT
// sale, straight from the real S_sales_payouts rows.

import React, { useEffect, useState } from 'react';
import { Loader2, Coins, AlertCircle } from 'lucide-react';
import HierarchyGraph from '../_shared/admin/hierarchy/HierarchyGraph';
import { getPayoutLineageForRegistrationAction, type SaleFinancials } from '../_shared/admin/payouts/actions';

interface VisualizePayoutClientProps {
  registrationId: string | null;
}

export default function VisualizePayoutClient({ registrationId }: VisualizePayoutClientProps) {
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [expandPath, setExpandPath] = useState<string[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [financials, setFinancials] = useState<SaleFinancials | null>(null);
  const [saleInfo, setSaleInfo] = useState<{ sellerName: string; projectName: string; plotSize: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationId) {
      setError('Open this from a specific sale on the Payouts page.');
      setLoading(false);
      return;
    }
    (async () => {
      const res = await getPayoutLineageForRegistrationAction(registrationId);
      if (res.success && res.sellerId) {
        setHighlightIds(new Set([res.sellerId, ...res.payeeIds]));
        setExpandPath(res.expandPath);
        setSellerId(res.sellerId);
        setFinancials(res.financials);
        setSaleInfo({ sellerName: res.sellerName, projectName: res.projectName, plotSize: res.plotSize });
      } else {
        setError(res.error || 'Could not load this sale.');
      }
      setLoading(false);
    })();
  }, [registrationId]);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#f7f8fa]">
      <div className="px-4 py-3 border-b border-[#e8ecf2] bg-white flex items-center gap-3 shrink-0 overflow-hidden">
        <Coins className="w-5 h-5 text-[#c4a55a] shrink-0" />
        <div className="min-w-0 shrink truncate">
          <h1 className="text-base font-bold text-[#0f1d33] leading-tight">Visualize Payout</h1>
          {saleInfo ? (
            <p className="text-xs text-[#5a6a82] leading-tight truncate hidden md:block">
              {saleInfo.sellerName} sold {saleInfo.plotSize} sq.yd at {saleInfo.projectName} — green shows who got paid.
            </p>
          ) : (
            <p className="text-xs text-[#5a6a82] leading-tight truncate hidden md:block">Green shows who got paid on this sale.</p>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        ) : (
          <HierarchyGraph highlightIds={highlightIds} expandPath={expandPath} sellerId={sellerId || undefined} financials={financials} />
        )}
      </div>
    </div>
  );
}
