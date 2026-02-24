import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, ShieldCheck, Home, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Hide public header/footer on admin dashboard for a different layout feel, 
  // but for simplicity, we will adapt it.
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin';

  if (isAdmin) {
    return <>{children}</>;
  }

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  const navLinks = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('projects'), path: '/projects', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-petrotec-500/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] opacity-50 dark:opacity-20"></div>
      </div>

      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50 glass-panel shadow-lg transition-all duration-300 rounded-2xl border border-white/20 dark:border-white/10 max-w-7xl mx-auto">
        <div className="px-4 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="https://i.ibb.co/pj75GXSs/logo.png" alt="Petrotec Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">Petrotec</span>
              <span className="text-[10px] font-semibold tracking-widest text-petrotec-600 dark:text-petrotec-400 uppercase">Projects</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200 dark:border-gray-700/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive 
                      ? 'text-petrotec-700 dark:text-white bg-white dark:bg-petrotec-600 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:border-petrotec-500 hover:text-petrotec-600 transition-all font-cairo font-bold text-sm"
              aria-label="Toggle Language"
            >
              {language === Language.EN ? 'ع' : 'En'}
            </button>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:border-petrotec-500 hover:text-petrotec-600 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link 
              to="/admin" 
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-petrotec-600 dark:hover:bg-petrotec-400 transition-colors shadow-lg shadow-gray-900/10"
              title={t('adminLogin')}
            >
                <ShieldCheck size={20}/>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-slide-down rounded-b-2xl">
            <div className="px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 p-4 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-petrotec-50 dark:hover:bg-petrotec-900/20 hover:text-petrotec-600 dark:hover:text-petrotec-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-petrotec-600">
                    <link.icon size={20} />
                  </div>
                  {link.name}
                  {isRTL ? <ChevronLeft className="mr-auto opacity-50" size={16}/> : <ChevronRight className="ml-auto opacity-50" size={16}/>}
                </Link>
              ))}
               <Link
                  to="/admin"
                  className="flex items-center gap-3 p-4 rounded-xl text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-petrotec-50 dark:hover:bg-petrotec-900/20 hover:text-petrotec-600 dark:hover:text-petrotec-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-petrotec-600">
                    <ShieldCheck size={20} />
                  </div>
                  {t('adminLogin')}
                </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12 pt-28 lg:pt-32">
        {children}
      </main>

       {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                  <img src="https://i.ibb.co/pj75GXSs/logo.png" alt="Petrotec Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200">Petrotec</span>
           </div>
           <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left flex flex-col items-center md:items-start gap-1">
             <div>© 2026 Petrotec Engineering. All rights reserved.</div>
             <div>
               {language === Language.AR ? 'App developed by Eng. ' : 'App developed by Eng. '}
               <a 
                 href="https://diyaa-sami.neocities.org/Diyaa-Sami" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-petrotec-600 hover:text-petrotec-700 dark:text-petrotec-400 dark:hover:text-petrotec-300 font-semibold hover:underline"
               >
                 {language === Language.AR ? 'Diyaa Sami' : 'Diyaa Sami'}
               </a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
};
