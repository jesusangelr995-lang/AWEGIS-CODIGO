export interface Product {
  id: string;
  name: string;
  categoryTag: string;
  description: string;
  price: number;
  image: string;
  features?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type NavTab = 'inicio' | 'tienda' | 'instalaciones' | 'planes' | 'asistente' | 'contacto' | 'pedidos';

export interface DeviceStatus {
  lightsOn: boolean;
  lockOpen: boolean;
  camerasActive: boolean;
  kitchenSensorOk: boolean;
  smokeDetected?: boolean;
  intruderDetected?: boolean;
  waterLeakDetected?: boolean;
  gasLeakDetected?: boolean;
  routineActive: boolean;
  vacationMode: boolean;
  ecoMode?: boolean;
  shuttersClosed: boolean;
  activeSimulationRoom?: string;
  simulationStep?: number;
  // Configuración de Modo Noche & Ritmo Circadiano
  nightModeActive?: boolean;
  nightModeAutoSchedule?: boolean;
  nightModeStartHour?: number; // Ej: 22 (22:00)
  nightModeEndHour?: number; // Ej: 7 (07:00)
  nightBrightness?: number; // Ej: 20 (%)
  nightColorTempK?: number; // Ej: 2200 (K - Ámbar cálido)
  dayBrightness?: number; // Ej: 85 (%)
  dayColorTempK?: number; // Ej: 4500 (K - Blanco neutro confort)
  simulatedSystemHour?: number | null; // null para reloj real del sistema, o número para pruebas
}

export type PaymentMethod = 'card' | 'bizum' | 'paypal' | 'transfer';

export interface OrderItem {
  productId: string;
  name: string;
  categoryTag: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  timestamp: number;
  items: OrderItem[];
  total: number;
  status: 'Pagado' | 'En preparación' | 'Enviado' | 'Entregado';
  paymentMethod: PaymentMethod;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface MaintenanceItem {
  id: string;
  productId: string;
  name: string;
  categoryTag: string;
  orderId?: string;
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextSuggestedDate: string;
  daysRemaining: number;
  estimatedLifespan: string;
  cycleIntervalDays: number;
  componentName: string;
  healthPercent: number; // 0-100%
  urgency: 'critical' | 'warning' | 'good';
  actionRequired: string;
  status: 'pending' | 'completed' | 'scheduled';
  scheduledDate?: string;
  notes?: string;
}

export type DeviceCategory = 'security' | 'lighting' | 'climate' | 'safety' | 'appliances';

export interface SmartDeviceDef {
  id: string;
  name: string;
  category: DeviceCategory;
  categoryLabel: string;
  description: string;
  icon: string;
  popular?: boolean;
  storeProductId?: string;
  defaultBrand?: string;
}

export interface AutomationRecommendation {
  id: string;
  title: string;
  category: 'security' | 'energy' | 'comfort' | 'safety';
  categoryLabel: string;
  description: string;
  trigger: string;
  action: string;
  condition?: string;
  requiredDeviceIds: string[];
  optionalDeviceIds?: string[];
  energySavingPct?: number; // e.g. 24 -> 24%
  securityScoreBoost?: number; // e.g. 35 -> +35%
  comfortScoreBoost?: number; // e.g. 30 -> +30%
  recommendedStoreProductId?: string;
  recommendedStoreProductName?: string;
  recommendedStoreProductPrice?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider?: 'google' | 'email';
}
