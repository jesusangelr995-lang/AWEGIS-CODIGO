import { DeviceStatus } from '../types';

export interface Temp7DayPoint {
  day: string;
  fullDate: string;
  interior: number;
  maxInterior: number;
  minInterior: number;
  exterior: number;
  humidity: number;
  savings: string;
  status: string;
}

export interface ReportGenerationParams {
  deviceStatus: DeviceStatus;
  selectedRoom: 'salon' | 'dormitorio';
  targetTemp: number;
  routineMessage: string;
  history7d: Temp7DayPoint[];
}

export interface DeviceActivityReport {
  metadata: {
    titulo: string;
    sistema: string;
    vivienda: string;
    fechaGeneracion: string;
    timestamp: number;
    tarifaEnergiaKwhEur: number;
  };
  resumenDispositivos: {
    iluminacion: {
      estado: string;
      consumoActualW: number;
      modoVacacionesAleatorio: boolean;
      habitacionSimulada: string;
      modoNocheCircadiano?: boolean;
      temperaturaColorK?: number;
      nivelBrilloPct?: number;
    };
    persianas: {
      estado: string;
      posicionPct: number;
      aislamientoTermico: string;
    };
    cerraduras: {
      estado: string;
      seguridadPerimetral: string;
      protocolo: string;
    };
    camarasSeguridad: {
      estado: string;
      modoGrabacion: string;
      consumoW: number;
    };
    sensorCocina: {
      estado: string;
      nivelGasHumo: string;
      seguridadValvula: string;
    };
    climatizacion: {
      zonaSeleccionada: string;
      temperaturaActualC: number;
      temperaturaConsignaC: number;
      humedadRelativaPct: number;
      modoEcoActivo: boolean;
    };
    rutinaActiva: {
      mensajeActual: string;
      modoAhorro: boolean;
      modoVacaciones: boolean;
      modoSalirCasa: boolean;
    };
  };
  consumoHistorico7Dias: Array<{
    fecha: string;
    dia: string;
    tempInteriorC: number;
    tempMinC: number;
    tempMaxC: number;
    tempExteriorC: number;
    humedadPct: number;
    climatizacionKwh: number;
    iluminacionKwh: number;
    otrosDispositivosKwh: number;
    consumoTotalKwh: number;
    costeEstimadoEur: number;
    ahorroClimaticoPct: string;
    estadoConfort: string;
  }>;
  metricasGlobales: {
    consumoTotalPeriodoKwh: number;
    consumoMedioDiarioKwh: number;
    ahorroTotalEstimadoKwh: number;
    ahorroPorcentualPromedio: string;
    costeTotalPeriodoEur: number;
    reduccionHuellaCarbonoKgCo2: number;
    clasificacionEnergetica: string;
  };
}

export const buildReportData = (params: ReportGenerationParams): DeviceActivityReport => {
  const { deviceStatus, selectedRoom, targetTemp, routineMessage, history7d } = params;
  const now = new Date();
  const tarifaEurKwh = 0.165; // Tarifa estándar media €/kWh en España

  // Mapear cada día histórico con estimaciones precisas
  const dailyHistory = history7d.map((d, index) => {
    // Si hoy tiene modo eco activo y es el último día ("Hoy 9"), aplicamos reducción especial
    const isToday = index === history7d.length - 1;
    const isEco = isToday && deviceStatus.ecoMode;

    const baseClima = isEco ? 2.9 : (3.8 + (Math.abs(d.interior - d.exterior) * 0.22));
    const baseLuz = isEco ? 0.3 : (deviceStatus.lightsOn ? 1.4 : 0.8);
    const baseOtros = isEco ? 0.6 : 0.9;
    
    const climaKwh = Number(baseClima.toFixed(2));
    const luzKwh = Number(baseLuz.toFixed(2));
    const otrosKwh = Number(baseOtros.toFixed(2));
    const totalKwh = Number((climaKwh + luzKwh + otrosKwh).toFixed(2));
    const costeEur = Number((totalKwh * tarifaEurKwh).toFixed(2));

    return {
      fecha: d.fullDate,
      dia: d.day,
      tempInteriorC: d.interior,
      tempMinC: d.minInterior,
      tempMaxC: d.maxInterior,
      tempExteriorC: d.exterior,
      humedadPct: d.humidity,
      climatizacionKwh: climaKwh,
      iluminacionKwh: luzKwh,
      otrosDispositivosKwh: otrosKwh,
      consumoTotalKwh: totalKwh,
      costeEstimadoEur: costeEur,
      ahorroClimaticoPct: isEco ? '-35%' : d.savings,
      estadoConfort: isEco ? 'Eco Ahorro Máximo' : d.status,
    };
  });

  const totalConsumoKwh = Number(dailyHistory.reduce((acc, d) => acc + d.consumoTotalKwh, 0).toFixed(2));
  const totalCosteEur = Number(dailyHistory.reduce((acc, d) => acc + d.costeEstimadoEur, 0).toFixed(2));
  const consumoMedioDiario = Number((totalConsumoKwh / dailyHistory.length).toFixed(2));
  // Ahorro medio frente a vivienda no domotizada (~8.8 kWh/día)
  const consumoSinDomotica = 8.8 * dailyHistory.length;
  const ahorroTotalKwh = Number(Math.max(0, consumoSinDomotica - totalConsumoKwh).toFixed(2));
  // 0.25 kg de CO2 por cada kWh evitado
  const co2Reducido = Number((ahorroTotalKwh * 0.25).toFixed(2));

  return {
    metadata: {
      titulo: 'Reporte AEGIS: Actividad de Dispositivos y Consumo Energético',
      sistema: 'AEGIS Domótica Certificada - Smart Central Hub v2.4',
      vivienda: 'Residencia Principal (ID: AEG-7824)',
      fechaGeneracion: now.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      timestamp: now.getTime(),
      tarifaEnergiaKwhEur: tarifaEurKwh,
    },
    resumenDispositivos: {
      iluminacion: {
        estado: deviceStatus.lightsOn ? 'Encendidas' : 'Apagadas',
        consumoActualW: deviceStatus.ecoMode ? 0 : (deviceStatus.lightsOn ? (deviceStatus.nightModeActive ? 32 : 160) : 0),
        modoVacacionesAleatorio: Boolean(deviceStatus.vacationMode),
        habitacionSimulada: deviceStatus.vacationMode ? (deviceStatus.activeSimulationRoom || 'Salón Principal') : 'Ninguna',
        modoNocheCircadiano: Boolean(deviceStatus.nightModeActive),
        temperaturaColorK: deviceStatus.nightModeActive ? (deviceStatus.nightColorTempK ?? 2200) : (deviceStatus.dayColorTempK ?? 4500),
        nivelBrilloPct: deviceStatus.nightModeActive ? (deviceStatus.nightBrightness ?? 20) : (deviceStatus.dayBrightness ?? 85),
      },
      persianas: {
        estado: deviceStatus.shuttersClosed ? '100% Bajadas (Cerradas)' : 'Subidas (Abiertas)',
        posicionPct: deviceStatus.shuttersClosed ? 0 : 100,
        aislamientoTermico: deviceStatus.shuttersClosed ? 'Activo (Aislamiento pasivo +18% retención)' : 'Modo luz natural',
      },
      cerraduras: {
        estado: deviceStatus.lockOpen ? 'Desbloqueada' : 'Bloqueada y asegurada perimetralmente',
        seguridadPerimetral: deviceStatus.lockOpen ? 'Precaución' : 'Máxima seguridad',
        protocolo: 'AEGIS AES-256 Zigbee 3.0',
      },
      camarasSeguridad: {
        estado: deviceStatus.camerasActive ? 'Activas (Detección de personas e intrusión)' : 'Standby bajo consumo',
        modoGrabacion: deviceStatus.camerasActive ? 'Grabación continua 2K HDR' : 'Suspensión',
        consumoW: deviceStatus.camerasActive ? 18 : 2,
      },
      sensorCocina: {
        estado: deviceStatus.kitchenSensorOk && !deviceStatus.waterLeakDetected ? 'Normal (Sin fugas)' : '¡ALERTA CRÍTICA: FUGA DETECTADA!',
        nivelGasHumo: deviceStatus.smokeDetected ? '¡EMERGENCIA: Humo detectado (90 ppm)!' : '12 ppm (Seguro < 50 ppm)',
        seguridadValvula: deviceStatus.kitchenSensorOk && !deviceStatus.waterLeakDetected ? 'Corte automático armado' : 'Válvula cerrada de emergencia',
      },
      climatizacion: {
        zonaSeleccionada: selectedRoom === 'salon' ? 'Salón Principal' : 'Dormitorio Principal',
        temperaturaActualC: selectedRoom === 'salon' ? 21.8 : 20.3,
        temperaturaConsignaC: targetTemp,
        humedadRelativaPct: 46,
        modoEcoActivo: Boolean(deviceStatus.ecoMode),
      },
      rutinaActiva: {
        mensajeActual: routineMessage,
        modoAhorro: Boolean(deviceStatus.ecoMode),
        modoVacaciones: Boolean(deviceStatus.vacationMode),
        modoSalirCasa: Boolean(deviceStatus.routineActive && !deviceStatus.vacationMode && !deviceStatus.ecoMode),
      },
    },
    consumoHistorico7Dias: dailyHistory,
    metricasGlobales: {
      consumoTotalPeriodoKwh: totalConsumoKwh,
      consumoMedioDiarioKwh: consumoMedioDiario,
      ahorroTotalEstimadoKwh: ahorroTotalKwh,
      ahorroPorcentualPromedio: '-21.4%',
      costeTotalPeriodoEur: totalCosteEur,
      reduccionHuellaCarbonoKgCo2: co2Reducido,
      clasificacionEnergetica: 'A+ (Excelente)',
    },
  };
};

export const generateJSONReport = (params: ReportGenerationParams): string => {
  const data = buildReportData(params);
  return JSON.stringify(data, null, 2);
};

export const generateCSVReport = (params: ReportGenerationParams): string => {
  const data = buildReportData(params);
  const rows: string[] = [];

  // Helper para escapar valores CSV
  const esc = (val: string | number | boolean | undefined): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Sección 1: Metadata
  rows.push('# ================================================================');
  rows.push('# REPORTE AEGIS: ACTIVIDAD DE DISPOSITIVOS Y CONSUMO ENERGÉTICO');
  rows.push('# ================================================================');
  rows.push(`Título,${esc(data.metadata.titulo)}`);
  rows.push(`Sistema,${esc(data.metadata.sistema)}`);
  rows.push(`Vivienda,${esc(data.metadata.vivienda)}`);
  rows.push(`Fecha de Generación,${esc(data.metadata.fechaGeneracion)}`);
  rows.push(`Tarifa Regulada (€/kWh),${esc(data.metadata.tarifaEnergiaKwhEur)}`);
  rows.push('');

  // Sección 2: Resumen de Estado Actual de Dispositivos
  rows.push('# ----------------------------------------------------------------');
  rows.push('# RESUMEN DE ACTIVIDAD ACTUAL DE DISPOSITIVOS');
  rows.push('# ----------------------------------------------------------------');
  rows.push('Dispositivo,Estado,Detalle 1,Detalle 2,Consumo / Consigna');
  
  const dev = data.resumenDispositivos;
  rows.push([
    esc('Iluminación'),
    esc(dev.iluminacion.estado),
    esc(`Vacaciones aleatorio: ${dev.iluminacion.modoVacacionesAleatorio ? 'SÍ' : 'NO'}`),
    esc(`Habitación: ${dev.iluminacion.habitacionSimulada}`),
    esc(`${dev.iluminacion.consumoActualW} W`),
  ].join(','));

  rows.push([
    esc('Persianas Inteligentes'),
    esc(dev.persianas.estado),
    esc(`Apertura: ${dev.persianas.posicionPct}%`),
    esc(dev.persianas.aislamientoTermico),
    esc('-'),
  ].join(','));

  rows.push([
    esc('Cerradura de Entrada'),
    esc(dev.cerraduras.estado),
    esc(`Perímetro: ${dev.cerraduras.seguridadPerimetral}`),
    esc(`Protocolo: ${dev.cerraduras.protocolo}`),
    esc('-'),
  ].join(','));

  rows.push([
    esc('Cámaras de Seguridad'),
    esc(dev.camarasSeguridad.estado),
    esc(`Grabación: ${dev.camarasSeguridad.modoGrabacion}`),
    esc('Detección perimetral IA'),
    esc(`${dev.camarasSeguridad.consumoW} W`),
  ].join(','));

  rows.push([
    esc('Sensor Cocina (Gas/Humo)'),
    esc(dev.sensorCocina.estado),
    esc(`Lectura: ${dev.sensorCocina.nivelGasHumo}`),
    esc(`Válvula: ${dev.sensorCocina.seguridadValvula}`),
    esc('1.5 W'),
  ].join(','));

  rows.push([
    esc('Termostato Inteligente'),
    esc(`Consigna: ${dev.climatizacion.temperaturaConsignaC}°C`),
    esc(`Zona: ${dev.climatizacion.zonaSeleccionada} (${dev.climatizacion.temperaturaActualC}°C)`),
    esc(`Humedad: ${dev.climatizacion.humedadRelativaPct}%`),
    esc(`Modo Ahorro: ${dev.climatizacion.modoEcoActivo ? 'ACTIVO (19.5°C)' : 'Estándar'}`),
  ].join(','));

  rows.push([
    esc('Modo Inteligente Activo'),
    esc(dev.rutinaActiva.modoAhorro ? 'MODO AHORRO ECO' : dev.rutinaActiva.modoVacaciones ? 'MODO VACACIONES' : dev.rutinaActiva.modoSalirCasa ? 'MODO SALIR DE CASA' : 'MODO NORMAL'),
    esc(dev.rutinaActiva.mensajeActual),
    esc('-'),
    esc('-'),
  ].join(','));
  rows.push('');

  // Sección 3: Histórico de Consumo Energético de los Últimos 7 Días
  rows.push('# ----------------------------------------------------------------');
  rows.push('# HISTÓRICO DE CONSUMO ENERGÉTICO Y TEMPERATURAS (ÚLTIMOS 7 DÍAS)');
  rows.push('# ----------------------------------------------------------------');
  rows.push([
    'Fecha',
    'Día',
    'Temp Interior (°C)',
    'Temp Mín Interior (°C)',
    'Temp Máx Interior (°C)',
    'Temp Exterior (°C)',
    'Humedad Relativa (%)',
    'Climatización (kWh)',
    'Iluminación (kWh)',
    'Otros Dispositivos (kWh)',
    'Consumo Total (kWh)',
    'Coste Estimado (€)',
    'Ahorro Climático (%)',
    'Estado Confort'
  ].map(h => esc(h)).join(','));

  data.consumoHistorico7Dias.forEach(d => {
    rows.push([
      esc(d.fecha),
      esc(d.dia),
      esc(d.tempInteriorC),
      esc(d.tempMinC),
      esc(d.tempMaxC),
      esc(d.tempExteriorC),
      esc(d.humedadPct),
      esc(d.climatizacionKwh),
      esc(d.iluminacionKwh),
      esc(d.otrosDispositivosKwh),
      esc(d.consumoTotalKwh),
      esc(d.costeEstimadoEur),
      esc(d.ahorroClimaticoPct),
      esc(d.estadoConfort),
    ].join(','));
  });
  rows.push('');

  // Sección 4: Métricas Globales y Totales
  rows.push('# ----------------------------------------------------------------');
  rows.push('# TOTALES Y EFICIENCIA ENERGÉTICA ACUMULADA');
  rows.push('# ----------------------------------------------------------------');
  rows.push('Métrica,Valor');
  rows.push(`Consumo Total 7 Días (kWh),${esc(data.metricasGlobales.consumoTotalPeriodoKwh)}`);
  rows.push(`Consumo Medio Diario (kWh),${esc(data.metricasGlobales.consumoMedioDiarioKwh)}`);
  rows.push(`Energía Ahorrada Estimada (kWh),${esc(data.metricasGlobales.ahorroTotalEstimadoKwh)}`);
  rows.push(`Ahorro Promedio (%),${esc(data.metricasGlobales.ahorroPorcentualPromedio)}`);
  rows.push(`Coste Total Acumulado (€),${esc(data.metricasGlobales.costeTotalPeriodoEur)}`);
  rows.push(`Huella CO2 Evitada (kg CO2),${esc(data.metricasGlobales.reduccionHuellaCarbonoKgCo2)}`);
  rows.push(`Clasificación Energética Aegis,${esc(data.metricasGlobales.clasificacionEnergetica)}`);

  return rows.join('\r\n');
};

export const downloadReportFile = (
  format: 'json' | 'csv',
  params: ReportGenerationParams
): { success: boolean; filename: string } => {
  const content = format === 'json' ? generateJSONReport(params) : generateCSVReport(params);
  const mimeType = format === 'json' 
    ? 'application/json;charset=utf-8;' 
    : 'text/csv;charset=utf-8;';

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `aegis-reporte-dispositivos-energia-${dateStr}.${format}`;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
};
