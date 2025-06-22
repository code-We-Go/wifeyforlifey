import React from 'react';
import { thirdFont } from '@/fonts';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Processing...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-lovely border-t-transparent`}></div>
      {text && (
        <span className={`${thirdFont.className} text-everGreen text-sm`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner; 