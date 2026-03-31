import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { X, Shield, Mail, Apple, User, Globe, Lock, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LoginModal = ({ onClose }) => {
  const { loginWithGoogle, loginWithApple, loginAsGuest, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleOAuthLogin = async (method) => {
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
      toast.error('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(formData.email, formData.password);
        toast.success('Logged in successfully');
      } else {
        if (!formData.username) throw new Error('Username is required');
        await signUpWithEmail(formData.email, formData.password, formData.username);
        toast.success('Check your email for confirmation link!');
      }
      onClose();
      navigate('/'); // Always redirect to Home after successful login/signup
    } catch (error) {
      console.error('Email auth error:', error);
      toast.error(error.message || 'Error during authentication');
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary text-white p-3 rounded-2xl mb-4 shadow-lg shadow-primary/20">
              <Shield size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t('auth.welcome')}</h2>
            <p className="text-muted-foreground text-sm">{mode === 'login' ? t('auth.loginPrompt') : 'Create your account to join the hub'}</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="email" 
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-muted/30 rounded-xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  <span>{mode === 'login' ? t('common.login') : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mb-6">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-border flex-grow"></div>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Social Login</span>
            <div className="h-px bg-border flex-grow"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white border border-border py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-xs"
            >
              <Globe size={16} className="text-[#4285F4]" />
              <span>Google</span>
            </button>

            <button 
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-black border border-black py-2.5 rounded-xl font-bold text-white hover:bg-black/90 transition-all text-xs"
            >
              <Apple size={16} />
              <span>Apple</span>
            </button>
          </div>

          <button 
            onClick={() => handleOAuthLogin('guest')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-muted/50 border border-muted py-3 rounded-xl font-black text-muted-foreground hover:bg-muted transition-all text-xs uppercase tracking-widest"
          >
            <User size={16} />
            <span>{t('auth.guestLogin')}</span>
          </button>
          
          <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            By joining, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;
