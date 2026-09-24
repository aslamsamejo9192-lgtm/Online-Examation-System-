import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { TopNavbar } from './TopNavbar';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans antialiased">
      {/* Top Navigation Bar: Online Tests | PDF Notes | Dashboard | Admin Login */}
      <TopNavbar />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Simple, Professional Educational Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-600 text-sm">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">Student Online Test Portal</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">Examination System</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 font-medium">
            <Link to="/tests" className="hover:text-blue-600 transition-colors">Online Tests</Link>
            <Link to="/pdf-notes" className="hover:text-blue-600 transition-colors">PDF Notes</Link>
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/admin/login" className="hover:text-blue-600 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
