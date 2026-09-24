import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import type { Test, Subject, TestAttempt } from '../../types';
import { 
  FileText, 
  Clock, 
  HelpCircle, 
  Award, 
  Play, 
  Search, 
  CheckCircle2, 
  XCircle, 
  History, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const OnlineTestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  useEffect(() => {
    const refreshData = () => {
      const loadedTests = DatabaseService.getTests();
      const loadedSubjects = DatabaseService.getSubjects();
      setTests(loadedTests);
      setSubjects(loadedSubjects);

      if (currentUser) {
        const studentAttempts = DatabaseService.getAttempts(currentUser.uid);
        setAttempts(studentAttempts);
      }
    };

    refreshData();
    const unsubscribe = DatabaseService.subscribe(refreshData);
    return () => unsubscribe();
  }, [currentUser]);

  // Filter tests by subject and search query
  const filteredTests = tests.filter((test) => {
    const matchesSubject = selectedSubjectId === 'all' || test.subjectId === selectedSubjectId;
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Official Examination Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ONLINE MCQ TESTS
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Timed assessments with instant evaluation, scoring analytics, and complete answer keys.
          </p>
        </div>

        {/* Tab Switcher: Available Tests vs Previous Attempts */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'available'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available Tests ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Attempt History ({attempts.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <>
          {/* Filter Bar: Dynamic Subjects + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Subject Filters */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSubjectId === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                All Subjects
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedSubjectId === sub.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search tests by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Test Cards Grid */}
          {tests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Online Tests Currently Available</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No examinations have been scheduled yet. New tests will be created and published by administrators soon.
              </p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No tests match your filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try selecting another subject or clearing your search term.</p>
              <button
                onClick={() => { setSelectedSubjectId('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {test.subjectName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{test.durationMinutes} Minutes</span>
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {test.title}
                    </h2>

                    {/* Metadata pills */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>{test.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span>{test.totalMarks} Total Marks</span>
                      </div>
                    </div>
                  </div>

                  {/* Start button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to={`/test/${test.id}`}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Test Now</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Test History / Previous Attempts */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Your Test Submission History</h2>
            <p className="text-xs text-slate-500">Review your past scores, correct answers, and performance percentage.</p>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No attempts on record</h3>
              <p className="text-xs text-slate-500 mt-1">You haven't attempted any tests yet. Click "Available Tests" to begin.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                Take a Test
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attempts.map((att) => (
                <div key={att.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{att.testTitle}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {att.subjectName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submitted on {new Date(att.submittedAt).toLocaleString()} • Time taken: {Math.round(att.timeSpentSeconds / 60)} mins
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Marks</span>
                        <span className="font-bold text-slate-800">{att.obtainedMarks} / {att.totalMarks}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
                        <span className={`font-extrabold ${att.percentage >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {att.percentage}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                        <span className={`inline-flex items-center space-x-1 font-semibold ${att.status === 'Passed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {att.status === 'Passed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          <span>{att.status}</span>
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/result/${att.id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <span>View Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
