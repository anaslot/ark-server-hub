import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { X, Shield, Mail, Apple, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginModal = ({ onClose }) => {
  const { loginWithGoogle, loginWithApple, loginAsGuest } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (method) => {
    setLoading(true);
    try {
      if (method === 'google') await loginWithGoogle();
      if (method === 'apple') await loginWithApple();
      if (method === 'guest') {
        loginAsGuest();
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary text-white p-3 rounded-2xl mb-4 shadow-lg shadow-primary/20">
              <Shield size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t('auth.welcome')}</h2>
            <p className="text-muted-foreground">{t('auth.loginPrompt')}</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border py-3.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Globe size={20} className="text-[#4285F4]" />
              <span>{t('auth.googleLogin')}</span>
            </button>

            <button 
              onClick={() => handleLogin('apple')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-black border-2 border-black py-3.5 rounded-xl font-semibold text-white hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Apple size={20} />
              <span>{t('auth.appleLogin')}</span>
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-border flex-grow"></div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">OR</span>
              <div className="h-px bg-border flex-grow"></div>
            </div>

            <button 
              onClick={() => handleLogin('guest')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-primary/10 border-2 border-primary/20 py-3.5 rounded-xl font-semibold text-primary hover:bg-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <User size={20} />
              <span>{t('auth.guestLogin')}</span>
            </button>
          </div>
          
          <p className="mt-8 text-center text-xs text-muted-foreground">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;
