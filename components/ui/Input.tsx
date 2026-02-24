import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

export const Input: React.FC<InputProps> = ({ icon, label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-petrotec-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full rounded-xl border border-gray-200 dark:border-gray-700 
            bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm
            text-gray-900 dark:text-white placeholder-gray-400
            shadow-sm transition-all duration-200
            focus:border-petrotec-500 focus:ring-2 focus:ring-petrotec-500/20 focus:bg-white dark:focus:bg-gray-900
            disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500
            ${icon ? 'ltr:pl-10 rtl:pr-10' : 'px-4'} py-2.5
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};
