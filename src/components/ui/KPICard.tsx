import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  iconColor = 'text-accent',
  className 
}: KPICardProps) {
  return (
    <Card className={cn('shadow-card hover:shadow-card-hover transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {change && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  change.isPositive !== false ? 'text-success' : 'text-destructive'
                )}>
                  {change.isPositive !== false ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change.value > 0 ? '+' : ''}{change.value}
                  {change.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('p-2 rounded-lg bg-secondary', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
