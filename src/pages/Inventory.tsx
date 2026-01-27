import React from 'react';
import { AppShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, AlertTriangle, Plus } from 'lucide-react';
import { useDataStore } from '@/lib/dataStore';

export default function Inventory() {
  const { partItems } = useDataStore();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Склад</h1>
            <p className="text-sm text-muted-foreground">Управление запчастями и материалами</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Добавить позицию</Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Поиск по названию, SKU..." className="pl-9" />
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Ед.</TableHead>
                  <TableHead>Себестоимость</TableHead>
                  <TableHead>Цена продажи</TableHead>
                  <TableHead>Остаток (Центр.)</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partItems.map((part) => {
                  const stock = part.stockByBranch['branch-1'] || 0;
                  const minQty = part.minQtyByBranch['branch-1'] || 0;
                  const isLow = stock < minQty;

                  return (
                    <TableRow key={part.id} className="table-row-hover">
                      <TableCell className="font-mono text-xs">{part.sku}</TableCell>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell><Badge variant="outline">{part.category}</Badge></TableCell>
                      <TableCell>{part.unit}</TableCell>
                      <TableCell className="text-muted-foreground">{part.costPrice.toLocaleString()} ₽</TableCell>
                      <TableCell>{part.sellPrice.toLocaleString()} ₽</TableCell>
                      <TableCell className={isLow ? 'text-destructive font-medium' : ''}>{stock} {part.unit}</TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Мало</Badge>
                        ) : (
                          <Badge variant="secondary">В норме</Badge>
                        )}
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
