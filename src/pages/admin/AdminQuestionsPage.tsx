import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DatabaseService } from '../../services/db';
import type { Test, Question } from '../../types';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export const AdminQuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [marks, setMarks] = useState(2);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const loadedTests = DatabaseService.getTests(true);
    setTests(loadedTests);

    const queryTestId = searchParams.get('testId');
    if (queryTestId && loadedTests.some(t => t.id === queryTestId)) {
      setSelectedTestId(queryTestId);
    } else if (loadedTests.length > 0) {
      setSelectedTestId(loadedTests[0].id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedTestId) {
      const qList = DatabaseService.getQuestionsByTestId(selectedTestId);
      setQuestions(qList);
    } else {
      setQuestions([]);
    }
  }, [selectedTestId]);

  const handleTestChange = (testId: string) => {
    setSelectedTestId(testId);
    setSearchParams({ testId });
  };

  const openAddModal = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOptionIndex(0);
    setMarks(2);
    setExplanation('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setOptionA(q.options[0] || '');
    setOptionB(q.options[1] || '');
    setOptionC(q.options[2] || '');
    setOptionD(q.options[3] || '');
    setCorrectOptionIndex(q.correctOptionIndex);
    setMarks(q.marks);
    setExplanation(q.explanation || '');
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert('Please fill in question text and all 4 options.');
      return;
    }

    const options: [string, string, string, string] = [
      optionA.trim(),
      optionB.trim(),
      optionC.trim(),
      optionD.trim(),
    ];

    if (editingQuestionId) {
      DatabaseService.updateQuestion(editingQuestionId, {
        questionText: questionText.trim(),
        options,
        correctOptionIndex: Number(correctOptionIndex),
        marks: Number(marks),
        explanation: explanation.trim(),
      });
    } else {
      DatabaseService.createQuestion({
        testId: selectedTestId,
        questionText: questionText.trim(),
        options,
        correctOptionIndex: Number(correctOptionIndex),
        marks: Number(marks),
        explanation: explanation.trim(),
      });
    }

    setIsModalOpen(false);
    // Reload questions
    const qList = DatabaseService.getQuestionsByTestId(selectedTestId);
    setQuestions(qList);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      DatabaseService.deleteQuestion(id);
      const qList = DatabaseService.getQuestionsByTestId(selectedTestId);
      setQuestions(qList);
    }
  };

  const selectedTest = tests.find(t => t.id === selectedTestId);
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Questions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Build and edit multiple choice questions, 4 options, and answer keys.
          </p>
        </div>

        {selectedTestId && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        )}
      </div>

      {/* Test Selector Dropdown or Empty Tests Warning */}
      {tests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Tests Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You need to create an examination test before you can add questions and options.
          </p>
          <Link
            to="/admin/tests"
            className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <span>Create New Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Test to Manage:
            </label>
            <select
              value={selectedTestId}
              onChange={(e) => handleTestChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.subjectName})
                </option>
              ))}
            </select>
          </div>

          {selectedTest && (
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-800 block text-sm">{questions.length}</span>
                <span>Questions</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-sm">{selectedTest.totalMarks}</span>
                <span>Total Marks</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-sm">{selectedTest.durationMinutes}m</span>
                <span>Time Limit</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No questions in this test yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click "Add Question" to create your first multiple-choice question.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Question Item</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">{q.marks} Marks</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="font-bold text-sm text-slate-900 mt-3 leading-relaxed">
                {q.questionText}
              </p>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctOptionIndex;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {optionLetters[optIdx]}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] font-extrabold text-emerald-700 flex items-center space-x-1 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Correct</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation note */}
              {q.explanation && (
                <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center space-x-1.5">
                  <span className="font-bold text-slate-700">Explanation:</span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestionId ? 'Edit Question' : 'Add New Multiple Choice Question'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 mt-4 text-xs">
              {/* Question Text */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the question clearly..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 4 Options and Radio selector for correct one */}
              <div className="space-y-2.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Answer Options &amp; Correct Key (Select which option is correct)
                </label>

                {/* Option A */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctKey"
                    id="radioOpt0"
                    checked={correctOptionIndex === 0}
                    onChange={() => setCorrectOptionIndex(0)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="radioOpt0" className="font-bold text-slate-700 w-6">A</label>
                  <input
                    type="text"
                    required
                    placeholder="Option A answer"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Option B */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctKey"
                    id="radioOpt1"
                    checked={correctOptionIndex === 1}
                    onChange={() => setCorrectOptionIndex(1)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="radioOpt1" className="font-bold text-slate-700 w-6">B</label>
                  <input
                    type="text"
                    required
                    placeholder="Option B answer"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Option C */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctKey"
                    id="radioOpt2"
                    checked={correctOptionIndex === 2}
                    onChange={() => setCorrectOptionIndex(2)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="radioOpt2" className="font-bold text-slate-700 w-6">C</label>
                  <input
                    type="text"
                    required
                    placeholder="Option C answer"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Option D */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctKey"
                    id="radioOpt3"
                    checked={correctOptionIndex === 3}
                    onChange={() => setCorrectOptionIndex(3)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="radioOpt3" className="font-bold text-slate-700 w-6">D</label>
                  <input
                    type="text"
                    required
                    placeholder="Option D answer"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Marks & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Rationale for the correct answer..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
