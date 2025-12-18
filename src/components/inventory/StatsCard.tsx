import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'alert';
  subtitle?: string;
}

export function StatsCard({ title, value, icon, variant = 'default', subtitle }: StatsCardProps) {
  return (
    <div className={cn(
      "glass-card rounded-xl p-6 animate-fade-in transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      variant === 'success' && "border-l-4 border-l-success",
      variant === 'warning' && "border-l-4 border-l-warning",
      variant === 'alert' && "border-l-4 border-l-alert",
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          variant === 'default' && "bg-primary/10 text-primary",
          variant === 'success' && "bg-success/10 text-success",
          variant === 'warning' && "bg-warning/10 text-warning",
          variant === 'alert' && "bg-alert/10 text-alert",
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
