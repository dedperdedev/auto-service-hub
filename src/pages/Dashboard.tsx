import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ClipboardList, 
  AlertTriangle, 
  DollarSign,
  Clock,
  ArrowRight,
  MoreHorizontal,
  User,
  Car
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { AppShell } from '@/components/layout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Mock chart data
const revenueData = [
  { month: 'Янв', revenue: 145000, bookings: 52 },
  { month: 'Фев', revenue: 162000, bookings: 58 },
  { month: 'Мар', revenue: 178000, bookings: 64 },
  { month: 'Апр', revenue: 195000, bookings: 71 },
  { month: 'Май', revenue: 210000, bookings: 78 },
  { month: 'Июн', revenue: 225000, bookings: 82 },
  { month: 'Июл', revenue: 198000, bookings: 75 },
  { month: 'Авг', revenue: 215000, bookings: 79 },
  { month: 'Сен', revenue: 232000, bookings: 85 },
  { month: 'Окт', revenue: 254000, bookings: 92 },
  { month: 'Ноя', revenue: 245000, bookings: 88 },
  { month: 'Дек', revenue: 268000, bookings: 96 },
];

const customerData = [
  { month: 'Янв', satisfied: 180, dissatisfied: 12 },
  { month: 'Фев', satisfied: 195, dissatisfied: 15 },
  { month: 'Мар', satisfied: 210, dissatisfied: 18 },
  { month: 'Апр', satisfied: 225, dissatisfied: 14 },
  { month: 'Май', satisfied: 240, dissatisfied: 16 },
  { month: 'Июн', satisfied: 255, dissatisfied: 20 },
  { month: 'Июл', satisfied: 298, dissatisfied: 24 },
  { month: 'Авг', satisfied: 275, dissatisfied: 19 },
  { month: 'Сен', satisfied: 290, dissatisfied: 21 },
  { month: 'Окт', satisfied: 310, dissatisfied: 25 },
  { month: 'Ноя', satisfied: 295, dissatisfied: 22 },
  { month: 'Дек', satisfied: 320, dissatisfied: 18 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    appointments, 
    workOrders, 
    partItems, 
    clients,
    vehicles,
    services,
    getClientById,
    getVehicleById,
    getServiceById,
    workOrderServiceLines 
  } = useDataStore();

  // Calculate KPIs
  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.startAt);
    return isToday(date) && a.status !== 'cancelled';
  });

  const openWorkOrders = workOrders.filter(wo => 
    !['closed', 'cancelled'].includes(wo.status)
  );

  const lowStockItems = partItems.filter(part => {
    const branch1Stock = part.stockByBranch['branch-1'] || 0;
    const branch1Min = part.minQtyByBranch['branch-1'] || 0;
    return branch1Stock < branch1Min;
  });

  // Calculate month revenue estimate
  const monthRevenue = workOrderServiceLines.reduce((sum, line) => {
    const wo = workOrders.find(w => w.id === line.workOrderId);
    if (wo && wo.paymentStatus !== 'unpaid') {
      return sum + (line.price * line.qty);
    }
    return sum;
  }, 0);

  // Upcoming appointments for schedule
  const upcomingAppointments = appointments
    .filter(a => {
      const date = parseISO(a.startAt);
      return (isToday(date) || isTomorrow(date)) && a.status !== 'cancelled' && a.status !== 'done';
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 8);

  // Recent work orders for table
  const recentWorkOrders = workOrders
    .filter(wo => wo.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Section: Charts + KPI Cards */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Chart */}
          <Card className="col-span-7 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Общая статистика</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Год</Button>
                <Button variant="outline" size="sm">2024</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `${(value / 1000).toFixed(0)}k ₽` : value,
                      name === 'revenue' ? 'Выручка' : 'Записи'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === 'revenue' ? 'Выручка' : 'Записи'}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--chart-bar))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--chart-line))" 
                    strokeWidth={2}
                    dot={false}
                    yAxisId={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* KPI Cards Stack */}
          <div className="col-span-2 space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Всего заработано:</p>
                <p className="text-2xl font-bold">2.8м</p>
                <span className="text-xs text-success flex items-center gap-1">
                  +486к ↑
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Всего записей:</p>
                <p className="text-2xl font-bold">9к</p>
                <span className="text-xs text-success flex items-center gap-1">
                  +284 ↑
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Отменённые записи:</p>
                <p className="text-2xl font-bold">684</p>
                <span className="text-xs text-destructive flex items-center gap-1">
                  +76 ↓
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Новые записи:</p>
                <p className="text-2xl font-bold">544</p>
                <span className="text-xs text-success flex items-center gap-1">
                  +124 ↑
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Customer Chart */}
          <Card className="col-span-3 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Клиенты</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Год</Button>
                <Button variant="outline" size="sm">2024</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={customerData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="satisfied" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="dissatisfied" stackId="a" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-success"></span>
                  <span className="text-muted-foreground">Довольны</span>
                  <span className="font-medium">298</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-warning"></span>
                  <span className="text-muted-foreground">Недовольны</span>
                  <span className="font-medium">24</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Table */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">Открытые записи</CardTitle>
              <Badge variant="secondary" className="text-xs">{openWorkOrders.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="search"
                  placeholder="Поиск..."
                  className="h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">⌘+F</span>
              </div>
              <Button variant="outline" size="sm">
                <span className="mr-1">⎙</span> Фильтры
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Компания</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Гос. номер</TableHead>
                  <TableHead>Работы</TableHead>
                  <TableHead className="w-12">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWorkOrders.map((wo, index) => {
                  const client = getClientById(wo.clientId);
                  const vehicle = getVehicleById(wo.vehicleId);
                  const woServices = workOrderServiceLines
                    .filter(sl => sl.workOrderId === wo.id)
                    .map(sl => getServiceById(sl.serviceId)?.name)
                    .filter(Boolean)
                    .join('. ');

                  return (
                    <TableRow 
                      key={wo.id}
                      className="table-row-hover cursor-pointer"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {wo.status === 'in_progress' && (
                            <span className="status-dot status-dot-warning" />
                          )}
                          {wo.status === 'waiting_parts' && (
                            <span className="status-dot status-dot-error" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(wo.createdAt), 'dd MMM, yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell className="font-medium">{client?.name || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {client?.companyName || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client?.phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">
                        {client?.email || '-'}
                      </TableCell>
                      <TableCell>{vehicle?.plate || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {woServices || '-'}
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
