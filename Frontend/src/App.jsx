import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './Components/ProductedRoute';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Product';
import AdminOrders from './pages/admin/Order';
import { Toaster } from './components/ui/sonner';
import './App.css';

function AppRoutes() {
  // ✅ Grab auth state from context
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
      />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute adminOnly>
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly>
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    // Suppress expected network errors during development only
    if (import.meta.env.DEV) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args[0]?.toString?.() || '';
        if (
          message.includes('Network Error') ||
          message.includes('Failed to fetch') ||
          message.includes('AxiosError')
        ) {
          return; // Suppress expected dev errors
        }
        originalConsoleError.apply(console, args);
      };
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <AppRoutes />
            </main>
            <Toaster position="top-right" richColors />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
