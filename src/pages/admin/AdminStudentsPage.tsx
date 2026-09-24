import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/db';
import type { UserProfile, TestAttempt } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Printer,
  Share2,
  Edit,
  GraduationCap,
  Award,
} from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Selected student for attempt history drawer
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<TestAttempt[]>([]);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Student@2026');
  const [formClass, setFormClass] = useState('');
  const [formRollNo, setFormRollNo] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  // Credential Slip Modal State (for sharing Student ID & Password with student)
  const [credentialSlipStudent, setCredentialSlipStudent] = useState<UserProfile | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

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

  const handleOpenRegister = () => {
    const nextId = DatabaseService.getNextStudentId();
    setFormStudentId(nextId);
    setFormName('');
    setFormFatherName('');
    setFormUsername(nextId.toLowerCase().replace(/[^a-z0-9]/g, ''));
    setFormEmail(`${nextId.toLowerCase().replace(/[^a-z0-9]/g, '')}@portal.edu`);
    setFormPassword(`Pass@${Math.floor(1000 + Math.random() * 9000)}`);
    setFormClass('');
    setFormRollNo('');
    setFormPhone('');
    setRegisterError('');
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!formName.trim()) {
      setRegisterError('Student full name is required.');
      return;
    }

    const res = DatabaseService.registerStudent({
      studentId: formStudentId.trim() || undefined,
      name: formName.trim(),
      fatherName: formFatherName.trim(),
      username: formUsername.trim(),
      email: formEmail.trim(),
      password: formPassword.trim() || 'student123',
      className: formClass.trim(),
      rollNumber: formRollNo.trim(),
      phone: formPhone.trim(),
      status: 'active',
    });

    if (!res.success || !res.user) {
      setRegisterError(res.error || 'Failed to register student.');
      return;
    }

    setShowRegisterModal(false);
    // Show credential slip immediately so admin can copy/send to student
    setCredentialSlipStudent(res.user);
  };

  const handleOpenEdit = (student: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setEditName(student.name);
    setEditFatherName(student.fatherName || '');
    setEditStudentId(student.studentId || student.accessCode || '');
    setEditUsername(student.username || '');
    setEditEmail(student.email);
    setEditPassword(student.password || '');
    setEditClass(student.className || '');
    setEditRollNo(student.rollNumber || '');
    setEditPhone(student.phone || '');
    setEditError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditError('');

    const res = DatabaseService.updateStudent(editingStudent.uid, {
      name: editName.trim(),
      fatherName: editFatherName.trim(),
      studentId: editStudentId.trim(),
      username: editUsername.trim(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      className: editClass.trim(),
      rollNumber: editRollNo.trim(),
      phone: editPhone.trim(),
    });

    if (!res.success) {
      setEditError(res.error || 'Failed to update student.');
      return;
    }

    setEditingStudent(null);
  };

  const handleToggleStatus = (student: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = student.status === 'blocked' ? 'active' : 'blocked';
    DatabaseService.updateUserStatus(student.uid, newStatus);
  };

  const handleDelete = (student: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete student "${student.name}" (${student.studentId || student.email})?`)) {
      DatabaseService.deleteStudent(student.uid);
      if (selectedStudent?.uid === student.uid) {
        setSelectedStudent(null);
      }
    }
  };

  const handleViewAttempts = (student: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectStudent(student);
  };

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPasswordMap((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleCopyWhatsAppSlip = (student: UserProfile) => {
    const loginUrl = `${window.location.origin}/login`;
    const message = `*Student Online Test Portal Credentials*
---------------------------------------
Student Name: ${student.name}
${student.fatherName ? `Father's Name: ${student.fatherName}\n` : ''}Student ID: ${student.studentId || student.accessCode || 'N/A'}
Username: ${student.username || student.email.split('@')[0]}
Password: ${student.password || 'student123'}
${student.className ? `Class / Batch: ${student.className}\n` : ''}${student.rollNumber ? `Roll No: ${student.rollNumber}\n` : ''}
Portal Login Link:
${loginUrl}
---------------------------------------
Please keep your credentials safe and do not share them.`;

    navigator.clipboard.writeText(message);
    setCopiedField('whatsapp_slip');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Distinct classes for filter dropdown
  const distinctClasses = Array.from(
    new Set(students.map((s) => s.className).filter(Boolean) as string[])
  );

  // Filter students
  const filteredStudents = students.filter((student) => {
    const sId = (student.studentId || student.accessCode || '').toLowerCase();
    const sName = student.name.toLowerCase();
    const sFather = (student.fatherName || '').toLowerCase();
    const sUser = (student.username || '').toLowerCase();
    const sEmail = student.email.toLowerCase();
    const sRoll = (student.rollNumber || '').toLowerCase();
    const sClass = (student.className || '').toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sId.includes(q) ||
      sName.includes(q) ||
      sFather.includes(q) ||
      sUser.includes(q) ||
      sEmail.includes(q) ||
      sRoll.includes(q) ||
      sClass.includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.status !== 'blocked') ||
      (statusFilter === 'blocked' && student.status === 'blocked');

    const matchesClass =
      classFilter === 'all' || student.className === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Main Heading & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              STUDENT MANAGEMENT
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register students, generate Student IDs, provide credentials, and manage examination access
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenRegister}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Active Directory</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Status</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {students.filter((s) => s.status !== 'blocked').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Can Login &amp; Test</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deactivated</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {students.filter((s) => s.status === 'blocked').length}
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">Access Suspended</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student IDs Issued</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            {students.filter((s) => s.studentId || s.accessCode).length}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold">Unique Identifiers</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Student ID, Name, Username, Email, Roll No, Class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="blocked">Deactivated Only</option>
          </select>

          {/* Class Filter */}
          {distinctClasses.length > 0 && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes / Batches</option>
              {distinctClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadStudents}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'No student matching your search criteria. Try a different search term.'
                : 'No students have been registered yet. Click "Register New Student" to enroll your first student and provide their Student ID.'}
            </p>
            <button
              onClick={handleOpenRegister}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Register First Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Student Info</th>
                  <th className="py-3.5 px-4">Login Credentials</th>
                  <th className="py-3.5 px-4">Class / Roll No</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredStudents.map((student) => {
                  const sId = student.studentId || student.accessCode || 'N/A';
                  const isVisiblePassword = showPasswordMap[student.uid] || false;
                  const isBlocked = student.status === 'blocked';

                  return (
                    <tr
                      key={student.uid}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => handleSelectStudent(student)}
                    >
                      {/* Student ID Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg text-xs">
                            {sId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(sId, `id_${student.uid}`);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy Student ID"
                          >
                            {copiedField === `id_${student.uid}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Student Info Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                            {student.fatherName && (
                              <p className="text-[10px] text-slate-500">S/O {student.fatherName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Login Credentials Column (Username, Email & Password view) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-slate-900 font-medium">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">User:</span>
                            <span className="font-mono">{student.username || student.email.split('@')[0]}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {student.email}
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] pt-0.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Pass:</span>
                            <span className="font-mono text-slate-800">
                              {isVisiblePassword ? (student.password || 'student123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => togglePasswordVisibility(student.uid, e)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title={isVisiblePassword ? 'Hide Password' : 'Show Password'}
                            >
                              {isVisiblePassword ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(student.password || 'student123', `pass_${student.uid}`);
                              }}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Copy Password"
                            >
                              {copiedField === `pass_${student.uid}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Class & Roll Number Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">
                          {student.className || <span className="text-slate-300 font-normal italic">No class</span>}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {student.rollNumber ? `Roll: ${student.rollNumber}` : ''}
                        </p>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(student, e)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to toggle account access"
                        >
                          {isBlocked ? (
                            <>
                              <Ban className="w-3 h-3 text-rose-500" />
                              <span>Deactivated</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              <span>Active</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Provide ID Slip button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCredentialSlipStudent(student);
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                            title="Provide Student ID and Credentials Slip"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Provide ID</span>
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(student, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Student Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Test history button */}
                          <button
                            type="button"
                            onClick={(e) => handleViewAttempts(student, e)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Test Attempts & Scores"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(student, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: REGISTER NEW STUDENT (WITH FULL STUDENT DATA)
          ======================================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Register New Student</h3>
                  <p className="text-xs text-slate-300">Enter student data to assign unique Student ID</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {registerError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* Student ID Assigned */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Assigned Student ID
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold">Unique System Identifier</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. STD-2026-001"
                    className="w-full font-mono font-bold text-sm tracking-wider uppercase text-blue-900 bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1">
                  The student will use this Student ID along with their password to sign in.
                </p>
              </div>

              {/* Full Name & Father Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!formUsername || formUsername.startsWith('std')) {
                        const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (sanitized) setFormUsername(sanitized);
                      }
                    }}
                    placeholder="e.g. Muhammad Bilal"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Father / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. mbilal"
                    className="w-full font-mono text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Login Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormPassword(`Pass@${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Generate New
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full font-mono text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. student@portal.edu"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class/Batch, Roll Number & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Batch
                  </label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="e.g. Class 10 / Batch 2026"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value.toUpperCase())}
                    placeholder="e.g. RN-402"
                    className="w-full font-mono text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Generate ID Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: STUDENT CREDENTIAL SLIP (FOR PROVIDING TO STUDENT)
          ======================================================== */}
      {credentialSlipStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  Student Admission &amp; Credential Slip
                </h3>
              </div>
              <button
                onClick={() => setCredentialSlipStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Printable Body */}
            <div id="credential-slip-print-area" className="p-6 space-y-5 bg-white">
              {/* Institution Title */}
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
                  Student Online Test Portal
                </h4>
                <p className="text-xs text-slate-500">Official Student Login Credentials Slip</p>
              </div>

              {/* Big Highlighted Student ID */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  Assigned Student ID
                </p>
                <div className="mt-1 flex items-center justify-center space-x-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-blue-800">
                    {credentialSlipStudent.studentId || credentialSlipStudent.accessCode || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        credentialSlipStudent.studentId || credentialSlipStudent.accessCode || '',
                        'slip_id'
                      )
                    }
                    className="p-1.5 bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-xs"
                    title="Copy Student ID"
                  >
                    {copiedField === 'slip_id' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  Provide this Student ID to the student to log into their examinations.
                </p>
              </div>

              {/* Credentials Details Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Student Full Name:</span>
                  <span className="font-bold text-slate-900">{credentialSlipStudent.name}</span>
                </div>
                {credentialSlipStudent.fatherName && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Father's Name:</span>
                    <span className="font-bold text-slate-900">{credentialSlipStudent.fatherName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Username:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-slate-900">
                      {credentialSlipStudent.username || credentialSlipStudent.email.split('@')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          credentialSlipStudent.username || credentialSlipStudent.email.split('@')[0],
                          'slip_user'
                        )
                      }
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      {copiedField === 'slip_user' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Login Password:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {credentialSlipStudent.password || 'student123'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(credentialSlipStudent.password || 'student123', 'slip_pass')
                      }
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      {copiedField === 'slip_pass' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {credentialSlipStudent.className && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Class / Batch:</span>
                    <span className="font-bold text-slate-900">{credentialSlipStudent.className}</span>
                  </div>
                )}
                {credentialSlipStudent.rollNumber && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Roll Number:</span>
                    <span className="font-mono font-bold text-slate-900">{credentialSlipStudent.rollNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Portal Sign In URL:</span>
                  <span className="font-mono text-blue-600 font-semibold truncate max-w-[200px]">
                    {window.location.origin}/login
                  </span>
                </div>
              </div>

              {/* Login Instructions Note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Instructions for the Student:</span>
                Open the portal login page, enter your <strong>Student ID</strong> (or Username/Email) and your <strong>Password</strong> to access your tests and study materials.
              </div>
            </div>

            {/* Actions for Admin (WhatsApp copy, Print, Close) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyWhatsAppSlip(credentialSlipStudent)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedField === 'whatsapp_slip' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>WhatsApp Slip Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy WhatsApp Slip</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialSlipStudent(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: EDIT STUDENT INFO & RESET PASSWORD
          ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Edit Student Credentials</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value.toUpperCase())}
                  className="w-full font-mono font-bold text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Name & Father Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                    className="w-full font-mono text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reset Password
                  </label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full font-mono text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class, Roll No & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Batch
                  </label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full font-mono text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DRAWER: STUDENT TEST ATTEMPT HISTORY
          ======================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 font-bold flex items-center justify-center text-sm">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono text-blue-300">
                    ID: {selectedStudent.studentId || selectedStudent.accessCode || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCredentialSlipStudent(selectedStudent)}
                  className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Provide ID Slip</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleStatus(selectedStudent, e)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 ${
                    selectedStudent.status === 'blocked'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {selectedStudent.status === 'blocked' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Re-activate</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Deactivate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Student Details Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedStudent.username || selectedStudent.email.split('@')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{selectedStudent.email}</span>
                </div>
                {selectedStudent.fatherName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Father's Name:</span>
                    <span className="font-bold text-slate-800">{selectedStudent.fatherName}</span>
                  </div>
                )}
                {selectedStudent.className && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class:</span>
                    <span className="font-bold text-slate-800">{selectedStudent.className}</span>
                  </div>
                )}
                {selectedStudent.rollNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roll No:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedStudent.rollNumber}</span>
                  </div>
                )}
              </div>

              {/* Test Attempts Section */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center justify-between">
                  <span>Examination Submissions</span>
                  <span className="text-xs text-slate-500 font-semibold">{studentAttempts.length} tests</span>
                </h4>

                {studentAttempts.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    This student has not submitted any tests yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate max-w-[180px]">
                            {attempt.testTitle}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              attempt.status === 'Passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {attempt.status} ({attempt.percentage}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Score: {attempt.obtainedMarks} / {attempt.totalMarks} marks
                          </span>
                          <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
