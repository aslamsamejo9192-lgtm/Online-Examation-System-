import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import type { TestAttempt, Subject, Test } from '../../types';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Download,
  Calendar
} from 'lucide-react';

export const AdminResultsPage: React.FC = () => {
  const [results, setResults] = useState<TestAttempt[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTestId, setSelectedTestId] = useState('all');

  useEffect(() => {
    loadData();
    const unsubscribe = DatabaseService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const list = DatabaseService.getAttempts();
    setResults(list);
    setSubjects(DatabaseService.getSubjects());
    setTests(DatabaseService.getTests(true));
  };

  const filteredResults = results.filter((r) => {
    const matchesSubject = selectedSubjectId === 'all' || r.subjectId === selectedSubjectId;
    const matchesTest = selectedTestId === 'all' || r.testId === selectedTestId;
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesTest && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredResults.length === 0) return;
    const headers = ['Attempt ID', 'Student Name', 'Student Email', 'Test Title', 'Subject', 'Obtained Marks', 'Total Marks', 'Percentage', 'Status', 'Date'];
    const rows = filteredResults.map(r => [
      r.id,
      `"${r.studentName}"`,
      r.studentEmail,
      `"${r.testTitle}"`,
      `"${r.subjectName}"`,
      r.obtainedMarks,
      r.totalMarks,
      `${r.percentage}%`,
      r.status,
      new Date(r.submittedAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Test_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Examination Results &amp; Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Global gradebook with student test scores, passing thresholds, and CSV export.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredResults.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, email, or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-600 whitespace-nowrap">Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Test Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-600 whitespace-nowrap">Test:</span>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="all">All Tests</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No examination results found</p>
            <p className="text-xs mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Test Title</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Correct / Wrong</th>
                  <th className="py-3 px-5">Score</th>
                  <th className="py-3 px-5">Percentage</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 block">{r.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{r.studentEmail}</span>
                    </td>
                    <td className="py-4 px-5 font-medium max-w-xs">{r.testTitle}</td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                        {r.subjectName}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold">
                      <span className="text-emerald-600">{r.correctAnswers}✓</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-rose-600">{r.wrongAnswers}✗</span>
                    </td>
                    <td className="py-4 px-5 font-bold font-mono">
                      {r.obtainedMarks} / {r.totalMarks}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold">
                      <span className={r.percentage >= 60 ? 'text-emerald-600' : 'text-rose-600'}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status === 'Passed' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      {new Date(r.submittedAt).toLocaleString()}
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
