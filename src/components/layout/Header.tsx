import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Календарь записей',
  '/clients': 'Клиенты',
  '/work-orders': 'Заказ-наряды',
  '/inventory': 'Склад',
  '/reports': 'Отчёты',
  '/settings': 'Настройки',
  '/settings/services': 'Услуги',
  '/settings/branches': 'Филиалы',
  '/settings/users': 'Пользователи',
};

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [];
  
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const title = routeTitles[currentPath];
    
    if (title) {
      if (index === parts.length - 1) {
        breadcrumbs.push({ label: title });
      } else {
        breadcrumbs.push({ label: title, href: currentPath });
      }
    } else if (part.match(/^[a-z0-9-]+$/i)) {
      // Dynamic segment like ID
      breadcrumbs.push({ label: 'Детали' });
    }
  });
  
  return breadcrumbs;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Left: Breadcrumbs */}
      <div>
        {breadcrumbs.length > 1 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
        )}
      </div>

      {/* Right: Search + Notifications */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск..."
            className="w-64 pl-9 h-9 bg-secondary border-0"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
            ⌘+F
          </kbd>
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
