
import { FC, ReactNode } from 'react';

interface PageHeaderProps {
  children?: ReactNode;
  className?: string;
}

interface TitleProps {
  children: ReactNode;
  className?: string;
}

interface DescriptionProps {
  children: ReactNode;
  className?: string;
}

interface PageHeaderComponent extends FC<PageHeaderProps> {
  Title: FC<TitleProps>;
  Description: FC<DescriptionProps>;
}

const PageHeader: PageHeaderComponent = ({ children, className = '' }) => {
  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {children}
    </div>
  );
};

const Title: FC<TitleProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-3xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  );
};

const Description: FC<DescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};

PageHeader.Title = Title;
PageHeader.Description = Description;

export { PageHeader };
