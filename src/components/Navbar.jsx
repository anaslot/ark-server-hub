import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, LogOut, User, Settings, Shield, Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLng = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLng);
    localStorage.setItem('lng', newLng);
  };

  const navLinks = [
    { name: t('common.home'), path: '/' },
    { name: t('common.submit'), path: '/submit', roles: ['User', 'Admin', 'Owner'] },
    { name: t('common.admin'), path: '/admin', roles: ['Admin', 'Owner'] },
    { name: t('common.owner'), path: '/owner', roles: ['Owner'] },
  ];

  const filteredLinks = navLinks.filter(link => 
    !link.roles || (profile && link.roles.includes(profile.role))
  );

  const roleColors = {
    'Guest': 'bg-gray-100 text-gray-800',
    'User': 'bg-blue-100 text-blue-800',
    'Admin': 'bg-purple-100 text-purple-800',
    'Owner': 'bg-red-100 text-red-800'
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Shield size={24} />
          </div>
          <span className="text-xl font-black text-primary tracking-tight">{t('common.appName')}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {filteredLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="text-muted-foreground hover:text-primary transition-colors font-black text-xs uppercase tracking-widest"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border shadow-sm active:scale-95"
          >
            <Globe size={18} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-widest">{i18n.language}</span>
          </button>

          {profile ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all shadow-sm border ${showNotifications ? 'bg-primary text-white border-primary' : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-border overflow-hidden z-[100]"
                    >
                      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest">{t('common.notifications')}</h3>
                        <button onClick={markAllAsRead} className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">{t('common.markAllRead')}</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={`p-4 border-b border-muted hover:bg-primary/5 transition-colors cursor-pointer group ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                            >
                              <p className={`text-sm leading-relaxed ${!n.read ? 'font-black text-gray-900' : 'text-muted-foreground'}`}>{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/50 mt-2 font-bold">{new Date(n.created_at).toLocaleTimeString()}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <Bell size={32} className="mx-auto mb-2 text-muted-foreground/20" />
                            <p className="text-xs font-bold text-muted-foreground">{t('common.noNotifications')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-all bg-muted/30 p-1.5 pr-4 rounded-2xl border border-border shadow-sm active:scale-95 group">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-xl border border-border object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                    <User size={18} />
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black leading-none text-gray-900 mb-1">{profile.username}</p>
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm ${roleColors[profile.role]}`}>
                    {profile.role}
                  </span>
                </div>
              </Link>
              
              <button 
                onClick={logout}
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                title={t('common.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="bg-primary text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              {t('common.login')}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border absolute top-16 left-0 right-0 py-6 px-4 shadow-2xl flex flex-col gap-4 overflow-hidden z-40"
          >
            {filteredLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors font-black text-xs uppercase tracking-widest py-3 border-b border-muted"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center justify-between py-2">
              <button 
                onClick={() => { toggleLanguage(); setIsOpen(false); }}
                className="flex items-center gap-2 text-muted-foreground font-black text-xs uppercase tracking-widest"
              >
                <Globe size={18} />
                <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
              </button>
              
              {profile && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${roleColors[profile.role]}`}>
                    {profile.role}
                  </span>
                </div>
              )}
            </div>
            
            {profile ? (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-center gap-2 bg-muted/50 text-muted-foreground py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-muted"
                >
                  <User size={18} />
                  <span>{t('common.profile')}</span>
                </Link>
                <button 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100"
                >
                  <LogOut size={18} />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 w-full"
              >
                {t('common.login')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
