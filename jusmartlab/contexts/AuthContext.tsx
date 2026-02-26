import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import type { AdminUser } from '@/types';

type Role = 'student' | 'admin' | 'superadmin' | null;

interface AuthState {
  user: AdminUser | null;
  role: Role;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: 'admin' | 'superadmin') => { success: boolean, message: string };
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (newName: string) => Promise<{ success: boolean; message: string }>;
  createAdmin: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  deleteAdmin: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleAdminStatus: (id: string) => Promise<{ success: boolean; message: string }>;
  admins: AdminUser[];
}

const defaultState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Default credentials
const DEFAULT_ADMINS = [
  { email: 'admin@ju.edu', password: 'admin123', role: 'admin' as const, id: 'a1', name: 'Ahmed Khalid Omar', status: 'active' as const },
  { email: 'super@ju.edu', password: 'super123', role: 'superadmin' as const, id: 's1', name: 'Super Admin', status: 'active' as const },
];

const STORAGE_KEY = '@ju_admin_credentials';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);
  const [admins, setAdmins] = useState<any[]>(DEFAULT_ADMINS);

  // Load stored credentials on mount
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAdmins(parsed);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const saveCredentials = async (updatedAdmins: any[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  const login = useCallback((email: string, password: string, role: 'admin' | 'superadmin') => {
    const found = admins.find(
      (a) => a.email === email && a.password === password && a.role === role
    );

    if (found) {
      if (found.status === 'inactive') {
        return { success: false, message: 'Your account has been deactivated. Please contact the Super Admin.' };
      }

      setState({
        user: { id: found.id, email: found.email, name: found.name, role: found.role, status: found.status },
        role: found.role,
        isAuthenticated: true,
      });
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid email or password.' };
  }, [admins]);

  const logout = useCallback(() => {
    setState(defaultState);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!state.user) {
      return { success: false, message: 'No user logged in' };
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Find current user in admins
    const currentAdmin = admins.find(a => a.email === state.user!.email);

    if (!currentAdmin) {
      return { success: false, message: 'User not found' };
    }

    // Verify current password
    if (currentAdmin.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Update password
    const updatedAdmins = admins.map(a =>
      a.email === state.user!.email ? { ...a, password: newPassword } : a
    );

    await saveCredentials(updatedAdmins);

    return { success: true, message: 'Password changed successfully!' };
  }, [state.user, admins]);

  const updateProfile = useCallback(async (newName: string) => {
    if (!state.user) {
      return { success: false, message: 'No user logged in' };
    }

    // Validate name
    if (!newName || newName.trim().length < 3) {
      return { success: false, message: 'Name must be at least 3 characters' };
    }

    // Update user's name in admins
    const updatedAdmins = admins.map(a =>
      a.email === state.user!.email ? { ...a, name: newName.trim() } : a
    );

    await saveCredentials(updatedAdmins);

    // Update current state
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, name: newName.trim() } : null
    }));

    return { success: true, message: 'Profile updated successfully!' };
  }, [state.user, admins]);

  const createAdmin = useCallback(async (email: string, password: string, name: string) => {
    // Basic validation
    if (!email.includes('@') || password.length < 6 || name.length < 3) {
      return { success: false, message: 'Invalid input data' };
    }

    // Check if exists
    if (admins.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Admin with this email already exists' };
    }

    const newAdmin = {
      id: `a${Date.now()}`,
      email: email.trim(),
      password,
      name: name.trim(),
      role: 'admin' as const,
      status: 'active' as const
    };

    const updatedAdmins = [...admins, newAdmin];
    await saveCredentials(updatedAdmins);

    return { success: true, message: 'Admin account created successfully!' };
  }, [admins]);

  const deleteAdmin = useCallback(async (id: string) => {
    // Prevent self-deletion
    if (state.user?.id === id) {
      return { success: false, message: 'You cannot delete your own account.' };
    }

    const updatedAdmins = admins.filter(a => a.id !== id);
    if (updatedAdmins.length === admins.length) {
      return { success: false, message: 'Admin account not found.' };
    }

    await saveCredentials(updatedAdmins);
    return { success: true, message: 'Admin account deleted successfully!' };
  }, [admins, state.user]);

  const toggleAdminStatus = useCallback(async (id: string) => {
    // Prevent self-deactivation
    if (state.user?.id === id) {
      return { success: false, message: 'You cannot deactivate your own account.' };
    }

    const updatedAdmins = admins.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    );

    await saveCredentials(updatedAdmins);
    return { success: true, message: 'User status updated successfully!' };
  }, [admins, state.user]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    changePassword,
    updateProfile,
    createAdmin,
    deleteAdmin,
    toggleAdminStatus,
    admins: admins.map(a => ({ id: a.id, email: a.email, name: a.name, role: a.role, status: a.status })),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

