import React from 'react';
import { AppShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, parseISO, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function CalendarPage() {
  const { appointments, getClientById, getVehicleById, getServiceById } = useDataStore();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Календарь записей</h1>
            <p className="text-sm text-muted-foreground">Управление записями на обслуживание</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Новая запись</Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="font-semibold">{format(today, 'LLLL yyyy', { locale: ru })}</span>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Сегодня</Button>
              <Button variant="outline" size="sm">Неделя</Button>
              <Button variant="secondary" size="sm">День</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-8 border-t">
              <div className="border-r p-2 text-center text-xs text-muted-foreground">Время</div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className={cn("p-2 text-center border-r last:border-r-0", isToday(day) && "bg-accent/20")}>
                  <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: ru })}</p>
                  <p className={cn("text-lg font-semibold", isToday(day) && "text-accent")}>{format(day, 'd')}</p>
                </div>
              ))}
            </div>
            <div className="max-h-[500px] overflow-auto">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-t min-h-[60px]">
                  <div className="border-r p-2 text-xs text-muted-foreground">{`${hour}:00`}</div>
                  {weekDays.map((day) => {
                    const dayAppts = appointments.filter(a => {
                      const aptDate = parseISO(a.startAt);
                      return aptDate.getDate() === day.getDate() && aptDate.getMonth() === day.getMonth() && aptDate.getHours() === hour;
                    });
                    return (
                      <div key={day.toISOString()} className={cn("border-r last:border-r-0 p-1", isToday(day) && "bg-accent/5")}>
                        {dayAppts.map((apt) => {
                          const client = getClientById(apt.clientId);
                          return (
                            <div key={apt.id} className="bg-accent/20 border-l-2 border-accent rounded p-1 text-xs mb-1">
                              <p className="font-medium truncate">{client?.name}</p>
                              <p className="text-muted-foreground">{format(parseISO(apt.startAt), 'HH:mm')}</p>
                            </div>
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
    </AppShell>
  );
}
