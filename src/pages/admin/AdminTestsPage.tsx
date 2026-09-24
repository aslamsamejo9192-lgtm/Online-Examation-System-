import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../../services/db';
import type { Test, Subject } from '../../types';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  Search,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

export const AdminTestsPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(20);
  const [passPercentage, setPassPercentage] = useState(60);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    loadData();
    const unsubscribe = DatabaseService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const loadedTests = DatabaseService.getTests(true); // include unpublished
    const loadedSubjects = DatabaseService.getSubjects();
    setTests(loadedTests);
    setSubjects(loadedSubjects);

    if (loadedSubjects.length > 0 && !subjectId) {
      setSubjectId(loadedSubjects[0].id);
    }
  };

  const openCreateModal = () => {
    setEditingTestId(null);
    setTitle('');
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setDurationMinutes(15);
    setTotalMarks(20);
    setPassPercentage(60);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (test: Test) => {
    setEditingTestId(test.id);
    setTitle(test.title);
    setSubjectId(test.subjectId);
    setDurationMinutes(test.durationMinutes);
    setTotalMarks(test.totalMarks);
    setPassPercentage(test.passPercentage || 60);
    setIsPublished(test.isPublished);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    if (editingTestId) {
      DatabaseService.updateTest(editingTestId, {
        title,
        subjectId,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passPercentage: Number(passPercentage),
        isPublished,
      });
    } else {
      DatabaseService.createTest({
        title,
        subjectId,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passPercentage: Number(passPercentage),
        isPublished,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleTogglePublish = (test: Test) => {
    DatabaseService.updateTest(test.id, {
      isPublished: !test.isPublished,
    });
    loadData();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete test "${title}" and all its questions?`)) {
      DatabaseService.deleteTest(id);
      loadData();
    }
  };

  const filteredTests = tests.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Online Tests
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Create, configure, publish, and delete MCQ examinations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search tests by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {filteredTests.length} tests
        </span>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No tests found</p>
            <p className="text-xs mt-1">Click "Create New Test" to add your first examination.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Test Title</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Questions</th>
                  <th className="py-3 px-5">Total Marks</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs">
                      <div>{test.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">ID: {test.id}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                        {test.subjectName}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium">{test.durationMinutes} mins</td>
                    <td className="py-4 px-5">
                      <Link
                        to={`/admin/questions?testId=${test.id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        title="Click to manage questions"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{test.totalQuestions} Questions &rarr;</span>
                      </Link>
                    </td>
                    <td className="py-4 px-5 font-mono font-semibold">{test.totalMarks} Marks</td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleTogglePublish(test)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          test.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {test.isPublished ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{test.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(test)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Test Settings"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(test.id, test.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingTestId ? 'Edit Online Test' : 'Create New Online Test'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              {/* Test Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Test Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Calculus & Differential Equations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select Subject (Dynamic from database) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Subject
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Need a new subject? Manage subjects in the Subjects tab.
                </p>
              </div>

              {/* Grid: Duration & Total Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pass Percentage */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Passing Percentage Threshold (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  required
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="publishToggle" className="font-semibold text-slate-800 cursor-pointer">
                  Publish test immediately (visible to students)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingTestId ? 'Save Changes' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
