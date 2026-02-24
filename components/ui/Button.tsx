import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-petrotec-600 to-petrotec-500 hover:from-petrotec-700 hover:to-petrotec-600 text-white shadow-lg shadow-petrotec-500/30 border border-transparent",
    secondary: "bg-white dark:bg-dark-surface text-gray-900 dark:text-white border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
    outline: "border-2 border-petrotec-500 text-petrotec-600 dark:text-petrotec-400 hover:bg-petrotec-50 dark:hover:bg-petrotec-900/20",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="ltr:mr-2 rtl:ml-2">{icon}</span>}
      {children}
    </button>
  );
};
