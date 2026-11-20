import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  loading: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loadingText = 'Loading...'
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-lovely text-creamey hover:bg-lovely/90",
    secondary: "bg-everGreen text-creamey hover:bg-everGreen/90",
    outline: "border border-lovely text-everGreen hover:bg-lovely hover:text-creamey"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={combinedClasses}
    >
      {loading ? (
        <LoadingSpinner size="sm" text={loadingText} />
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton; 