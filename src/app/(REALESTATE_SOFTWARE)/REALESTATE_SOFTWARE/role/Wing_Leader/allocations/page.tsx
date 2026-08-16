'use client';

import React, { useEffect, useState } from 'react';
import { getWingAllocationsAction } from './actions';
import { LayoutGrid, IndianRupee, Loader2, PieChart, MapPin } from 'lucide-react';

export default function WingAllocationsPage() {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlots = async () => {
      const res = await getWingAllocationsAction();
      if (res.success) {
        setPlots(res.data || []);
      }
      setLoading(false);
    };
    fetchPlots();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold">Available</span>;
      case 'token_paid': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold">Token Paid</span>;
      case 'fully_paid': return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-semibold">Fully Paid</span>;
      case 'registered': return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">Registered</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{status}</span>;
    }
  };

  const filteredPlots = plots.filter(p => 
    p.plot_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f1d33]">My Allocations</h1>
          <p className="text-[#5a6a82] mt-1">View all inventory plots assigned to your Wing.</p>
        </div>
        <div className="w-full md:w-64 relative">
          <input 
            type="text" 
            placeholder="Search plots or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e8ecf2] rounded-lg pl-4 pr-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-xl font-bold text-[#0f1d33]">Assigned Inventory</h2>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#e8ecf2] rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8fa] border-b border-[#e8ecf2]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Project</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Plot No.</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Size (Sq.Ft)</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Total Value</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Budget %</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {filteredPlots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5a6a82] text-sm">
                      {searchQuery ? 'No plots match your search.' : 'No plots have been assigned to your Wing yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredPlots.map((plot) => (
                    <tr key={plot.id} className="hover:bg-[#f7f8fa] transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-[#0f1d33]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#5a6a82]" />
                          {plot.project_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#0f1d33] font-medium">{plot.plot_number}</td>
                      <td className="py-3 px-4 text-sm text-[#5a6a82]">{plot.size_sqft}</td>
                      <td className="py-3 px-4 text-sm text-[#0f1d33] font-semibold flex items-center gap-1">
                        {formatCurrency(plot.total_price)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#c4a55a] font-semibold">
                        <div className="flex items-center gap-1">
                          <PieChart className="w-3.5 h-3.5" />
                          {plot.wing_budget_percentage}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(plot.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
