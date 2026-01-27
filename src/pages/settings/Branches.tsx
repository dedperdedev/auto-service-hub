import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDataStore } from '@/lib/dataStore';

export default function SettingsBranches() {
  const { branches } = useDataStore();
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Филиалы</CardTitle>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Название</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Часы работы</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map(b => (
              <TableRow key={b.id} className="table-row-hover">
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.address}</TableCell>
                <TableCell>{b.workingHours.open} — {b.workingHours.close}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
