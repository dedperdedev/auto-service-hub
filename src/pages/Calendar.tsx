import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, ClipboardList } from 'lucide-react';
import { format, addDays, startOfWeek, parseISO, isToday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateAppointmentDialog } from '@/components/appointments/CreateAppointmentDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    appointments, 
    getClientById, 
    getVehicleById, 
    getServiceById,
    convertAppointmentToWorkOrder,
    updateAppointment
  } = useDataStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<Date | undefined>();
  const [createDefaultHour, setCreateDefaultHour] = useState<number | undefined>();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const goToPrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());

  const handleCellClick = (day: Date, hour: number) => {
    setCreateDefaultDate(day);
    setCreateDefaultHour(hour);
    setIsCreateOpen(true);
  };

  const handleConvertToWorkOrder = (appointmentId: string) => {
    try {
      const wo = convertAppointmentToWorkOrder(appointmentId);
      toast({
        title: 'Заказ-наряд создан',
        description: `Создан заказ-наряд ${wo.number}`,
      });
      navigate(`/work-orders/${wo.id}`);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ-наряд',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = (appointmentId: string, status: string) => {
    updateAppointment(appointmentId, { status: status as any });
    toast({ title: 'Статус обновлён' });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Календарь записей</h1>
            <p className="text-sm text-muted-foreground">Управление записями на обслуживание</p>
          </div>
          <Button onClick={() => { setCreateDefaultDate(undefined); setCreateDefaultHour(undefined); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Новая запись
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={goToPrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[180px] text-center">
                {format(weekStart, 'd', { locale: ru })} — {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: ru })}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>Сегодня</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-8 border-t">
              <div className="border-r p-2 text-center text-xs text-muted-foreground">Время</div>
              {weekDays.map((day) => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "p-2 text-center border-r last:border-r-0",
                    isToday(day) && "bg-accent/10"
                  )}
                >
                  <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: ru })}</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    isToday(day) && "text-accent"
                  )}>{format(day, 'd')}</p>
                </div>
              ))}
            </div>
            <div className="max-h-[500px] overflow-auto">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-t min-h-[70px]">
                  <div className="border-r p-2 text-xs text-muted-foreground">{`${hour}:00`}</div>
                  {weekDays.map((day) => {
                    const dayAppts = appointments.filter(a => {
                      const aptDate = parseISO(a.startAt);
                      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
                    });

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={cn(
                          "border-r last:border-r-0 p-1 cursor-pointer hover:bg-muted/30 transition-colors",
                          isToday(day) && "bg-accent/5"
                        )}
                        onClick={() => handleCellClick(day, hour)}
                      >
                        {dayAppts.map((apt) => {
                          const client = getClientById(apt.clientId);
                          const vehicle = getVehicleById(apt.vehicleId);
                          const services = apt.serviceIds
                            .map(id => getServiceById(id)?.name)
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(', ');

                          return (
                            <DropdownMenu key={apt.id}>
                              <DropdownMenuTrigger asChild>
                                <div 
                                  className={cn(
                                    "rounded p-1.5 text-xs mb-1 cursor-pointer transition-colors",
                                    apt.status === 'confirmed' && "bg-success/20 border-l-2 border-success",
                                    apt.status === 'new' && "bg-info/20 border-l-2 border-info",
                                    apt.status === 'in_progress' && "bg-warning/20 border-l-2 border-warning",
                                    apt.status === 'done' && "bg-muted border-l-2 border-muted-foreground",
                                    apt.status === 'cancelled' && "bg-destructive/10 border-l-2 border-destructive line-through",
                                    apt.status === 'no_show' && "bg-destructive/10 border-l-2 border-destructive"
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <p className="font-medium truncate">{client?.name}</p>
                                  <p className="text-muted-foreground truncate">{vehicle?.plate}</p>
                                  <p className="text-muted-foreground truncate">{format(parseISO(apt.startAt), 'HH:mm')}</p>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56">
                                <div className="p-2 border-b">
                                  <p className="font-medium">{client?.name}</p>
                                  <p className="text-xs text-muted-foreground">{vehicle?.make} {vehicle?.model} ({vehicle?.plate})</p>
                                  <p className="text-xs text-muted-foreground mt-1">{services}</p>
                                  <div className="mt-2">
                                    <StatusBadge status={apt.status} />
                                  </div>
                                </div>
                                {apt.status !== 'done' && apt.status !== 'cancelled' && (
                                  <>
                                    {apt.status === 'new' && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(apt.id, 'confirmed')}>
                                        Подтвердить
                                      </DropdownMenuItem>
                                    )}
                                    {apt.status === 'confirmed' && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(apt.id, 'in_progress')}>
                                        Начать работу
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleConvertToWorkOrder(apt.id)}>
                                      <ClipboardList className="h-4 w-4 mr-2" />
                                      Создать заказ-наряд
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                      className="text-destructive"
                                    >
                                      Отменить запись
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => navigate(`/clients/${apt.clientId}`)}>
                                  Карточка клиента
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateAppointmentDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        defaultDate={createDefaultDate}
        defaultHour={createDefaultHour}
      />
    </AppShell>
  );
}
