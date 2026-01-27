import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Car, 
  Plus, 
  Edit2, 
  ClipboardList,
  Calendar as CalendarIcon,
  MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

const vehicleSchema = z.object({
  make: z.string().min(2, 'Укажите марку'),
  model: z.string().min(1, 'Укажите модель'),
  year: z.number().min(1980).max(2030),
  plate: z.string().min(4, 'Укажите госномер'),
  vin: z.string().optional(),
  mileage: z.number().min(0).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getClientById, 
    getVehiclesByClientId, 
    getWorkOrdersByClientId,
    getAppointmentsByClientId,
    addVehicle,
    getServiceById
  } = useDataStore();
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  const client = getClientById(id || '');
  const vehicles = getVehiclesByClientId(id || '');
  const workOrders = getWorkOrdersByClientId(id || '');
  const appointments = getAppointmentsByClientId(id || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      vin: '',
      mileage: 0,
    },
  });

  if (!client) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <EmptyState
            title="Клиент не найден"
            description="Возможно, клиент был удалён или ссылка неверна"
            action={{
              label: 'К списку клиентов',
              onClick: () => navigate('/clients'),
            }}
          />
        </div>
      </AppShell>
    );
  }

  const onSubmitVehicle = (data: VehicleFormData) => {
    addVehicle({
      clientId: client.id,
      make: data.make,
      model: data.model,
      year: data.year,
      plate: data.plate,
      vin: data.vin || '',
      mileage: data.mileage || 0,
    });
    reset();
    setIsAddVehicleOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
              {client.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {client.type === 'company' ? client.companyName : 'Физическое лицо'}
            </p>
          </div>
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Телефон</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{client.email || '-'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Автомобили</p>
                <p className="font-medium">{vehicles.length} шт.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles">Автомобили</TabsTrigger>
            <TabsTrigger value="orders">Заказ-наряды</TabsTrigger>
            <TabsTrigger value="appointments">Записи</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Автомобили клиента</CardTitle>
                <Button size="sm" onClick={() => setIsAddVehicleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {vehicles.length === 0 ? (
                  <EmptyState
                    icon={Car}
                    title="Нет автомобилей"
                    description="Добавьте первый автомобиль клиента"
                    action={{
                      label: 'Добавить автомобиль',
                      onClick: () => setIsAddVehicleOpen(true),
                    }}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Марка / Модель</TableHead>
                        <TableHead>Год</TableHead>
                        <TableHead>Госномер</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Пробег</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="table-row-hover">
                          <TableCell className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{vehicle.plate}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {vehicle.vin || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {vehicle.mileage.toLocaleString()} км
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>История заказ-нарядов</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать заказ-наряд
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {workOrders.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="Нет заказ-нарядов"
                    description="У клиента пока нет истории обслуживания"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Номер</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Оплата</TableHead>
                        <TableHead>Автомобиль</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrders.map((wo) => {
                        const vehicle = vehicles.find(v => v.id === wo.vehicleId);
                        return (
                          <TableRow 
                            key={wo.id} 
                            className="table-row-hover cursor-pointer"
                            onClick={() => navigate(`/work-orders/${wo.id}`)}
                          >
                            <TableCell className="font-medium">{wo.number}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(parseISO(wo.createdAt), 'dd.MM.yyyy', { locale: ru })}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={wo.status} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={wo.paymentStatus} />
                            </TableCell>
                            <TableCell>
                              {vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Записи</CardTitle>
                <Button size="sm" onClick={() => navigate('/calendar')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать запись
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {appointments.length === 0 ? (
                  <EmptyState
                    icon={CalendarIcon}
                    title="Нет записей"
                    description="У клиента пока нет записей на обслуживание"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Дата и время</TableHead>
                        <TableHead>Услуги</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Автомобиль</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => {
                        const vehicle = vehicles.find(v => v.id === apt.vehicleId);
                        const aptServices = apt.serviceIds
                          .map(id => getServiceById(id)?.name)
                          .filter(Boolean)
                          .join(', ');
                        
                        return (
                          <TableRow key={apt.id} className="table-row-hover">
                            <TableCell className="font-medium">
                              {format(parseISO(apt.startAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {aptServices || '-'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={apt.status} />
                            </TableCell>
                            <TableCell>
                              {vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить автомобиль</DialogTitle>
            <DialogDescription>
              Укажите данные автомобиля клиента
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitVehicle)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Марка</Label>
                <Input
                  id="make"
                  placeholder="BMW"
                  {...register('make')}
                  className={errors.make ? 'border-destructive' : ''}
                />
                {errors.make && (
                  <p className="text-xs text-destructive">{errors.make.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Модель</Label>
                <Input
                  id="model"
                  placeholder="X5"
                  {...register('model')}
                  className={errors.model ? 'border-destructive' : ''}
                />
                {errors.model && (
                  <p className="text-xs text-destructive">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Год выпуска</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2021"
                  {...register('year', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Госномер</Label>
                <Input
                  id="plate"
                  placeholder="А123ВС77"
                  {...register('plate')}
                  className={errors.plate ? 'border-destructive' : ''}
                />
                {errors.plate && (
                  <p className="text-xs text-destructive">{errors.plate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN (необязательно)</Label>
              <Input
                id="vin"
                placeholder="WBAPH5C55BA123456"
                {...register('vin')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Пробег (км)</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="50000"
                {...register('mileage', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
