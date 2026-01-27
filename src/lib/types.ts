// Core entity types for the Auto Service CRM

export type UserRole = 'owner' | 'manager' | 'staff';

export type ServiceCategory = 'sto' | 'wash' | 'detailing' | 'tires' | 'tuning';

export type ClientType = 'individual' | 'company';

export type AppointmentStatus = 'new' | 'confirmed' | 'in_progress' | 'no_show' | 'cancelled' | 'done';

export type WorkOrderStatus = 'draft' | 'in_progress' | 'waiting_parts' | 'ready' | 'closed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type InventoryMovementType = 'in' | 'reserve' | 'consume' | 'return' | 'adjust';

export interface Branch {
  id: string;
  name: string;
  address: string;
  timezone: string;
  workingHours: {
    open: string; // "09:00"
    close: string; // "18:00"
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  avatar?: string;
}

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  defaultDurationMin: number;
  basePrice: number;
}

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
}

export interface Appointment {
  id: string;
  branchId: string;
  clientId: string;
  vehicleId: string;
  serviceIds: string[];
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string;
  assignedUserId: string;
}

export interface WorkOrder {
  id: string;
  branchId: string;
  clientId: string;
  vehicleId: string;
  number: string;
  status: WorkOrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  plannedStartAt: string;
  plannedEndAt: string;
  assignedUserId: string;
  notes: string;
  appointmentId?: string;
}

export interface WorkOrderServiceLine {
  id: string;
  workOrderId: string;
  serviceId: string;
  qty: number;
  price: number;
  durationMin: number;
}

export interface WorkOrderPartLine {
  id: string;
  workOrderId: string;
  partItemId: string;
  qty: number;
  price: number;
  status: 'reserved' | 'consumed';
}

export interface PartItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stockByBranch: Record<string, number>;
  minQtyByBranch: Record<string, number>;
}

export interface InventoryMovement {
  id: string;
  branchId: string;
  partItemId: string;
  type: InventoryMovementType;
  qty: number;
  relatedWorkOrderId?: string;
  createdAt: string;
  note: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'users.manage'
  | 'reports.view'
  | 'settings.manage'
  | 'inventory.manage'
  | 'workorders.manage'
  | 'appointments.manage'
  | 'clients.manage';

// Role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    'users.manage',
    'reports.view',
    'settings.manage',
    'inventory.manage',
    'workorders.manage',
    'appointments.manage',
    'clients.manage',
  ],
  manager: [
    'reports.view',
    'settings.manage',
    'inventory.manage',
    'workorders.manage',
    'appointments.manage',
    'clients.manage',
  ],
  staff: [
    'workorders.manage',
    'appointments.manage',
    'clients.manage',
  ],
};
