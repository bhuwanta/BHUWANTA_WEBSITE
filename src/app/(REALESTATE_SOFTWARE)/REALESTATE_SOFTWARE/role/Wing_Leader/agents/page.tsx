'use client';

import React, { useEffect, useState } from 'react';
import { getWingAgentsAction, createAgentAction } from './actions';
import { Users, Plus, Loader2, AlertCircle, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function WingAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    const res = await getWingAgentsAction();
    if (res.success) {
      setAgents(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.password) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const res = await createAgentAction(formData);
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Agent created successfully!' });
      setFormData({ fullName: '', phone: '', password: '' });
      setShowModal(false);
      fetchAgents();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create agent' });
    }
    setSubmitting(false);
  };

  const filteredAgents = agents.filter(a => 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.phone.includes(searchQuery) ||
    a.bhuwanta_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f1d33]">My Agents</h1>
          <p className="text-[#5a6a82] mt-1">Manage the agents in your wing.</p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <div className="w-full md:w-64 relative">
            <input 
              type="text" 
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e8ecf2] rounded-lg pl-4 pr-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="shrink-0 gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 px-6 py-2.5 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Agent</span>
          </button>
        </div>
      </div>

      {message && !showModal && (
        <div className={`p-4 rounded-lg flex items-start gap-3 mb-6 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-xl font-bold text-[#0f1d33]">Agent Directory</h2>
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
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">BHUWANTA ID</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Full Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5a6a82] text-sm">
                      {searchQuery ? 'No agents match your search.' : 'You have not added any agents yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-[#f7f8fa] transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-[#c4a55a]">{agent.bhuwanta_id || 'Pending'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-[#0f1d33]">{agent.full_name}</td>
                      <td className="py-3 px-4 text-sm text-[#5a6a82]">{agent.phone}</td>
                      <td className="py-3 px-4">
                        {agent.is_active ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#5a6a82]">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1d33]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#e8ecf2] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0f1d33]">Add New Agent</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#5a6a82] hover:text-[#0f1d33] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-1.5">Full Name</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-5 h-5 text-[#5a6a82]" />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter agent name"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-10 pr-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-5 h-5 text-[#5a6a82]" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-10 pr-4 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0f1d33] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-[#5a6a82]" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Set login password"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-10 pr-10 py-2.5 text-[#0f1d33] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#5a6a82] hover:text-[#1e3a5f]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-[#5a6a82] mt-1.5">Minimum 6 characters. They will use this and their phone to login.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-[#e8ecf2] text-[#0f1d33] font-semibold rounded-lg px-4 py-2.5 hover:bg-[#f3f5f8] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 px-4 py-2.5 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
