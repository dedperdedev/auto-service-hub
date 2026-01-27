import { 
  Branch, User, Service, Client, Vehicle, Appointment, 
  WorkOrder, WorkOrderServiceLine, WorkOrderPartLine, 
  PartItem, InventoryMovement 
} from './types';
import { addDays, subDays, format, addHours, startOfDay } from 'date-fns';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Branches
export const branches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Центральный СТО',
    address: 'ул. Автомобильная, 15',
    timezone: 'Europe/Moscow',
    workingHours: { open: '08:00', close: '20:00' },
  },
  {
    id: 'branch-2',
    name: 'Южный филиал',
    address: 'пр. Южный, 42',
    timezone: 'Europe/Moscow',
    workingHours: { open: '09:00', close: '19:00' },
  },
];

// Users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Олег Владимиров',
    email: 'oleg@autoservice.ru',
    phone: '+7 (999) 123-45-67',
    role: 'owner',
    branchId: 'branch-1',
    avatar: undefined,
  },
  {
    id: 'user-2',
    name: 'Анна Петрова',
    email: 'anna@autoservice.ru',
    phone: '+7 (999) 234-56-78',
    role: 'manager',
    branchId: 'branch-1',
  },
  {
    id: 'user-3',
    name: 'Сергей Иванов',
    email: 'sergey@autoservice.ru',
    phone: '+7 (999) 345-67-89',
    role: 'staff',
    branchId: 'branch-1',
  },
  {
    id: 'user-4',
    name: 'Михаил Козлов',
    email: 'mikhail@autoservice.ru',
    phone: '+7 (999) 456-78-90',
    role: 'staff',
    branchId: 'branch-2',
  },
];

// Services
export const services: Service[] = [
  // СТО
  { id: 'srv-1', category: 'sto', name: 'Замена масла', defaultDurationMin: 30, basePrice: 2500 },
  { id: 'srv-2', category: 'sto', name: 'Замена тормозных колодок', defaultDurationMin: 60, basePrice: 4500 },
  { id: 'srv-3', category: 'sto', name: 'Диагностика двигателя', defaultDurationMin: 45, basePrice: 3000 },
  { id: 'srv-4', category: 'sto', name: 'Замена фильтров', defaultDurationMin: 20, basePrice: 1500 },
  { id: 'srv-5', category: 'sto', name: 'Замена ремня ГРМ', defaultDurationMin: 180, basePrice: 12000 },
  // Мойка
  { id: 'srv-6', category: 'wash', name: 'Комплексная мойка', defaultDurationMin: 40, basePrice: 800 },
  { id: 'srv-7', category: 'wash', name: 'Экспресс-мойка', defaultDurationMin: 15, basePrice: 400 },
  { id: 'srv-8', category: 'wash', name: 'Мойка двигателя', defaultDurationMin: 30, basePrice: 1200 },
  // Детейлинг
  { id: 'srv-9', category: 'detailing', name: 'Полировка кузова', defaultDurationMin: 240, basePrice: 15000 },
  { id: 'srv-10', category: 'detailing', name: 'Химчистка салона', defaultDurationMin: 180, basePrice: 8000 },
  { id: 'srv-11', category: 'detailing', name: 'Керамическое покрытие', defaultDurationMin: 480, basePrice: 35000 },
  // Шиномонтаж
  { id: 'srv-12', category: 'tires', name: 'Сезонная замена шин', defaultDurationMin: 45, basePrice: 2000 },
  { id: 'srv-13', category: 'tires', name: 'Балансировка колёс', defaultDurationMin: 30, basePrice: 800 },
  { id: 'srv-14', category: 'tires', name: 'Ремонт прокола', defaultDurationMin: 20, basePrice: 500 },
  // Тюнинг
  { id: 'srv-15', category: 'tuning', name: 'Чип-тюнинг', defaultDurationMin: 120, basePrice: 25000 },
  { id: 'srv-16', category: 'tuning', name: 'Установка спойлера', defaultDurationMin: 90, basePrice: 8000 },
];

// Clients
export const clients: Client[] = [
  {
    id: 'client-1',
    type: 'individual',
    name: 'Андрей Борисов',
    phone: '+7 (912) 345-67-89',
    email: 'andrey.b@mail.ru',
    tags: ['VIP', 'Постоянный'],
    notes: 'Предпочитает записываться на утро',
    createdAt: subDays(new Date(), 120).toISOString(),
  },
  {
    id: 'client-2',
    type: 'company',
    name: 'ООО "Автопарк"',
    companyName: 'ООО "Автопарк"',
    phone: '+7 (495) 123-45-67',
    email: 'fleet@autopark.ru',
    tags: ['Корпоративный'],
    notes: 'Договор на обслуживание автопарка',
    createdAt: subDays(new Date(), 200).toISOString(),
  },
  {
    id: 'client-3',
    type: 'individual',
    name: 'Елена Смирнова',
    phone: '+7 (903) 456-78-90',
    email: 'elena.s@gmail.com',
    tags: ['Постоянный'],
    notes: '',
    createdAt: subDays(new Date(), 45).toISOString(),
  },
  {
    id: 'client-4',
    type: 'individual',
    name: 'Дмитрий Николаев',
    phone: '+7 (926) 567-89-01',
    email: 'dmitry.n@yandex.ru',
    tags: [],
    notes: 'Первичный клиент',
    createdAt: subDays(new Date(), 10).toISOString(),
  },
  {
    id: 'client-5',
    type: 'company',
    name: 'ИП Городской Такси',
    companyName: 'ИП Городской Такси',
    phone: '+7 (495) 987-65-43',
    email: 'taxi@city.ru',
    tags: ['Корпоративный', 'Такси'],
    notes: 'Регулярное ТО каждые 10000 км',
    createdAt: subDays(new Date(), 180).toISOString(),
  },
  {
    id: 'client-6',
    type: 'individual',
    name: 'Максим Орлов',
    phone: '+7 (915) 234-56-78',
    email: 'max.orlov@mail.ru',
    tags: ['VIP'],
    notes: 'Владелец премиум автомобилей',
    createdAt: subDays(new Date(), 90).toISOString(),
  },
  {
    id: 'client-7',
    type: 'individual',
    name: 'Ольга Федорова',
    phone: '+7 (909) 876-54-32',
    email: 'olga.f@inbox.ru',
    tags: [],
    notes: '',
    createdAt: subDays(new Date(), 5).toISOString(),
  },
  {
    id: 'client-8',
    type: 'individual',
    name: 'Виктор Громов',
    phone: '+7 (916) 111-22-33',
    email: 'victor.g@gmail.com',
    tags: ['Постоянный'],
    notes: 'Записывается через сайт',
    createdAt: subDays(new Date(), 60).toISOString(),
  },
];

// Vehicles
export const vehicles: Vehicle[] = [
  { id: 'veh-1', clientId: 'client-1', make: 'BMW', model: 'X5', year: 2021, plate: 'А123ВС77', vin: 'WBAPH5C55BA123456', mileage: 45000 },
  { id: 'veh-2', clientId: 'client-1', make: 'Mercedes', model: 'E-Class', year: 2020, plate: 'В456АС77', vin: 'WDD2130451A123456', mileage: 62000 },
  { id: 'veh-3', clientId: 'client-2', make: 'Ford', model: 'Transit', year: 2019, plate: 'С789ЕК77', vin: 'WF0XXXGCDX1234567', mileage: 120000 },
  { id: 'veh-4', clientId: 'client-2', make: 'Ford', model: 'Transit', year: 2019, plate: 'С790ЕК77', vin: 'WF0XXXGCDX1234568', mileage: 115000 },
  { id: 'veh-5', clientId: 'client-3', make: 'Toyota', model: 'Camry', year: 2022, plate: 'К111ОО77', vin: '4T1B11HK5NU123456', mileage: 28000 },
  { id: 'veh-6', clientId: 'client-4', make: 'Volkswagen', model: 'Tiguan', year: 2020, plate: 'М222НН77', vin: 'WVGZZZ5NZLW123456', mileage: 55000 },
  { id: 'veh-7', clientId: 'client-5', make: 'Skoda', model: 'Octavia', year: 2021, plate: 'Т333АА77', vin: 'TMBLD45L5K1234567', mileage: 180000 },
  { id: 'veh-8', clientId: 'client-5', make: 'Skoda', model: 'Octavia', year: 2021, plate: 'Т334АА77', vin: 'TMBLD45L5K1234568', mileage: 175000 },
  { id: 'veh-9', clientId: 'client-6', make: 'Porsche', model: '911', year: 2023, plate: 'О777ОО77', vin: 'WP0AB2A91PS123456', mileage: 8000 },
  { id: 'veh-10', clientId: 'client-7', make: 'Kia', model: 'Rio', year: 2018, plate: 'Р555РР77', vin: 'Z94CB41AAJR123456', mileage: 89000 },
  { id: 'veh-11', clientId: 'client-8', make: 'Hyundai', model: 'Tucson', year: 2022, plate: 'Х666ХХ77', vin: 'KMHJ381CGNU123456', mileage: 32000 },
];

const today = startOfDay(new Date());

// Appointments
export const appointments: Appointment[] = [
  {
    id: 'apt-1',
    branchId: 'branch-1',
    clientId: 'client-1',
    vehicleId: 'veh-1',
    serviceIds: ['srv-1', 'srv-4'],
    startAt: addHours(today, 9).toISOString(),
    endAt: addHours(today, 10).toISOString(),
    status: 'confirmed',
    notes: 'Клиент просит использовать синтетическое масло',
    assignedUserId: 'user-3',
  },
  {
    id: 'apt-2',
    branchId: 'branch-1',
    clientId: 'client-3',
    vehicleId: 'veh-5',
    serviceIds: ['srv-6'],
    startAt: addHours(today, 11).toISOString(),
    endAt: addHours(today, 12).toISOString(),
    status: 'new',
    notes: '',
    assignedUserId: 'user-3',
  },
  {
    id: 'apt-3',
    branchId: 'branch-1',
    clientId: 'client-6',
    vehicleId: 'veh-9',
    serviceIds: ['srv-9'],
    startAt: addHours(today, 14).toISOString(),
    endAt: addHours(today, 18).toISOString(),
    status: 'confirmed',
    notes: 'Премиум полировка для Porsche',
    assignedUserId: 'user-3',
  },
  {
    id: 'apt-4',
    branchId: 'branch-1',
    clientId: 'client-4',
    vehicleId: 'veh-6',
    serviceIds: ['srv-12', 'srv-13'],
    startAt: addHours(addDays(today, 1), 10).toISOString(),
    endAt: addHours(addDays(today, 1), 11.5).toISOString(),
    status: 'new',
    notes: 'Сезонная замена на зимнюю резину',
    assignedUserId: 'user-3',
  },
  {
    id: 'apt-5',
    branchId: 'branch-1',
    clientId: 'client-8',
    vehicleId: 'veh-11',
    serviceIds: ['srv-2', 'srv-3'],
    startAt: addHours(addDays(today, 1), 14).toISOString(),
    endAt: addHours(addDays(today, 1), 16).toISOString(),
    status: 'confirmed',
    notes: '',
    assignedUserId: 'user-3',
  },
  {
    id: 'apt-6',
    branchId: 'branch-2',
    clientId: 'client-5',
    vehicleId: 'veh-7',
    serviceIds: ['srv-1', 'srv-4'],
    startAt: addHours(today, 9).toISOString(),
    endAt: addHours(today, 10).toISOString(),
    status: 'in_progress',
    notes: 'Регулярное ТО',
    assignedUserId: 'user-4',
  },
];

// Work Orders
export const workOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    branchId: 'branch-1',
    clientId: 'client-2',
    vehicleId: 'veh-3',
    number: 'WO-2024-001',
    status: 'in_progress',
    paymentStatus: 'unpaid',
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: new Date().toISOString(),
    plannedStartAt: subDays(new Date(), 1).toISOString(),
    plannedEndAt: addDays(new Date(), 1).toISOString(),
    assignedUserId: 'user-3',
    notes: 'Комплексный ремонт тормозной системы',
  },
  {
    id: 'wo-2',
    branchId: 'branch-1',
    clientId: 'client-1',
    vehicleId: 'veh-2',
    number: 'WO-2024-002',
    status: 'waiting_parts',
    paymentStatus: 'partial',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    plannedStartAt: subDays(new Date(), 3).toISOString(),
    plannedEndAt: addDays(new Date(), 2).toISOString(),
    assignedUserId: 'user-3',
    notes: 'Ожидаем запчасти для ГРМ',
  },
  {
    id: 'wo-3',
    branchId: 'branch-1',
    clientId: 'client-5',
    vehicleId: 'veh-8',
    number: 'WO-2024-003',
    status: 'ready',
    paymentStatus: 'unpaid',
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: new Date().toISOString(),
    plannedStartAt: subDays(new Date(), 2).toISOString(),
    plannedEndAt: subDays(new Date(), 1).toISOString(),
    assignedUserId: 'user-3',
    notes: 'Готов к выдаче, ожидает оплаты',
  },
  {
    id: 'wo-4',
    branchId: 'branch-1',
    clientId: 'client-3',
    vehicleId: 'veh-5',
    number: 'WO-2024-004',
    status: 'closed',
    paymentStatus: 'paid',
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString(),
    plannedStartAt: subDays(new Date(), 9).toISOString(),
    plannedEndAt: subDays(new Date(), 8).toISOString(),
    assignedUserId: 'user-3',
    notes: '',
  },
  {
    id: 'wo-5',
    branchId: 'branch-2',
    clientId: 'client-7',
    vehicleId: 'veh-10',
    number: 'WO-2024-005',
    status: 'draft',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plannedStartAt: addDays(new Date(), 1).toISOString(),
    plannedEndAt: addDays(new Date(), 1).toISOString(),
    assignedUserId: 'user-4',
    notes: 'Черновик заказа',
  },
];

// Work Order Service Lines
export const workOrderServiceLines: WorkOrderServiceLine[] = [
  { id: 'wosl-1', workOrderId: 'wo-1', serviceId: 'srv-2', qty: 1, price: 4500, durationMin: 60 },
  { id: 'wosl-2', workOrderId: 'wo-1', serviceId: 'srv-3', qty: 1, price: 3000, durationMin: 45 },
  { id: 'wosl-3', workOrderId: 'wo-2', serviceId: 'srv-5', qty: 1, price: 12000, durationMin: 180 },
  { id: 'wosl-4', workOrderId: 'wo-3', serviceId: 'srv-1', qty: 1, price: 2500, durationMin: 30 },
  { id: 'wosl-5', workOrderId: 'wo-3', serviceId: 'srv-4', qty: 1, price: 1500, durationMin: 20 },
  { id: 'wosl-6', workOrderId: 'wo-4', serviceId: 'srv-6', qty: 1, price: 800, durationMin: 40 },
  { id: 'wosl-7', workOrderId: 'wo-4', serviceId: 'srv-10', qty: 1, price: 8000, durationMin: 180 },
];

// Part Items
export const partItems: PartItem[] = [
  {
    id: 'part-1',
    sku: 'OIL-5W40-5L',
    name: 'Моторное масло 5W-40 5L',
    category: 'Масла',
    unit: 'шт',
    costPrice: 2800,
    sellPrice: 3500,
    stockByBranch: { 'branch-1': 15, 'branch-2': 8 },
    minQtyByBranch: { 'branch-1': 10, 'branch-2': 5 },
  },
  {
    id: 'part-2',
    sku: 'FILT-OIL-001',
    name: 'Масляный фильтр универсальный',
    category: 'Фильтры',
    unit: 'шт',
    costPrice: 350,
    sellPrice: 550,
    stockByBranch: { 'branch-1': 25, 'branch-2': 18 },
    minQtyByBranch: { 'branch-1': 15, 'branch-2': 10 },
  },
  {
    id: 'part-3',
    sku: 'FILT-AIR-001',
    name: 'Воздушный фильтр универсальный',
    category: 'Фильтры',
    unit: 'шт',
    costPrice: 450,
    sellPrice: 700,
    stockByBranch: { 'branch-1': 20, 'branch-2': 12 },
    minQtyByBranch: { 'branch-1': 10, 'branch-2': 8 },
  },
  {
    id: 'part-4',
    sku: 'BRAKE-PAD-FR',
    name: 'Тормозные колодки передние',
    category: 'Тормозная система',
    unit: 'комплект',
    costPrice: 2200,
    sellPrice: 3200,
    stockByBranch: { 'branch-1': 8, 'branch-2': 5 },
    minQtyByBranch: { 'branch-1': 6, 'branch-2': 4 },
  },
  {
    id: 'part-5',
    sku: 'BRAKE-PAD-RR',
    name: 'Тормозные колодки задние',
    category: 'Тормозная система',
    unit: 'комплект',
    costPrice: 1800,
    sellPrice: 2600,
    stockByBranch: { 'branch-1': 6, 'branch-2': 4 },
    minQtyByBranch: { 'branch-1': 5, 'branch-2': 3 },
  },
  {
    id: 'part-6',
    sku: 'BELT-GRM-001',
    name: 'Ремень ГРМ',
    category: 'Двигатель',
    unit: 'шт',
    costPrice: 3500,
    sellPrice: 5000,
    stockByBranch: { 'branch-1': 3, 'branch-2': 2 },
    minQtyByBranch: { 'branch-1': 4, 'branch-2': 3 },
  },
  {
    id: 'part-7',
    sku: 'COOLANT-5L',
    name: 'Антифриз 5L',
    category: 'Жидкости',
    unit: 'шт',
    costPrice: 800,
    sellPrice: 1200,
    stockByBranch: { 'branch-1': 12, 'branch-2': 8 },
    minQtyByBranch: { 'branch-1': 8, 'branch-2': 5 },
  },
  {
    id: 'part-8',
    sku: 'WIPER-SET',
    name: 'Комплект щёток стеклоочистителя',
    category: 'Кузов',
    unit: 'комплект',
    costPrice: 600,
    sellPrice: 950,
    stockByBranch: { 'branch-1': 10, 'branch-2': 6 },
    minQtyByBranch: { 'branch-1': 5, 'branch-2': 4 },
  },
];

// Work Order Part Lines
export const workOrderPartLines: WorkOrderPartLine[] = [
  { id: 'wopl-1', workOrderId: 'wo-1', partItemId: 'part-4', qty: 1, price: 3200, status: 'consumed' },
  { id: 'wopl-2', workOrderId: 'wo-2', partItemId: 'part-6', qty: 1, price: 5000, status: 'reserved' },
  { id: 'wopl-3', workOrderId: 'wo-3', partItemId: 'part-1', qty: 1, price: 3500, status: 'consumed' },
  { id: 'wopl-4', workOrderId: 'wo-3', partItemId: 'part-2', qty: 1, price: 550, status: 'consumed' },
];

// Inventory Movements
export const inventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    branchId: 'branch-1',
    partItemId: 'part-1',
    type: 'in',
    qty: 20,
    createdAt: subDays(new Date(), 30).toISOString(),
    note: 'Поставка от поставщика',
  },
  {
    id: 'mov-2',
    branchId: 'branch-1',
    partItemId: 'part-4',
    type: 'consume',
    qty: 1,
    relatedWorkOrderId: 'wo-1',
    createdAt: subDays(new Date(), 1).toISOString(),
    note: 'Списание на заказ-наряд WO-2024-001',
  },
  {
    id: 'mov-3',
    branchId: 'branch-1',
    partItemId: 'part-6',
    type: 'reserve',
    qty: 1,
    relatedWorkOrderId: 'wo-2',
    createdAt: subDays(new Date(), 4).toISOString(),
    note: 'Резерв для заказ-наряда WO-2024-002',
  },
  {
    id: 'mov-4',
    branchId: 'branch-1',
    partItemId: 'part-1',
    type: 'consume',
    qty: 1,
    relatedWorkOrderId: 'wo-3',
    createdAt: subDays(new Date(), 2).toISOString(),
    note: 'Списание на заказ-наряд WO-2024-003',
  },
  {
    id: 'mov-5',
    branchId: 'branch-1',
    partItemId: 'part-2',
    type: 'consume',
    qty: 1,
    relatedWorkOrderId: 'wo-3',
    createdAt: subDays(new Date(), 2).toISOString(),
    note: 'Списание на заказ-наряд WO-2024-003',
  },
];

// Helper function to get service by id
export const getServiceById = (id: string) => services.find(s => s.id === id);
export const getClientById = (id: string) => clients.find(c => c.id === id);
export const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getBranchById = (id: string) => branches.find(b => b.id === id);
export const getPartById = (id: string) => partItems.find(p => p.id === id);
