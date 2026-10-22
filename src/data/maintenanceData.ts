import { MaintenanceItem, Order } from '../types';
import { PRODUCTS } from './products';

export interface ProductMaintenanceTemplate {
  productId: string;
  name: string;
  categoryTag: string;
  cycleIntervalDays: number;
  estimatedLifespan: string;
  componentName: string;
  actionRequired: string;
  defaultHealth: number;
  defaultDaysRemaining: number;
  notes: string;
}

export const MAINTENANCE_TEMPLATES: Record<string, ProductMaintenanceTemplate> = {
  'cerradura-inteligente': {
    productId: 'cerradura-inteligente',
    name: 'Cerradura Inteligente Aegis',
    categoryTag: 'SEGURIDAD AVANZADA',
    cycleIntervalDays: 300,
    estimatedLifespan: '10 años (mecanismo) · Baterías: 10-12 meses',
    componentName: '4x Pilas AA Litio & Cilindro biométrico',
    actionRequired: 'Reemplazo preventivo de pilas y lubricación con teflón seco del resbalón',
    defaultHealth: 18,
    defaultDaysRemaining: 12,
    notes: 'Aviso crítico de batería baja. La cerradura emitirá pitido disuasorio si cae por debajo del 15%.',
  },
  'sensor-humo': {
    productId: 'sensor-humo',
    name: 'Sensor de Humo y Gas Inteligente Aegis',
    categoryTag: 'SEGURIDAD CONTRA INCENDIOS',
    cycleIntervalDays: 180,
    estimatedLifespan: '10 años (sensor óptico EN 14604) · Celda gas: 5 años',
    componentName: 'Cámara óptica fotoeléctrica y sirena 90 dB',
    actionRequired: 'Comprobación de cámara de polvo con spray de test y autodiagnóstico acústico',
    defaultHealth: 78,
    defaultDaysRemaining: 68,
    notes: 'Revisión semestral obligatoria según directiva europea EN 14604 de prevención contra incendios.',
  },
  'camara-ip': {
    productId: 'camara-ip',
    name: 'Cámara IP de Seguridad Aegis 2K',
    categoryTag: 'VIGILANCIA Y VISIÓN NOCTURNA',
    cycleIntervalDays: 90,
    estimatedLifespan: '6 años · Rodamiento PTZ: 25.000 rotaciones',
    componentName: 'Lente óptica 2K, LEDs infrarrojos y MicroSD',
    actionRequired: 'Limpieza de lente con microfibra antiestática y verificación de integridad de tarjeta SD',
    defaultHealth: 45,
    defaultDaysRemaining: 24,
    notes: 'Revisar que la rotación 360° no tenga holguras ni suciedad en el anillo perimetral.',
  },
  'sensor-inundacion': {
    productId: 'sensor-inundacion',
    name: 'Sensor de Inundación y Fugas Aegis',
    categoryTag: 'PREVENCIÓN DE DAÑOS',
    cycleIntervalDays: 180,
    estimatedLifespan: '8 años · Batería interna sellada: 24 meses',
    componentName: 'Sondas de contacto de platino sumergibles',
    actionRequired: 'Prueba de conductividad con agua y limpieza de residuos calcáreos en sondas',
    defaultHealth: 88,
    defaultDaysRemaining: 105,
    notes: 'Ubicado en zona húmeda de cocina/fregadero. Comprobar estanqueidad de la junta IP67.',
  },
  'robot-aspirador': {
    productId: 'robot-aspirador',
    name: 'Robot Aspirador Aegis Clean Pro',
    categoryTag: 'LIMPIEZA AUTOMATIZADA',
    cycleIntervalDays: 60,
    estimatedLifespan: '5 años · Batería Li-ion 5200 mAh: 800 ciclos',
    componentName: 'Filtro HEPA H13, cepillo rotativo y mopa',
    actionRequired: 'Sustitución de filtro HEPA, desobstrucción de cepillos y limpieza de sensores LiDAR',
    defaultHealth: 32,
    defaultDaysRemaining: 18,
    notes: 'Un filtro saturado aumenta el consumo un 40% y reduce la potencia de succión en alfombras.',
  },
  'termostato-inteligente': {
    productId: 'termostato-inteligente',
    name: 'Termostato Inteligente Aegis',
    categoryTag: 'CLIMATIZACIÓN',
    cycleIntervalDays: 180,
    estimatedLifespan: '8 años · Sensor PID de precisión continua',
    componentName: 'Sonda térmica NTC y relé de caldera/aerotermia',
    actionRequired: 'Calibración estacional de temperatura con termómetro patrón y test de apertura de válvula',
    defaultHealth: 92,
    defaultDaysRemaining: 135,
    notes: 'Preparación para el cambio de temporada de calefacción a refrigeración.',
  },
  'sensor-apertura': {
    productId: 'sensor-apertura',
    name: 'Sensor de Apertura Puertas y Ventanas Aegis',
    categoryTag: 'SEGURIDAD PERIMETRAL',
    cycleIntervalDays: 240,
    estimatedLifespan: '6 años · Pila botón CR2032: 24 meses',
    componentName: 'Pila botón CR2032 y cinta magnética 3M VHB',
    actionRequired: 'Comprobación de voltaje de pila y verificación de distancia de apertura (máx 15 mm)',
    defaultHealth: 64,
    defaultDaysRemaining: 82,
    notes: 'Revisar la adherencia del adhesivo 3M ante variaciones térmicas de la carpintería.',
  },
  'enchufe-inteligente': {
    productId: 'enchufe-inteligente',
    name: 'Enchufe Inteligente Aegis',
    categoryTag: 'CONFORT Y ENERGÍA',
    cycleIntervalDays: 365,
    estimatedLifespan: '7 años · 100.000 conmutaciones de relé',
    componentName: 'Shunt de medición de potencia y varistor MOV',
    actionRequired: 'Comprobación de temperatura en bornes de contacto y calibración de telemetría en vatios',
    defaultHealth: 95,
    defaultDaysRemaining: 210,
    notes: 'Monitorea electrodomésticos de alto consumo sin calentamiento en la toma schuko.',
  },
  'foco-inteligente': {
    productId: 'foco-inteligente',
    name: 'Foco Inteligente LED Aegis RGB+W',
    categoryTag: 'ILUMINACIÓN Y CONFORT',
    cycleIntervalDays: 365,
    estimatedLifespan: '25.000 horas de uso (~6-8 años)',
    componentName: 'Driver electrónico de corriente constante & disipador',
    actionRequired: 'Limpieza de disipador térmico de aluminio y chequeo de estabilidad de señal Zigbee/Mesh',
    defaultHealth: 90,
    defaultDaysRemaining: 195,
    notes: 'Verificar que la rosca E27 esté firme y sin restos de sulfatación.',
  },
};

// Generador de fecha legible (ej: "21 Oct 2026")
export const formatSuggestedDate = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getUrgencyFromDaysAndHealth = (days: number, health: number): 'critical' | 'warning' | 'good' => {
  if (days <= 15 || health <= 25) return 'critical';
  if (days <= 45 || health <= 55) return 'warning';
  return 'good';
};

/**
 * Genera la lista de elementos del calendario de mantenimiento sincronizando
 * tanto las compras realizadas en la tienda (órdenes activas) como el equipamiento del hogar.
 */
export const generateMaintenanceItems = (orders: Order[] = []): MaintenanceItem[] => {
  const items: MaintenanceItem[] = [];
  const processedProductIds = new Set<string>();

  // 1. Añadir dispositivos comprados formalmente en los pedidos del usuario
  orders.forEach((order) => {
    order.items.forEach((orderItem) => {
      const template = MAINTENANCE_TEMPLATES[orderItem.productId];
      const prod = PRODUCTS.find((p) => p.id === orderItem.productId);
      
      const cycleDays = template ? template.cycleIntervalDays : 180;
      // Para la cerradura que ya viene en la orden de ejemplo (hace 10 meses de uso simulado):
      const defaultHealth = template ? template.defaultHealth : 50;
      const defaultDays = template ? template.defaultDaysRemaining : 30;

      const urgency = getUrgencyFromDaysAndHealth(defaultDays, defaultHealth);

      items.push({
        id: `maint-order-${order.id}-${orderItem.productId}`,
        productId: orderItem.productId,
        name: orderItem.name,
        categoryTag: orderItem.categoryTag || template?.categoryTag || 'DOMÓTICA AEGIS',
        orderId: order.id,
        purchaseDate: order.date,
        lastMaintenanceDate: 'Revisión inicial en fábrica',
        nextSuggestedDate: formatSuggestedDate(defaultDays),
        daysRemaining: defaultDays,
        estimatedLifespan: template?.estimatedLifespan || '5 años · Garantía oficial Aegis',
        cycleIntervalDays: cycleDays,
        componentName: template?.componentName || 'Batería y calibración electrónica',
        healthPercent: defaultHealth,
        urgency,
        actionRequired: template?.actionRequired || 'Inspección de diagnóstico y comprobación de enlace inalámbrico',
        status: 'pending',
        notes: template?.notes || `Dispositivo adquirido en pedido ${order.id}.`,
      });

      processedProductIds.add(orderItem.productId);
    });
  });

  // 2. Complementar con otros dispositivos esenciales del ecosistema Aegis instalados en la vivienda
  // para que el calendario esté completo con todos los sensores de seguridad, climatización y aspiración
  const defaultEcosystemIds = [
    'sensor-humo',
    'robot-aspirador',
    'camara-ip',
    'sensor-inundacion',
    'termostato-inteligente',
  ];

  defaultEcosystemIds.forEach((pid) => {
    if (processedProductIds.has(pid)) return; // Evitar duplicar si ya fue comprado en un pedido

    const template = MAINTENANCE_TEMPLATES[pid];
    if (!template) return;

    const urgency = getUrgencyFromDaysAndHealth(template.defaultDaysRemaining, template.defaultHealth);

    items.push({
      id: `maint-eco-${pid}`,
      productId: pid,
      name: template.name,
      categoryTag: template.categoryTag,
      orderId: undefined, // Instalación del sistema base
      purchaseDate: 'Instalado con Pack Hogar Conectado',
      lastMaintenanceDate: 'Inspección técnica semestral previa',
      nextSuggestedDate: formatSuggestedDate(template.defaultDaysRemaining),
      daysRemaining: template.defaultDaysRemaining,
      estimatedLifespan: template.estimatedLifespan,
      cycleIntervalDays: template.cycleIntervalDays,
      componentName: template.componentName,
      healthPercent: template.defaultHealth,
      urgency,
      actionRequired: template.actionRequired,
      status: 'pending',
      notes: template.notes,
    });
  });

  return items;
};
