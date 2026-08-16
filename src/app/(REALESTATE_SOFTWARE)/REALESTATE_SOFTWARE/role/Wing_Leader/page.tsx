'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, PieChart, Users, Loader2, Target } from 'lucide-react';
import { getWingLeaderDashboardStatsAction } from './actions';

export default function WingLeaderDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getWingLeaderDashboardStatsAction();
      if (res.success) {
        setStats(res.data || null);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f1d33]">Dashboard Overview</h1>
        <p className="text-[#5a6a82] mt-1">Here is a high-level summary of your allocated projects and budget.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Value */}
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#5a6a82]">Total Value Allocated</h3>
            <div className="w-10 h-10 rounded-lg bg-[#f3f5f8] flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-[#1e3a5f]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1d33]">{formatCurrency(stats?.totalValue || 0)}</p>
        </div>

        {/* Total Plots */}
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#5a6a82]">Total Plots</h3>
            <div className="w-10 h-10 rounded-lg bg-[#f3f5f8] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#1e3a5f]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1d33]">{stats?.totalPlots || 0}</p>
        </div>

        {/* Wing Budget % */}
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#5a6a82]">Wing Budget %</h3>
            <div className="w-10 h-10 rounded-lg bg-[#f3f5f8] flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#1e3a5f]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1d33]">{stats?.wingBudgetPercentage || 0}%</p>
        </div>

        {/* Total Budget Amount */}
        <div className="bg-white border border-[#c4a55a]/30 shadow-sm rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#c4a55a]/20 to-transparent rounded-bl-full -z-10" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f1d33]">Your Total Budget</h3>
            <div className="w-10 h-10 rounded-lg bg-[#c4a55a]/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-[#c4a55a]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#c4a55a]">{formatCurrency(stats?.totalBudget || 0)}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#0f1d33] mb-6">Breakdown by Project</h2>
      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <th className="py-4 px-6 text-sm font-semibold text-[#0f1d33]">Project Name</th>
              <th className="py-4 px-6 text-sm font-semibold text-[#0f1d33]">Plots</th>
              <th className="py-4 px-6 text-sm font-semibold text-[#0f1d33]">Total Value</th>
              <th className="py-4 px-6 text-sm font-semibold text-[#0f1d33]">Budget Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8ecf2]">
            {stats?.projects && stats.projects.length > 0 ? (
              stats.projects.map((p: any) => (
                <tr key={p.project_id} className="hover:bg-[#f7f8fa] transition-colors">
                  <td className="py-4 px-6 text-sm text-[#0f1d33] font-medium">{p.project_name}</td>
                  <td className="py-4 px-6 text-sm text-[#5a6a82]">{p.total_plots}</td>
                  <td className="py-4 px-6 text-sm text-[#5a6a82]">{formatCurrency(p.total_value)}</td>
                  <td className="py-4 px-6 text-sm text-[#c4a55a] font-semibold">{formatCurrency(p.total_budget)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#5a6a82] text-sm">
                  No projects allocated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
