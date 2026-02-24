import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 transition-opacity duration-500 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] max-w-[500px] h-[150vw] max-h-[500px] bg-petrotec-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center animate-slide-up">
        {/* Logo Animation */}
        <div className="w-32 h-32 mb-6 relative">
          <div className="absolute inset-0 bg-petrotec-500/30 rounded-full blur-2xl animate-pulse-glow"></div>
          <img 
            src="https://i.ibb.co/pj75GXSs/logo.png" 
            alt="Petrotec Logo" 
            className="w-full h-full object-contain relative z-10 animate-float" 
          />
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center mb-2">
          Petrotec <span className="text-transparent bg-clip-text bg-gradient-to-r from-petrotec-600 to-cyan-400">Project Hub</span>
        </h1>
        
        {/* App Description */}
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs font-medium">
          {language === Language.AR ? 'الدليل الشامل لشركاء ومشاريع بتروتك' : 'Secure Stakeholder Directory for Petrotec Engineering'}
        </p>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-8 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="text-xs text-gray-400 dark:text-gray-500 flex flex-col items-center gap-1">
          <div>© 2026 Petrotec Engineering. All rights reserved.</div>
          <div>
            {language === Language.AR ? 'تم تطوير التطبيق بواسطة م. ' : 'App developed by Eng. '}
            <span className="text-petrotec-600 dark:text-petrotec-400 font-semibold">
              {language === Language.AR ? 'ضياء سامي' : 'Diyaa Sami'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
