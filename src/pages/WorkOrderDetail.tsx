import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Package,
  Wrench,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { WorkOrderStatus, PaymentStatus } from '@/lib/types';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workOrders, 
    getClientById, 
    getVehicleById, 
    getServiceById,
    getBranchById,
    getUserById,
    getPartById,
    services,
    partItems,
    getServiceLinesForWorkOrder,
    getPartLinesForWorkOrder,
    addWorkOrderServiceLine,
    deleteWorkOrderServiceLine,
    addWorkOrderPartLine,
    deleteWorkOrderPartLine,
    consumePartLine,
    updateWorkOrder,
    updatePartStock
  } = useDataStore();

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  const workOrder = workOrders.find(wo => wo.id === id);
  
  if (!workOrder) {
    return (
      <AppShell>
        <EmptyState
          title="Заказ-наряд не найден"
          description="Возможно, он был удалён или ссылка неверна"
          action={{ label: 'К списку заказов', onClick: () => navigate('/work-orders') }}
        />
      </AppShell>
    );
  }

  const client = getClientById(workOrder.clientId);
  const vehicle = getVehicleById(workOrder.vehicleId);
  const branch = getBranchById(workOrder.branchId);
  const assignedUser = getUserById(workOrder.assignedUserId);
  const serviceLines = getServiceLinesForWorkOrder(workOrder.id);
  const partLines = getPartLinesForWorkOrder(workOrder.id);

  const totalServices = serviceLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const totalParts = partLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const grandTotal = totalServices + totalParts;

  const handleAddService = () => {
    if (!selectedServiceId) return;
    const service = getServiceById(selectedServiceId);
    if (service) {
      addWorkOrderServiceLine({
        workOrderId: workOrder.id,
        serviceId: service.id,
        qty: 1,
        price: service.basePrice,
        durationMin: service.defaultDurationMin,
      });
    }
    setSelectedServiceId('');
    setIsAddServiceOpen(false);
  };

  const handleAddPart = () => {
    if (!selectedPartId || partQty < 1) return;
    const part = getPartById(selectedPartId);
    if (part) {
      addWorkOrderPartLine({
        workOrderId: workOrder.id,
        partItemId: part.id,
        qty: partQty,
        price: part.sellPrice,
        status: 'reserved',
      });
      updatePartStock(part.id, workOrder.branchId, -partQty);
    }
    setSelectedPartId('');
    setPartQty(1);
    setIsAddPartOpen(false);
  };

  const handleConsumePart = (lineId: string, partId: string) => {
    consumePartLine(lineId);
  };

  const handleStatusChange = (status: WorkOrderStatus) => {
    updateWorkOrder(workOrder.id, { status });
  };

  const handlePaymentChange = (paymentStatus: PaymentStatus) => {
    updateWorkOrder(workOrder.id, { paymentStatus });
  };

  const statusOptions: { value: WorkOrderStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting_parts', label: 'Ожидание запчастей' },
    { value: 'ready', label: 'Готов' },
    { value: 'closed', label: 'Закрыт' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  const paymentOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'unpaid', label: 'Не оплачен' },
    { value: 'partial', label: 'Частично' },
    { value: 'paid', label: 'Оплачен' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{workOrder.number}</h1>
              <StatusBadge status={workOrder.status} />
              <StatusBadge status={workOrder.paymentStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              Создан {format(parseISO(workOrder.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={workOrder.status} onValueChange={(v) => handleStatusChange(v as WorkOrderStatus)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={workOrder.paymentStatus} onValueChange={(v) => handlePaymentChange(v as PaymentStatus)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Клиент</p>
              <p className="font-medium">{client?.name || '-'}</p>
              <p className="text-xs text-muted-foreground">{client?.phone}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Автомобиль</p>
              <p className="font-medium">{vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}</p>
              <p className="text-xs text-muted-foreground">{vehicle?.plate}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Филиал</p>
              <p className="font-medium">{branch?.name || '-'}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Исполнитель</p>
              <p className="font-medium">{assignedUser?.name || '-'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services" className="gap-2"><Wrench className="h-4 w-4" />Услуги</TabsTrigger>
            <TabsTrigger value="parts" className="gap-2"><Package className="h-4 w-4" />Запчасти</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Услуги</CardTitle>
                <Button size="sm" onClick={() => setIsAddServiceOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Добавить
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {serviceLines.length === 0 ? (
                  <EmptyState icon={Wrench} title="Нет услуг" description="Добавьте услуги в заказ-наряд" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Услуга</TableHead>
                        <TableHead>Длительность</TableHead>
                        <TableHead>Кол-во</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceLines.map(line => {
                        const svc = getServiceById(line.serviceId);
                        return (
                          <TableRow key={line.id} className="table-row-hover">
                            <TableCell className="font-medium">{svc?.name || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{line.durationMin} мин</TableCell>
                            <TableCell>{line.qty}</TableCell>
                            <TableCell>{line.price.toLocaleString()} ₽</TableCell>
                            <TableCell className="font-medium">{(line.price * line.qty).toLocaleString()} ₽</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteWorkOrderServiceLine(line.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={4} className="text-right font-medium">Итого услуги:</TableCell>
                        <TableCell className="font-bold">{totalServices.toLocaleString()} ₽</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Запчасти и материалы</CardTitle>
                <Button size="sm" onClick={() => setIsAddPartOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Добавить
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {partLines.length === 0 ? (
                  <EmptyState icon={Package} title="Нет запчастей" description="Добавьте запчасти в заказ-наряд" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Запчасть</TableHead>
                        <TableHead>Кол-во</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partLines.map(line => {
                        const part = getPartById(line.partItemId);
                        return (
                          <TableRow key={line.id} className="table-row-hover">
                            <TableCell className="font-medium">{part?.name || '-'}</TableCell>
                            <TableCell>{line.qty}</TableCell>
                            <TableCell>{line.price.toLocaleString()} ₽</TableCell>
                            <TableCell className="font-medium">{(line.price * line.qty).toLocaleString()} ₽</TableCell>
                            <TableCell>
                              <Badge variant={line.status === 'consumed' ? 'default' : 'secondary'}>
                                {line.status === 'consumed' ? 'Списано' : 'Резерв'}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex gap-1">
                              {line.status === 'reserved' && (
                                <Button variant="outline" size="sm" onClick={() => handleConsumePart(line.id, line.partItemId)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />Списать
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteWorkOrderPartLine(line.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={3} className="text-right font-medium">Итого запчасти:</TableCell>
                        <TableCell className="font-bold">{totalParts.toLocaleString()} ₽</TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Totals */}
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Услуги</p>
                <p className="text-lg font-medium">{totalServices.toLocaleString()} ₽</p>
              </div>
              <div className="text-2xl text-muted-foreground">+</div>
              <div>
                <p className="text-sm text-muted-foreground">Запчасти</p>
                <p className="text-lg font-medium">{totalParts.toLocaleString()} ₽</p>
              </div>
              <div className="text-2xl text-muted-foreground">=</div>
              <div>
                <p className="text-sm text-muted-foreground">ИТОГО</p>
                <p className="text-2xl font-bold text-accent">{grandTotal.toLocaleString()} ₽</p>
              </div>
            </div>
            {workOrder.status === 'ready' && workOrder.paymentStatus !== 'paid' && (
              <Button onClick={() => handlePaymentChange('paid')}>
                <DollarSign className="h-4 w-4 mr-2" />Отметить оплаченным
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
            <DialogDescription>Выберите услугу из каталога</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Услуга</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger><SelectValue placeholder="Выберите услугу" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.basePrice.toLocaleString()} ₽
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>Отмена</Button>
            <Button onClick={handleAddService} disabled={!selectedServiceId}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить запчасть</DialogTitle>
            <DialogDescription>Запчасть будет зарезервирована со склада</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Запчасть</Label>
              <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                <SelectTrigger><SelectValue placeholder="Выберите запчасть" /></SelectTrigger>
                <SelectContent>
                  {partItems.map(p => {
                    const stock = p.stockByBranch[workOrder.branchId] || 0;
                    return (
                      <SelectItem key={p.id} value={p.id} disabled={stock < 1}>
                        {p.name} — {p.sellPrice.toLocaleString()} ₽ (в наличии: {stock})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Количество</Label>
              <Input type="number" min={1} value={partQty} onChange={e => setPartQty(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPartOpen(false)}>Отмена</Button>
            <Button onClick={handleAddPart} disabled={!selectedPartId}>Зарезервировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
