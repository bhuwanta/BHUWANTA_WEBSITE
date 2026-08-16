'use client';

import React, { useState, useEffect } from 'react';
import { Settings2, Percent, Users, LayoutGrid, CheckSquare, Upload, FileSpreadsheet, AlertCircle, Loader2, ChevronDown, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getAreasAndProjectsAction, 
  uploadInventoryAction, 
  getProjectInventoryAction,
  getWingLeadersAction,
  allocatePlotsAction
} from './actions';

export default function WingAllocationPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [wingLeaders, setWingLeaders] = useState<any[]>([]);
  
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [unallocated, setUnallocated] = useState<any[]>([]);
  const [allocatedByLeader, setAllocatedByLeader] = useState<Record<string, any[]>>({});
  
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set());
  const [compareLeaders, setCompareLeaders] = useState<Set<string>>(new Set());
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [wingBudget, setWingBudget] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Custom Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [dataRes, leadersRes] = await Promise.all([
        getAreasAndProjectsAction(),
        getWingLeadersAction()
      ]);
      if (dataRes.success) {
        setAreas(dataRes.areas);
        setProjects(dataRes.projects);
      }
      if (leadersRes.success) {
        setWingLeaders(leadersRes.data);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch inventory when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchInventory();
    } else {
      setUnallocated([]);
      setAllocatedByLeader({});
    }
  }, [selectedProjectId]);

  const fetchInventory = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    const res = await getProjectInventoryAction(selectedProjectId);
    if (res.success) {
      setUnallocated(res.unallocated);
      setAllocatedByLeader(res.allocatedByLeader);
      setCompareLeaders(new Set(Object.keys(res.allocatedByLeader)));
    }
    setSelectedPlots(new Set()); // Reset selections
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;
    
    setUploading(true);
    setMessage(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Upload to server
        const res = await uploadInventoryAction(selectedProjectId, jsonData);
        
        if (res.success) {
          setMessage({ type: 'success', text: res.message! });
          fetchInventory();
        } else {
          setMessage({ type: 'error', text: res.error! });
        }
      } catch (err: any) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to parse Excel file. Ensure columns match the template.' });
      } finally {
        setUploading(false);
        // Reset file input
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const togglePlotSelection = (id: string) => {
    const newSelection = new Set(selectedPlots);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedPlots(newSelection);
  };

  const handleAllocate = async () => {
    if (selectedPlots.size === 0) return alert('Select at least one plot to allocate.');
    if (!selectedLeaderId) return alert('Select a Wing Leader.');
    if (!wingBudget) return alert('Enter a Wing Budget percentage.');

    setAllocating(true);
    setMessage(null);

    const res = await allocatePlotsAction(Array.from(selectedPlots), selectedLeaderId, parseFloat(wingBudget));
    
    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setSelectedLeaderId('');
      setWingBudget('');
      fetchInventory();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setAllocating(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  // Filter projects by selected area
  const availableProjects = projects.filter(p => p.s_project_areas.some((pa: any) => pa.area_id === selectedAreaId));

  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f1d33]">Allocations & Inventory</h1>
          <p className="text-[#5a6a82] mt-1">Select an area and project to upload inventory or assign plots to Wing Leaders.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 mb-6 ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Top Controls: Area & Project Selection */}
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-[#0f1d33] mb-2">1. Select Area</label>
            <div className="relative">
              <select 
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  setSelectedProjectId('');
                }}
                className="w-full h-11 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-4 pr-10 text-[#0f1d33] text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] appearance-none"
              >
                <option value="">Choose an Area...</option>
                {areas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82] pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-[#0f1d33] mb-2">2. Select Project</label>
            <div className="relative">
              <select 
                disabled={!selectedAreaId}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full h-11 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-4 pr-10 text-[#0f1d33] text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:opacity-50 appearance-none"
              >
                <option value="">Choose a Project...</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82] pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-[#0f1d33] mb-2">3. Upload Inventory (Excel)</label>
            <label className={`w-full h-11 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 transition-colors cursor-pointer ${
              !selectedProjectId ? 'border-[#e8ecf2] bg-[#f7f8fa] text-[#a0abbb] cursor-not-allowed' : 'border-[#1e3a5f]/30 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f]'
            }`}>
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="text-sm font-semibold text-center">Upload .xlsx file</span>
                </>
              )}
              <input 
                type="file" 
                accept=".xlsx, .xls"
                disabled={!selectedProjectId || uploading}
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
          </div>
        ) : selectedProjectId && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Inventory Selection Table */}
              <div className="lg:col-span-2 bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0f1d33] flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-[#1e3a5f]" />
                    Unallocated Inventory
                  </h2>
                </div>

                <div className="overflow-x-auto border border-[#e8ecf2] rounded-lg h-[400px] overflow-y-auto relative">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f7f8fa] sticky top-0 z-10 shadow-sm">
                      <tr className="border-b border-[#e8ecf2] text-sm text-[#5a6a82]">
                        <th className="py-3 px-4 font-medium w-10">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPlots(new Set(unallocated.map(p => p.id)));
                              else setSelectedPlots(new Set());
                            }}
                            checked={unallocated.length > 0 && selectedPlots.size === unallocated.length}
                            className="rounded text-[#1e3a5f] focus:ring-[#1e3a5f]/20" 
                          />
                        </th>
                        <th className="py-3 px-4 font-medium">Plot No.</th>
                        <th className="py-3 px-4 font-medium">Size (SqFt)</th>
                        <th className="py-3 px-4 font-medium">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-[#0f1d33]">
                      {unallocated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[#5a6a82]">
                            No unallocated inventory found. Upload an Excel sheet above.
                          </td>
                        </tr>
                      ) : (
                        unallocated.map((row) => (
                          <tr key={row.id} className="border-b border-[#e8ecf2] hover:bg-[#f7f8fa] transition-colors">
                            <td className="py-3 px-4">
                              <input 
                                type="checkbox" 
                                checked={selectedPlots.has(row.id)}
                                onChange={() => togglePlotSelection(row.id)}
                                className="rounded text-[#1e3a5f] focus:ring-[#1e3a5f]/20" 
                              />
                            </td>
                            <td className="py-3 px-4 font-semibold">#{row.plot_number}</td>
                            <td className="py-3 px-4 text-[#5a6a82]">{row.size_sqft}</td>
                            <td className="py-3 px-4 font-semibold">{formatPrice(row.total_price)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-[#5a6a82]">
                  <span>Showing {unallocated.length} unallocated plots</span>
                  <span className="font-semibold text-[#0f1d33]">{selectedPlots.size} Plots Selected</span>
                </div>
              </div>

              {/* Allocation Settings */}
              <div className="space-y-6">
                <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#0f1d33] flex items-center gap-2 mb-6">
                    <Settings2 className="w-5 h-5 text-[#c4a55a]" />
                    Allocation Settings
                  </h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Assign to Wing Leader</label>
                      <div className="relative">
                        <div 
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-10 pr-10 py-2.5 text-[#0f1d33] text-sm focus-within:ring-2 focus-within:ring-[#1e3a5f]/20 cursor-pointer flex items-center justify-between"
                        >
                          <Users className="absolute left-3 w-5 h-5 text-[#5a6a82]" />
                          <span className={selectedLeaderId ? "text-[#0f1d33]" : "text-[#5a6a82]"}>
                            {selectedLeaderId ? wingLeaders.find(w => w.id === selectedLeaderId)?.full_name : "Select Wing Leader..."}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#5a6a82]" />
                        </div>
                        
                        {dropdownOpen && (
                          <div className="absolute top-full mt-1 left-0 w-full bg-white border border-[#e8ecf2] rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-[#e8ecf2] flex items-center gap-2 bg-[#f7f8fa]">
                              <Search className="w-4 h-4 text-[#5a6a82]" />
                              <input 
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-sm w-full outline-none text-[#0f1d33]"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {wingLeaders.filter(wl => wl.full_name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <div className="p-3 text-sm text-[#5a6a82] text-center">No matches found.</div>
                              ) : (
                                wingLeaders.filter(wl => wl.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map(wl => (
                                  <div 
                                    key={wl.id}
                                    onClick={() => {
                                      setSelectedLeaderId(wl.id);
                                      setDropdownOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className="px-3 py-2 text-sm text-[#0f1d33] hover:bg-[#f3f5f8] cursor-pointer"
                                  >
                                    {wl.full_name}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Wing Budget (%)</label>
                      <p className="text-xs text-[#5a6a82] mb-2">The total commission percentage the Wing Leader can distribute downline.</p>
                      <div className="relative">
                        <Percent className="absolute left-3 top-2.5 w-5 h-5 text-[#5a6a82]" />
                        <input 
                          type="number" 
                          value={wingBudget}
                          onChange={(e) => setWingBudget(e.target.value)}
                          placeholder="e.g. 4.5"
                          className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-10 pr-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleAllocate}
                      disabled={allocating || selectedPlots.size === 0}
                      className="w-full gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 px-6 py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {allocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
                      Lock Allocation & Budget
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wing Leader Comparison */}
            <div className="mt-12">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#1e3a5f]" />
                  Wing Leader Allocations Overview
                </h2>
              </div>
              
              {Object.keys(allocatedByLeader).length === 0 ? (
                <div className="bg-white border border-[#e8ecf2] rounded-xl p-8 text-center text-[#5a6a82]">
                  No plots have been allocated to Wing Leaders for this project yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter / Selector */}
                  <div className="bg-white border border-[#e8ecf2] rounded-xl p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#0f1d33] mb-3">Select Wing Leaders to Compare:</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(allocatedByLeader).map(leaderName => (
                        <button
                          key={leaderName}
                          onClick={() => {
                            const newSet = new Set(compareLeaders);
                            if (newSet.has(leaderName)) {
                              newSet.delete(leaderName);
                            } else {
                              newSet.add(leaderName);
                            }
                            setCompareLeaders(newSet);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                            compareLeaders.has(leaderName)
                              ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                              : 'bg-white text-[#5a6a82] border-[#e8ecf2] hover:bg-[#f3f5f8]'
                          }`}
                        >
                          {leaderName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Scroll Area */}
                  {compareLeaders.size === 0 ? (
                    <div className="bg-[#f7f8fa] border border-[#e8ecf2] rounded-xl p-8 text-center text-[#5a6a82]">
                      Please select at least one Wing Leader to view their allocations.
                    </div>
                  ) : (
                    <div className="overflow-x-auto pb-4">
                      <div className="flex gap-6 min-w-max" style={{ minWidth: compareLeaders.size >= 3 ? '100%' : 'auto' }}>
                        {Array.from(compareLeaders).map((leaderName) => {
                          const plots = allocatedByLeader[leaderName];
                          if (!plots) return null;
                          
                          const totalBudget = plots.reduce((sum, p) => sum + Number(p.total_price), 0);
                          const wingBudgetPct = plots[0]?.s_wings?.wing_budget_percentage || 0;
                          
                          return (
                            <div key={leaderName} className="bg-white border border-[#e8ecf2] rounded-xl shadow-sm w-80 shrink-0 flex flex-col overflow-hidden">
                              {/* Header */}
                              <div className="bg-[#1e3a5f] p-4 text-center">
                                <h3 className="font-bold text-white text-lg truncate" title={leaderName}>{leaderName}</h3>
                              </div>
                              
                              {/* Metrics */}
                              <div className="bg-[#f7f8fa] border-b border-[#e8ecf2] p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-semibold text-[#0f1d33]">Total Value</span>
                                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{formatPrice(totalBudget)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-semibold text-[#0f1d33]">Budget %</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[#1e3a5f]">{wingBudgetPct}%</span>
                                    <span className="text-xs font-medium text-[#c4a55a] bg-[#c4a55a]/10 px-1.5 py-0.5 rounded">
                                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(totalBudget * (wingBudgetPct / 100))}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-semibold text-[#0f1d33]">Total Plots</span>
                                  <span className="text-[#5a6a82] font-medium">{plots.length}</span>
                                </div>
                              </div>
                              
                              {/* Plots List */}
                              <div className="p-4 flex-1 h-64 overflow-y-auto">
                                <h4 className="text-xs font-semibold text-[#5a6a82] uppercase tracking-wider mb-3">Allocated Plots</h4>
                                <div className="space-y-2">
                                  {plots.map(plot => (
                                    <div key={plot.id} className="flex justify-between items-center text-sm border-b border-[#e8ecf2] pb-2 last:border-0">
                                      <span className="font-semibold text-[#0f1d33]">#{plot.plot_number}</span>
                                      <span className="text-[#5a6a82]">{formatPrice(plot.total_price)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
