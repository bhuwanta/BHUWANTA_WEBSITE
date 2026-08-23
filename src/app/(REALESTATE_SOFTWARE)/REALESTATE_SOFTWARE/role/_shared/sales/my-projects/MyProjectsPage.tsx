'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Loader2, MapPin, IndianRupee, FileText, Search } from 'lucide-react';
import { getMyProjectsAction } from './actions';
import { getDocumentsForProjectsAction } from '../../documents';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getMyProjectsAction();
      if (res.success) {
        setProjects(res.data);
        const ids = res.data.map((p: any) => p.id);
        if (ids.length > 0) {
          const docsRes = await getDocumentsForProjectsAction(ids);
          if (docsRes.success) setDocuments(docsRes.data);
        }
      }
      setLoading(false);
    })();
  }, []);

  const formatPrice = (v: number | null) => (v == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v));

  const filtered = searchQuery.trim()
    ? projects.filter((p) => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) || (p.s_areas?.name || '').toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : projects;

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#c4a55a]" />
            My Projects
          </h1>
          <p className="text-[#5a6a82] text-sm mt-1">The Project(s) your Director is assigned to — inherited automatically, read-only.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e8ecf2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center text-[#5a6a82]">
          <Building2 className="w-10 h-10 text-[#e8ecf2] mx-auto mb-3" />
          {projects.length === 0 ? 'No Projects assigned to your Director yet — ask IT/CEO/Governing Council to assign one.' : 'No projects match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const projectDocs = documents.filter((d) => d.project_id === project.id);
            return (
              <div key={project.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-[#0f1d33]">{project.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-0.5 rounded text-xs font-medium">{project.s_areas?.name || 'N/A'}</span>
                    {project.google_maps_url && (
                      <a href={project.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#5a6a82] hover:text-[#c4a55a] transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                        Map
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#e8ecf2]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Base Price
                    </p>
                    <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{formatPrice(project.base_price)}/sq.yd</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Default MRP
                    </p>
                    <p className="text-sm font-bold text-[#0f1d33] mt-0.5">{formatPrice(project.mrp_default)}/sq.yd</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6a82] font-semibold mb-1.5">Documents</p>
                  {projectDocs.length === 0 ? (
                    <p className="text-xs text-[#a0abbb] italic">None uploaded yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {projectDocs.map((doc) => (
                        <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#1e3a5f] hover:text-[#c4a55a] transition-colors truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.file_name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
