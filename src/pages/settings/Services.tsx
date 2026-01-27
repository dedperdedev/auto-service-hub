import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDataStore } from '@/lib/dataStore';

const categoryLabels: Record<string, string> = {
  sto: 'СТО', wash: 'Мойка', detailing: 'Детейлинг', tires: 'Шиномонтаж', tuning: 'Тюнинг'
};

export default function SettingsServices() {
  const { services } = useDataStore();

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Каталог услуг</CardTitle>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead>Базовая цена</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(s => (
              <TableRow key={s.id} className="table-row-hover">
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><Badge variant="outline">{categoryLabels[s.category]}</Badge></TableCell>
                <TableCell>{s.defaultDurationMin} мин</TableCell>
                <TableCell>{s.basePrice.toLocaleString()} ₽</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
