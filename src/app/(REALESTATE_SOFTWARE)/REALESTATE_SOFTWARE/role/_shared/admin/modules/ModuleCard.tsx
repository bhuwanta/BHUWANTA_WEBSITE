'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, X, type LucideIcon } from 'lucide-react';
import { toggleModuleRoleAction } from './actions';
import { ROLE_LABELS, SALES_RANK_ORDER } from '../../permissions';

// Module toggles apply to the sales chain only (Director→LIA) — IT/CEO/GC
// always have full access to everything (§2 peer rule), so there's
// nothing to toggle for them.
const TOGGLEABLE_ROLES = SALES_RANK_ORDER.map((id) => ({ id, label: ROLE_LABELS[id] }));

export function ModuleCard({ mod, icon: Icon, onUpdate }: { mod: any; icon: LucideIcon; onUpdate: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleOpenModal = () => {
    const validRoles = (mod.enabled_roles || []).filter((r: string) => TOGGLEABLE_ROLES.some((ar) => ar.id === r));
    setActiveRoles(validRoles);
    setIsModalOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setActiveRoles((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));
  };

  const saveRoles = async () => {
    setSaving(true);
    const res = await toggleModuleRoleAction(mod.id, activeRoles);
    if (res.success) {
      onUpdate();
      setIsModalOpen(false);
    } else {
      alert('Error saving roles: ' + res.error);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#f3f5f8] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#1e3a5f]" />
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
              mod.enabled_roles.map((role: string) => {
                const matchedRole = TOGGLEABLE_ROLES.find((r) => r.id === role);
                if (!matchedRole) return null;
                return (
                  <span key={role} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {matchedRole.label}
                  </span>
                );
              })
            )}
          </div>
        </div>

        <button onClick={handleOpenModal} className="w-full py-2.5 rounded-lg border border-[#e8ecf2] text-[#1e3a5f] font-semibold text-sm hover:bg-[#f3f5f8] transition-colors mt-auto">
          Configure Module Access
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f1d33]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#e8ecf2]">
              <h3 className="font-bold text-[#0f1d33] text-lg">Enable {mod.module_name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0abbb] hover:text-[#0f1d33] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start mb-6 text-amber-800 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Toggle which sales-tier roles should have access to the <strong>{mod.module_name}</strong> module.
                </p>
              </div>

              <div className="space-y-3">
                {TOGGLEABLE_ROLES.map((role) => {
                  const isChecked = activeRoles.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#e8ecf2] hover:bg-[#f3f5f8]'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isChecked ? 'text-emerald-800' : 'text-[#0f1d33]'}`}>{role.label}</span>
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleRole(role.id)} className="sr-only" />
                        <div className={`w-11 h-6 rounded-full transition-colors ${isChecked ? 'bg-emerald-500' : 'bg-[#d1d5db]'}`}>
                          <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-[#e8ecf2] bg-[#f7f8fa] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#5a6a82] hover:bg-[#e8ecf2] rounded-lg transition-colors" disabled={saving}>
                Cancel
              </button>
              <button onClick={saveRoles} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg shadow hover:bg-[#0f1d33] transition-colors">
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
