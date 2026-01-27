import React from 'react';
import { AppShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDataStore } from '@/lib/dataStore';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function Reports() {
  const { workOrders, workOrderServiceLines, getServiceById } = useDataStore();

  const statusData = [
    { name: 'Черновик', value: workOrders.filter(w => w.status === 'draft').length },
    { name: 'В работе', value: workOrders.filter(w => w.status === 'in_progress').length },
    { name: 'Готов', value: workOrders.filter(w => w.status === 'ready').length },
    { name: 'Закрыт', value: workOrders.filter(w => w.status === 'closed').length },
  ];

  const serviceCount: Record<string, number> = {};
  workOrderServiceLines.forEach(sl => {
    const svc = getServiceById(sl.serviceId);
    if (svc) serviceCount[svc.name] = (serviceCount[svc.name] || 0) + sl.qty;
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Отчёты</h1>
          <p className="text-sm text-muted-foreground">Аналитика и статистика</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Заказ-наряды по статусам</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle>Топ услуг</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topServices} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-bar))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
