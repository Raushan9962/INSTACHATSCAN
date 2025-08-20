import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Define the base URL for the API.
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';

// Create a dedicated axios instance for authentication requests.
// This prevents global side effects that could affect other parts of your app.
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Create the authentication context.
const AuthContext = createContext();

// Custom hook to access the auth context.
// It ensures that the hook is used within the AuthProvider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// The main AuthProvider component.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // Define the logout function here to make it accessible to the interceptor.
  const logout = async () => {
    try {
      // Attempt to invalidate the token on the server.
      await authAxios.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and state regardless of API response.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // Check for an existing token on app load.
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
        try {
          // Set the token and retrieve user data.
          setToken(savedToken);
          // Set the Authorization header for the initial request.
          authAxios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await authAxios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // If auth check fails, clear all tokens and log out.
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Set up request and response interceptors on the dedicated axios instance.
  useEffect(() => {
    // Add Authorization header to every request before it's sent.
    const requestInterceptor = authAxios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Handle token refresh for 401 Unauthorized errors.
    const responseInterceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Check for 401 status and prevent infinite loops with _retry flag.
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              // Attempt to get a new access token using the refresh token.
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              setToken(accessToken);

              // Update the header on the original request and re-send it.
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
              return authAxios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // If token refresh fails, log out the user.
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptors on unmount.
    return () => {
      authAxios.interceptors.request.eject(requestInterceptor);
      authAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout]);

  // Login function.
  const login = async (email, password) => {
    try {
      const response = await authAxios.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setUser(user);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Registration function.
  const register = async (name, email, password) => {
    try {
      const response = await authAxios.post('/auth/register', { name, email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setUser(user);

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
