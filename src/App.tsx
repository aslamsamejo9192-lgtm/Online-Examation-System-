import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { StudentLayout } from './components/StudentLayout';
import { AdminLayout } from './components/AdminLayout';

// Auth Pages
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { AdminRegisterPage } from './pages/auth/AdminRegisterPage';

// Student Portal Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { OnlineTestsPage } from './pages/student/OnlineTestsPage';
import { TakeTestPage } from './pages/student/TakeTestPage';
import { TestResultPage } from './pages/student/TestResultPage';
import { PdfNotesPage } from './pages/student/PdfNotesPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTestsPage } from './pages/admin/AdminTestsPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminPdfNotesPage } from './pages/admin/AdminPdfNotesPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Protected Route Guard for Students
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <StudentLayout>{children}</StudentLayout>;
};

// Protected Route Guard for Administrators
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Root route dispatcher: If authenticated -> /dashboard, else -> /register
const RootIndexRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // When a student opens the website for the first time, show Create Account (Register)
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/register" replace />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root Entry Point */}
      <Route path="/" element={<RootIndexRoute />} />

      {/* Authentication Routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />

      {/* Student Portal Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <DashboardPage />
          </StudentRoute>
        }
      />
      <Route
        path="/tests"
        element={
          <StudentRoute>
            <OnlineTestsPage />
          </StudentRoute>
        }
      />
      <Route
        path="/test/:id"
        element={
          <StudentRoute>
            <TakeTestPage />
          </StudentRoute>
        }
      />
      <Route
        path="/result/:id"
        element={
          <StudentRoute>
            <TestResultPage />
          </StudentRoute>
        }
      />
      <Route
        path="/pdf-notes"
        element={
          <StudentRoute>
            <PdfNotesPage />
          </StudentRoute>
        }
      />

      {/* Admin Panel Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tests"
        element={
          <AdminRoute>
            <AdminTestsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <AdminRoute>
            <AdminQuestionsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <AdminRoute>
            <AdminSubjectsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pdf-notes"
        element={
          <AdminRoute>
            <AdminPdfNotesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <AdminStudentsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <AdminRoute>
            <AdminResultsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />

      {/* Fallback route - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
