import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft, ShieldCheck, Database, Users } from 'lucide-react';

export const Home: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto space-y-12 relative">
      
      {/* Decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] max-w-[500px] h-[150vw] max-h-[500px] bg-petrotec-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      <div className="space-y-6 animate-fade-in relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 border border-petrotec-200 dark:border-petrotec-900/50 backdrop-blur-md mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide uppercase">Secure Stakeholder Directory</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight flex flex-col items-center gap-4">
          <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://i.ibb.co/pj75GXSs/logo.png" alt="Petrotec Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            Petrotec <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-petrotec-600 to-cyan-400">Project Hub</span>
          </div>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('welcomeSubtitle')} <br/>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">Connect with engineering teams across all active sites instantly.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10 animate-slide-up">
        <Link 
            to="/projects" 
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-petrotec-600 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-petrotec-500/40"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-petrotec-600 via-cyan-500 to-petrotec-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
                {t('viewProjects')}
                <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </span>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 pt-12 border-t border-gray-200/50 dark:border-gray-800/50 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/30 backdrop-blur-sm">
             <div className="w-12 h-12 bg-petrotec-100 dark:bg-petrotec-900/30 rounded-xl flex items-center justify-center text-petrotec-600 mb-4 mx-auto">
                <ShieldCheck size={24}/>
             </div>
             <h3 className="font-bold text-gray-900 dark:text-white mb-2">Secure Access</h3>
             <p className="text-sm text-gray-500">Password-protected project gateways.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/30 backdrop-blur-sm">
             <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-4 mx-auto">
                <Users size={24}/>
             </div>
             <h3 className="font-bold text-gray-900 dark:text-white mb-2">Team Directory</h3>
             <p className="text-sm text-gray-500">Direct contact info for site engineers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/30 backdrop-blur-sm">
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-4 mx-auto">
                <Database size={24}/>
             </div>
             <h3 className="font-bold text-gray-900 dark:text-white mb-2">Real-time Data</h3>
             <p className="text-sm text-gray-500">Always up-to-date assignment lists.</p>
          </div>
      </div>

    </div>
  );
};
