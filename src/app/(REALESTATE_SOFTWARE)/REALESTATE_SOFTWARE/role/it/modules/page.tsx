'use client';

import React, { useState, useEffect } from 'react';
import { Blocks, Key, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { getModulesAction, toggleModuleRoleAction, ensurePasswordsModuleExists } from './actions';

const AVAILABLE_ROLES = [
  { id: 'partner', label: 'Partner' },
  { id: 'wing_leader', label: 'Wing Leader' },
  { id: 'sub_agent', label: 'Sub Agent' }
];

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    await ensurePasswordsModuleExists(); // Ensure seed data exists
    const res = await getModulesAction();
    if (res.success) {
      setModules(res.data);
    }
    setLoading(false);
  };

  const handleOpenModal = (mod: any) => {
    setSelectedModule(mod);
    setActiveRoles(mod.enabled_roles || []);
  };

  const toggleRole = (roleId: string) => {
    if (activeRoles.includes(roleId)) {
      setActiveRoles(activeRoles.filter(r => r !== roleId));
    } else {
      setActiveRoles([...activeRoles, roleId]);
    }
  };

  const saveRoles = async () => {
    if (!selectedModule) return;
    setSaving(true);
    const res = await toggleModuleRoleAction(selectedModule.id, activeRoles);
    if (res.success) {
      await loadModules();
      setSelectedModule(null);
    } else {
      alert("Error saving roles: " + res.error);
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 bg-[#f7f8fa] h-full flex flex-col relative">
      <div className="flex flex-col mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#0f1d33] flex items-center gap-2">
          <Blocks className="w-6 h-6 text-[#c4a55a]" />
          Modules
        </h1>
        <p className="text-[#5a6a82] text-sm mt-1">Configure and manage ERP system micro-service modules.</p>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#5a6a82]">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(mod => (
            <div key={mod.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f3f5f8] flex items-center justify-center shrink-0">
                  {mod.module_key === 'passwords' ? <Key className="w-5 h-5 text-[#1e3a5f]" /> : <Blocks className="w-5 h-5 text-[#1e3a5f]" />}
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1d33]">{mod.module_name}</h3>
                  <p className="text-xs text-[#5a6a82]">Key: {mod.module_key}</p>
                </div>
              </div>
              <p className="text-sm text-[#5a6a82] mb-6 flex-1">{mod.description}</p>
              
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#0f1d33] mb-2 uppercase tracking-wider">Enabled For Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {!mod.enabled_roles || mod.enabled_roles.length === 0 ? (
                     <span className="text-xs text-[#a0abbb] italic">No roles enabled</span>
                  ) : (
                    mod.enabled_roles.map((role: string) => (
                      <span key={role} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {AVAILABLE_ROLES.find(r => r.id === role)?.label || role}
                      </span>
                    ))
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenModal(mod)}
                className="w-full py-2.5 rounded-lg border border-[#e8ecf2] text-[#1e3a5f] font-semibold text-sm hover:bg-[#f3f5f8] transition-colors mt-auto"
              >
                Configure Module Access
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-[#0f1d33]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#e8ecf2]">
              <h3 className="font-bold text-[#0f1d33] text-lg">Enable {selectedModule.module_name}</h3>
              <button onClick={() => setSelectedModule(null)} className="text-[#a0abbb] hover:text-[#0f1d33] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start mb-6 text-amber-800 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Toggle which user roles should have access to the <strong>{selectedModule.module_name}</strong> micro-service module.</p>
              </div>
              
              <div className="space-y-3">
                {AVAILABLE_ROLES.map(role => {
                  const isChecked = activeRoles.includes(role.id);
                  return (
                    <label key={role.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#e8ecf2] hover:bg-[#f3f5f8]'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleRole(role.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-600"
                      />
                      <span className={`text-sm font-medium ${isChecked ? 'text-emerald-800' : 'text-[#0f1d33]'}`}>{role.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-[#e8ecf2] bg-[#f7f8fa] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 text-sm font-semibold text-[#5a6a82] hover:bg-[#e8ecf2] rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={saveRoles}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg shadow hover:bg-[#0f1d33] transition-colors"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
