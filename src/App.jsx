import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useNotifications } from './context/NotificationContext'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SubmitServer from './pages/SubmitServer'
import RequestDetail from './pages/RequestDetail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import Blocked from './pages/Blocked'
import LoginModal from './components/LoginModal'
import { ShieldAlert, LogOut } from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, setShowLogin }) => {
  const { profile, user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return null;

  // If not logged in at all (not even as a guest)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role not allowed (e.g., Guest trying to submit)
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    // If it's a guest trying to access User/Admin/Owner pages, show login prompt
    if (profile?.role === 'Guest') {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول مطلوب</h1>
          <p className="text-muted-foreground font-medium max-w-md">لا يمكنك الوصول لهذه الصفحة كضيف. يرجى إنشاء حساب أو تسجيل الدخول للمتابعة.</p>
          <button 
            onClick={() => {
              // Trigger login modal
              window.dispatchEvent(new CustomEvent('open-login'));
            }}
            className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20"
          >
            تسجيل الدخول الآن
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-100">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">عذراً، غير مسموح لك بالدخول</h1>
        <p className="text-muted-foreground font-medium max-w-md">ليست لديك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20"
        >
          العودة للخلف
        </button>
      </div>
    );
  }

  return children;
};

function App() {
  const { profile, loading, user } = useAuth()
  const { requestPushPermission } = useNotifications()
  const { i18n } = useTranslation()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    // Event listener to open login modal from anywhere
    const handleOpenLogin = () => setShowLogin(true)
    window.addEventListener('open-login', handleOpenLogin)
    return () => window.removeEventListener('open-login', handleOpenLogin)
  }, [])

  useEffect(() => {
    // Show login modal if user is not logged in (and not even as a guest)
    // or if we want to prompt guests to sign up
    if (!loading && (!user || profile?.role === 'Guest')) {
      const hasSeenModal = sessionStorage.getItem('has_seen_login_modal')
      if (!hasSeenModal) {
        setShowLogin(true)
        sessionStorage.setItem('has_seen_login_modal', 'true')
      }
    }
  }, [loading, user, profile])

  useEffect(() => {
    // Request notification permission when user is logged in
    if (user) {
      requestPushPermission()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (profile?.role === 'Blocked') {
    return <Blocked />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/submit" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Admin', 'Owner']}>
                  <SubmitServer />
                </ProtectedRoute>
              } 
            />
            <Route path="/request/:code" element={<RequestDetail />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Admin', 'Owner', 'Guest']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<div className="flex items-center justify-center min-h-[60vh]"><button onClick={() => setShowLogin(true)} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">Open Login</button></div>} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Owner Routes */}
            <Route 
              path="/owner" 
              element={
                <ProtectedRoute allowedRoles={['Owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-border py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">ARK Server Hub</span>
            </div>
            <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto leading-relaxed">
              The ultimate destination for ARK Mobile enthusiasts to find and manage their favorite servers.
            </p>
            <div className="mt-8 pt-8 border-t border-muted flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">© 2026 ARK Server Hub. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">Terms</a>
                <a href="#" className="text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">Privacy</a>
                <a href="#" className="text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App
