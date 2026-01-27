import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  AppointmentStatus, 
  WorkOrderStatus, 
  PaymentStatus 
} from '@/lib/types';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Appointment statuses
        new: 'bg-info/10 text-info',
        confirmed: 'bg-success/10 text-success',
        in_progress: 'bg-warning/10 text-warning',
        no_show: 'bg-destructive/10 text-destructive',
        cancelled: 'bg-muted text-muted-foreground',
        done: 'bg-success/10 text-success',
        
        // Work order statuses
        draft: 'bg-muted text-muted-foreground',
        waiting_parts: 'bg-warning/10 text-warning',
        ready: 'bg-info/10 text-info',
        closed: 'bg-success/10 text-success',
        
        // Payment statuses
        unpaid: 'bg-destructive/10 text-destructive',
        partial: 'bg-warning/10 text-warning',
        paid: 'bg-success/10 text-success',
        
        // Generic
        default: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-destructive/10 text-destructive',
        info: 'bg-info/10 text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const statusLabels: Record<string, string> = {
  // Appointment
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В работе',
  no_show: 'Неявка',
  cancelled: 'Отменена',
  done: 'Выполнена',
  
  // Work Order
  draft: 'Черновик',
  waiting_parts: 'Ожидание запчастей',
  ready: 'Готов',
  closed: 'Закрыт',
  
  // Payment
  unpaid: 'Не оплачен',
  partial: 'Частично',
  paid: 'Оплачен',
};

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: AppointmentStatus | WorkOrderStatus | PaymentStatus | string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || (status as VariantProps<typeof statusBadgeVariants>['variant']);
  const label = statusLabels[status] || status;

  return (
    <span className={cn(statusBadgeVariants({ variant: resolvedVariant }), className)}>
      {showDot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full',
          resolvedVariant === 'success' || status === 'done' || status === 'closed' || status === 'paid' || status === 'confirmed' 
            ? 'bg-success' 
            : resolvedVariant === 'warning' || status === 'in_progress' || status === 'waiting_parts' || status === 'partial'
            ? 'bg-warning'
            : resolvedVariant === 'danger' || status === 'cancelled' || status === 'no_show' || status === 'unpaid'
            ? 'bg-destructive'
            : resolvedVariant === 'info' || status === 'new' || status === 'ready'
            ? 'bg-info'
            : 'bg-muted-foreground'
        )} />
      )}
      {label}
    </span>
  );
}
