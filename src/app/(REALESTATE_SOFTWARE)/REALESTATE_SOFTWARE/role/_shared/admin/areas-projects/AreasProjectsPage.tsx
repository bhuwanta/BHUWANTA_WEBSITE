'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, MapPin, Building2, AlertCircle, X, CheckCircle2, FileText, Download, Trash2, Edit2, Filter, IndianRupee, Search } from 'lucide-react';
import {
  createAreaAction,
  updateAreaAction,
  deleteAreaAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  getAreasAction,
  getProjectsAction,
  getDirectorsListAction,
  getDocumentsAction,
  uploadDocumentAction,
  deleteDocumentAction,
} from './actions';

type Message = { type: 'success' | 'error'; text: string } | null;

export default function AreasProjectsPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'documents'>('projects');

  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f1d33]">Areas & Projects</h1>
          <p className="text-[#5a6a82] mt-1">Manage geographical areas, projects, pricing, Director assignments, and documents.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#e8ecf2] w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-[#1e3a5f] text-white shadow' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
          >
            Areas & Projects
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'documents' ? 'bg-[#1e3a5f] text-white shadow' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
          >
            Documents
          </button>
        </div>

        {activeTab === 'projects' ? <ProjectsTab /> : <DocumentsTab />}
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [areas, setAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  const [areaName, setAreaName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectAreaId, setProjectAreaId] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectGoogleMapsUrl, setProjectGoogleMapsUrl] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [mrpDefault, setMrpDefault] = useState('');
  const [selectedDirectorIds, setSelectedDirectorIds] = useState<string[]>([]);

  const [selectedFilterAreaId, setSelectedFilterAreaId] = useState<string | null>(null);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const fetchData = async () => {
    setLoadingData(true);
    const [areasRes, projectsRes, directorsRes] = await Promise.all([getAreasAction(), getProjectsAction(), getDirectorsListAction()]);
    if (areasRes.success) setAreas(areasRes.data);
    if (projectsRes.success) setProjects(projectsRes.data);
    if (directorsRes.success) setDirectors(directorsRes.data);
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetProjectForm = () => {
    setProjectName('');
    setProjectAreaId('');
    setProjectLocation('');
    setProjectGoogleMapsUrl('');
    setBasePrice('');
    setMrpDefault('');
    setSelectedDirectorIds([]);
    setEditingProjectId(null);
  };

  const handleSubmitArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;
    setLoading(true);
    setMessage(null);
    const res = editingAreaId ? await updateAreaAction(editingAreaId, areaName.trim()) : await createAreaAction(areaName.trim());
    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setAreaName('');
      setEditingAreaId(null);
      setIsAreaModalOpen(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const openEditArea = (area: any) => {
    setEditingAreaId(area.id);
    setAreaName(area.name);
    setMessage(null);
    setIsAreaModalOpen(true);
  };

  const handleDeleteArea = async (id: string, name: string) => {
    if (!window.confirm(`Delete area "${name}"? This cannot be undone.`)) return;
    const res = await deleteAreaAction(id);
    if (res.success) {
      if (selectedFilterAreaId === id) setSelectedFilterAreaId(null);
      fetchData();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    const res = await deleteProjectAction(id);
    if (res.success) {
      fetchData();
    } else {
      alert(res.error);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectAreaId) {
      setMessage({ type: 'error', text: 'Please provide a project name and select an area.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      name: projectName.trim(),
      areaId: projectAreaId,
      location: projectLocation.trim() || undefined,
      googleMapsUrl: projectGoogleMapsUrl.trim() || undefined,
      basePrice: basePrice ? parseFloat(basePrice) : undefined,
      mrpDefault: mrpDefault ? parseFloat(mrpDefault) : undefined,
      directorIds: selectedDirectorIds,
    };

    const res = editingProjectId ? await updateProjectAction(editingProjectId, payload) : await createProjectAction(payload);

    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      resetProjectForm();
      setIsProjectModalOpen(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const openEditProject = (project: any) => {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setProjectAreaId(project.s_areas?.id || '');
    setProjectLocation(project.location || '');
    setProjectGoogleMapsUrl(project.google_maps_url || '');
    setBasePrice(project.base_price != null ? String(project.base_price) : '');
    setMrpDefault(project.mrp_default != null ? String(project.mrp_default) : '');
    setSelectedDirectorIds((project.s_director_projects || []).map((dp: any) => dp.director_id));
    setMessage(null);
    setIsProjectModalOpen(true);
  };

  const toggleDirectorSelection = (id: string) => {
    setSelectedDirectorIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const formatPrice = (value: number | null) => (value == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value));

  const filteredAreas = areaSearchQuery.trim()
    ? areas.filter((a) => a.name.toLowerCase().includes(areaSearchQuery.trim().toLowerCase()))
    : areas;

  const filteredProjects = projects
    .filter((p) => !selectedFilterAreaId || p.s_areas?.id === selectedFilterAreaId)
    .filter((p) => {
      if (!projectSearchQuery.trim()) return true;
      const q = projectSearchQuery.trim().toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q) || (p.s_areas?.name || '').toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      {message && !isAreaModalOpen && !isProjectModalOpen && <MessageBanner message={message} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#e8ecf2] bg-[#f7f8fa] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#c4a55a]" />
                All Areas
              </h2>
              <button
                onClick={() => {
                  setMessage(null);
                  setAreaName('');
                  setEditingAreaId(null);
                  setIsAreaModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-white border border-[#e8ecf2] text-[#0f1d33] px-3 py-1.5 rounded-lg font-semibold shadow-sm hover:bg-[#f3f5f8] transition-colors text-xs"
                title="Create Area"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
              <input
                type="text"
                placeholder="Search areas..."
                value={areaSearchQuery}
                onChange={(e) => setAreaSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
              />
            </div>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            {loadingData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#5a6a82]" />
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="p-8 text-center text-[#5a6a82]">{areaSearchQuery ? 'No areas match your search.' : 'No areas created yet.'}</div>
            ) : (
              <ul className="divide-y divide-[#e8ecf2]">
                <li
                  onClick={() => setSelectedFilterAreaId(null)}
                  className={`p-4 hover:bg-[#f7f8fa] transition-colors flex items-center justify-between cursor-pointer ${selectedFilterAreaId === null ? 'bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f]' : 'border-l-4 border-transparent'}`}
                >
                  <span className={`font-semibold ${selectedFilterAreaId === null ? 'text-[#1e3a5f]' : 'text-[#0f1d33]'}`}>All Areas</span>
                </li>
                {filteredAreas.map((area) => (
                  <li
                    key={area.id}
                    className={`p-4 hover:bg-[#f7f8fa] transition-colors flex items-center justify-between group ${selectedFilterAreaId === area.id ? 'bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f]' : 'border-l-4 border-transparent'}`}
                  >
                    <span
                      onClick={() => setSelectedFilterAreaId(area.id)}
                      className={`font-semibold cursor-pointer flex-1 ${selectedFilterAreaId === area.id ? 'text-[#1e3a5f]' : 'text-[#0f1d33]'}`}
                    >
                      {area.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditArea(area)} className="p-1.5 text-[#5a6a82] hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-colors" title="Edit Area">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteArea(area.id, area.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Area">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#e8ecf2] bg-[#f7f8fa] flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <h2 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2 shrink-0">
              <Building2 className="w-5 h-5 text-[#1e3a5f]" />
              Projects
              {selectedFilterAreaId && (
                <button onClick={() => setSelectedFilterAreaId(null)} className="text-xs font-normal text-[#1e3a5f] bg-[#1e3a5f]/10 px-2 py-0.5 rounded-full hover:bg-[#1e3a5f]/20 transition-colors">
                  Clear area filter ×
                </button>
              )}
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
                <input
                  type="text"
                  placeholder="Search projects, location..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>
              <button
                onClick={() => {
                  resetProjectForm();
                  setMessage(null);
                  setIsProjectModalOpen(true);
                }}
                className="shrink-0 flex items-center gap-1.5 gradient-gold text-white px-3 py-2 rounded-lg font-semibold shadow-lg shadow-[#c4a55a]/20 transition-all text-xs"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </button>
            </div>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            {loadingData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#5a6a82]" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-[#5a6a82]">No projects found for the selected area.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f5f8] text-[#5a6a82] text-xs uppercase tracking-wider font-semibold border-y border-[#e8ecf2]">
                      <th className="p-4">Project</th>
                      <th className="p-4">Area</th>
                      <th className="p-4">Base Price</th>
                      <th className="p-4">MRP (Default)</th>
                      <th className="p-4">Director(s)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ecf2]">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-[#f7f8fa] transition-colors">
                        <td className="p-4 align-top">
                          <span className="font-bold text-[#0f1d33]">{project.name}</span>
                          {project.location && <div className="text-xs text-[#5a6a82] mt-0.5">{project.location}</div>}
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2.5 py-1 rounded-md text-xs font-medium border border-[#1e3a5f]/20 whitespace-nowrap">{project.s_areas?.name || 'N/A'}</span>
                            {project.google_maps_url && (
                              <a
                                href={project.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[#5a6a82] hover:text-[#c4a55a] transition-colors"
                                title="Open in Google Maps"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                View on Map
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-sm text-[#0f1d33] font-medium whitespace-nowrap">{formatPrice(project.base_price)}</td>
                        <td className="p-4 align-top text-sm text-[#0f1d33] font-medium whitespace-nowrap">{formatPrice(project.mrp_default)}</td>
                        <td className="p-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {(project.s_director_projects || []).length === 0 ? (
                              <span className="text-xs text-[#5a6a82] italic">Unassigned</span>
                            ) : (
                              project.s_director_projects.map((dp: any) => (
                                <span key={dp.director_id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                                  {dp.s_realestate_users?.full_name || 'Unknown'}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-right whitespace-nowrap">
                          <button onClick={() => openEditProject(project)} className="text-[#1e3a5f] font-semibold text-xs hover:underline mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteProject(project.id, project.name)} className="text-red-500 font-semibold text-xs hover:underline">
                            Delete
                          </button>
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

      {isAreaModalOpen && (
        <Modal title={editingAreaId ? 'Edit Area' : 'Create New Area'} icon={MapPin} onClose={() => setIsAreaModalOpen(false)}>
          <form onSubmit={handleSubmitArea} className="p-6">
            {message?.type === 'error' && <ErrorBanner text={message.text} />}
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
              <button type="button" onClick={() => setIsAreaModalOpen(false)} className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 px-6 py-2 flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAreaId ? 'Save Changes' : 'Create Area'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isProjectModalOpen && (
        <Modal title={editingProjectId ? 'Edit Project' : 'Create New Project'} icon={Building2} onClose={() => setIsProjectModalOpen(false)} wide>
          <form onSubmit={handleSubmitProject} className="p-6">
            {message?.type === 'error' && <ErrorBanner text={message.text} />}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                Area <span className="text-red-500">*</span>
              </label>
              {areas.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">You need to create an Area first before creating a project.</div>
              ) : (
                <select
                  required
                  value={projectAreaId}
                  onChange={(e) => setProjectAreaId(e.target.value)}
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                >
                  <option value="" disabled>
                    Select an Area (a Project belongs to exactly one)
                  </option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="e.g. Sadashivpet"
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Google Maps URL (Optional)</label>
                <input
                  type="url"
                  value={projectGoogleMapsUrl}
                  onChange={(e) => setProjectGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Base Price (₹/sq.yard)</label>
                <p className="text-xs text-[#5a6a82] mb-2">Used only for commission calculation — never shown to customers.</p>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6a82]" />
                  <input
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-9 pr-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Default MRP (₹/sq.yard)</label>
                <p className="text-xs text-[#5a6a82] mb-2">Pre-fills on New Registration — sellers can adjust per sale.</p>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6a82]" />
                  <input
                    type="number"
                    step="0.01"
                    value={mrpDefault}
                    onChange={(e) => setMrpDefault(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-9 pr-4 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2 flex justify-between">
                <span>Assign Director(s)</span>
                <span className="text-[#5a6a82] font-normal text-xs">{selectedDirectorIds.length} selected</span>
              </label>
              {directors.length === 0 ? (
                <div className="bg-[#f3f5f8] border border-[#e8ecf2] p-4 rounded-lg text-[#5a6a82] text-sm">No Director accounts exist yet — assign later once one is created.</div>
              ) : (
                <div className="bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {directors.map((director) => (
                    <label key={director.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-[#e8ecf2]">
                      <input type="checkbox" checked={selectedDirectorIds.includes(director.id)} onChange={() => toggleDirectorSelection(director.id)} className="w-4 h-4 text-[#1e3a5f] border-[#e8ecf2] rounded focus:ring-[#1e3a5f]" />
                      <span className="text-sm font-medium text-[#0f1d33]">{director.full_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || areas.length === 0}
                className="bg-[#1e3a5f] text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 hover:bg-[#0f1d33] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProjectId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function DocumentsTab() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documentType, setDocumentType] = useState('brochure');
  const [file, setFile] = useState<File | null>(null);

  const [filterProjectId, setFilterProjectId] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const fetchData = async () => {
    setLoadingData(true);
    const [docsRes, projRes] = await Promise.all([getDocumentsAction(), getProjectsAction()]);
    if (docsRes.success) setDocuments(docsRes.data);
    if (projRes.success) setProjects(projRes.data);
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !file) {
      setMessage({ type: 'error', text: 'Please select a project and a file.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', selectedProjectId);
    formData.append('documentType', documentType);

    const res = await uploadDocumentAction(formData);

    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setFile(null);
      setSelectedProjectId('');
      setDocumentType('brochure');
      setIsModalOpen(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, fileUrl: string, docType: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) return;
    setLoadingData(true);
    const res = await deleteDocumentAction(id, fileUrl, docType);
    if (res.success) {
      fetchData();
    } else {
      alert(res.error);
      setLoadingData(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchProject = filterProjectId === 'all' || doc.project_id === filterProjectId;
    const matchType = filterDocType === 'all' || doc.document_type === filterDocType;
    return matchProject && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setMessage(null);
            setFile(null);
            setSelectedProjectId('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 gradient-gold text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-[#c4a55a]/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {message && !isModalOpen && <MessageBanner message={message} />}

      <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e8ecf2] bg-[#f7f8fa] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-[#5a6a82] font-semibold">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} className="bg-white border border-[#e8ecf2] rounded-lg px-3 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]">
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select value={filterDocType} onChange={(e) => setFilterDocType(e.target.value)} className="bg-white border border-[#e8ecf2] rounded-lg px-3 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] capitalize">
              <option value="all">All Types</option>
              <option value="brochure">Brochures</option>
              <option value="layout">Layouts</option>
              <option value="linkdocument">Link Documents</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f5f8] text-[#5a6a82] text-xs uppercase tracking-wider font-semibold border-b border-[#e8ecf2]">
              <tr>
                <th className="p-4">Document</th>
                <th className="p-4">Project</th>
                <th className="p-4">Type</th>
                <th className="p-4">Upload Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ecf2]">
              {loadingData ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a] mx-auto mb-2" />
                    <p className="text-[#5a6a82] text-sm">Loading documents...</p>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#5a6a82]">
                    No documents found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f7f8fa] transition-colors">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#1e3a5f]/10 p-2 rounded-lg text-[#1e3a5f]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-[#0f1d33] max-w-[200px] truncate" title={doc.file_name}>
                          {doc.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle font-medium text-[#0f1d33]">{doc.s_projects?.name || 'Unknown'}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                          doc.document_type === 'brochure' ? 'bg-emerald-50 text-emerald-600' : doc.document_type === 'layout' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {doc.document_type.replace('linkdocument', 'Link Document')}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-sm text-[#5a6a82]">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-colors" title="Download/View">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(doc.id, doc.file_url, doc.document_type)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal title="Upload Document" icon={FileText} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleUpload} className="p-6">
            {message?.type === 'error' && <ErrorBanner text={message.text} />}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              {projects.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm">No projects available. Please create a project first.</div>
              ) : (
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                >
                  <option value="" disabled>
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['brochure', 'layout', 'linkdocument'].map((type) => (
                  <label key={type} className={`cursor-pointer border rounded-lg p-2 text-center text-xs font-semibold transition-colors ${documentType === type ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]' : 'border-[#e8ecf2] bg-white text-[#5a6a82] hover:bg-[#f3f5f8]'}`}>
                    <input type="radio" name="docType" value={type} checked={documentType === type} onChange={(e) => setDocumentType(e.target.value)} className="sr-only" />
                    <span className="capitalize">{type.replace('linkdocument', 'Link Doc')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0f1d33] mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-[#5a6a82] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f3f5f8] file:text-[#0f1d33] hover:file:bg-[#e8ecf2] file:cursor-pointer border border-[#e8ecf2] rounded-lg p-1.5"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading || projects.length === 0} className="bg-[#1e3a5f] text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 hover:bg-[#0f1d33] transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, icon: Icon, onClose, children, wide }: { title: string; icon: any; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
          <h3 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#1e3a5f]" />
            {title}
          </h3>
          <button onClick={onClose} className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors rounded-full p-1 hover:bg-[#e8ecf2]">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MessageBanner({ message }: { message: { type: 'success' | 'error'; text: string } }) {
  return (
    <div className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
      {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
      <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{message.text}</p>
    </div>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
      <p className="text-sm text-red-800">{text}</p>
    </div>
  );
}
