import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Shield, ArrowLeft, ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Language } from '../../types';
import { supabase } from '../../src/lib/supabase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isRTL, t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', email)
            .eq('password', password) // In a real app, use hashing!
            .single();

        if (error || !data) {
            setError('Invalid email or password');
        } else {
            localStorage.setItem('adminToken', data.id); // Use ID as token for now
            navigate('/admin/dashboard');
        }
    } catch (err) {
        console.error("Login error:", err);
        setError('An error occurred during login');
    } finally {
        setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 relative">
       {/* Top Controls */}
       <div className="absolute top-6 right-6 flex gap-2">
         <button
           onClick={toggleLanguage}
           className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-petrotec-600 shadow-sm border border-gray-200 dark:border-gray-700"
         >
           <Globe size={18} />
         </button>
         <button
           onClick={toggleTheme}
           className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-petrotec-600 shadow-sm border border-gray-200 dark:border-gray-700"
         >
           {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
         </button>
       </div>

       {/* Back Button */}
       <Link 
         to="/" 
         className="absolute top-6 left-6 ltr:left-6 rtl:right-6 rtl:left-auto flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-petrotec-600 dark:hover:text-petrotec-400 transition-colors font-medium bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700"
       >
        <Arrow size={18} />
        <span>{t('home')}</span>
      </Link>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fade-in">
        <div className="flex justify-center mb-4">
           <div className="bg-petrotec-600 p-3 rounded-lg shadow-lg shadow-petrotec-500/30">
             <Shield className="text-white" size={32} />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">{t('adminLogin')}</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">Sign in to manage projects and teams</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <Input 
               type="email" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)}
               placeholder="admin@petrotec.com"
               required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <Input 
               type="password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
               required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full shadow-petrotec-500/20" disabled={loading}>
              {loading ? 'Logging in...' : t('submit')}
          </Button>
        </form>
      </div>
    </div>
  );
};