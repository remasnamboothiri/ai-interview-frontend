import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Loading = ({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
      {text && <p className="text-sm text-neutral-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export const LoadingSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] rounded ${className}`}
    />
  );
};
