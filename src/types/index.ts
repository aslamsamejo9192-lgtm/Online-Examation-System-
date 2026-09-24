export type UserRole = 'student' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export type UserProfile = User;

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  testId: string;
  questionText: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, 3
  marks: number;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  passPercentage: number;
  isPublished: boolean;
  createdAt: string;
  questions?: Question[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  subjectId?: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  status: 'Passed' | 'Failed';
  answers: Record<string, number>; // questionId -> selectedOptionIndex (0-3)
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
}

export interface PdfNote {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string;
  fileUrl: string;
  fileName?: string;
  fileSize: string;
  pageCount?: number;
  isPublished: boolean;
  createdAt: string;
  downloadsCount: number;
}

export interface PortalSettings {
  portalName: string;
  instituteName: string;
  passPercentageDefault: number;
  contactEmail: string;
  allowSelfRegistration: boolean;
}
