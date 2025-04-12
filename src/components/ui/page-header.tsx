
import React from 'react';

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  children, 
  className = ""
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
};

PageHeader.Title = function PageHeaderTitle({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <h2 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

PageHeader.Description = function PageHeaderDescription({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <p className={`text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};
