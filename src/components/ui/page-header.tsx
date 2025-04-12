
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

// Create the components separately instead of adding them as properties
const PageHeaderTitle = ({ 
  children, 
  className = ""
}: PageHeaderTitleProps) => {
  return (
    <h2 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

const PageHeaderDescription = ({ 
  children, 
  className = ""
}: PageHeaderDescriptionProps) => {
  return (
    <p className={`text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};

export const PageHeader: React.FC<PageHeaderProps> & {
  Title: typeof PageHeaderTitle;
  Description: typeof PageHeaderDescription;
} = ({ 
  children, 
  className = ""
}: PageHeaderProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
};

// Assign the subcomponents properly
PageHeader.Title = PageHeaderTitle;
PageHeader.Description = PageHeaderDescription;
