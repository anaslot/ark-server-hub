import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Blocked = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-red-100 overflow-hidden text-center"
      >
        <div className="h-40 bg-red-500 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
          <ShieldAlert size={80} className="text-white relative z-10 animate-bounce" />
        </div>

        <div className="p-10 space-y-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('auth.blockedMsg')}</h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Your account has been restricted due to a violation of our terms of service or a manual administrative action.
          </p>

          <div className="flex flex-col gap-4">
            <button 
              className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-50"
            >
              <MessageSquare size={20} />
              <span>Contact Support</span>
            </button>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 bg-muted/50 text-muted-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-muted hover:bg-gray-900 hover:text-white transition-all"
            >
              <LogOut size={20} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
          
          <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
            Security Reference: HUB-BLOCK-RESTRICTED
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Blocked;
