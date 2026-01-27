import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardList, 
  Package, 
  BarChart3, 
  Settings,
  ChevronLeft,
  LogOut,
  Wrench,
  CarFront
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  section?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Записи', icon: Calendar, href: '/calendar' },
  { label: 'Заказ-наряды', icon: ClipboardList, href: '/work-orders' },
  { label: 'Клиенты', icon: Users, href: '/clients' },
  { label: 'Склад', icon: Package, href: '/inventory' },
  { label: 'Отчёты', icon: BarChart3, href: '/reports' },
];

const settingsNavItems: NavItem[] = [
  { label: 'Настройки', icon: Settings, href: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const link = (
      <NavLink
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'text-sidebar-foreground/80 hover:text-sidebar-foreground',
          active 
            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' 
            : 'hover:bg-sidebar-accent',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <CarFront className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">AUTOCRM</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <CarFront className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent shrink-0',
            collapsed && 'absolute -right-3 top-6 bg-sidebar rounded-full border border-sidebar-border shadow-md'
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3">
        {!collapsed && (
          <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-3 mb-2 block">
            Меню
          </span>
        )}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </div>

        <div className="mt-6">
          {!collapsed && (
            <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-3 mb-2 block">
              Настройки
            </span>
          )}
          <div className="space-y-1">
            {settingsNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn(
        'border-t border-sidebar-border p-3',
        collapsed && 'flex justify-center'
      )}>
        {user && (
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'flex-col'
          )}>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-muted capitalize">
                  {user.role === 'owner' ? 'Владелец' : user.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
                </p>
              </div>
            )}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
                Выйти
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}
