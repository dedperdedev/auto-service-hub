import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours, setHours, setMinutes, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useDataStore } from '@/lib/dataStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  branchId: z.string().min(1, 'Выберите филиал'),
  clientId: z.string().min(1, 'Выберите клиента'),
  vehicleId: z.string().min(1, 'Выберите автомобиль'),
  assignedUserId: z.string().min(1, 'Выберите исполнителя'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultHour?: number;
}

export function CreateAppointmentDialog({ open, onOpenChange, defaultDate, defaultHour }: CreateAppointmentDialogProps) {
  const { 
    branches, 
    clients, 
    vehicles, 
    users, 
    services, 
    addAppointment,
    getVehiclesByClientId 
  } = useDataStore();

  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate || new Date());
  const [selectedHour, setSelectedHour] = useState<number>(defaultHour || 9);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      branchId: branches[0]?.id || '',
      clientId: '',
      vehicleId: '',
      assignedUserId: '',
      notes: '',
    },
  });

  const selectedClientId = watch('clientId');
  const selectedBranchId = watch('branchId');

  const clientVehicles = useMemo(() => {
    if (!selectedClientId) return [];
    return getVehiclesByClientId(selectedClientId);
  }, [selectedClientId, getVehiclesByClientId]);

  const branchUsers = useMemo(() => {
    return users.filter(u => u.branchId === selectedBranchId && u.role !== 'owner');
  }, [users, selectedBranchId]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, svcId) => {
      const svc = services.find(s => s.id === svcId);
      return sum + (svc?.defaultDurationMin || 0);
    }, 0);
  }, [selectedServices, services]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const onSubmit = (data: AppointmentFormData) => {
    if (selectedServices.length === 0) return;

    const startAt = setMinutes(setHours(startOfDay(selectedDate), selectedHour), 0);
    const endAt = addHours(startAt, Math.ceil(totalDuration / 60));

    addAppointment({
      branchId: data.branchId,
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      serviceIds: selectedServices,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: 'new',
      notes: data.notes || '',
      assignedUserId: data.assignedUserId,
    });

    reset();
    setSelectedServices([]);
    onOpenChange(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
          <DialogDescription>Создайте запись на обслуживание</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Branch */}
          <div className="space-y-2">
            <Label>Филиал</Label>
            <Select value={watch('branchId')} onValueChange={(v) => setValue('branchId', v)}>
              <SelectTrigger className={errors.branchId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Выберите филиал" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label>Клиент</Label>
            <Select 
              value={watch('clientId')} 
              onValueChange={(v) => {
                setValue('clientId', v);
                setValue('vehicleId', '');
              }}
            >
              <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle */}
          <div className="space-y-2">
            <Label>Автомобиль</Label>
            <Select 
              value={watch('vehicleId')} 
              onValueChange={(v) => setValue('vehicleId', v)}
              disabled={!selectedClientId}
            >
              <SelectTrigger className={errors.vehicleId ? 'border-destructive' : ''}>
                <SelectValue placeholder={selectedClientId ? "Выберите автомобиль" : "Сначала выберите клиента"} />
              </SelectTrigger>
              <SelectContent>
                {clientVehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.plate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Время начала</Label>
              <Select value={String(selectedHour)} onValueChange={(v) => setSelectedHour(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={h} value={String(h)}>{`${h}:00`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Услуги</Label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {services.map(svc => (
                <div key={svc.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={svc.id}
                    checked={selectedServices.includes(svc.id)}
                    onCheckedChange={() => toggleService(svc.id)}
                  />
                  <label htmlFor={svc.id} className="text-sm flex-1 cursor-pointer">
                    {svc.name}
                  </label>
                  <span className="text-xs text-muted-foreground">{svc.defaultDurationMin} мин</span>
                </div>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Выбрано: {selectedServices.length} услуг, ≈{totalDuration} мин
              </p>
            )}
          </div>

          {/* Assigned User */}
          <div className="space-y-2">
            <Label>Исполнитель</Label>
            <Select value={watch('assignedUserId')} onValueChange={(v) => setValue('assignedUserId', v)}>
              <SelectTrigger className={errors.assignedUserId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Выберите исполнителя" />
              </SelectTrigger>
              <SelectContent>
                {branchUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Заметки</Label>
            <Textarea {...register('notes')} placeholder="Дополнительная информация..." rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={selectedServices.length === 0}>Создать запись</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
