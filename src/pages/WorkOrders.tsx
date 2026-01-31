import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/StatusBadge';
import WorkOrderDetail from './WorkOrderDetail';

export default function WorkOrders() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workOrders, getClientById, getVehicleById, workOrderServiceLines, getServiceById } = useDataStore();
  const [search, setSearch] = useState('');

  // If we have an ID param, show the detail view
  if (id) {
    return <WorkOrderDetail />;
  }

  const filteredOrders = workOrders
    .filter(wo => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      const client = getClientById(wo.clientId);
      return (
        wo.number.toLowerCase().includes(searchLower) ||
        client?.name.toLowerCase().includes(searchLower) ||
        client?.phone.includes(search)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Заказ-наряды</h1>
            <p className="text-sm text-muted-foreground">Управление заказами на обслуживание</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Новый заказ-наряд</Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Поиск по номеру, клиенту..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Фильтры</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Номер</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Автомобиль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Оплата</TableHead>
                  <TableHead>Работы</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((wo) => {
                  const client = getClientById(wo.clientId);
                  const vehicle = getVehicleById(wo.vehicleId);
                  const services = workOrderServiceLines
                    .filter(sl => sl.workOrderId === wo.id)
                    .map(sl => getServiceById(sl.serviceId)?.name)
                    .filter(Boolean).join(', ');

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
                      <TableCell>{client?.name || '-'}</TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : '-'}
                      </TableCell>
                      <TableCell><StatusBadge status={wo.status} /></TableCell>
                      <TableCell><StatusBadge status={wo.paymentStatus} /></TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {services || '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/work-orders/${wo.id}`)}>
                              Открыть
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/clients/${wo.clientId}`)}>
                              Карточка клиента
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
