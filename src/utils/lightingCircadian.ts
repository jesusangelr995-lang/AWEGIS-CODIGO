import { DeviceStatus } from '../types';

export interface CircadianLightingState {
  isNightMode: boolean;
  effectiveBrightness: number;
  effectiveColorTempK: number;
  effectiveColorHex: string;
  effectiveColorLabel: string;
  currentHour: number;
  isAutoScheduled: boolean;
  isSimulatedTime: boolean;
}

/**
 * Determina si una hora específica está dentro del rango nocturno.
 * Ejemplo típico: de 22:00 a 07:00 (cruza medianoche).
 */
export const isHourInNightRange = (hour: number, startHour: number = 22, endHour: number = 7): boolean => {
  if (startHour > endHour) {
    // Cruza medianoche: e.g. 22:00 a 07:00
    return hour >= startHour || hour < endHour;
  } else {
    // Mismo día: e.g. 01:00 a 06:00
    return hour >= startHour && hour < endHour;
  }
};

/**
 * Convierte temperatura Kelvin de iluminación LED a color HEX representativo y agradable.
 */
export const kelvinToHex = (kelvin: number): string => {
  if (kelvin <= 2000) return '#ff8200'; // Luz vela ultra cálida
  if (kelvin <= 2300) return '#ffa53b'; // Ámbar relajante circadiano (2200K)
  if (kelvin <= 2800) return '#ffc272'; // Blanco cálido estándar (2700K)
  if (kelvin <= 3500) return '#ffe4ba'; // Blanco suave
  if (kelvin <= 4500) return '#fff1e0'; // Blanco neutro confort
  if (kelvin <= 5500) return '#f4f8ff'; // Luz diurna pura
  return '#d0e7ff'; // Blanco frío energizante (6500K)
};

/**
 * Obtiene la etiqueta amigable de la temperatura de color.
 */
export const getKelvinLabel = (kelvin: number): string => {
  if (kelvin <= 2000) return 'Luz Vela Profunda (1800K)';
  if (kelvin <= 2300) return 'Ámbar Circadiano Noche (2200K)';
  if (kelvin <= 2800) return 'Blanco Cálido Acogedor (2700K)';
  if (kelvin <= 3500) return 'Blanco Suave (3200K)';
  if (kelvin <= 4500) return 'Blanco Neutro Confort (4500K)';
  return 'Luz Diurna Energizante (6000K)';
};

/**
 * Calcula el estado circadiano completo de la iluminación según el estado del dispositivo y horario del sistema.
 */
export const getCircadianLightingState = (status: DeviceStatus): CircadianLightingState => {
  const now = new Date();
  const realHour = now.getHours();
  const currentHour = typeof status.simulatedSystemHour === 'number' 
    ? status.simulatedSystemHour 
    : realHour;

  const isSimulatedTime = typeof status.simulatedSystemHour === 'number';
  const isAutoScheduled = status.nightModeAutoSchedule !== false;

  const startHour = status.nightModeStartHour ?? 22;
  const endHour = status.nightModeEndHour ?? 7;

  // Si está en modo automático, depende del horario; si no, del toggle manual nightModeActive
  const shouldBeNight = isAutoScheduled 
    ? isHourInNightRange(currentHour, startHour, endHour)
    : Boolean(status.nightModeActive);

  // Forzar si nightModeActive está explícitamente activado sin horario o viceversa
  const isNightMode = shouldBeNight;

  const nightBrightness = status.nightBrightness ?? 20;
  const nightColorTempK = status.nightColorTempK ?? 2200;
  const dayBrightness = status.dayBrightness ?? 85;
  const dayColorTempK = status.dayColorTempK ?? 4500;

  const effectiveBrightness = isNightMode ? nightBrightness : dayBrightness;
  const effectiveColorTempK = isNightMode ? nightColorTempK : dayColorTempK;
  const effectiveColorHex = kelvinToHex(effectiveColorTempK);
  const effectiveColorLabel = getKelvinLabel(effectiveColorTempK);

  return {
    isNightMode,
    effectiveBrightness,
    effectiveColorTempK,
    effectiveColorHex,
    effectiveColorLabel,
    currentHour,
    isAutoScheduled,
    isSimulatedTime,
  };
};
