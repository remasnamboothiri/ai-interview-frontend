import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = ({ children, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`border-b border-neutral-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-semibold text-secondary ${className}`} {...props}>
      {children}
    </h3>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div
      className={`border-t border-neutral-200 pt-4 mt-4 flex items-center justify-end gap-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
