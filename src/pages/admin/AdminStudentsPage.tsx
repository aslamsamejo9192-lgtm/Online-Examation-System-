import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import type { UserProfile, TestAttempt } from '../../types';
import {
  Users,
  Search,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Calendar,
  X,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    loadStudents();
    const unsubscribe = DatabaseService.subscribe(() => {
      loadStudents();
    });
    return () => unsubscribe();
  }, []);

  const loadStudents = () => {
    const list = DatabaseService.getStudents();
    setStudents(list);
  };

  const handleSelectStudent = (student: UserProfile) => {
    setSelectedStudent(student);
    const attempts = DatabaseService.getAttempts(student.uid);
    setStudentAttempts(attempts);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registered Students Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            View student profiles, activity logs, test attempts, and individual academic performance.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Live Sync</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{students.length} Enrolled</span>
          </div>

          <button
            onClick={loadStudents}
            title="Reload students directory"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No students match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Email Address</th>
                  <th className="py-3 px-5">Registered Date</th>
                  <th className="py-3 px-5">Tests Taken</th>
                  <th className="py-3 px-5">Avg Score</th>
                  <th className="py-3 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => {
                  const studentStats = DatabaseService.getStudentStats(s.uid);
                  return (
                    <tr
                      key={s.uid}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleSelectStudent(s)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[10px] text-slate-400">UID: {s.uid.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600">{s.email}</td>
                      <td className="py-4 px-5 text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-800">
                        {studentStats.totalAttempted} Tests
                      </td>
                      <td className="py-4 px-5 font-bold font-mono">
                        <span className={studentStats.avgPercentage >= 60 ? 'text-emerald-600' : 'text-slate-600'}>
                          {studentStats.avgPercentage}%
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStudent(s);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          View Results &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details & Attempts Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Badges */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Attempts</span>
                <span className="text-lg font-extrabold text-slate-900">{studentAttempts.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Passed</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  {studentAttempts.filter(a => a.status === 'Passed').length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Date</span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  {new Date(selectedStudent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Student's Test Attempts List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Examination Attempts History
              </h4>

              {studentAttempts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No tests attempted by this student yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{att.testTitle}</span>
                        <span className="text-[11px] text-slate-500">
                          {att.subjectName} • {new Date(att.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="font-bold text-slate-800 block">
                            {att.obtainedMarks} / {att.totalMarks}
                          </span>
                          <span className={`text-[10px] font-extrabold ${att.percentage >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {att.percentage}% ({att.status})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
