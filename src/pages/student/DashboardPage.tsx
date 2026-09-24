import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import type { Test, PdfNote, TestAttempt } from '../../types';
import { PdfModalViewer } from '../../components/PdfModalViewer';
import {
  FileText,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Download,
  Eye,
  TrendingUp,
  Percent,
  Play,
  Calendar,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalAttempted: 0,
    completed: 0,
    avgPercentage: 0,
    recentAttempts: [] as TestAttempt[],
  });
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [recentNotes, setRecentNotes] = useState<PdfNote[]>([]);
  const [viewingPdf, setViewingPdf] = useState<PdfNote | null>(null);

  useEffect(() => {
    const refreshData = () => {
      if (currentUser) {
        const studentStats = DatabaseService.getStudentStats(currentUser.uid);
        setStats(studentStats);
      }
      const tests = DatabaseService.getTests().slice(0, 4);
      setAvailableTests(tests);

      const notes = DatabaseService.getPdfNotes().slice(0, 4);
      setRecentNotes(notes);
    };

    refreshData();
    const unsubscribe = DatabaseService.subscribe(refreshData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleDownload = (note: PdfNote) => {
    DatabaseService.incrementDownload(note.id);
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Prominent Top Main Heading */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Academic Examination Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            STUDENT PORTAL DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time test progress, assessment scores, and academic study resources
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Session {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Welcome
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {currentUser?.name || 'Student'}!
          </h2>
          <p className="mt-2 text-blue-100 text-xs sm:text-sm leading-relaxed">
            Welcome to your official online testing terminal. As you complete online examinations, your attempts and scores will be updated here automatically.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/tests"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Online Tests</span>
            </Link>
            <Link
              to="/pdf-notes"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm border border-blue-400/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>PDF Notes</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Real-time KPI Cards (Initial 0 until real student attempts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Total Tests Attempted */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tests Attempted</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.totalAttempted}</span>
            <span className="text-xs text-slate-500 font-medium">attempted</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>{stats.totalAttempted === 0 ? 'No test attempts yet' : 'Real-time student history'}</span>
          </p>
        </div>

        {/* Tests Completed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tests Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stats.completed}</span>
            <span className="text-xs text-slate-500 font-medium">completed</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{stats.completed === 0 ? 'Awaiting test completion' : 'Evaluated and scored'}</span>
          </p>
        </div>

        {/* Average Percentage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Percentage</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {stats.avgPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">overall score</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {stats.totalAttempted === 0
                ? 'Will calculate upon test submission'
                : stats.avgPercentage >= 60
                ? 'Passing Performance'
                : 'Needs Improvement'}
            </span>
          </p>
        </div>

      </div>

      {/* Main Content Grid: Available Tests & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Available Tests (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Online Tests</h3>
              <p className="text-xs text-slate-500">Active examinations available for testing</p>
            </div>
            {availableTests.length > 0 && (
              <Link
                to="/tests"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View All Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {availableTests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Tests Currently Available</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No examinations have been scheduled yet. Once your instructors publish online tests, they will appear here ready to take.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {test.subjectName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.durationMinutes} mins</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-800 line-clamp-2 mt-1">
                      {test.title}
                    </h4>

                    <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.totalQuestions} Questions</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.totalMarks} Marks</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      to={`/test/${test.id}`}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Test</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Results (1 Col on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Test Results</h3>
              <p className="text-xs text-slate-500">Your examination submission records</p>
            </div>
            {stats.recentAttempts.length > 0 && (
              <Link to="/tests" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                History
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            {stats.recentAttempts.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No test attempts yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  When you take and submit an online test, your obtained marks and result breakdown will appear here.
                </p>
                <Link
                  to="/tests"
                  className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <span>Browse Tests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              stats.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-3">
                    <p className="text-xs font-bold text-slate-800 truncate">{attempt.testTitle}</p>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                      <span>{attempt.subjectName}</span>
                      <span>•</span>
                      <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${attempt.percentage >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {attempt.percentage}%
                      </span>
                      <span className="text-[10px] block text-slate-400">
                        {attempt.obtainedMarks}/{attempt.totalMarks}
                      </span>
                    </div>
                    <Link
                      to={`/result/${attempt.id}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                      title="View complete result"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* PDF Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recently Uploaded PDF Notes</h3>
            <p className="text-xs text-slate-500">Curated study materials, formula sheets, and reference notes</p>
          </div>
          {recentNotes.length > 0 && (
            <Link
              to="/pdf-notes"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All PDF Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No PDF Notes Uploaded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              PDF notes uploaded by administrators will appear here for you to view and download.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {note.subjectName}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2 mt-2">
                    {note.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {note.fileSize}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setViewingPdf(note)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Open PDF Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(note)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfModalViewer note={viewingPdf} onClose={() => setViewingPdf(null)} />
      )}
    </div>
  );
};
