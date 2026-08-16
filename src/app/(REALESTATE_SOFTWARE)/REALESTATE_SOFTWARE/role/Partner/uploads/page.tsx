'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, FileText, X, CheckCircle2, Download, Trash2, Filter } from 'lucide-react';
import { getDocumentsAction, uploadDocumentAction, deleteDocumentAction } from './actions';
import { getProjectsAction } from '../projects/actions';

export default function UploadsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documentType, setDocumentType] = useState('brochure');
  const [file, setFile] = useState<File | null>(null);
  
  // Filter state
  const [filterProjectId, setFilterProjectId] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchData = async () => {
    setLoadingData(true);
    const [docsRes, projRes] = await Promise.all([
      getDocumentsAction(),
      getProjectsAction()
    ]);
    
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
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
    
    setLoadingData(true);
    const res = await deleteDocumentAction(id, fileUrl, docType);
    if (res.success) {
      fetchData();
    } else {
      alert(res.error);
      setLoadingData(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchProject = filterProjectId === 'all' || doc.project_id === filterProjectId;
    const matchType = filterDocType === 'all' || doc.document_type === filterDocType;
    return matchProject && matchType;
  });

  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f1d33]">Project Uploads</h1>
            <p className="text-[#5a6a82] mt-1">Manage brochures, layouts, and link documents for your projects.</p>
          </div>
          
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

        {message && !isModalOpen && (
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

        {/* Filters and Table Container */}
        <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-[#e8ecf2] bg-[#f7f8fa] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-[#5a6a82] font-semibold">
              <Filter className="w-4 h-4" /> Filters
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select 
                value={filterProjectId} 
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="bg-white border border-[#e8ecf2] rounded-lg px-3 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select 
                value={filterDocType} 
                onChange={(e) => setFilterDocType(e.target.value)}
                className="bg-white border border-[#e8ecf2] rounded-lg px-3 py-1.5 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] capitalize"
              >
                <option value="all">All Types</option>
                <option value="brochure">Brochures</option>
                <option value="layout">Layouts</option>
                <option value="linkdocument">Link Documents</option>
              </select>
            </div>
          </div>

          {/* Table */}
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
                  filteredDocs.map(doc => (
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
                      <td className="p-4 align-middle font-medium text-[#0f1d33]">
                        {doc.s_projects?.name || 'Unknown'}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                          doc.document_type === 'brochure' ? 'bg-emerald-50 text-emerald-600' :
                          doc.document_type === 'layout' ? 'bg-purple-50 text-purple-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {doc.document_type.replace('linkdocument', 'Link Document')}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-sm text-[#5a6a82]">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-colors"
                            title="Download/View"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleDelete(doc.id, doc.file_url, doc.document_type)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
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

      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#e8ecf2] bg-[#f7f8fa]">
              <h3 className="text-lg font-bold text-[#0f1d33] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1e3a5f]" />
                Upload Document
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors rounded-full p-1 hover:bg-[#e8ecf2]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6">
              {message && message.type === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{message.text}</p>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Project <span className="text-red-500">*</span></label>
                {projects.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm">
                    No projects available. Please create a project first.
                  </div>
                ) : (
                  <select 
                    required
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">Document Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {['brochure', 'layout', 'linkdocument'].map((type) => (
                    <label 
                      key={type}
                      className={`cursor-pointer border rounded-lg p-2 text-center text-xs font-semibold transition-colors ${
                        documentType === type 
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]' 
                          : 'border-[#e8ecf2] bg-white text-[#5a6a82] hover:bg-[#f3f5f8]'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="docType" 
                        value={type}
                        checked={documentType === type}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="sr-only" 
                      />
                      <span className="capitalize">{type.replace('linkdocument', 'Link Doc')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#0f1d33] mb-2">File <span className="text-red-500">*</span></label>
                <input 
                  type="file" 
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-[#5a6a82]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#f3f5f8] file:text-[#0f1d33]
                    hover:file:bg-[#e8ecf2] file:cursor-pointer
                    border border-[#e8ecf2] rounded-lg p-1.5"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#5a6a82] font-semibold hover:bg-[#f3f5f8] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || projects.length === 0}
                  className="bg-[#1e3a5f] text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 hover:bg-[#0f1d33] transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
