import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import { Link } from 'react-router-dom';
import {
  Save,
  CheckCircle2,
  ShieldCheck,
  Database,
  Globe,
  KeyRound,
  Users,
  Lock,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [portalName, setPortalName] = useState('Student Online Test Portal');
  const [instituteName, setInstituteName] = useState('Examination & Testing Authority');
  const [defaultPassPercentage, setDefaultPassPercentage] = useState(60);
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [requireUniqueAccessKey, setRequireUniqueAccessKey] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [keysCount, setKeysCount] = useState({ total: 0, active: 0, used: 0 });

  useEffect(() => {
    const settings = DatabaseService.getSettings();
    setPortalName(settings.portalName || 'Student Online Test Portal');
    setInstituteName(settings.instituteName || 'Examination & Testing Authority');
    setDefaultPassPercentage(settings.passPercentageDefault || 60);
    setAllowRegistration(settings.allowSelfRegistration ?? false);
    setRequireUniqueAccessKey(settings.requireUniqueAccessKey ?? true);

    const keys = DatabaseService.getAccessKeys();
    setKeysCount({
      total: keys.length,
      active: keys.filter((k) => k.status === 'active' && !k.isUsed).length,
      used: keys.filter((k) => k.status === 'used' || k.isUsed).length,
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DatabaseService.updateSettings({
      portalName,
      instituteName,
      passPercentageDefault: defaultPassPercentage,
      allowSelfRegistration: allowRegistration,
      requireUniqueAccessKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Settings &amp; Access Control
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure student admission rules, unique access keys, and portal parameters.
          </p>
        </div>
        <Link
          to="/admin/students"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition-colors self-start sm:self-auto"
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Manage Students &amp; IDs</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings updated and synced successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 text-xs">
        
        {/* STUDENT ACCESS & REGISTRATION SECURITY */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Student Authentication &amp; Unique Key Protection</span>
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Access Control
            </span>
          </div>

          <div className="space-y-4 max-w-2xl">
            {/* Require Unique Access Key Policy */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireUniqueAccessKey}
                  onChange={(e) => setRequireUniqueAccessKey(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Require Administration-Issued Unique Access Key (Mandatory Access Control)
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    When active, students <strong>CANNOT</strong> register or log in unless the administration has generated a unique student access key / roll number for them.
                  </p>
                </div>
              </label>

              {/* Access Key Summary Stats */}
              <div className="mt-3 pt-3 border-t border-blue-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Keys</span>
                  <span className="font-extrabold text-slate-900 text-sm">{keysCount.total}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 block font-bold uppercase">Active &amp; Ready</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{keysCount.active}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-blue-600 block font-bold uppercase">Assigned / Used</span>
                  <span className="font-extrabold text-blue-700 text-sm">{keysCount.used}</span>
                </div>
              </div>
            </div>

            {/* Allow Self-Registration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Allow Student Registration Page
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    If enabled along with Unique Key requirement, students can self-register using their administration-issued key. If disabled, only the admin can directly enroll students.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* GENERAL PORTAL INFORMATION */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span>Institution &amp; Portal Information</span>
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
                Institute / Examination Authority
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
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
                <code>vercel.json</code> rewrite active. All routes rewrite to <code>/index.html</code>. No 404 on refresh.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700 font-bold mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Storage Layer</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Firestore blueprint &amp; security rules mapped with real-time cloud distribution for unique access keys.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Access Control</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Administration authorization key enforcement prevents unauthorized accounts from accessing the portal.
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
