import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../../services/db';
import type { TestAttempt } from '../../types';
import {
  Users,
  FileText,
  BookOpen,
  Award,
  PlusCircle,
  FolderTree,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTests: 0,
    totalPdfNotes: 0,
    totalAttempts: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    loadData();
    const unsubscribe = DatabaseService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const adminStats = DatabaseService.getAdminStats();
    setStats(adminStats);

    const attempts = DatabaseService.getAttempts().slice(0, 6);
    setRecentAttempts(attempts);
  };

  return (
    <div className="space-y-8">
      
      {/* Prominent Top Main Heading */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ADMINISTRATOR DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Academic examination management, live student evaluations, and system metrics
          </p>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Administrator Command Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration Overview
          </h2>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Manage academic subjects, create timed MCQ tests, upload downloadable PDF study materials, and monitor real student results.
          </p>
        </div>
      </div>

      {/* Required 4 Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.totalStudents}</span>
            <span className="text-xs text-slate-400">registered</span>
          </div>
          <Link
            to="/admin/students"
            className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Tests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tests</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.totalTests}</span>
            <span className="text-xs text-slate-400">active &amp; draft</span>
          </div>
          <Link
            to="/admin/tests"
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Manage tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total PDF Notes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total PDF Notes</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.totalPdfNotes}</span>
            <span className="text-xs text-slate-400">files</span>
          </div>
          <Link
            to="/admin/pdf-notes"
            className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <span>Manage notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Test Attempts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Attempts</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.totalAttempts}</span>
            <span className="text-xs text-slate-400">submissions</span>
          </div>
          <Link
            to="/admin/results"
            className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Review results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/tests"
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Create New Test</span>
            <span className="text-[10px] text-slate-500 mt-0.5">MCQ examination</span>
          </Link>

          <Link
            to="/admin/questions"
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Questions</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Options &amp; answer keys</span>
          </Link>

          <Link
            to="/admin/subjects"
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Manage Subjects</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Dynamic categories</span>
          </Link>

          <Link
            to="/admin/pdf-notes"
            className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Upload PDF Note</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Study materials</span>
          </Link>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Latest Student Submissions</h2>
            <p className="text-xs text-slate-500">Live feed of student test evaluations across subjects</p>
          </div>
          <Link
            to="/admin/results"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>All Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No student tests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Test Title</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Score</th>
                  <th className="py-3 px-5">Percentage</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-bold text-slate-900">
                      <div>{att.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{att.studentEmail}</div>
                    </td>
                    <td className="py-3 px-5 max-w-[200px] truncate">{att.testTitle}</td>
                    <td className="py-3 px-5">{att.subjectName}</td>
                    <td className="py-3 px-5 font-mono font-bold">
                      {att.obtainedMarks} / {att.totalMarks}
                    </td>
                    <td className="py-3 px-5 font-bold font-mono">
                      <span className={att.percentage >= 60 ? 'text-emerald-600' : 'text-rose-600'}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-400">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
