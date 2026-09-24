import type { Subject, Test, Question, TestAttempt, PdfNote, User, PortalSettings } from '../types';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const STORAGE_KEYS = {
  USERS: 'sotp_users_v3',
  SUBJECTS: 'sotp_subjects_v3',
  TESTS: 'sotp_tests_v3',
  QUESTIONS: 'sotp_questions_v3',
  ATTEMPTS: 'sotp_attempts_v3',
  PDF_NOTES: 'sotp_pdf_notes_v3',
  SETTINGS: 'sotp_settings_v3',
  INITIALIZED: 'sotp_initialized_v3',
};

// Initial Subject Registry (Categories ready for admin to attach tests and notes to)
const initialSubjects: Subject[] = [
  {
    id: 'sub_cs',
    name: 'Computer Science',
    code: 'CS-101',
    description: 'Data structures, algorithms, and computer programming',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_math',
    name: 'Mathematics',
    code: 'MATH-201',
    description: 'Calculus, algebra, and applied mathematical analysis',
    color: 'indigo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_physics',
    name: 'Physics',
    code: 'PHY-102',
    description: 'Mechanics, electromagnetism, and modern physics',
    color: 'emerald',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_chemistry',
    name: 'Chemistry',
    code: 'CHEM-103',
    description: 'Organic chemistry, inorganic reactions, and stoichiometry',
    color: 'amber',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_english',
    name: 'English Language',
    code: 'ENG-101',
    description: 'Grammar, vocabulary, comprehension, and composition',
    color: 'rose',
    createdAt: new Date().toISOString(),
  },
];

const initialTests: Test[] = [];
const initialQuestions: Question[] = [];
const initialAttempts: TestAttempt[] = [];
const initialPdfNotes: PdfNote[] = [];

// Default System Administrator account
const initialUsers: User[] = [
  {
    uid: 'admin_sys_01',
    name: 'Administrator',
    email: 'admin@portal.edu',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

const initialSettings: PortalSettings = {
  portalName: 'Student Online Test Portal',
  instituteName: 'Examination & Testing Authority',
  passPercentageDefault: 60,
  contactEmail: 'admin@portal.edu',
  allowSelfRegistration: true,
};

// Helper storage functions
function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// In-memory pub/sub listener system for instant UI updates when cloud data syncs
type Listener = () => void;
const subscribers = new Set<Listener>();

function notifySubscribers() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Database subscriber error:', e);
    }
  });
}

// Global initialization flag
let isCloudSyncInitialized = false;

function setupRealtimeCloudSync() {
  if (typeof window === 'undefined' || isCloudSyncInitialized) return;
  isCloudSyncInitialized = true;

  // 1. Sync USERS collection (Enables cross-device registration sync)
  try {
    const usersCol = collection(db, 'users');
    onSnapshot(
      usersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudUsers: User[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as User;
            cloudUsers.push(data);
          });
          // Merge with default admin if missing
          if (!cloudUsers.some((u) => u.email === 'admin@portal.edu')) {
            cloudUsers.push(initialUsers[0]);
          }
          setStorage(STORAGE_KEYS.USERS, cloudUsers);
          notifySubscribers();
        } else {
          // Seed cloud with default admin
          setDoc(doc(db, 'users', initialUsers[0].uid), initialUsers[0]).catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for users:', e);
  }

  // 2. Sync SUBJECTS collection
  try {
    const subjectsCol = collection(db, 'subjects');
    onSnapshot(
      subjectsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudSubjects: Subject[] = [];
          snapshot.forEach((d) => {
            cloudSubjects.push(d.data() as Subject);
          });
          setStorage(STORAGE_KEYS.SUBJECTS, cloudSubjects);
          notifySubscribers();
        } else {
          // Seed default subjects
          initialSubjects.forEach((s) => {
            setDoc(doc(db, 'subjects', s.id), s).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'subjects');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for subjects:', e);
  }

  // 3. Sync TESTS collection
  try {
    const testsCol = collection(db, 'tests');
    onSnapshot(
      testsCol,
      (snapshot) => {
        const cloudTests: Test[] = [];
        snapshot.forEach((d) => {
          cloudTests.push(d.data() as Test);
        });
        setStorage(STORAGE_KEYS.TESTS, cloudTests);
        notifySubscribers();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tests');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for tests:', e);
  }

  // 4. Sync QUESTIONS collection
  try {
    const questionsCol = collection(db, 'questions');
    onSnapshot(
      questionsCol,
      (snapshot) => {
        const cloudQuestions: Question[] = [];
        snapshot.forEach((d) => {
          cloudQuestions.push(d.data() as Question);
        });
        setStorage(STORAGE_KEYS.QUESTIONS, cloudQuestions);
        notifySubscribers();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'questions');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for questions:', e);
  }

  // 5. Sync TEST ATTEMPTS collection
  try {
    const attemptsCol = collection(db, 'testAttempts');
    onSnapshot(
      attemptsCol,
      (snapshot) => {
        const cloudAttempts: TestAttempt[] = [];
        snapshot.forEach((d) => {
          cloudAttempts.push(d.data() as TestAttempt);
        });
        // Sort newest first
        cloudAttempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setStorage(STORAGE_KEYS.ATTEMPTS, cloudAttempts);
        notifySubscribers();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'testAttempts');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for testAttempts:', e);
  }

  // 6. Sync PDF NOTES collection
  try {
    const notesCol = collection(db, 'pdfNotes');
    onSnapshot(
      notesCol,
      (snapshot) => {
        const cloudNotes: PdfNote[] = [];
        snapshot.forEach((d) => {
          cloudNotes.push(d.data() as PdfNote);
        });
        setStorage(STORAGE_KEYS.PDF_NOTES, cloudNotes);
        notifySubscribers();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pdfNotes');
      }
    );
  } catch (e) {
    console.warn('Real-time sync setup warning for pdfNotes:', e);
  }
}

// Initializer: guarantees clean local starting state and starts cloud listeners
function initDatabase() {
  if (typeof window === 'undefined') return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubjects));
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(initialTests));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(initialAttempts));
    localStorage.setItem(STORAGE_KEYS.PDF_NOTES, JSON.stringify(initialPdfNotes));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  setupRealtimeCloudSync();
}

initDatabase();

export const DatabaseService = {
  // Real-time event subscriber
  subscribe(listener: Listener): () => void {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },

  // ---- USERS & STUDENTS ----
  getUsers(): User[] {
    return getStorage<User[]>(STORAGE_KEYS.USERS, initialUsers);
  },

  getStudents(): User[] {
    return this.getUsers().filter((u) => u.role === 'student');
  },

  getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email.trim().toLowerCase() === normalized);
  },

  getUserById(uid: string): User | undefined {
    return this.getUsers().find((u) => u.uid === uid);
  },

  createUser(user: Omit<User, 'createdAt'> & { createdAt?: string }): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    };

    // Update local cache immediately
    const existingIndex = users.findIndex((u) => u.uid === newUser.uid || u.email === newUser.email);
    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    setStorage(STORAGE_KEYS.USERS, users);
    notifySubscribers();

    // Persist to Firebase Firestore across all devices and clients
    try {
      setDoc(doc(db, 'users', newUser.uid), newUser).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${newUser.uid}`);
      });
    } catch (e) {
      console.error('Error persisting user to Firestore:', e);
    }

    return newUser;
  },

  // ---- SUBJECTS ----
  getSubjects(): Subject[] {
    return getStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, initialSubjects);
  },

  getSubjectById(id: string): Subject | undefined {
    return this.getSubjects().find((s) => s.id === id);
  },

  createSubject(subject: Omit<Subject, 'id' | 'createdAt'>): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      ...subject,
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    subjects.push(newSubject);
    setStorage(STORAGE_KEYS.SUBJECTS, subjects);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'subjects', newSubject.id), newSubject).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `subjects/${newSubject.id}`);
      });
    } catch (e) {
      console.error('Error saving subject to Firestore:', e);
    }

    return newSubject;
  },

  updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    subjects[idx] = { ...subjects[idx], ...updates };
    setStorage(STORAGE_KEYS.SUBJECTS, subjects);
    notifySubscribers();

    // Firestore update
    try {
      setDoc(doc(db, 'subjects', id), subjects[idx], { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `subjects/${id}`);
      });
    } catch (e) {
      console.error('Error updating subject in Firestore:', e);
    }

    // Update denormalized subject names in tests and pdf notes
    if (updates.name) {
      const tests = this.getTests(true);
      tests.forEach((t) => {
        if (t.subjectId === id) {
          t.subjectName = updates.name!;
          setDoc(doc(db, 'tests', t.id), t, { merge: true }).catch(() => {});
        }
      });
      setStorage(STORAGE_KEYS.TESTS, tests);

      const notes = this.getPdfNotes(true);
      notes.forEach((n) => {
        if (n.subjectId === id) {
          n.subjectName = updates.name!;
          setDoc(doc(db, 'pdfNotes', n.id), n, { merge: true }).catch(() => {});
        }
      });
      setStorage(STORAGE_KEYS.PDF_NOTES, notes);
    }

    return subjects[idx];
  },

  deleteSubject(id: string): boolean {
    const subjects = this.getSubjects();
    const filtered = subjects.filter((s) => s.id !== id);
    if (filtered.length === subjects.length) return false;
    setStorage(STORAGE_KEYS.SUBJECTS, filtered);
    notifySubscribers();

    try {
      deleteDoc(doc(db, 'subjects', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`);
      });
    } catch (e) {
      console.error('Error deleting subject from Firestore:', e);
    }

    return true;
  },

  // ---- TESTS ----
  getTests(includeUnpublished = false): Test[] {
    const tests = getStorage<Test[]>(STORAGE_KEYS.TESTS, initialTests);
    if (includeUnpublished) return tests;
    return tests.filter((t) => t.isPublished);
  },

  getTestById(id: string): (Test & { questions: Question[] }) | undefined {
    const test = this.getTests(true).find((t) => t.id === id);
    if (!test) return undefined;
    const questions = this.getQuestionsByTestId(id);
    return {
      ...test,
      questions,
    };
  },

  createTest(data: {
    title: string;
    subjectId: string;
    durationMinutes: number;
    totalMarks: number;
    passPercentage?: number;
    isPublished?: boolean;
  }): Test {
    const tests = this.getTests(true);
    const subject = this.getSubjectById(data.subjectId);
    const subjectName = subject ? subject.name : 'General';

    const newTest: Test = {
      id: `test_${Date.now()}`,
      title: data.title.trim(),
      subjectId: data.subjectId,
      subjectName,
      durationMinutes: data.durationMinutes,
      totalMarks: data.totalMarks,
      totalQuestions: 0,
      passPercentage: data.passPercentage || 60,
      isPublished: data.isPublished ?? true,
      createdAt: new Date().toISOString(),
    };

    tests.unshift(newTest);
    setStorage(STORAGE_KEYS.TESTS, tests);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'tests', newTest.id), newTest).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `tests/${newTest.id}`);
      });
    } catch (e) {
      console.error('Error creating test in Firestore:', e);
    }

    return newTest;
  },

  updateTest(id: string, updates: Partial<Test>): Test | null {
    const tests = this.getTests(true);
    const idx = tests.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    if (updates.subjectId && !updates.subjectName) {
      const sub = this.getSubjectById(updates.subjectId);
      if (sub) updates.subjectName = sub.name;
    }

    tests[idx] = { ...tests[idx], ...updates };
    setStorage(STORAGE_KEYS.TESTS, tests);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'tests', id), tests[idx], { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `tests/${id}`);
      });
    } catch (e) {
      console.error('Error updating test in Firestore:', e);
    }

    return tests[idx];
  },

  deleteTest(id: string): boolean {
    const tests = this.getTests(true);
    const filtered = tests.filter((t) => t.id !== id);
    if (filtered.length === tests.length) return false;
    setStorage(STORAGE_KEYS.TESTS, filtered);

    // Also remove associated questions locally and in cloud
    const questions = this.getQuestions();
    const toDeleteQuestions = questions.filter((q) => q.testId === id);
    const remainingQuestions = questions.filter((q) => q.testId !== id);
    setStorage(STORAGE_KEYS.QUESTIONS, remainingQuestions);
    notifySubscribers();

    try {
      deleteDoc(doc(db, 'tests', id)).catch(() => {});
      toDeleteQuestions.forEach((q) => {
        deleteDoc(doc(db, 'questions', q.id)).catch(() => {});
      });
    } catch (e) {
      console.error('Error deleting test from Firestore:', e);
    }

    return true;
  },

  // ---- QUESTIONS ----
  getQuestions(): Question[] {
    return getStorage<Question[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);
  },

  getQuestionsByTestId(testId: string): Question[] {
    return this.getQuestions().filter((q) => q.testId === testId);
  },

  createQuestion(data: {
    testId: string;
    questionText: string;
    options: [string, string, string, string];
    correctOptionIndex: number;
    marks: number;
    explanation?: string;
  }): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      testId: data.testId,
      questionText: data.questionText.trim(),
      options: data.options,
      correctOptionIndex: data.correctOptionIndex,
      marks: data.marks,
      explanation: data.explanation?.trim(),
    };

    questions.push(newQuestion);
    setStorage(STORAGE_KEYS.QUESTIONS, questions);

    // Sync total questions count in test
    this.syncTestQuestionsCount(data.testId);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'questions', newQuestion.id), newQuestion).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `questions/${newQuestion.id}`);
      });
    } catch (e) {
      console.error('Error creating question in Firestore:', e);
    }

    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = this.getQuestions();
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;

    questions[idx] = { ...questions[idx], ...updates };
    setStorage(STORAGE_KEYS.QUESTIONS, questions);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'questions', id), questions[idx], { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `questions/${id}`);
      });
    } catch (e) {
      console.error('Error updating question in Firestore:', e);
    }

    return questions[idx];
  },

  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const target = questions.find((q) => q.id === id);
    if (!target) return false;

    const filtered = questions.filter((q) => q.id !== id);
    setStorage(STORAGE_KEYS.QUESTIONS, filtered);

    // Sync total questions count in test
    this.syncTestQuestionsCount(target.testId);
    notifySubscribers();

    try {
      deleteDoc(doc(db, 'questions', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `questions/${id}`);
      });
    } catch (e) {
      console.error('Error deleting question from Firestore:', e);
    }

    return true;
  },

  syncTestQuestionsCount(testId: string) {
    const testQuestions = this.getQuestionsByTestId(testId);
    const tests = this.getTests(true);
    const tIdx = tests.findIndex((t) => t.id === testId);
    if (tIdx !== -1) {
      tests[tIdx].totalQuestions = testQuestions.length;
      setStorage(STORAGE_KEYS.TESTS, tests);
      try {
        setDoc(doc(db, 'tests', testId), { totalQuestions: testQuestions.length }, { merge: true }).catch(() => {});
      } catch (e) {}
    }
  },

  // ---- TEST ATTEMPTS ----
  getAttempts(studentId?: string): TestAttempt[] {
    const attempts = getStorage<TestAttempt[]>(STORAGE_KEYS.ATTEMPTS, initialAttempts);
    if (studentId) {
      return attempts.filter((a) => a.studentId === studentId);
    }
    return attempts;
  },

  getAttemptById(id: string): TestAttempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  },

  submitTestAttempt(data: {
    testId: string;
    student: User;
    answers: Record<string, number>;
    startedAt: string;
    timeSpentSeconds: number;
  }): TestAttempt {
    const test = this.getTestById(data.testId);
    if (!test) throw new Error('Test not found');

    const questions = test.questions || [];
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;
    let obtainedMarks = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      totalMarks += q.marks;
      const studentChoice = data.answers[q.id];
      if (studentChoice !== undefined) {
        answeredCount++;
        if (studentChoice === q.correctOptionIndex) {
          correctCount++;
          obtainedMarks += q.marks;
        } else {
          wrongCount++;
        }
      }
    });

    const unansweredCount = questions.length - answeredCount;
    const effectiveTotalMarks = totalMarks > 0 ? totalMarks : test.totalMarks || 1;
    const percentage = Math.round((obtainedMarks / effectiveTotalMarks) * 100);
    const status: 'Passed' | 'Failed' = percentage >= (test.passPercentage || 60) ? 'Passed' : 'Failed';

    const newAttempt: TestAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      testId: test.id,
      testTitle: test.title,
      subjectId: test.subjectId,
      subjectName: test.subjectName,
      studentId: data.student.uid,
      studentName: data.student.name,
      studentEmail: data.student.email,
      totalQuestions: questions.length,
      answeredQuestions: answeredCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unansweredQuestions: unansweredCount,
      obtainedMarks,
      totalMarks: totalMarks || test.totalMarks,
      percentage,
      status,
      answers: data.answers,
      startedAt: data.startedAt,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: data.timeSpentSeconds,
    };

    const attempts = this.getAttempts();
    attempts.unshift(newAttempt);
    setStorage(STORAGE_KEYS.ATTEMPTS, attempts);
    notifySubscribers();

    // Persist attempt to Firestore so Admin can review scores immediately from anywhere
    try {
      setDoc(doc(db, 'testAttempts', newAttempt.id), newAttempt).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `testAttempts/${newAttempt.id}`);
      });
    } catch (e) {
      console.error('Error persisting test attempt to Firestore:', e);
    }

    return newAttempt;
  },

  // ---- PDF NOTES ----
  getPdfNotes(includeUnpublished = false): PdfNote[] {
    const notes = getStorage<PdfNote[]>(STORAGE_KEYS.PDF_NOTES, initialPdfNotes);
    if (includeUnpublished) return notes;
    return notes.filter((n) => n.isPublished);
  },

  getPdfNoteById(id: string): PdfNote | undefined {
    return this.getPdfNotes(true).find((n) => n.id === id);
  },

  createPdfNote(data: {
    title: string;
    subjectId: string;
    description: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    pageCount?: number;
    isPublished?: boolean;
  }): PdfNote {
    const notes = this.getPdfNotes(true);
    const subject = this.getSubjectById(data.subjectId);
    const subjectName = subject ? subject.name : 'General';

    const newNote: PdfNote = {
      id: `pdf_${Date.now()}`,
      title: data.title.trim(),
      subjectId: data.subjectId,
      subjectName,
      description: data.description.trim(),
      fileUrl: data.fileUrl || '',
      fileName: data.fileName || `${data.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: data.fileSize || '1.5 MB',
      pageCount: data.pageCount || 10,
      isPublished: data.isPublished ?? true,
      createdAt: new Date().toISOString(),
      downloadsCount: 0,
    };

    notes.unshift(newNote);
    setStorage(STORAGE_KEYS.PDF_NOTES, notes);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'pdfNotes', newNote.id), newNote).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `pdfNotes/${newNote.id}`);
      });
    } catch (e) {
      console.error('Error saving PDF note to Firestore:', e);
    }

    return newNote;
  },

  updatePdfNote(id: string, updates: Partial<PdfNote>): PdfNote | null {
    const notes = this.getPdfNotes(true);
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;

    if (updates.subjectId && !updates.subjectName) {
      const sub = this.getSubjectById(updates.subjectId);
      if (sub) updates.subjectName = sub.name;
    }

    notes[idx] = { ...notes[idx], ...updates };
    setStorage(STORAGE_KEYS.PDF_NOTES, notes);
    notifySubscribers();

    // Firestore sync
    try {
      setDoc(doc(db, 'pdfNotes', id), notes[idx], { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `pdfNotes/${id}`);
      });
    } catch (e) {
      console.error('Error updating PDF note in Firestore:', e);
    }

    return notes[idx];
  },

  incrementDownload(id: string): void {
    const notes = this.getPdfNotes(true);
    const note = notes.find((n) => n.id === id);
    if (note) {
      note.downloadsCount = (note.downloadsCount || 0) + 1;
      setStorage(STORAGE_KEYS.PDF_NOTES, notes);
      try {
        setDoc(doc(db, 'pdfNotes', id), { downloadsCount: note.downloadsCount }, { merge: true }).catch(() => {});
      } catch (e) {}
    }
  },

  deletePdfNote(id: string): boolean {
    const notes = this.getPdfNotes(true);
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === notes.length) return false;
    setStorage(STORAGE_KEYS.PDF_NOTES, filtered);
    notifySubscribers();

    try {
      deleteDoc(doc(db, 'pdfNotes', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `pdfNotes/${id}`);
      });
    } catch (e) {
      console.error('Error deleting PDF note from Firestore:', e);
    }

    return true;
  },

  // ---- SETTINGS ----
  getSettings(): PortalSettings {
    return getStorage<PortalSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
  },

  updateSettings(updates: Partial<PortalSettings>): PortalSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    setStorage(STORAGE_KEYS.SETTINGS, updated);
    notifySubscribers();
    return updated;
  },

  // ---- ADMIN STATS ----
  getAdminStats() {
    const students = this.getStudents();
    const tests = this.getTests(true);
    const notes = this.getPdfNotes(true);
    const attempts = this.getAttempts();

    return {
      totalStudents: students.length,
      totalTests: tests.length,
      totalPdfNotes: notes.length,
      totalAttempts: attempts.length,
    };
  },

  // ---- STUDENT STATS ----
  getStudentStats(studentId: string) {
    const attempts = this.getAttempts(studentId);
    const totalAttempted = attempts.length;
    const completed = attempts.filter((a) => a.status === 'Passed' || a.status === 'Failed').length;

    let avgPercentage = 0;
    if (totalAttempted > 0) {
      const sum = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
      avgPercentage = Math.round(sum / totalAttempted);
    }

    return {
      totalAttempted,
      completed,
      avgPercentage,
      recentAttempts: attempts.slice(0, 5),
    };
  },

  // Reset database back to clean initial state
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TESTS);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.PDF_NOTES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    initDatabase();
    notifySubscribers();
  },
};
