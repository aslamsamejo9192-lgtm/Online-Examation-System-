import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { DatabaseService } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithAccessCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, accessCode?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  adminRegister: (name: string, email: string, password: string, securityPasscode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sotp_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore saved session on page load / browser refresh
    const savedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUserJson) {
      try {
        const savedUser: User = JSON.parse(savedUserJson);
        // Verify user still exists in database
        const dbUser = DatabaseService.getUserById(savedUser.uid);
        if (dbUser) {
          setCurrentUser(dbUser);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse active user:', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const clean = identifier.trim();
    if (!clean) {
      return { success: false, error: 'Please enter your Student ID, Username, or Email Address.' };
    }

    if (!password || !password.trim()) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Universal lookup: Student ID, Username, Email, or Roll Number
    let user = DatabaseService.getUserByIdentifier(clean);
    if (!user) {
      user = DatabaseService.getUserByStudentId(clean);
    }
    if (!user) {
      user = DatabaseService.getUserByUsername(clean);
    }
    if (!user) {
      user = DatabaseService.getUserByEmail(clean.toLowerCase());
    }

    if (!user) {
      return {
        success: false,
        error: 'No student record found with this Student ID, Username, or Email. Please contact your administration to obtain your Student ID.',
      };
    }

    if (user.role !== 'student') {
      return { success: false, error: 'This is an administrator account. Please use the Admin Login portal.' };
    }

    if (user.status === 'blocked') {
      return {
        success: false,
        error: 'Your student account has been deactivated by administration. Please contact your institution office.',
      };
    }

    // Password verification
    if (user.password && user.password !== password.trim()) {
      return { success: false, error: 'Incorrect password. Please enter the valid password provided by administration.' };
    }

    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true };
  };

  const loginWithAccessCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Please enter your unique student access key.' };
    }

    // Check if an existing student already has this access code or roll number
    const registeredStudent = DatabaseService.getUserByAccessCode(cleanCode);
    if (registeredStudent) {
      if (registeredStudent.status === 'blocked') {
        return { success: false, error: 'Your student account has been deactivated by administration.' };
      }
      setCurrentUser(registeredStudent);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(registeredStudent));
      return { success: true };
    }

    // Validate against administration issued access keys
    const validation = DatabaseService.validateAccessKey(cleanCode);
    if (!validation.valid || !validation.key) {
      return {
        success: false,
        error: validation.error || 'Invalid Unique Access Key. Only students authorized by administration can log in.',
      };
    }

    const key = validation.key;
    const studentName = key.assignedToName || `Student (${key.code})`;
    const studentEmail =
      key.assignedToEmail || `${key.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.portal`;

    const newUser = DatabaseService.createUser({
      uid: `std_${Date.now()}`,
      name: studentName,
      email: studentEmail,
      role: 'student',
      accessCode: key.code,
      rollNumber: key.rollNumber || '',
      status: 'active',
    });

    DatabaseService.markAccessKeyUsed(key.code, newUser.uid, newUser.name);
    setCurrentUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    accessCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const settings = DatabaseService.getSettings();

    // Check administration unique key enforcement
    if (settings.requireUniqueAccessKey) {
      if (!accessCode || !accessCode.trim()) {
        return {
          success: false,
          error: 'Registration is restricted: You must provide a valid Unique Student Access Key issued by the administration.',
        };
      }

      const keyCheck = DatabaseService.validateAccessKey(accessCode.trim(), cleanEmail);
      if (!keyCheck.valid) {
        return { success: false, error: keyCheck.error };
      }
    } else if (!settings.allowSelfRegistration) {
      return {
        success: false,
        error: 'Registration is currently disabled by administration. Only authorized students can log in.',
      };
    }

    const existing = DatabaseService.getUserByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const cleanAccessCode = accessCode?.trim().toUpperCase();

    // Students can ONLY register as a student. Under no circumstances can they be assigned admin role.
    const newUser = DatabaseService.createUser({
      uid: `std_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'student',
      password: password?.trim(),
      accessCode: cleanAccessCode,
      status: 'active',
    });

    if (cleanAccessCode) {
      DatabaseService.markAccessKeyUsed(cleanAccessCode, newUser.uid, newUser.name);
    }

    setCurrentUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const adminRegister = async (
    name: string,
    email: string,
    password: string,
    securityPasscode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanPasscode = (securityPasscode || '').trim().toUpperCase();

    // Verify Master Security Code to prevent students from registering as admin
    const REQUIRED_SECURITY_CODE = 'ADMIN2026';
    if (cleanPasscode !== REQUIRED_SECURITY_CODE) {
      return {
        success: false,
        error: 'Invalid Admin Security Key. Only authorized faculty and administrators possessing the security key (ADMIN2026) can register.',
      };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'Administrator password must be at least 6 characters long.' };
    }

    const existing = DatabaseService.getUserByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists in the system.' };
    }

    // Create new dedicated administrator with their own custom email & password
    const newAdmin = DatabaseService.createUser({
      uid: `adm_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'admin',
      password: cleanPass,
    });

    setCurrentUser(newAdmin);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAdmin));
    return { success: true };
  };

  const adminLogin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Look up user in database
    const user = DatabaseService.getUserByEmail(cleanEmail);

    // If user exists but is a student, strictly deny admin access
    if (user && user.role === 'student') {
      return {
        success: false,
        error: 'Access Denied: This is a student account. Students are not permitted to access the Administrator Control Center.',
      };
    }

    // Default seeded admin fallback
    if (cleanEmail === 'admin@portal.edu' && (cleanPass === 'admin123' || !cleanPass)) {
      let adminUser = user;
      if (!adminUser) {
        adminUser = DatabaseService.createUser({
          uid: 'admin_master',
          name: 'Portal Administrator',
          email: 'admin@portal.edu',
          role: 'admin',
          password: 'admin123',
        });
      }
      setCurrentUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // Custom registered admin check
    if (user && user.role === 'admin') {
      if (user.password && user.password !== cleanPass) {
        return { success: false, error: 'Invalid administrator password. Access denied.' };
      }
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    }

    return {
      success: false,
      error: 'No administrator account found with this email. Please register your admin account first.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        loginWithAccessCode,
        register,
        adminLogin,
        adminRegister,
        logout,
        isAuthenticated,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
