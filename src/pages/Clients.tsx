import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  User as UserIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDataStore } from '@/lib/dataStore';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClientType } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';

const clientSchema = z.object({
  type: z.enum(['individual', 'company']),
  name: z.string().min(2, 'Минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер'),
  email: z.string().email('Введите корректный email').or(z.literal('')),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function Clients() {
  const navigate = useNavigate();
  const { clients, vehicles, addClient, getVehiclesByClientId } = useDataStore();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'individual',
      name: '',
      phone: '',
      email: '',
      companyName: '',
      notes: '',
    },
  });

  const clientType = watch('type');

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const searchLower = search.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchLower))
    );
  }, [clients, search]);

  const onSubmit = (data: ClientFormData) => {
    addClient({
      type: data.type as ClientType,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      companyName: data.type === 'company' ? data.companyName : undefined,
      tags: [],
      notes: data.notes || '',
    });
    reset();
    setIsCreateOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Клиенты</h1>
            <p className="text-sm text-muted-foreground">
              Управление базой клиентов и их автомобилями
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новый клиент
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по имени, телефону, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            {filteredClients.length === 0 ? (
              <EmptyState
                icon={UserIcon}
                title="Клиенты не найдены"
                description={search ? 'Попробуйте изменить параметры поиска' : 'Добавьте первого клиента'}
                action={!search ? {
                  label: 'Добавить клиента',
                  onClick: () => setIsCreateOpen(true),
                } : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Клиент</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Автомобили</TableHead>
                    <TableHead>Теги</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const clientVehicles = getVehiclesByClientId(client.id);
                    
                    return (
                      <TableRow
                        key={client.id}
                        className="table-row-hover cursor-pointer"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                              {client.type === 'company' ? (
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              {client.companyName && (
                                <p className="text-xs text-muted-foreground">{client.companyName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {client.type === 'company' ? 'Компания' : 'Физ. лицо'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {client.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {client.email || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {clientVehicles.length} авто
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {client.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {client.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{client.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(client.createdAt), 'dd.MM.yyyy', { locale: ru })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                Открыть карточку
                              </DropdownMenuItem>
                              <DropdownMenuItem>Создать запись</DropdownMenuItem>
                              <DropdownMenuItem>Создать заказ-наряд</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый клиент</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом клиенте
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Тип клиента</Label>
              <Select
                value={clientType}
                onValueChange={(value) => setValue('type', value as 'individual' | 'company')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Физическое лицо</SelectItem>
                  <SelectItem value="company">Компания</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {clientType === 'company' ? 'Контактное лицо' : 'ФИО'}
              </Label>
              <Input
                id="name"
                placeholder={clientType === 'company' ? 'Иван Иванов' : 'Иван Иванов'}
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {clientType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  placeholder='ООО "Компания"'
                  {...register('companyName')}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация о клиенте..."
                {...register('notes')}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
