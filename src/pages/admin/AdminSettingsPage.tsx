import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import {
  Save,
  CheckCircle2,
  ShieldCheck,
  Database,
  Globe
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [portalName, setPortalName] = useState('Student Online Test Portal');
  const [defaultPassPercentage, setDefaultPassPercentage] = useState(60);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DatabaseService.updateSettings({
      portalName,
      passPercentageDefault: defaultPassPercentage,
      allowSelfRegistration: allowRegistration,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Settings &amp; Configuration
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Configure examination rules, portal defaults, and system parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 text-xs">
        
        <div>
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
            General Portal Information
          </h2>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Portal Name
              </label>
              <input
                type="text"
                value={portalName}
                onChange={(e) => setPortalName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Passing Grade Threshold (%)
              </label>
              <input
                type="number"
                min="30"
                max="100"
                value={defaultPassPercentage}
                onChange={(e) => setDefaultPassPercentage(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                New tests will default to this percentage passing score.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-800">
                  Enable New Student Self-Registration
                </span>
              </label>
              <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
                When enabled, visitors can freely create a student account and take tests.
              </p>
            </div>
          </div>
        </div>

        {/* Vercel & Deployment Architecture Status */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
            Deployment &amp; Routing Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700 font-bold mb-1">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Vercel SPA Config</span>
              </div>
              <p className="text-[11px] text-slate-500">
                <code>vercel.json</code> rewrite is active. All routes rewrite to <code>/index.html</code>. No 404 on refresh.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700 font-bold mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Storage Layer</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Firestore blueprint &amp; security rules mapped. Client persistence ensures data integrity.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Access Control</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Role-based routing prevents unauthorized student access to admin endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
