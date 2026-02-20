import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  ...props
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} {...props}>
      <Loader2 className={cn('animate-spin text-blue-600', sizes[size])} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}
