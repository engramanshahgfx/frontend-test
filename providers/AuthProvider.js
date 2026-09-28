'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // OTP flow state
  const [pendingOtp, setPendingOtp] = useState(null); // { phone, type, userData? }

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getUser();
      setUser(response.user);
      setRoles(response.roles || []);
      setPermissions(response.permissions || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user - Step 1: Submit registration and receive OTP
   * After calling this, user needs to verify OTP
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Check if OTP is required (for non-admin users)
      if (response.requires_otp) {
        // Store pending OTP state
        setPendingOtp({
          identifier: response.identifier || userData.email || userData.phone,
          type: 'register',
          userData: response.user,
        });
        
        toast.info(response.verification_channel === 'email'
          ? 'Please verify your email with the code we sent.'
          : 'Please verify your Saudi mobile with the code we sent.');
        return { 
          success: true, 
          requiresOtp: true, 
          identifier: response.identifier || userData.email || userData.phone,
          verificationChannel: response.verification_channel,
          message: response.message,
          // Include dev OTP for testing
          devOtp: response.dev_otp,
        };
      }
      
      // Direct token response (if OTP is not required)
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        return { success: true, user: response.user };
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed';
      if (error?.message) {
        errorMessage = error.message;
      }
      if (error?.status === 422 && error?.errors?.phone) {
        errorMessage = 'This phone number is already registered.';
      }
      if (error?.status === 422 && error?.errors?.email) {
        errorMessage = 'This email is already registered.';
      }
      
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  /**
   * Login user - Step 1: Submit credentials and receive OTP
   * After calling this, user needs to verify OTP
   */
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Check if OTP is required (for non-admin users)
      if (response.requires_otp) {
        // Store pending OTP state
        setPendingOtp({
          phone: response.phone || credentials.phone,
          type: 'login',
        });
        
        toast.info('Please verify your login with the OTP code.');
        return { 
          success: true, 
          requiresOtp: true, 
          phone: response.phone || credentials.phone,
          message: response.message,
          // Include dev OTP for testing
          devOtp: response.dev_otp,
        };
      }
      
      // Direct token response (for admin users)
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_roles', JSON.stringify(response.roles || []));
        localStorage.setItem('user_permissions', JSON.stringify(response.permissions || []));
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        setUser(response.user);
        setRoles(response.roles || []);
        setPermissions(response.permissions || []);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true, user: response.user, roles: response.roles, permissions: response.permissions };
      }
      
      return { success: false, error: { message: 'Unexpected response' } };
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed';
      // Prefer server-provided message (which will be localized if backend receives Accept-Language)
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401 || error?.status === 404) {
        // Fallback generic message when server didn't provide one
        errorMessage = 'We couldn\'t sign you in. Please check your phone and password or register an account.';
      } else if (error?.status === 422) {
        // Validation errors (bad input format)
        errorMessage = 'Invalid login details. Please check your input and try again.';
      }
      
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  /**
   * Send OTP to phone number
   */
  const sendOtp = async (identifier, type = 'login') => {
    try {
      const response = await authAPI.sendOtp(identifier, type);
      
      if (response.success) {
        setPendingOtp({ identifier, type });
        toast.info('OTP code sent to your phone.');
        return { 
          success: true, 
          message: response.message,
          devOtp: response.dev_otp, // For testing
        };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Send OTP failed:', error);
      toast.error(error?.message || 'Failed to send OTP');
      return { success: false, error };
    }
  };

  /**
   * Verify OTP and complete authentication
   */
  const verifyOtp = async (identifier, code, type = 'login') => {
    try {
      const response = await authAPI.verifyOtp(identifier, code, type);
      
      if (response.success && response.token) {
        // Store auth data
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_roles', JSON.stringify(response.roles || []));
        localStorage.setItem('user_permissions', JSON.stringify(response.permissions || []));
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Update state
        setUser(response.user);
        setRoles(response.roles || []);
        setPermissions(response.permissions || []);
        setIsAuthenticated(true);
        setPendingOtp(null);
        
        const successMessage = type === 'register' 
          ? 'Phone verified! Welcome!' 
          : 'Login successful!';
        toast.success(successMessage);
        
        return { 
          success: true, 
          user: response.user, 
          roles: response.roles, 
          permissions: response.permissions 
        };
      }
      
      return { success: false, message: response.message || 'Verification failed' };
    } catch (error) {
      console.error('OTP verification failed:', error);
      
      let errorMessage = 'Verification failed';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  /**
   * Cancel pending OTP flow
   */
  const cancelOtp = () => {
    setPendingOtp(null);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('user_permissions');
      localStorage.removeItem('user_data');
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setIsAuthenticated(false);
      setPendingOtp(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(response.user);
      toast.success('Profile updated successfully!');
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Profile update failed');
      return { success: false, error };
    }
  };

  const value = {
    user,
    roles,
    permissions,
    loading,
    isAuthenticated,
    pendingOtp,
    register,
    login,
    sendOtp,
    verifyOtp,
    cancelOtp,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;

