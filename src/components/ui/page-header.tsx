
import React from 'react';

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  children, 
  className = ""
}: PageHeaderProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
};

// Define subcomponents as properties on PageHeader
PageHeader.Title = function PageHeaderTitle({ 
  children, 
  className = ""
}: PageHeaderTitleProps) {
  return (
    <h2 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

PageHeader.Description = function PageHeaderDescription({ 
  children, 
  className = ""
}: PageHeaderDescriptionProps) {
  return (
    <p className={`text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};
