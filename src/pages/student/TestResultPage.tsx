import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DatabaseService } from '../../services/db';
import type { TestAttempt, Test, Question } from '../../types';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Check,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<(Test & { questions: Question[] }) | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadedAttempt = DatabaseService.getAttemptById(id);
    if (!loadedAttempt) {
      alert('Result record not found.');
      navigate('/tests');
      return;
    }

    setAttempt(loadedAttempt);

    const loadedTest = DatabaseService.getTestById(loadedAttempt.testId);
    if (loadedTest) {
      setTest(loadedTest);
    }

    // Trigger celebration confetti if passed!
    if (loadedAttempt.status === 'Passed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fail
      }
    }
  }, [id, navigate]);

  if (!attempt) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Calculating your examination results...</p>
      </div>
    );
  }

  const isPassed = attempt.status === 'Passed';
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Result Hero Header */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-700/15'
            : 'bg-gradient-to-r from-rose-600 via-slate-800 to-rose-700 shadow-rose-700/15'
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <span>{attempt.subjectName}</span>
              <span>•</span>
              <span>{attempt.testTitle}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isPassed ? 'Congratulations! You Passed' : 'Test Completed'}
            </h1>
            <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-lg">
              {isPassed
                ? 'Great performance! You met the minimum passing requirements for this examination.'
                : 'Keep practicing! Review your question breakdown below to identify areas for improvement.'}
            </p>
          </div>

          {/* Large percentage badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[130px] self-start sm:self-auto">
            <span className="text-xs uppercase tracking-wider block font-bold text-white/80">Percentage</span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight block">
              {attempt.percentage}%
            </span>
            <span className="text-[11px] font-bold mt-1 px-2.5 py-0.5 rounded-full bg-white text-slate-900 inline-block">
              {attempt.status}
            </span>
          </div>
        </div>
      </div>

      {/* Required Scorecard Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Obtained Marks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Obtained Marks
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{attempt.obtainedMarks}</span>
            <span className="text-xs text-slate-400">/ {attempt.totalMarks}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Total score</span>
        </div>

        {/* Correct Answers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Correct Answers
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{attempt.correctAnswers}</span>
            <span className="text-xs text-slate-400">/ {attempt.totalQuestions}</span>
          </div>
          <span className="text-[11px] text-emerald-600 block mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 inline" />
            <span>Verified answers</span>
          </span>
        </div>

        {/* Wrong Answers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
            Wrong Answers
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{attempt.wrongAnswers}</span>
            <span className="text-xs text-slate-400">questions</span>
          </div>
          <span className="text-[11px] text-rose-600 block mt-1 flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 inline" />
            <span>Incorrect choices</span>
          </span>
        </div>

        {/* Time Spent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Time Spent
          </span>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {Math.max(1, Math.round(attempt.timeSpentSeconds / 60))}
            </span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 inline text-slate-400" />
            <span>Duration used</span>
          </span>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Attempt ID: <code className="font-mono text-slate-800">{attempt.id}</code></span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tests"
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>All Tests</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Question-by-Question Detailed Review Sheet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Question-by-Question Detailed Review</h2>
            <p className="text-xs text-slate-500">Inspect each question, your selected option, and correct explanations.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {attempt.totalQuestions} Questions
          </span>
        </div>

        {test && test.questions ? (
          <div className="space-y-4">
            {test.questions.map((q, index) => {
              const selectedIndex = attempt.answers[q.id];
              const isAnswered = selectedIndex !== undefined;
              const isCorrect = isAnswered && selectedIndex === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl p-6 border transition-all ${
                    !isAnswered
                      ? 'border-slate-200'
                      : isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  {/* Question header badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">
                      Question {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        !isAnswered
                          ? 'bg-slate-100 text-slate-600'
                          : isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {!isAnswered ? (
                        <span>Skipped (0 Marks)</span>
                      ) : isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Correct (+{q.marks} Marks)</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Incorrect (0 Marks)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Question text */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-3 leading-relaxed">
                    {q.questionText}
                  </h3>

                  {/* Options List */}
                  <div className="mt-4 space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isUserChoice = selectedIndex === optIdx;
                      const isCorrectChoice = optIdx === q.correctOptionIndex;

                      let optionClasses = 'border-slate-200 bg-white text-slate-700';
                      if (isCorrectChoice) {
                        optionClasses = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold';
                      } else if (isUserChoice && !isCorrect) {
                        optionClasses = 'border-rose-400 bg-rose-50/80 text-rose-950 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${optionClasses}`}
                        >
                          <div className="flex items-center space-x-3 pr-2">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrectChoice
                                  ? 'bg-emerald-600 text-white'
                                  : isUserChoice
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {optionLetters[optIdx]}
                            </span>
                            <span>{option}</span>
                          </div>

                          <div className="shrink-0 text-xs font-bold flex items-center space-x-1">
                            {isCorrectChoice && (
                              <span className="text-emerald-700 flex items-center space-x-1">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span className="hidden sm:inline">Correct Answer</span>
                              </span>
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <span className="text-rose-700 flex items-center space-x-1">
                                <X className="w-4 h-4 stroke-[3]" />
                                <span className="hidden sm:inline">Your Selection</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  {q.explanation && (
                    <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
            Full test question references could not be re-rendered for this attempt.
          </div>
        )}
      </div>

    </div>
  );
};
