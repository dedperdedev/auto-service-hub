import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { cn } from '@/lib/utils';
import { Wrench, Building2, Users } from 'lucide-react';

const settingsNav = [
  { label: 'Услуги', href: '/settings/services', icon: Wrench },
  { label: 'Филиалы', href: '/settings/branches', icon: Building2 },
  { label: 'Пользователи', href: '/settings/users', icon: Users },
];

export default function Settings() {
  const location = useLocation();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-sm text-muted-foreground">Управление системой</p>
        </div>

        <div className="flex gap-6">
          <nav className="w-48 space-y-1">
            {settingsNav.map(item => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  location.pathname === item.href 
                    ? 'bg-accent text-accent-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
