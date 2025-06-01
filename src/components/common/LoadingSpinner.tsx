
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Chargement...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto`}></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
