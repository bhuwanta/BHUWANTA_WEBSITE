'use client';

import React, { useState, useEffect } from 'react';
import { Blocks, Users, Key } from 'lucide-react';
import { getModulesAction, ensurePasswordsModuleExists, ensureUserManagementModuleExists } from './actions';
import { ModuleCard } from './ModuleCard';

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    await ensurePasswordsModuleExists();
    await ensureUserManagementModuleExists();
    const res = await getModulesAction();
    if (res.success) {
      setModules(res.data);
    }
    setLoading(false);
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
          {modules.find((m) => m.module_key === 'passwords') && (
            <ModuleCard mod={modules.find((m) => m.module_key === 'passwords')} icon={Key} onUpdate={loadModules} />
          )}
          {modules.find((m) => m.module_key === 'user_management') && (
            <ModuleCard mod={modules.find((m) => m.module_key === 'user_management')} icon={Users} onUpdate={loadModules} />
          )}
          {modules
            .filter((m) => m.module_key !== 'passwords' && m.module_key !== 'user_management')
            .map((mod) => (
              <div key={mod.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <Blocks className="w-8 h-8 text-[#a0abbb] mb-3" />
                <h3 className="font-bold text-[#0f1d33] mb-1">{mod.module_name}</h3>
                <p className="text-sm text-[#5a6a82]">Module component not implemented yet.</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
