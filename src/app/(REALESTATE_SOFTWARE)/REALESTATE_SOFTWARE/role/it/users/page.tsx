'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserX, UserCheck, Briefcase, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, X, Eye, EyeOff, Edit2 } from 'lucide-react';
import { createExecutiveAction, getExecutivesAction, updateExecutiveAction, toggleExecutiveStatusAction } from './actions';

export default function ITUserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
  const [roleSelection, setRoleSelection] = useState<'partner' | 'wing_leader' | 'agent' | 'it'>('partner');
  const [formData, setFormData] = useState({ fullName: '', phone: '', equitySplit: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'all' | 'partner' | 'wing_leader' | 'agent' | 'it'>('all');
  const [sortCol, setSortCol] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const itemsPerPage = 50;

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setLoadingData(true);
    const res = await getExecutivesAction(currentPage, itemsPerPage, searchQuery, roleFilter, sortCol, sortDir);
    if (res.success) {
      setUsers(res.data);
      setTotalUsers(res.count || 0);
    }
    if (showLoading) setLoadingData(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, roleFilter, sortCol, sortDir, searchQuery]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronRight className="w-3 h-3 rotate-90 opacity-40 ml-1 inline" />;
    return <ChevronRight className={`w-3 h-3 ml-1 inline transition-transform ${sortDir === 'asc' ? '-rotate-90' : 'rotate-90'}`} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;
    
    setLoading(true);
    setMessage(null);
    
    if (isEditMode && editingUserId) {
      const res = await updateExecutiveAction(editingUserId, {
        fullName: formData.fullName,
        phone: formData.phone,
        role: roleSelection,
        password: formData.password || undefined,
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message! });
        setFormData({ fullName: '', phone: '', equitySplit: '', password: '' });
        fetchUsers(false);
      } else {
        setMessage({ type: 'error', text: res.error! });
      }
      setLoading(false);
      return;
    }

    const res = await createExecutiveAction({
      fullName: formData.fullName,
      phone: formData.phone,
      role: roleSelection,
      password: formData.password || undefined,
      equitySplit: roleSelection === 'partner' && formData.equitySplit ? parseFloat(formData.equitySplit) : undefined
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message! });
      setFormData({ fullName: '', phone: '', equitySplit: '', password: '' });
      fetchUsers(false); // Refresh table without spinner
    } else {
      setMessage({ type: 'error', text: res.error! });
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      const confirmed = window.confirm("Are you sure you want to deactivate this user? They will immediately lose access to their dashboard.");
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm("Are you sure you want to activate this user? They will regain access to their dashboard.");
      if (!confirmed) return;
    }
    
    // Optimistic UI update
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));

    const res = await toggleExecutiveStatusAction(id, currentStatus);
    if (!res.success) {
      alert(res.error);
      fetchUsers(false); // revert if failed
    }
  };

  const openEditModal = (user: any) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setRoleSelection(user.role);
    setFormData({ 
      fullName: user.full_name, 
      phone: user.phone, 
      equitySplit: '', 
      password: '' 
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1d33]">User Management</h1>
          <p className="text-[#5a6a82] text-sm mt-1">Manage Partners, Wing Leaders, and Agents.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              setIsEditMode(false);
              setEditingUserId(null);
              setFormData({ fullName: '', phone: '', equitySplit: '', password: '' });
              setRoleSelection('partner');
              setIsModalOpen(true);
              setMessage(null);
            }}
            className="shrink-0 gradient-gold text-white font-semibold rounded-lg shadow-sm px-4 py-2 flex items-center gap-2 hover:opacity-90 transition-opacity text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Main Table Area with Fixed Header & Scroll */}
      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl flex-1 flex flex-col min-h-0">
        
        {/* Table Toolbar (Search & Filters) */}
        <div className="p-4 border-b border-[#e8ecf2] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white shrink-0">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset to page 1 on search
              }}
              className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0f1d33] focus:outline-none focus:ring-1 focus:ring-[#c4a55a]"
            />
          </div>
          
          <div className="flex bg-[#f3f5f8] p-1 rounded-lg w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'it', 'partner', 'wing_leader', 'agent'].map((role) => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role as any); setCurrentPage(1); }}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap capitalize ${roleFilter === role ? 'bg-white text-[#c4a55a] shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse relative min-w-[900px]">
            <thead className="bg-[#f7f8fa] sticky top-0 z-10 shadow-[0_1px_0_#e8ecf2]">
              <tr className="text-[13px] uppercase tracking-wider text-[#5a6a82]">
                <th className="py-4 px-5 font-semibold w-20 whitespace-nowrap">Sr. No.</th>
                <th className="py-4 px-5 font-semibold w-40 whitespace-nowrap cursor-pointer hover:bg-[#e8ecf2] transition-colors" onClick={() => handleSort('bhuwanta_id')}>Bhuwanta ID <SortIcon col="bhuwanta_id" /></th>
                <th className="py-4 px-5 font-semibold whitespace-nowrap cursor-pointer hover:bg-[#e8ecf2] transition-colors" onClick={() => handleSort('full_name')}>Name <SortIcon col="full_name" /></th>
                <th className="py-4 px-5 font-semibold whitespace-nowrap cursor-pointer hover:bg-[#e8ecf2] transition-colors" onClick={() => handleSort('role')}>Role <SortIcon col="role" /></th>
                <th className="py-4 px-5 font-semibold whitespace-nowrap cursor-pointer hover:bg-[#e8ecf2] transition-colors" onClick={() => handleSort('phone')}>Phone Number <SortIcon col="phone" /></th>
                <th className="py-4 px-5 font-semibold whitespace-nowrap cursor-pointer hover:bg-[#e8ecf2] transition-colors" onClick={() => handleSort('is_active')}>Status <SortIcon col="is_active" /></th>
                <th className="py-4 px-5 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#0f1d33] divide-y divide-[#e8ecf2]">
              {loadingData ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c4a55a] mx-auto mb-2" />
                    <p className="text-[#5a6a82] text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : users.map((user, index) => (
                <tr key={user.id} className="hover:bg-[#f3f5f8] transition-colors">
                  <td className="py-4 px-5 text-[#5a6a82] text-sm whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-4 px-5 font-mono text-sm text-[#0f1d33] font-semibold whitespace-nowrap">{user.bhuwanta_id || 'Pending...'}</td>
                  <td className="py-4 px-5 font-medium text-[#0f1d33] whitespace-nowrap">{user.full_name}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {user.role === 'partner' ? (
                       <span className="bg-[#c4a55a]/10 text-[#c4a55a] px-2.5 py-1 rounded text-xs font-semibold">Partner</span>
                    ) : user.role === 'wing_leader' ? (
                       <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2.5 py-1 rounded text-xs font-semibold">Wing Leader</span>
                    ) : user.role === 'it' ? (
                       <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded text-xs font-semibold">IT Admin</span>
                    ) : (
                       <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded text-xs font-semibold capitalize">{user.role}</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-[#5a6a82] font-mono whitespace-nowrap">{user.phone}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {user.is_active ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 w-fit px-2.5 py-1 rounded">
                        <UserCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold text-xs bg-red-50 w-fit px-2.5 py-1 rounded">
                        <UserX className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap space-x-1">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8] p-2 rounded transition-colors inline-block" 
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`${user.is_active ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'} p-2 rounded transition-colors inline-block`} 
                      title={user.is_active ? "Deactivate User" : "Activate User"}
                    >
                      {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {(!loadingData && users.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5a6a82]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#e8ecf2] p-4 flex items-center justify-between bg-white shrink-0 rounded-b-xl text-sm">
          <p className="text-[#5a6a82]">
            Showing <span className="font-semibold text-[#0f1d33]">{users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-[#0f1d33]">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of <span className="font-semibold text-[#0f1d33]">{totalUsers}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#e8ecf2] rounded hover:bg-[#f3f5f8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[#0f1d33] font-medium px-2">Page {currentPage} of {Math.max(1, totalPages)}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 border border-[#e8ecf2] rounded hover:bg-[#f3f5f8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1d33]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[#e8ecf2]">
                <h2 className="text-xl font-bold text-[#0f1d33]">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#5a6a82] hover:bg-[#f3f5f8] p-1.5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-5">
              {message && (
                <div className={`p-3 rounded-lg mb-4 flex items-start gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <UserCheck className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role Toggle */}
                <div className="flex bg-[#f3f5f8] p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRoleSelection('partner')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] md:text-sm font-semibold rounded-md transition-all ${roleSelection === 'partner' ? 'bg-white text-[#c4a55a] shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
                  >
                    Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection('wing_leader')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] md:text-sm font-semibold rounded-md transition-all ${roleSelection === 'wing_leader' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
                  >
                    Wing Leader
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection('agent')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] md:text-sm font-semibold rounded-md transition-all ${roleSelection === 'agent' ? 'bg-white text-emerald-600 shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
                  >
                    Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection('it')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] md:text-sm font-semibold rounded-md transition-all ${roleSelection === 'it' ? 'bg-white text-purple-600 shadow-sm' : 'text-[#5a6a82] hover:text-[#0f1d33]'}`}
                  >
                    IT Admin
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f1d33] mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#0f1d33] mb-1.5">Phone Number (Login ID)</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f1d33] mb-1.5">Password (Optional)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Set a password for login"
                      className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2 pr-10 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6a82] hover:text-[#0f1d33]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[#5a6a82] text-xs mt-1">{isEditMode ? 'Leave blank to keep current password.' : 'If left blank, user can login via OTP.'}</p>
                </div>

                {!isEditMode && roleSelection === 'partner' && (
                  <div>
                    <label className="block text-sm font-medium text-[#0f1d33] mb-1.5">Master Equity Split (%)</label>
                    <input 
                      type="number" 
                      value={formData.equitySplit}
                      onChange={(e) => setFormData({...formData, equitySplit: e.target.value})}
                      placeholder="e.g. 25"
                      className="w-full bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2 text-[#0f1d33] text-sm focus:outline-none focus:border-[#c4a55a] focus:ring-1 focus:ring-[#c4a55a]"
                    />
                  </div>
                )}
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#0f1d33] text-white font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-[#1e3a5f] transition-colors disabled:opacity-50 capitalize"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : `${isEditMode ? 'Update' : 'Create'} ${roleSelection.replace('_', ' ')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
