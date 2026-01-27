import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Branch, User, Service, Client, Vehicle, Appointment, 
  WorkOrder, WorkOrderServiceLine, WorkOrderPartLine, 
  PartItem, InventoryMovement 
} from './types';
import {
  branches as initialBranches,
  users as initialUsers,
  services as initialServices,
  clients as initialClients,
  vehicles as initialVehicles,
  appointments as initialAppointments,
  workOrders as initialWorkOrders,
  workOrderServiceLines as initialWOServiceLines,
  workOrderPartLines as initialWOPartLines,
  partItems as initialPartItems,
  inventoryMovements as initialInventoryMovements,
} from './mockData';

// Generate ID helper
const generateId = () => Math.random().toString(36).substring(2, 11);

interface DataStoreContextType {
  // Data
  branches: Branch[];
  users: User[];
  services: Service[];
  clients: Client[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  workOrders: WorkOrder[];
  workOrderServiceLines: WorkOrderServiceLine[];
  workOrderPartLines: WorkOrderPartLine[];
  partItems: PartItem[];
  inventoryMovements: InventoryMovement[];
  
  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Vehicle CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Appointment CRUD
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Work Order CRUD
  addWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => WorkOrder;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  
  // Work Order Service Lines
  addWorkOrderServiceLine: (line: Omit<WorkOrderServiceLine, 'id'>) => WorkOrderServiceLine;
  updateWorkOrderServiceLine: (id: string, updates: Partial<WorkOrderServiceLine>) => void;
  deleteWorkOrderServiceLine: (id: string) => void;
  
  // Work Order Part Lines
  addWorkOrderPartLine: (line: Omit<WorkOrderPartLine, 'id'>) => WorkOrderPartLine;
  updateWorkOrderPartLine: (id: string, updates: Partial<WorkOrderPartLine>) => void;
  deleteWorkOrderPartLine: (id: string) => void;
  consumePartLine: (id: string) => void;
  
  // Inventory
  addInventoryMovement: (movement: Omit<InventoryMovement, 'id' | 'createdAt'>) => InventoryMovement;
  updatePartStock: (partId: string, branchId: string, delta: number) => void;
  
  // Services CRUD
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Users CRUD
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Branches CRUD
  addBranch: (branch: Omit<Branch, 'id'>) => Branch;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  
  // Helpers
  getClientById: (id: string) => Client | undefined;
  getVehicleById: (id: string) => Vehicle | undefined;
  getServiceById: (id: string) => Service | undefined;
  getUserById: (id: string) => User | undefined;
  getBranchById: (id: string) => Branch | undefined;
  getPartById: (id: string) => PartItem | undefined;
  getVehiclesByClientId: (clientId: string) => Vehicle[];
  getWorkOrdersByClientId: (clientId: string) => WorkOrder[];
  getAppointmentsByClientId: (clientId: string) => Appointment[];
  getServiceLinesForWorkOrder: (workOrderId: string) => WorkOrderServiceLine[];
  getPartLinesForWorkOrder: (workOrderId: string) => WorkOrderPartLine[];
  
  // Convert appointment to work order
  convertAppointmentToWorkOrder: (appointmentId: string) => WorkOrder;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

let workOrderCounter = 6; // Start after seed data

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [workOrderServiceLines, setWOServiceLines] = useState<WorkOrderServiceLine[]>(initialWOServiceLines);
  const [workOrderPartLines, setWOPartLines] = useState<WorkOrderPartLine[]>(initialWOPartLines);
  const [partItems, setPartItems] = useState<PartItem[]>(initialPartItems);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(initialInventoryMovements);

  // Client CRUD
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: `client-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  // Vehicle CRUD
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${generateId()}`,
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  // Appointment CRUD
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${generateId()}`,
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Work Order CRUD
  const addWorkOrder = useCallback((workOrder: Omit<WorkOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: `wo-${generateId()}`,
      number: `WO-2024-${String(workOrderCounter++).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    };
    setWorkOrders(prev => [...prev, newWorkOrder]);
    return newWorkOrder;
  }, []);

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, ...updates, updatedAt: new Date().toISOString() } : wo
    ));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    setWOServiceLines(prev => prev.filter(sl => sl.workOrderId !== id));
    setWOPartLines(prev => prev.filter(pl => pl.workOrderId !== id));
  }, []);

  // Work Order Service Lines
  const addWorkOrderServiceLine = useCallback((line: Omit<WorkOrderServiceLine, 'id'>) => {
    const newLine: WorkOrderServiceLine = {
      ...line,
      id: `wosl-${generateId()}`,
    };
    setWOServiceLines(prev => [...prev, newLine]);
    return newLine;
  }, []);

  const updateWorkOrderServiceLine = useCallback((id: string, updates: Partial<WorkOrderServiceLine>) => {
    setWOServiceLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteWorkOrderServiceLine = useCallback((id: string) => {
    setWOServiceLines(prev => prev.filter(l => l.id !== id));
  }, []);

  // Work Order Part Lines
  const addWorkOrderPartLine = useCallback((line: Omit<WorkOrderPartLine, 'id'>) => {
    const newLine: WorkOrderPartLine = {
      ...line,
      id: `wopl-${generateId()}`,
    };
    setWOPartLines(prev => [...prev, newLine]);
    return newLine;
  }, []);

  const updateWorkOrderPartLine = useCallback((id: string, updates: Partial<WorkOrderPartLine>) => {
    setWOPartLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteWorkOrderPartLine = useCallback((id: string) => {
    setWOPartLines(prev => prev.filter(l => l.id !== id));
  }, []);

  const consumePartLine = useCallback((id: string) => {
    setWOPartLines(prev => prev.map(l => l.id === id ? { ...l, status: 'consumed' as const } : l));
  }, []);

  // Inventory
  const addInventoryMovement = useCallback((movement: Omit<InventoryMovement, 'id' | 'createdAt'>) => {
    const newMovement: InventoryMovement = {
      ...movement,
      id: `mov-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    setInventoryMovements(prev => [...prev, newMovement]);
    return newMovement;
  }, []);

  const updatePartStock = useCallback((partId: string, branchId: string, delta: number) => {
    setPartItems(prev => prev.map(p => {
      if (p.id !== partId) return p;
      const currentStock = p.stockByBranch[branchId] || 0;
      return {
        ...p,
        stockByBranch: {
          ...p.stockByBranch,
          [branchId]: Math.max(0, currentStock + delta),
        },
      };
    }));
  }, []);

  // Services CRUD
  const addService = useCallback((service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: `srv-${generateId()}`,
    };
    setServices(prev => [...prev, newService]);
    return newService;
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  }, []);

  // Users CRUD
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `user-${generateId()}`,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // Branches CRUD
  const addBranch = useCallback((branch: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...branch,
      id: `branch-${generateId()}`,
    };
    setBranches(prev => [...prev, newBranch]);
    return newBranch;
  }, []);

  const updateBranch = useCallback((id: string, updates: Partial<Branch>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBranch = useCallback((id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  }, []);

  // Helpers
  const getClientById = useCallback((id: string) => clients.find(c => c.id === id), [clients]);
  const getVehicleById = useCallback((id: string) => vehicles.find(v => v.id === id), [vehicles]);
  const getServiceById = useCallback((id: string) => services.find(s => s.id === id), [services]);
  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const getBranchById = useCallback((id: string) => branches.find(b => b.id === id), [branches]);
  const getPartById = useCallback((id: string) => partItems.find(p => p.id === id), [partItems]);
  
  const getVehiclesByClientId = useCallback((clientId: string) => 
    vehicles.filter(v => v.clientId === clientId), [vehicles]);
  
  const getWorkOrdersByClientId = useCallback((clientId: string) => 
    workOrders.filter(wo => wo.clientId === clientId), [workOrders]);
  
  const getAppointmentsByClientId = useCallback((clientId: string) => 
    appointments.filter(a => a.clientId === clientId), [appointments]);
  
  const getServiceLinesForWorkOrder = useCallback((workOrderId: string) => 
    workOrderServiceLines.filter(l => l.workOrderId === workOrderId), [workOrderServiceLines]);
  
  const getPartLinesForWorkOrder = useCallback((workOrderId: string) => 
    workOrderPartLines.filter(l => l.workOrderId === workOrderId), [workOrderPartLines]);

  // Convert appointment to work order
  const convertAppointmentToWorkOrder = useCallback((appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) throw new Error('Appointment not found');
    
    const wo = addWorkOrder({
      branchId: appointment.branchId,
      clientId: appointment.clientId,
      vehicleId: appointment.vehicleId,
      status: 'draft',
      paymentStatus: 'unpaid',
      plannedStartAt: appointment.startAt,
      plannedEndAt: appointment.endAt,
      assignedUserId: appointment.assignedUserId,
      notes: appointment.notes,
      appointmentId: appointment.id,
    });
    
    // Add service lines from appointment
    appointment.serviceIds.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        addWorkOrderServiceLine({
          workOrderId: wo.id,
          serviceId: service.id,
          qty: 1,
          price: service.basePrice,
          durationMin: service.defaultDurationMin,
        });
      }
    });
    
    // Update appointment status
    updateAppointment(appointmentId, { status: 'done' });
    
    return wo;
  }, [appointments, services, addWorkOrder, addWorkOrderServiceLine, updateAppointment]);

  const value: DataStoreContextType = {
    branches,
    users,
    services,
    clients,
    vehicles,
    appointments,
    workOrders,
    workOrderServiceLines,
    workOrderPartLines,
    partItems,
    inventoryMovements,
    addClient,
    updateClient,
    deleteClient,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrderServiceLine,
    updateWorkOrderServiceLine,
    deleteWorkOrderServiceLine,
    addWorkOrderPartLine,
    updateWorkOrderPartLine,
    deleteWorkOrderPartLine,
    consumePartLine,
    addInventoryMovement,
    updatePartStock,
    addService,
    updateService,
    deleteService,
    addUser,
    updateUser,
    deleteUser,
    addBranch,
    updateBranch,
    deleteBranch,
    getClientById,
    getVehicleById,
    getServiceById,
    getUserById,
    getBranchById,
    getPartById,
    getVehiclesByClientId,
    getWorkOrdersByClientId,
    getAppointmentsByClientId,
    getServiceLinesForWorkOrder,
    getPartLinesForWorkOrder,
    convertAppointmentToWorkOrder,
  };

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
}
