'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, MapPin, Building2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { createAreaAction, createProjectAction, getAreasAction, getProjectsAction } from './actions';

export default function AreasAndProjectsPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Modals state
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Form state
  const [areaName, setAreaName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectGoogleMapsUrl, setProjectGoogleMapsUrl] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  
  const [selectedFilterAreaId, setSelectedFilterAreaId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchData = async () => {
    setLoadingData(true);
    const [areasRes, projectsRes] = await Promise.all([
      getAreasAction(),
      getProjectsAction()
    ]);
    if (areasRes.success) setAreas(areasRes.data);
    if (projectsRes.success) setProjects(projectsRes.data);
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;
    
    setLoading(true);
    setMessage(null);
    
    const res = await createAreaAction(areaName.trim());
    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setAreaName('');
      setIsAreaModalOpen(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || selectedAreaIds.length === 0) {
      setMessage({ type: 'error', text: 'Please provide a project name and select at least one area.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    const res = await createProjectAction(projectName.trim(), selectedAreaIds, projectLocation.trim() || undefined, projectGoogleMapsUrl.trim() || undefined);
    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setProjectName('');
      setProjectLocation('');
      setProjectGoogleMapsUrl('');
      setSelectedAreaIds([]);
      setIsProjectModalOpen(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const toggleAreaSelection = (areaId: string) => {
    setSelectedAreaIds(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const filteredProjects = selectedFilterAreaId
    ? projects.filter(p => p.s_project_areas?.some((pa: any) => pa.s_areas.id === selectedFilterAreaId))
    : projects;

  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f1d33]">Areas & Projects</h1>
            <p className="text-[#5a6a82] mt-1">Manage geographical areas and map projects to them.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setMessage(null);
                setAreaName('');
                setIsAreaModalOpen(true);
              }}
              className="flex items-center gap-2 bg-white border border-[#e8ecf2] text-[#0f1d33] px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#f3f5f8] transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Create Area
            </button>
            <button 
              onClick={() => {
                setMessage(null);
                setProjectName('');
                setProjectLocation('');
                setProjectGoogleMapsUrl('');
                setSelectedAreaIds([]);
                setIsProjectModalOpen(true);
              }}
              className="flex items-center gap-2 gradient-gold text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-[#c4a55a]/20 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Create Project
            </button>
          </div>
        </div>

        {message && !isAreaModalOpen && !isProjectModalOpen && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas List (1/3 width) */}
          <div className="lg:col-span-1 bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h2 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#c4a55a]" />
                All Areas
              </h2>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {loadingData ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#5a6a82]" /></div>
              ) : areas.length === 0 ? (
                <div className="p-8 text-center text-[#5a6a82]">No areas created yet.</div>
              ) : (
                <ul className="divide-y divide-[#e8ecf2]">
                  <li 
                    onClick={() => setSelectedFilterAreaId(null)}
                    className={`p-4 hover:bg-[#f7f8fa] transition-colors flex items-center justify-between cursor-pointer ${selectedFilterAreaId === null ? 'bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f]' : 'border-l-4 border-transparent'}`}
                  >
                    <span className={`font-semibold ${selectedFilterAreaId === null ? 'text-[#1e3a5f]' : 'text-[#0f1d33]'}`}>All Areas</span>
                  </li>
                  {areas.map(area => (
                    <li 
                      key={area.id} 
                      onClick={() => setSelectedFilterAreaId(area.id)}
                      className={`p-4 hover:bg-[#f7f8fa] transition-colors flex items-center justify-between cursor-pointer ${selectedFilterAreaId === area.id ? 'bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f]' : 'border-l-4 border-transparent'}`}
                    >
                      <span className={`font-semibold ${selectedFilterAreaId === area.id ? 'text-[#1e3a5f]' : 'text-[#0f1d33]'}`}>{area.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Projects List (2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h2 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1e3a5f]" />
                Projects
              </h2>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {loadingData ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#5a6a82]" /></div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-[#5a6a82]">No projects found for the selected area.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f3f5f8] text-[#5a6a82] text-xs uppercase tracking-wider font-semibold border-y border-[#e8ecf2]">
                        <th className="p-4">Project Name</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Maps Link</th>
                        <th className="p-4">Mapped Areas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8ecf2]">
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="hover:bg-[#f7f8fa] transition-colors">
                          <td className="p-4 align-top">
                            <span className="font-bold text-[#0f1d33]">{project.name}</span>
                          </td>
                          <td className="p-4 align-top">
                            {project.location ? (
                              <span className="text-sm text-[#5a6a82] flex items-center gap-1 whitespace-nowrap">
                                <MapPin className="w-3.5 h-3.5" />
                                {project.location}
                              </span>
                            ) : (
                              <span className="text-sm text-[#5a6a82] italic">N/A</span>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            {project.google_maps_url ? (
                              <a href={project.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-[#1e3a5f] hover:underline flex items-center gap-1 text-sm font-medium whitespace-nowrap">
                                View Map
                              </a>
                            ) : (
                              <span className="text-sm text-[#5a6a82] italic">N/A</span>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {project.s_project_areas && project.s_project_areas.length > 0 ? (
                                project.s_project_areas.map((mapping: any) => (
                                  <span key={mapping.s_areas.id} className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2.5 py-1 rounded-md text-xs font-medium border border-[#1e3a5f]/20 whitespace-nowrap">
                                    {mapping.s_areas.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-[#5a6a82] italic">No areas mapped</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* CREATE AREA MODAL */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h3 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#c4a55a]" />
                Create New Area
              </h3>
              <button onClick={() => setIsAreaModalOpen(false)} className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors rounded-full p-1 hover:bg-[#e8ecf2]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateArea} className="p-6">
              {message && message.type === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{message.text}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Area Name</label>
                <input 
                  type="text" 
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. North Zone, Sector 45..." 
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h3 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1e3a5f]" />
                Create New Project
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors rounded-full p-1 hover:bg-[#e8ecf2]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6">
              {message && message.type === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{message.text}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Project Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Prestige Falcon City" 
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Location (Optional)</label>
                <input 
                  type="text" 
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="e.g. Sadashivpet" 
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Google Maps URL (Optional)</label>
                <input 
                  type="url" 
                  value={projectGoogleMapsUrl}
                  onChange={(e) => setProjectGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..." 
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2 flex justify-between">
                  <span>Map to Areas</span>
                  <span className="text-[#5a6a82] font-normal text-xs">{selectedAreaIds.length} selected</span>
                </label>
                {areas.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
                    You need to create an Area first before creating a project.
                  </div>
                ) : (
                  <div className="bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {areas.map(area => (
                      <label key={area.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-[#e8ecf2]">
                        <input 
                          type="checkbox" 
                          checked={selectedAreaIds.includes(area.id)}
                          onChange={() => toggleAreaSelection(area.id)}
                          className="w-4 h-4 text-[#1e3a5f] border-[#e8ecf2] rounded focus:ring-[#1e3a5f]"
                        />
                        <span className="text-sm font-medium text-[#0f1d33]">{area.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || areas.length === 0}
                  className="bg-[#1e3a5f] text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 hover:bg-[#0f1d33] transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
