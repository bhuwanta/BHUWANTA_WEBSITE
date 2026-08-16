'use client'

import { useState, useEffect } from 'react'
import { getWingLeaderStatsAction, getWingLeaderPlotsAction, deassignPlotAction } from './actions'
import { Loader2, Users, Building2, MapPin, X, Filter } from 'lucide-react'

export default function WingLeadersPage() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  
  // For viewing specific plots
  const [selectedWingId, setSelectedWingId] = useState<string | null>(null)
  const [selectedWingName, setSelectedWingName] = useState<string>('')
  const [plots, setPlots] = useState<any[]>([])
  const [plotsLoading, setPlotsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const res = await getWingLeaderStatsAction()
    if (res.success) {
      setStats(res.data)
    }
    setLoading(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
  }

  const formatExactPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price)
  }

  // Get unique projects for filter
  const allProjects = Array.from(new Set(stats.map(s => JSON.stringify({ id: s.project_id, name: s.project_name })))).map(s => JSON.parse(s))

  // Group stats by Wing Leader, applying project filters if any
  const filteredStats = stats.filter(s => selectedProjects.size === 0 || selectedProjects.has(s.project_id))
  
  const leadersMap = new Map<string, any>()
  filteredStats.forEach(s => {
    if (!leadersMap.has(s.wing_id)) {
      leadersMap.set(s.wing_id, {
        wing_id: s.wing_id,
        name: `${s.wing_leader_name} (${s.wing_budget_percentage}%)`,
        budget_pct: s.wing_budget_percentage,
        total_plots: 0,
        total_value: 0,
        total_budget: 0,
        projects: new Set()
      })
    }
    const l = leadersMap.get(s.wing_id)
    l.total_plots += Number(s.total_plots)
    l.total_value += Number(s.total_value)
    l.total_budget += Number(s.total_budget)
    l.projects.add(s.project_name)
  })
  
  const leaders = Array.from(leadersMap.values())

  const handleToggleProject = (projectId: string) => {
    const next = new Set(selectedProjects)
    if (next.has(projectId)) next.delete(projectId)
    else next.add(projectId)
    setSelectedProjects(next)
  }

  const handleViewPlots = async (wingId: string, wingName: string) => {
    setSelectedWingId(wingId)
    setSelectedWingName(wingName)
    setPlotsLoading(true)
    // If filtering by project, we should technically pass the project filter to the plots query,
    // but for "Master Control" seeing all their plots might be better, or we can fetch all and filter client side.
    const res = await getWingLeaderPlotsAction(wingId)
    if (res.success) {
      setPlots(res.data)
    }
    setPlotsLoading(false)
  }

  const handleDeassign = async (plotId: string) => {
    if (!confirm('Are you sure you want to de-assign this plot? It will go back to the unallocated pool.')) return
    
    setActionLoading(plotId)
    const res = await deassignPlotAction(plotId)
    if (res.success) {
      setPlots(plots.filter(p => p.id !== plotId))
      loadStats() // Refresh stats behind the scenes
    } else {
      alert('Failed to de-assign plot')
    }
    setActionLoading(null)
  }

  // Filter plots by selected projects if projects are selected
  const displayPlots = plots.filter(p => selectedProjects.size === 0 || selectedProjects.has(p.project_id))

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" /></div>
  }

  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[#0f1d33]">Wing Leaders Master Control</h1>
            <p className="text-[#5a6a82] mt-1">Global overview of all Wing Leaders, their budgets, and cross-project allocations.</p>
          </div>
        </div>

        {/* Project Filters */}
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#0f1d33] mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1e3a5f]" /> Filter by Project
          </h3>
          <div className="flex flex-wrap gap-3">
            {allProjects.map((p: any) => (
              <button
                key={p.id}
                onClick={() => handleToggleProject(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedProjects.has(p.id) 
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' 
                  : 'bg-[#f3f5f8] text-[#5a6a82] border-[#e8ecf2] hover:bg-[#e8ecf2]'
                }`}
              >
                {p.name}
              </button>
            ))}
            {selectedProjects.size > 0 && (
              <button
                onClick={() => setSelectedProjects(new Set())}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Wing Leaders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map(l => (
            <div key={l.wing_id} className="bg-white border border-[#e8ecf2] rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="bg-[#1e3a5f] p-4 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg truncate flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c4a55a]" />
                  {l.name}
                </h3>
              </div>
              
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-center text-sm border-b border-[#e8ecf2] pb-3">
                  <span className="font-semibold text-[#5a6a82]">Active Projects</span>
                  <div className="flex gap-1 overflow-hidden max-w-[150px]">
                    {Array.from(l.projects).map((projName: any, idx) => (
                      <span key={idx} className="bg-[#f3f5f8] text-[#0f1d33] px-2 py-0.5 rounded text-xs whitespace-nowrap truncate" title={projName}>
                        {projName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#0f1d33]">Total Plots</span>
                  <span className="text-[#5a6a82] font-medium">{l.total_plots}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#0f1d33]">Total Inventory Value</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{formatPrice(l.total_value)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#0f1d33]">Allocated Budget</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1e3a5f]">{l.budget_pct}%</span>
                    <span className="text-xs font-medium text-[#c4a55a] bg-[#c4a55a]/10 px-1.5 py-0.5 rounded">
                      {formatExactPrice(l.total_budget)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#f7f8fa] border-t border-[#e8ecf2]">
                <button 
                  onClick={() => handleViewPlots(l.wing_id, l.name)}
                  className="w-full gradient-gold text-white font-semibold py-2.5 rounded-lg shadow-md shadow-[#c4a55a]/20 transition-transform active:scale-[0.98]"
                >
                  Manage Plots
                </button>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#5a6a82] bg-white border border-[#e8ecf2] rounded-xl">
              No Wing Leaders found for the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* Plots Management Modal */}
      {selectedWingId && (
        <div className="fixed inset-0 bg-[#0f1d33]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#e8ecf2] flex justify-between items-center bg-[#f7f8fa]">
              <div>
                <h2 className="text-xl font-bold text-[#0f1d33] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1e3a5f]" />
                  Managing {selectedWingName}'s Plots
                </h2>
                {selectedProjects.size > 0 && (
                  <p className="text-sm text-[#5a6a82] mt-1">Filtered by selected projects.</p>
                )}
              </div>
              <button 
                onClick={() => setSelectedWingId(null)}
                className="p-2 text-[#5a6a82] hover:bg-[#e8ecf2] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {plotsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" /></div>
              ) : displayPlots.length === 0 ? (
                <div className="text-center py-12 text-[#5a6a82]">
                  No plots allocated to this leader under the current filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayPlots.map(plot => (
                    <div key={plot.id} className="border border-[#e8ecf2] rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-[#1e3a5f] text-white text-xs font-bold px-2 py-1 rounded">
                            Plot #{plot.plot_number}
                          </span>
                          <div className="text-sm text-[#5a6a82] mt-2 flex items-center gap-1 truncate" title={plot.s_projects?.name}>
                            <Building2 className="w-3.5 h-3.5" />
                            {plot.s_projects?.name}
                          </div>
                        </div>
                        <span className="font-bold text-[#0f1d33] text-sm">{formatPrice(plot.total_price)}</span>
                      </div>
                      
                      <div className="mt-2 pt-3 border-t border-[#e8ecf2]">
                        <button
                          onClick={() => handleDeassign(plot.id)}
                          disabled={actionLoading === plot.id}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                          {actionLoading === plot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          De-assign Plot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
