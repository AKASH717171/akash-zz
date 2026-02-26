import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('luxe_token');
        const savedUser = localStorage.getItem('luxe_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Verify token is still valid by fetching profile
          try {
            const response = await api.get('/auth/profile');
            if (response.data.success) {
              setUser(response.data.user);
              localStorage.setItem('luxe_user', JSON.stringify(response.data.user));
            }
          } catch (err) {
            // Token invalid — clear everything
            console.log('Token verification failed, logging out');
            localStorage.removeItem('luxe_token');
            localStorage.removeItem('luxe_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('luxe_token');
        localStorage.removeItem('luxe_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    initAuth();
  }, []);

  // Listen for forced logout events (from axios interceptor)
  useEffect(() => {
    const handleForcedLogout = (event) => {
      console.log('Forced logout:', event.detail?.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
    };

    window.addEventListener('auth:logout', handleForcedLogout);

    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout);
    };
  }, []);

  // Register
  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('luxe_token', newToken);
        localStorage.setItem('luxe_user', JSON.stringify(newUser));

        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  // Login
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('luxe_token', newToken);
        localStorage.setItem('luxe_user', JSON.stringify(newUser));

        if (rememberMe) {
          localStorage.setItem('luxe_remember_email', email);
        } else {
          localStorage.removeItem('luxe_remember_email');
        }

        return { success: true, message: response.data.message, user: newUser };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    }
  };

  // Admin Login
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('luxe_token', newToken);
        localStorage.setItem('luxe_user', JSON.stringify(newUser));

        return { success: true, message: response.data.message, user: newUser };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Admin login failed.',
      };
    }
  };

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('luxe_token');
    localStorage.removeItem('luxe_user');
  }, []);

  // Update Profile
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('luxe_user', JSON.stringify(response.data.user));
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile.',
      };
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (response.data.success) {
        // Update token since password change invalidates old tokens
        if (response.data.token) {
          setToken(response.data.token);
          localStorage.setItem('luxe_token', response.data.token);
        }
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password.',
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('luxe_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    initialCheckDone,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    register,
    login,
    adminLogin,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;