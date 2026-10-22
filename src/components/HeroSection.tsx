import React, { useState, useMemo } from 'react';
import { 
  Shield, Sparkles, CheckCircle2, Lightbulb, Lock, Unlock, 
  Video, VideoOff, Droplets, Palmtree, Blinds, Mic, Sun, Moon,
  Thermometer, TrendingUp, TrendingDown, ArrowUpRight,
  Calendar, Layers, Activity, Leaf, ZapOff,
  Download, FileSpreadsheet, FileCode, Check, Eye, X, FileText,
  Zap, ShieldCheck, Home, Key, Wifi, Cpu, Star, Clock, Truck, Award,
  AlertTriangle, Bell, BellRing, Flame, UserX, Siren, Volume2, VolumeX, ShieldAlert,
  Wrench, CalendarClock, Battery, BatteryWarning, Sliders, Compass, User
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NavTab, DeviceStatus, Order, AuthUser } from '../types';
import { downloadReportFile, generateJSONReport, generateCSVReport } from '../utils/reportGenerator';
import { MaintenanceCalendar } from './MaintenanceCalendar';
import { generateMaintenanceItems } from '../data/maintenanceData';
import { NightModeConfigModal } from './NightModeConfigModal';
import { getCircadianLightingState, kelvinToHex } from '../utils/lightingCircadian';

interface HeroSectionProps {
  onNavigate: (tab: NavTab) => void;
  deviceStatus: DeviceStatus;
  setDeviceStatus: React.Dispatch<React.SetStateAction<DeviceStatus>>;
  onOpenLiliDemo?: () => void;
  orders?: Order[];
  addToast?: (type: 'success' | 'info' | 'warning' | 'critical' | 'emergency', title: string, description?: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

interface TempDataPoint {
  hour: string;
  salon: number;
  dormitorio: number;
  humidity: number;
  comfort: string;
}

interface Temp7DayPoint {
  day: string;
  fullDate: string;
  interior: number;      // Temp media interior confort
  maxInterior: number;   // Máxima diurna interior
  minInterior: number;   // Mínima nocturna interior
  exterior: number;      // Sensor exterior
  humidity: number;      // % Humedad media
  savings: string;       // % Ahorro climatización inteligente
  status: string;        // Estado estabilidad
}

const TEMPERATURE_24H_DATA: TempDataPoint[] = [
  { hour: '00:00', salon: 20.4, dormitorio: 19.6, humidity: 48, comfort: 'Confort' },
  { hour: '02:00', salon: 19.9, dormitorio: 19.2, humidity: 49, comfort: 'Confort' },
  { hour: '04:00', salon: 19.4, dormitorio: 18.8, humidity: 50, comfort: 'Ahorro nocturno' },
  { hour: '06:00', salon: 19.6, dormitorio: 19.0, humidity: 49, comfort: 'Encendido' },
  { hour: '08:00', salon: 20.8, dormitorio: 19.8, humidity: 47, comfort: 'Confort' },
  { hour: '10:00', salon: 21.4, dormitorio: 20.2, humidity: 46, comfort: 'Óptima' },
  { hour: '12:00', salon: 21.9, dormitorio: 20.5, humidity: 45, comfort: 'Óptima' },
  { hour: '14:00', salon: 22.5, dormitorio: 20.9, humidity: 44, comfort: 'Pico diurno' },
  { hour: '16:00', salon: 22.8, dormitorio: 21.2, humidity: 44, comfort: 'Pico diurno' },
  { hour: '18:00', salon: 22.2, dormitorio: 20.8, humidity: 45, comfort: 'Óptima' },
  { hour: '20:00', salon: 21.9, dormitorio: 20.4, humidity: 46, comfort: 'Confort' },
  { hour: '22:00', salon: 21.5, dormitorio: 20.0, humidity: 47, comfort: 'Confort' },
  { hour: 'Ahora', salon: 21.8, dormitorio: 20.3, humidity: 46, comfort: 'Óptima' },
];

const TEMPERATURE_7D_DATA: Temp7DayPoint[] = [
  { day: 'Sáb 3', fullDate: 'Sáb 3 Octubre', interior: 21.2, maxInterior: 22.4, minInterior: 19.2, exterior: 14.1, humidity: 48, savings: '-16%', status: 'Estabilidad 99%' },
  { day: 'Dom 4', fullDate: 'Dom 4 Octubre', interior: 21.5, maxInterior: 22.8, minInterior: 19.5, exterior: 15.2, humidity: 47, savings: '-18%', status: 'Confort 100%' },
  { day: 'Lun 5', fullDate: 'Lun 5 Octubre', interior: 21.1, maxInterior: 22.2, minInterior: 19.0, exterior: 13.4, humidity: 52, savings: '-22%', status: 'Aislamiento alto' },
  { day: 'Mar 6', fullDate: 'Mar 6 Octubre', interior: 21.6, maxInterior: 22.6, minInterior: 19.5, exterior: 14.8, humidity: 46, savings: '-19%', status: 'Confort 100%' },
  { day: 'Mié 7', fullDate: 'Mié 7 Octubre', interior: 21.8, maxInterior: 23.1, minInterior: 19.8, exterior: 16.5, humidity: 44, savings: '-15%', status: 'Confort 100%' },
  { day: 'Jue 8', fullDate: 'Jue 8 Octubre', interior: 21.4, maxInterior: 22.5, minInterior: 19.2, exterior: 13.8, humidity: 49, savings: '-21%', status: 'Aislamiento alto' },
  { day: 'Hoy 9', fullDate: 'Hoy 9 Octubre', interior: 21.8, maxInterior: 22.8, minInterior: 19.4, exterior: 15.1, humidity: 46, savings: '-18%', status: 'En directo' },
];

// Tooltip para el gráfico de 7 días
const Custom7DayTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Temp7DayPoint }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#051c3d]/95 backdrop-blur-md border border-cyan-500/40 p-3 rounded-xl shadow-2xl text-xs space-y-2 z-50 min-w-[210px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5">
          <div>
            <span className="text-white font-bold block">{data.fullDate}</span>
            <span className="text-[10px] text-slate-400">Tendencia semanal Aegis</span>
          </div>
          <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-700/60">
            {data.status}
          </span>
        </div>

        <div className="space-y-1.5 text-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              Interior vivienda:
            </span>
            <strong className="text-white text-sm">{data.interior}°C</strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pl-3.5">
            <span>Rango diario:</span>
            <span className="text-slate-300">
              <span className="text-sky-400">{data.minInterior}°</span> / <span className="text-amber-400">{data.maxInterior}°C</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#818cf8]" />
              Sensor exterior:
            </span>
            <strong className="text-indigo-200">{data.exterior}°C</strong>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            🌱 Ahorro: {data.savings}
          </span>
          <span className="text-slate-400">Humedad: {data.humidity}% HR</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTempTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: TempDataPoint }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tempValue = payload[0].value;
    return (
      <div className="bg-[#051c3d]/95 backdrop-blur-md border border-cyan-500/40 px-3 py-2 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <div className="flex items-center justify-between gap-4 border-b border-slate-700/60 pb-1">
          <span className="text-slate-300 font-semibold">{label}</span>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
            {data.comfort}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            Temperatura:
          </span>
          <span className="font-extrabold text-white text-sm">{tempValue}°C</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>Humedad relativa:</span>
          <span className="text-sky-300 font-medium">{data.humidity}% HR</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      watts: number;
      percent: number;
      color: string;
      detail: string;
    };
  }>;
}> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#051c3d]/95 backdrop-blur-md border border-cyan-500/50 px-3 py-2 rounded-xl shadow-xl text-xs space-y-1 z-50 text-white min-w-[170px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <span className="text-[11px] font-black font-mono text-cyan-300">
            {data.percent}%
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-200 pt-0.5">
          <span className="text-slate-400">Potencia:</span>
          <span className="font-extrabold text-white font-mono">{data.watts} W</span>
        </div>
        <div className="text-[10px] text-slate-400 border-t border-slate-700/50 pt-1 leading-tight">
          {data.detail}
        </div>
      </div>
    );
  }
  return null;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  deviceStatus,
  setDeviceStatus,
  onOpenLiliDemo,
  orders = [],
  addToast,
  currentUser,
  onOpenAuth,
}) => {
  const [nightModeModalOpen, setNightModeModalOpen] = useState(false);
  const circadianLighting = useMemo(() => getCircadianLightingState(deviceStatus), [deviceStatus]);
  const [routineMessage, setRoutineMessage] = useState('Modo «Salir de casa» activado');
  const [animatingRoutine, setAnimatingRoutine] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<'salon' | 'dormitorio'>('salon');
  const [targetTemp, setTargetTemp] = useState<number>(21.5);
  const [timeframe, setTimeframe] = useState<'7d' | '24h'>('7d');
  const [showExteriorLayer, setShowExteriorLayer] = useState<boolean>(true);
  const [activeProfileTab, setActiveProfileTab] = useState<'habitual' | 'airbnb' | 'segunda'>('habitual');

  // Cálculo e integración del Calendario de Mantenimiento Preventivo
  const maintenanceItems = useMemo(() => generateMaintenanceItems(orders), [orders]);
  const urgentMaintItems = useMemo(
    () => maintenanceItems.filter((i) => (i.urgency === 'critical' || i.urgency === 'warning') && i.status !== 'completed'),
    [maintenanceItems]
  );
  const topUrgentMaint = urgentMaintItems[0] || maintenanceItems[0];

  const scrollToMaintenance = () => {
    const el = document.getElementById('calendario-mantenimiento');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Estado del Sistema de Notificaciones Críticas en Tiempo Real sincronizado con deviceStatus
  const smokeDetected = Boolean(deviceStatus.smokeDetected);
  const intruderDetected = Boolean(deviceStatus.intruderDetected);
  const waterLeakDetected = !deviceStatus.kitchenSensorOk || Boolean(deviceStatus.waterLeakDetected);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState<boolean>(false);
  const [soundAlertMuted, setSoundAlertMuted] = useState<boolean>(false);
  const [lastCriticalAlertTime, setLastCriticalAlertTime] = useState<string>('En tiempo real');

  // Conteo de alertas críticas activas (Humo, Intrusos y Fugas de Agua)
  const criticalAlertsCount = (smokeDetected ? 1 : 0) + (intruderDetected ? 1 : 0) + (waterLeakDetected ? 1 : 0);

  // Activación / simulación de alerta de humo
  const toggleSmokeAlarm = () => {
    setDeviceStatus((prev) => {
      const next = !prev.smokeDetected;
      if (next) {
        setLastCriticalAlertTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertsDropdownOpen(true);
      }
      return { ...prev, smokeDetected: next };
    });
  };

  // Activación / simulación de alerta de intrusión
  const toggleIntruderAlarm = () => {
    setDeviceStatus((prev) => {
      const next = !prev.intruderDetected;
      if (next) {
        setLastCriticalAlertTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertsDropdownOpen(true);
      }
      return { ...prev, intruderDetected: next };
    });
  };

  // Activación / simulación de alerta de fuga de agua
  const toggleWaterLeakAlarm = () => {
    setDeviceStatus((prev) => {
      const isLeaking = !prev.kitchenSensorOk || Boolean(prev.waterLeakDetected);
      const next = !isLeaking;
      if (next) {
        setLastCriticalAlertTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertsDropdownOpen(true);
      }
      return {
        ...prev,
        kitchenSensorOk: !next,
        waterLeakDetected: next,
      };
    });
  };

  // Desactivar todas las alarmas críticas
  const handleSilenceAllCriticalAlerts = () => {
    setDeviceStatus((prev) => ({
      ...prev,
      smokeDetected: false,
      intruderDetected: false,
      kitchenSensorOk: true,
      waterLeakDetected: false,
    }));
  };

  // Resumen de Consumo Energético Instantáneo (Recharts Pie Chart)
  const instantEnergyData = useMemo(() => {
    // 1. Iluminación: depende de luces encendidas y modo ahorro
    const lightsWatts = deviceStatus.lightsOn ? (deviceStatus.ecoMode ? 42 : 138) : 12;
    
    // 2. Climatización: depende del targetTemp y modo ahorro
    const climateWatts = deviceStatus.ecoMode 
      ? 330 
      : Math.max(360, Math.round(540 + (targetTemp - 20) * 80));
    
    // 3. Seguridad: cámaras activas y sensores perimetrales
    const securityWatts = deviceStatus.camerasActive ? (deviceStatus.ecoMode ? 36 : 62) : 18;
    
    // 4. Electrodomésticos: standby optimizado, frigorífico, router y domótica
    const appliancesWatts = deviceStatus.ecoMode ? 190 : 310;

    const totalWatts = lightsWatts + climateWatts + securityWatts + appliancesWatts;

    const categories = [
      {
        id: 'climatizacion',
        name: 'Climatización',
        watts: climateWatts,
        percent: Math.round((climateWatts / totalWatts) * 100),
        color: '#009fe3',
        detail: deviceStatus.ecoMode ? 'Consigna Eco 19.5°C (-28% potencia)' : `Consigna ${targetTemp.toFixed(1)}°C · Clima inteligente`,
      },
      {
        id: 'electrodomesticos',
        name: 'Electrodomésticos',
        watts: appliancesWatts,
        percent: Math.round((appliancesWatts / totalWatts) * 100),
        color: '#10b981',
        detail: deviceStatus.ecoMode ? 'Standby optimizado · Enchufes desconectados' : 'Frigorífico A+++, domótica y routers',
      },
      {
        id: 'iluminacion',
        name: 'Iluminación',
        watts: lightsWatts,
        percent: Math.round((lightsWatts / totalWatts) * 100),
        color: '#f59e0b',
        detail: deviceStatus.lightsOn 
          ? (deviceStatus.ecoMode ? 'LED tenue regulado al 40%' : 'LED activadas en estancia') 
          : 'Luces apagadas (0.1W por driver)',
      },
      {
        id: 'seguridad',
        name: 'Seguridad',
        watts: securityWatts,
        percent: Math.round((securityWatts / totalWatts) * 100),
        color: '#818cf8',
        detail: deviceStatus.camerasActive 
          ? 'Cámaras HD + sensores perimetrales' 
          : 'Hub Zigbee central + cerradura en reposo',
      },
    ];

    // Asegurar que la suma de porcentajes sea exactamente 100%
    const currentSum = categories.reduce((sum, item) => sum + item.percent, 0);
    if (currentSum !== 100 && categories.length > 0) {
      categories[0].percent += (100 - currentSum);
    }

    return {
      totalWatts,
      categories,
      costPerHour: ((totalWatts * 0.165) / 1000).toFixed(3),
    };
  }, [deviceStatus.lightsOn, deviceStatus.ecoMode, deviceStatus.camerasActive, targetTemp]);

  // Toggle individual devices
  const toggleLights = () => {
    setDeviceStatus((prev) => ({ ...prev, lightsOn: !prev.lightsOn }));
  };

  const toggleLock = () => {
    setDeviceStatus((prev) => ({ ...prev, lockOpen: !prev.lockOpen }));
  };

  const toggleCameras = () => {
    setDeviceStatus((prev) => ({ ...prev, camerasActive: !prev.camerasActive }));
  };

  const toggleSensor = () => {
    toggleWaterLeakAlarm();
  };

  const toggleShutters = () => {
    setDeviceStatus((prev) => ({ ...prev, shuttersClosed: !prev.shuttersClosed }));
  };

  // Run Routine: "Salir de casa"
  const handleExecuteRoutine = () => {
    setAnimatingRoutine(true);
    setTimeout(() => {
      setDeviceStatus((prev) => {
        const nextState = !prev.routineActive;
        if (nextState) {
          // Turning on "Salir de casa": lights off, lock closed, cameras armed, shutters closed
          return {
            ...prev,
            lightsOn: false,
            lockOpen: false,
            shuttersClosed: true,
            camerasActive: true,
            routineActive: true,
            vacationMode: false,
          };
        } else {
          // Returning home: lights on, lock unlocked, cameras relaxed, shutters open
          return {
            ...prev,
            lightsOn: true,
            lockOpen: true,
            shuttersClosed: false,
            camerasActive: false,
            routineActive: false,
            vacationMode: false,
          };
        }
      });
      setRoutineMessage(deviceStatus.routineActive ? 'Modo «Volver a casa» activado' : 'Modo «Salir de casa» activado');
      setAnimatingRoutine(false);
    }, 350);
  };

  // Run Routine: "Modo Vacaciones" (Special requested routine)
  const handleToggleVacationMode = () => {
    setAnimatingRoutine(true);
    setTimeout(() => {
      setDeviceStatus((prev) => {
        const nextVacation = !prev.vacationMode;
        if (nextVacation) {
          setRoutineMessage('🌴 Modo «Vacaciones» activo: persianas y puertas blindadas con simulación de luces aleatoria');
          return {
            ...prev,
            vacationMode: true,
            shuttersClosed: true,
            lockOpen: false,
            camerasActive: true,
            lightsOn: true,
            activeSimulationRoom: 'Salón Principal',
            routineActive: true,
          };
        } else {
          setRoutineMessage('☀️ Modo «Vacaciones» finalizado: restableciendo iluminación habitual');
          return {
            ...prev,
            vacationMode: false,
            shuttersClosed: false,
            lockOpen: true,
            activeSimulationRoom: undefined,
          };
        }
      });
      setAnimatingRoutine(false);
    }, 350);
  };

  // Run Routine: "Modo Ahorro" (Automatic low-consumption eco optimization)
  const handleToggleEcoMode = () => {
    setAnimatingRoutine(true);
    setTimeout(() => {
      setDeviceStatus((prev) => {
        const nextEco = !prev.ecoMode;
        if (nextEco) {
          setRoutineMessage('🌱 Modo «Ahorro» activo: dispositivos ajustados a ultra bajo consumo (-35% kWh)');
          setTargetTemp(19.5); // Consigna eco de bajo consumo
          return {
            ...prev,
            ecoMode: true,
            vacationMode: false,
            lightsOn: false,            // Apagar luces para consumo 0W
            shuttersClosed: true,       // Cerrar persianas para aislamiento térmico pasivo
            lockOpen: false,            // Bloquear puertas perimetrales
            camerasActive: false,       // Cámaras en standby eficiente
            routineActive: true,
          };
        } else {
          setRoutineMessage('⚡ Modo «Ahorro» desactivado: restableciendo niveles estándar de confort');
          setTargetTemp(21.5);
          return {
            ...prev,
            ecoMode: false,
            lightsOn: true,
            shuttersClosed: false,
            lockOpen: true,
          };
        }
      });
      setAnimatingRoutine(false);
    }, 350);
  };

  // Estado y handler para la descarga de reporte de actividad y consumo energético
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<{
    filename: string;
    format: 'JSON' | 'CSV';
  } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<'json' | 'csv' | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadReport = (format: 'json' | 'csv') => {
    setIsExporting(true);
    setTimeout(() => {
      const res = downloadReportFile(format, {
        deviceStatus,
        selectedRoom,
        targetTemp,
        routineMessage,
        history7d: TEMPERATURE_7D_DATA,
      });
      setIsExporting(false);
      setDownloadSuccessToast({
        filename: res.filename,
        format: format.toUpperCase() as 'JSON' | 'CSV',
      });
      setTimeout(() => {
        setDownloadSuccessToast((curr) => (curr?.filename === res.filename ? null : curr));
      }, 5000);
    }, 250);
  };

  return (
    <section className="relative pt-8 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-blue-100/40 dark:bg-sky-950/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container / Card */}
      <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#0b1d3a] backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100/80 dark:border-slate-800 p-6 sm:p-8 lg:p-12 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Heading, Value Props and Interactive Features */}
          <div className="lg:col-span-6 space-y-5">
            {/* Sistema de Notificaciones Críticas (Banner Activo con Icono de Aviso Parpadeante) */}
            {criticalAlertsCount > 0 && (
              <div 
                className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/95 via-rose-900/80 to-amber-950/90 border-2 border-rose-500/90 shadow-xl shadow-rose-950/60 ring-2 ring-rose-500/50 text-white animate-pulse transition-all"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Icono de aviso parpadeante con ondas radiales */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-600/50">
                        <Siren className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-black text-rose-100 tracking-wide flex items-center gap-1.5 uppercase">
                          <span>¡Alerta Crítica en Tiempo Real!</span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/50 text-[10px] font-black uppercase">
                          {criticalAlertsCount} activa{criticalAlertsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-rose-200/90 font-medium mt-0.5">
                        {[
                          smokeDetected && 'Detección de Humo',
                          waterLeakDetected && 'Fuga de Agua',
                          intruderDetected && 'Intrusión Perimetral',
                        ].filter(Boolean).join(' + ')}: <span>Protocolo de emergencia y notificación crítica activa.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSoundAlertMuted((prev) => !prev)}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-rose-200 hover:text-white border border-rose-500/40 text-xs transition-colors"
                      title={soundAlertMuted ? 'Activar sirena de aviso' : 'Silenciar sirena'}
                    >
                      {soundAlertMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleSilenceAllCriticalAlerts}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="Restablecer sensores a estado seguro"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>

                {/* Subdetalles de la alerta */}
                <div className="mt-3 pt-2.5 border-t border-rose-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-rose-200">
                  {smokeDetected && (
                    <div className="flex items-center justify-between bg-black/30 px-2.5 py-1.5 rounded-lg border border-rose-700/60">
                      <span className="flex items-center gap-1.5 font-semibold text-rose-100">
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        Sensor Humo:
                      </span>
                      <button
                        type="button"
                        onClick={toggleSmokeAlarm}
                        className="text-[10px] text-rose-300 hover:text-white underline cursor-pointer"
                      >
                        Apagar
                      </button>
                    </div>
                  )}
                  {waterLeakDetected && (
                    <div className="flex items-center justify-between bg-black/30 px-2.5 py-1.5 rounded-lg border border-sky-700/60">
                      <span className="flex items-center gap-1.5 font-semibold text-sky-200">
                        <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        Fuga de Agua:
                      </span>
                      <button
                        type="button"
                        onClick={toggleWaterLeakAlarm}
                        className="text-[10px] text-sky-300 hover:text-white underline cursor-pointer"
                      >
                        Restablecer
                      </button>
                    </div>
                  )}
                  {intruderDetected && (
                    <div className="flex items-center justify-between bg-black/30 px-2.5 py-1.5 rounded-lg border border-amber-700/60">
                      <span className="flex items-center gap-1.5 font-semibold text-amber-200">
                        <UserX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Intrusión PIR:
                      </span>
                      <button
                        type="button"
                        onClick={toggleIntruderAlarm}
                        className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
                      >
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pill Badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e1f2fc] dark:bg-[#009fe3]/15 text-[#008cc9] dark:text-[#38bdf8] border border-[#bde2f8] dark:border-[#009fe3]/30 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                <Shield className="w-4 h-4 fill-[#009fe3] text-[#009fe3]" />
                <span>Domótica certificada AEGIS</span>
              </div>

              {/* Indicador de Estado de Notificaciones Críticas en Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {criticalAlertsCount > 0 ? (
                  <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{criticalAlertsCount} Alerta{criticalAlertsCount > 1 ? 's' : ''} activa</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sensores críticos: Seguros</span>
                  </span>
                )}
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031733] dark:text-white tracking-tight leading-tight">
              Tu hogar inteligente en una sola app.
            </h1>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              En <strong className="text-[#031733] dark:text-white font-bold">AEGIS</strong> centralizamos el control de tu vivienda. Ideal para propietarios, familias y alquileres vacacionales (Airbnb). Seguridad, confort y prevención sin complicaciones técnicas.
            </p>

            {/* Mission Box */}
            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-[#07172e] rounded-xl p-3.5 border-l-4 border-[#009fe3]">
              <strong className="text-[#031733] dark:text-white font-bold">Misión:</strong> Que proteger lo que más importa sea una decisión simple y segura mediante productos con nuestra certificación propia.
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => onNavigate('tienda')}
                className="px-6 py-3.5 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-[#009fe3]/25 transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <span>Ver catálogo</span>
              </button>

              <button
                onClick={() => onNavigate('planes')}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 text-[#031733] dark:text-white font-bold text-sm sm:text-base border-2 border-[#031733] dark:border-slate-500 transition-all duration-200 cursor-pointer"
              >
                <span>Ver planes</span>
              </button>

              <button
                onClick={() => onNavigate('asistente')}
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                title="Configura tus dispositivos y recibe recomendaciones personalizadas de automatización"
              >
                <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform animate-pulse" />
                <span>Asistente de Dispositivos</span>
              </button>
            </div>

            {/* Resumen de Consumo Energético Instantáneo (Pie Chart Recharts) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 transition-all">
              {/* Header con indicador en tiempo real */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-[#009fe3]/20 text-[#009fe3] dark:text-cyan-300 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#031733] dark:text-white flex items-center gap-2">
                      <span>Resumen de Consumo Energético Instantáneo</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Porcentaje de consumo por categoría de tu vivienda en tiempo real
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {deviceStatus.ecoMode ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      <span>Modo Eco -35%</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-[#051c3d] text-slate-700 dark:text-cyan-300 border border-slate-300/80 dark:border-cyan-800/60 text-xs font-semibold">
                      ~{instantEnergyData.costPerHour} €/h
                    </span>
                  )}
                </div>
              </div>

              {/* Contenedor Gráfico Circular (Pie Chart) y Desglose por Categorías */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
                {/* Gráfico Circular con Recharts */}
                <div className="sm:col-span-5 relative flex items-center justify-center">
                  <div className="w-full h-44 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={instantEnergyData.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="watts"
                          nameKey="name"
                          isAnimationActive={true}
                        >
                          {instantEnergyData.categories.map((entry, index) => (
                            <Cell 
                              key={`cell-category-${index}`} 
                              fill={entry.color} 
                              stroke="#051c3d"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Texto Central en el Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-xl sm:text-2xl font-black text-[#031733] dark:text-white leading-none">
                        {instantEnergyData.totalWatts}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                        Watts
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {deviceStatus.ecoMode ? 'Eco Ahorro' : 'Directo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Categorías: Climatización, Electrodomésticos, Iluminación, Seguridad */}
                <div className="sm:col-span-7 grid grid-cols-1 gap-2">
                  {instantEnergyData.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#051c3d]/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs hover:border-[#009fe3]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-2 ring-white dark:ring-slate-900" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#031733] dark:text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {cat.detail}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span 
                          className="text-xs sm:text-sm font-black font-mono block" 
                          style={{ color: cat.color }}
                        >
                          {cat.percent}%
                        </span>
                        <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                          {cat.watts} W
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra inferior informativa */}
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-[#009fe3]" />
                  <span>
                    Potencia total activa: <strong className="text-[#031733] dark:text-white font-mono font-bold">{(instantEnergyData.totalWatts / 1000).toFixed(2)} kW</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {deviceStatus.ecoMode ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Consumo reducido en ~35% con Modo Ahorro
                    </span>
                  ) : (
                    <span>
                      Eficiencia estimada: <strong className="text-[#031733] dark:text-white">Clase A+++</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas Clave de Rendimiento y Ahorro */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/70 dark:border-slate-800 transition-all hover:border-[#009fe3]/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#031733] dark:text-white">-35%</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  Ahorro energético medio con consignas eco y rutinas automáticas
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/70 dark:border-slate-800 transition-all hover:border-[#009fe3]/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-[#009fe3] flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#031733] dark:text-white">&lt;15 min</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  Instalación Plug & Play sin obras, regatas ni cables invasivos
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/70 dark:border-slate-800 transition-all hover:border-[#009fe3]/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#031733] dark:text-white">100%</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  Privacidad y cifrado local AES-256 sin venta de datos a terceros
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/70 dark:border-slate-800 transition-all hover:border-[#009fe3]/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#031733] dark:text-white">4.9 / 5</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  Satisfacción verificada en más de 2.400 viviendas en España
                </p>
              </div>
            </div>

            {/* Selector Interactivo de Perfiles de Vivienda */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-[#07172e] border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#009fe3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Soluciones a medida según tu inmueble
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-[#009fe3]">Interactivo</span>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-[#041021] border border-slate-300/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('habitual')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeProfileTab === 'habitual'
                      ? 'bg-white dark:bg-[#009fe3] text-[#031733] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#031733] dark:hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="truncate">Habitual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('airbnb')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeProfileTab === 'airbnb'
                      ? 'bg-white dark:bg-[#009fe3] text-[#031733] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#031733] dark:hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="truncate">Airbnb</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('segunda')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeProfileTab === 'segunda'
                      ? 'bg-white dark:bg-[#009fe3] text-[#031733] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#031733] dark:hover:text-white'
                  }`}
                >
                  <Palmtree className="w-3.5 h-3.5" />
                  <span className="truncate">2ª Residencia</span>
                </button>
              </div>

              {/* Contenido dinámico del perfil */}
              <div className="pt-1 space-y-2.5">
                {activeProfileTab === 'habitual' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#031733] dark:text-white">Vivienda Habitual & Familias</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                        Confort & Ahorro
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Automatiza el clima según horarios, apaga luces y enchufes al marcharte y recibe alertas si se detecta fuga de agua en cocina o baño.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Rutina «Salir de casa» en 1 clic</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Control por voz con Siri, Alexa o Google</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Sensores antifuga con aviso inmediato</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Monitoreo de gasto en kWh y euros</span>
                      </div>
                    </div>
                  </>
                )}

                {activeProfileTab === 'airbnb' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#031733] dark:text-white">Alquiler Turístico & Airbnb</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold text-[11px]">
                        Gestión 100% Remota
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Evita desplazamientos para entregar llaves físicas con códigos PIN automáticos por reserva y pon límites de termostato para evitar facturas abusivas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Auto check-in con PIN temporal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Tope consigna clima (mín 21°C / máx 24°C)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Sensor de decibelios (antifiestas sin audio)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Registro de accesos en tiempo real</span>
                      </div>
                    </div>
                  </>
                )}

                {activeProfileTab === 'segunda' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#031733] dark:text-white">Segunda Residencia & Vacacional</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                        Anti-Ocupación & Mantenimiento
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Protege tu casa de playa o campo todo el año: simulación de habitabilidad encendiendo luces y control constante de heladas y cortes eléctricos.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Modo vacaciones con presencia aleatoria</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Aviso inmediato de corte de luz o router</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Vigilancia perimetral disuasoria</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Encendido remoto de clima antes de llegar</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Franja de Garantías Oficiales AEGIS */}
            <div className="p-3.5 rounded-2xl bg-[#009fe3]/5 dark:bg-[#009fe3]/10 border border-[#009fe3]/20 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                <Award className="w-4 h-4 text-[#009fe3]" />
                <span><strong>3 Años</strong> de Garantía oficial</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Envío <strong>24/48h</strong> gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
                <span>Soporte <strong>en España</strong></span>
              </div>
            </div>

            {/* Compatibilidad de estándares abiertos */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Ecosistemas:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700">Matter 1.2</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700">Apple HomeKit</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700">Google Home</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700">Amazon Alexa</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700">Zigbee 3.0</span>
            </div>

            {/* Banner Asesora Lili IA */}
            {onOpenLiliDemo && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/90 dark:from-[#0a1e3b] dark:to-[#0f2852] border border-[#009fe3]/30 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#009fe3] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#009fe3]/30 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#031733] dark:text-white flex items-center gap-1.5">
                      <span>¿Dudas con qué kit elegir?</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-[#009fe3]/20 text-[#009fe3] dark:text-sky-300">Lili IA</span>
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Asistente domótica en directo para configurar tu hogar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenLiliDemo}
                  className="px-3 py-1.5 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>Preguntar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Central Control Panel */}
          <div className="lg:col-span-6">
            <div className="bg-[#051c3d] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-700/60 relative overflow-hidden transition-all duration-300">
              
              {/* Header of Central Control Panel */}
              <div className="mb-5">
                <div className="flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      Panel de Control Central
                    </h3>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Sistema online" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botón e Icono de Alerta Crítica Parpadeante (Humo / Intrusos) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAlertsDropdownOpen((prev) => !prev)}
                        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border shadow-sm ${
                          criticalAlertsCount > 0
                            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/50 ring-2 ring-rose-500 animate-pulse'
                            : 'bg-[#072d56] hover:bg-[#0c407a] text-slate-300 hover:text-white border-cyan-500/30'
                        }`}
                        title={
                          criticalAlertsCount > 0
                            ? `¡ALERTA CRÍTICA ACTIVA! (${criticalAlertsCount} detectadas)`
                            : 'Centro de Alertas de Seguridad'
                        }
                        aria-label="Notificaciones críticas de seguridad"
                      >
                        {criticalAlertsCount > 0 ? (
                          <>
                            <BellRing className="w-4 h-4 text-white animate-bounce" />
                            {/* Ping parpadeante adicional */}
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 text-[8px] font-black items-center justify-center text-white">
                                {criticalAlertsCount}
                              </span>
                            </span>
                          </>
                        ) : (
                          <Bell className="w-4 h-4 text-cyan-300" />
                        )}
                      </button>

                      {/* Dropdown de Alertas Críticas */}
                      {alertsDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#031733] border border-cyan-500/50 shadow-2xl p-4 z-50 text-slate-200 backdrop-blur-xl">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className={`w-4 h-4 ${criticalAlertsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                              <h4 className="text-sm font-bold text-white">Notificaciones Críticas</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {criticalAlertsCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSoundAlertMuted((prev) => !prev)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title={soundAlertMuted ? 'Activar sonido de alarma' : 'Silenciar sirena'}
                                >
                                  {soundAlertMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setAlertsDropdownOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Listado de eventos activos */}
                          <div className="py-3 space-y-2.5">
                            {smokeDetected && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/90 to-rose-900/60 border border-rose-500/80 shadow-md flex items-start gap-3 animate-pulse">
                                <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                                  <Flame className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-rose-200 uppercase tracking-wider">¡Humo Detectado!</span>
                                    <span className="text-[10px] text-rose-300 font-mono">{lastCriticalAlertTime}</span>
                                  </div>
                                  <p className="text-[11px] text-rose-100 mt-0.5 leading-snug">
                                    Sensor óptico en Cocina / Salón disparado. Protocolo de extracción y llamada de emergencia activable.
                                  </p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={toggleSmokeAlarm}
                                      className="px-2.5 py-1 rounded-md bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                      Restablecer sensor
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {waterLeakDetected && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/90 to-blue-900/60 border border-sky-500/80 shadow-md flex items-start gap-3 animate-pulse">
                                <div className="p-2 rounded-lg bg-sky-600 text-white shrink-0 mt-0.5">
                                  <Droplets className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-sky-200 uppercase tracking-wider">¡Fuga de Agua!</span>
                                    <span className="text-[10px] text-sky-300 font-mono">{lastCriticalAlertTime}</span>
                                  </div>
                                  <p className="text-[11px] text-sky-100 mt-0.5 leading-snug">
                                    Sensor de inundación en cocina activo. Notificación crítica disparada y corte preventivo aplicado.
                                  </p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={toggleWaterLeakAlarm}
                                      className="px-2.5 py-1 rounded-md bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                      Restablecer sensor
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {intruderDetected && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/90 to-amber-950/60 border border-amber-500/80 shadow-md flex items-start gap-3 animate-pulse">
                                <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
                                  <UserX className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-amber-200 uppercase tracking-wider">¡Intruso Detectado!</span>
                                    <span className="text-[10px] text-amber-300 font-mono">{lastCriticalAlertTime}</span>
                                  </div>
                                  <p className="text-[11px] text-amber-100 mt-0.5 leading-snug">
                                    Sensor de movimiento PIR y cámara perimetral registraron intrusión no autorizada en acceso principal.
                                  </p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={toggleIntruderAlarm}
                                      className="px-2.5 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                      Descartar alerta
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {criticalAlertsCount === 0 && (
                              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-white block">Todo en orden</span>
                                  <span className="text-[11px] text-emerald-400/90">Sensores de humo, agua e intrusión 100% operativos sin incidencias.</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Simulador rápido para el usuario */}
                          <div className="pt-2.5 border-t border-slate-700/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                              Simular eventos en tiempo real:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={toggleSmokeAlarm}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                  smokeDetected
                                    ? 'bg-rose-900/60 text-rose-200 border-rose-500'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                                title="Simular anomalía en sensor de humo"
                              >
                                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>{smokeDetected ? 'Parar' : 'Humo'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={toggleWaterLeakAlarm}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                  waterLeakDetected
                                    ? 'bg-sky-900/60 text-sky-200 border-sky-500'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                                title="Simular anomalía en sensor de fuga de agua"
                              >
                                <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span>{waterLeakDetected ? 'Parar' : 'Agua'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={toggleIntruderAlarm}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                  intruderDetected
                                    ? 'bg-amber-900/60 text-amber-200 border-amber-500'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                                title="Simular detección de intruso"
                              >
                                <UserX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{intruderDetected ? 'Parar' : 'Intruso'}</span>
                              </button>
                            </div>
                            {criticalAlertsCount > 0 && (
                              <button
                                type="button"
                                onClick={handleSilenceAllCriticalAlerts}
                                className="w-full mt-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                              >
                                Silenciar todas las alarmas
                              </button>
                            )}

                            {/* Resumen de Mantenimiento Preventivo en el Desplegable */}
                            <div className="pt-2.5 mt-2.5 border-t border-slate-700/80">
                              <div className="flex items-center justify-between text-xs pb-1.5">
                                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>Mantenimiento Preventivo ({urgentMaintItems.length})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAlertsDropdownOpen(false);
                                    scrollToMaintenance();
                                  }}
                                  className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-semibold cursor-pointer"
                                >
                                  Ver calendario →
                                </button>
                              </div>
                              {topUrgentMaint && (
                                <div 
                                  onClick={() => {
                                    setAlertsDropdownOpen(false);
                                    scrollToMaintenance();
                                  }}
                                  className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/40 text-[11px] text-slate-300 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center justify-between font-bold text-white mb-0.5">
                                    <span>{topUrgentMaint.name}</span>
                                    <span className="text-amber-400 font-mono">{topUrgentMaint.healthPercent}% Salud</span>
                                  </div>
                                  <p className="text-slate-400 text-[10px]">
                                    {topUrgentMaint.componentName} · Revisión sugerida: <strong className="text-amber-300">{topUrgentMaint.nextSuggestedDate}</strong>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón e Icono de Alerta de Mantenimiento (Acceso directo al Calendario) */}
                    <button
                      type="button"
                      onClick={scrollToMaintenance}
                      className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border shadow-sm ${
                        urgentMaintItems.length > 0
                          ? 'bg-[#092c54] hover:bg-[#0e3c73] text-amber-300 border-amber-500/60 shadow-amber-950/40 ring-1 ring-amber-500/40'
                          : 'bg-[#072d56] hover:bg-[#0c407a] text-slate-300 hover:text-white border-cyan-500/30'
                      }`}
                      title={`Calendario de Mantenimiento (${urgentMaintItems.length} avisos de revisión)`}
                      aria-label="Abrir calendario de mantenimiento"
                    >
                      <Wrench className="w-4 h-4 text-amber-400" />
                      {urgentMaintItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 text-[8px] font-black items-center justify-center text-slate-950">
                            {urgentMaintItems.length}
                          </span>
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('asistente')}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-200 hover:text-white border border-cyan-400/50 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Abrir Asistente de Configuración de Dispositivos"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                      <span>Asistente IA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadReport('json')}
                      disabled={isExporting}
                      className="px-2.5 py-1.5 rounded-lg bg-[#072d56] hover:bg-[#0c407a] text-cyan-300 hover:text-white border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Descargar reporte en formato JSON"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadReport('csv')}
                      disabled={isExporting}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Descargar reporte en formato CSV (Excel)"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Demo interactiva: prueba los interruptores, modos inteligentes y exporta el reporte de consumo
                </p>
              </div>

              {/* Banner de Estado Dinámico: Modo Demostración vs Cuenta Vinculada */}
              {!currentUser ? (
                <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#009fe3]/15 via-sky-500/10 to-indigo-500/10 border border-[#009fe3]/30 flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#009fe3]/20 text-[#009fe3] border border-[#009fe3]/30 shrink-0">
                      <Compass className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">Modo Demostración Interactivo</span>
                        <span className="text-[10px] font-bold bg-[#009fe3] text-white px-2 py-0.2 rounded-full">Simulador Activo</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Prueba interruptores, alarmas y el Modo Noche. Para vincular los sensores reales de tu vivienda, inicia sesión.
                      </p>
                    </div>
                  </div>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-3.5 py-1.5 rounded-xl bg-[#009fe3] hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-[#009fe3]/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Iniciar Sesión / Registrarse</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3 animate-fadeIn text-xs text-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>
                      Vivienda vinculada a <strong className="text-white">{currentUser.name || currentUser.email}</strong> · Monitorización activa en tiempo real
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {currentUser.provider === 'google' ? '⚡ Google Sign-In' : '🛡️ Cuenta Supabase'}
                  </span>
                </div>
              )}

              {/* Alerta de Mantenimiento Preventivo Integrada en el Panel Central */}
              {topUrgentMaint && (
                <div className="mb-4 bg-gradient-to-r from-[#07244c] via-[#092d59] to-[#07244c] border border-amber-500/50 rounded-2xl p-3.5 sm:p-4 text-xs shadow-lg space-y-2 relative overflow-hidden transition-all">
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                        <Wrench className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Alerta de Mantenimiento: {topUrgentMaint.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/25 text-amber-300 border border-amber-500/40">
                            {topUrgentMaint.healthPercent}% Salud
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                          {topUrgentMaint.componentName} · Sugerido para: <strong className="text-amber-300">{topUrgentMaint.nextSuggestedDate}</strong> (en {topUrgentMaint.daysRemaining} días)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={scrollToMaintenance}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-1.5 ml-auto sm:ml-0"
                    >
                      <span>Calendario</span>
                      <CalendarClock className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1.5 border-t border-slate-700/60">
                    <span className="truncate">💡 Acción: {topUrgentMaint.actionRequired}</span>
                    <button
                      type="button"
                      onClick={scrollToMaintenance}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold shrink-0 cursor-pointer hover:underline text-[11px]"
                    >
                      {urgentMaintItems.length} alertas de mantenimiento →
                    </button>
                  </div>
                </div>
              )}

              {/* Switches List */}
              <div className="space-y-3">
                {/* 1. Luces (con Ritmo Circadiano / Modo Noche automático, o simulación aleatoria en Modo Vacaciones) */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl p-3.5 sm:px-4 sm:py-3.5 transition-all gap-3 ${
                  deviceStatus.ecoMode
                    ? 'bg-[#042828] border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-900/30'
                    : deviceStatus.vacationMode 
                      ? 'bg-[#0f2c4d] border-amber-400/80 ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/20' 
                      : circadianLighting.isNightMode && deviceStatus.lightsOn
                        ? 'bg-gradient-to-r from-[#211406]/90 to-[#0e1d35] border-amber-500/60 ring-1 ring-amber-400/30'
                        : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="relative flex items-center justify-center shrink-0">
                      <Lightbulb 
                        className={`w-5 h-5 transition-colors duration-300 ${
                          !deviceStatus.lightsOn 
                            ? 'text-slate-500' 
                            : deviceStatus.vacationMode 
                              ? 'text-amber-300 animate-pulse fill-amber-300' 
                              : ''
                        }`} 
                        style={
                          deviceStatus.lightsOn && !deviceStatus.vacationMode
                            ? {
                                color: circadianLighting.effectiveColorHex,
                                fill: circadianLighting.effectiveColorHex,
                                filter: `drop-shadow(0 0 6px ${circadianLighting.effectiveColorHex}88)`,
                              }
                            : undefined
                        }
                      />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center flex-wrap gap-1.5">
                        <span>Luces inteligentes</span>
                        {deviceStatus.ecoMode && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            🌱 Eco · 0W
                          </span>
                        )}
                        {deviceStatus.vacationMode && !deviceStatus.ecoMode && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                            Presencia aleatoria
                          </span>
                        )}
                        {!deviceStatus.ecoMode && !deviceStatus.vacationMode && deviceStatus.lightsOn && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                            circadianLighting.isNightMode
                              ? 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                              : 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                          }`}>
                            {circadianLighting.isNightMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                            <span>{circadianLighting.isNightMode ? `Modo Noche · ${circadianLighting.effectiveColorTempK}K (${circadianLighting.effectiveBrightness}%)` : `Día · ${circadianLighting.effectiveColorTempK}K (${circadianLighting.effectiveBrightness}%)`}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {deviceStatus.ecoMode
                          ? 'Ahorro activo: iluminación apagada'
                          : deviceStatus.vacationMode 
                            ? `Simulando presencia: ${deviceStatus.activeSimulationRoom || 'Salón'}` 
                            : circadianLighting.isNightMode && deviceStatus.lightsOn
                              ? `Ritmo circadiano activo: ${circadianLighting.effectiveColorLabel}`
                              : 'Confort visual y temperatura según horario'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                    {/* Botón de configuración de Modo Noche */}
                    <button
                      type="button"
                      onClick={() => setNightModeModalOpen(true)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                        circadianLighting.isNightMode
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                      title="Configurar horario, temperatura de color y brillo nocturno"
                    >
                      <Moon className="w-3 h-3 text-amber-300" />
                      <span>Modo Noche</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${
                        deviceStatus.ecoMode && !deviceStatus.lightsOn
                          ? 'text-emerald-400 font-bold'
                          : deviceStatus.lightsOn 
                            ? (deviceStatus.vacationMode ? 'text-amber-300 font-bold' : circadianLighting.isNightMode ? 'text-amber-300' : 'text-cyan-400') 
                            : 'text-slate-400'
                      }`}>
                        {deviceStatus.ecoMode && !deviceStatus.lightsOn 
                          ? 'Standby Eco' 
                          : deviceStatus.lightsOn 
                            ? (deviceStatus.vacationMode ? 'Aleatorio ON' : 'Encendidas') 
                            : 'Apagadas'}
                      </span>
                      <button
                        type="button"
                        onClick={toggleLights}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          deviceStatus.lightsOn ? (deviceStatus.vacationMode ? 'bg-amber-500' : circadianLighting.isNightMode ? 'bg-amber-500' : 'bg-[#009fe3]') : 'bg-slate-600'
                        }`}
                        aria-label="Alternar luces del salón"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            deviceStatus.lightsOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Persianas inteligentes (Cierre automático en Modo Ahorro y Modo Vacaciones) */}
                <div className={`flex items-center justify-between border rounded-xl px-4 py-3.5 transition-colors ${
                  deviceStatus.ecoMode
                    ? 'bg-[#042828] border-emerald-500/70'
                    : deviceStatus.vacationMode 
                      ? 'bg-[#0c2847] border-emerald-500/60' 
                      : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 text-lg">
                      <Blinds className={`w-5 h-5 ${deviceStatus.shuttersClosed ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Persianas inteligentes</span>
                        {deviceStatus.ecoMode && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Aislamiento Pasivo
                          </span>
                        )}
                        {deviceStatus.vacationMode && !deviceStatus.ecoMode && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Blindadas
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {deviceStatus.ecoMode ? 'Retención térmica pasiva (-20% pérdidas)' : 'Protección solar y seguridad'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${deviceStatus.shuttersClosed ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {deviceStatus.shuttersClosed ? 'Bajadas · Cerradas' : 'Subidas · Abiertas'}
                    </span>
                    <button
                      type="button"
                      onClick={toggleShutters}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        deviceStatus.shuttersClosed ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                      aria-label="Alternar persianas"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          deviceStatus.shuttersClosed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. Cerradura & Puertas inteligentes */}
                <div className={`flex items-center justify-between border rounded-xl px-4 py-3.5 transition-colors ${
                  deviceStatus.vacationMode 
                    ? 'bg-[#0c2847] border-emerald-500/60' 
                    : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-500 text-lg">
                      {deviceStatus.lockOpen ? (
                        <Unlock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-emerald-400" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Puertas & Cerradura principal</span>
                        {urgentMaintItems.some((i) => i.productId === 'cerradura-inteligente') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToMaintenance();
                            }}
                            className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 cursor-pointer hover:bg-amber-400/30 flex items-center gap-1 transition-colors"
                            title="Batería baja al 18% · Revisión sugerida en 12 días"
                          >
                            <BatteryWarning className="w-3 h-3 text-amber-400" />
                            <span>Bat 18% · Revisión</span>
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">Cierre perimetral digital · Pedido Aegis</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${deviceStatus.lockOpen ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {deviceStatus.lockOpen ? 'Abierta' : 'Bloqueada'}
                    </span>
                    <button
                      type="button"
                      onClick={toggleLock}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        deviceStatus.lockOpen ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                      aria-label="Alternar cerradura"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          deviceStatus.lockOpen ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 4. Cámaras */}
                <div className={`flex items-center justify-between border rounded-xl px-4 py-3.5 transition-colors ${
                  deviceStatus.ecoMode
                    ? 'bg-[#042828] border-emerald-500/70'
                    : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 text-lg">
                      {deviceStatus.camerasActive ? (
                        <Video className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <VideoOff className="w-5 h-5 text-slate-400" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Cámaras Aegis</span>
                        {deviceStatus.ecoMode && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Standby Eco
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {deviceStatus.ecoMode ? 'Bajo consumo pasivo' : 'Vigilancia y detección'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${
                      deviceStatus.ecoMode && !deviceStatus.camerasActive
                        ? 'text-emerald-400 font-bold'
                        : deviceStatus.camerasActive 
                          ? 'text-cyan-400' 
                          : 'text-slate-400'
                    }`}>
                      {deviceStatus.ecoMode && !deviceStatus.camerasActive ? 'Standby Eco' : deviceStatus.camerasActive ? 'Conectadas' : 'Desactivadas'}
                    </span>
                    <button
                      type="button"
                      onClick={toggleCameras}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        deviceStatus.camerasActive ? 'bg-[#009fe3]' : 'bg-slate-600'
                      }`}
                      aria-label="Alternar cámaras"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          deviceStatus.camerasActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 5. Sensor cocina / inundación */}
                <div 
                  onClick={toggleSensor}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3.5 cursor-pointer transition-all ${
                    waterLeakDetected
                      ? 'bg-gradient-to-r from-sky-950/90 to-blue-900/80 border-sky-400 ring-2 ring-sky-500/70 shadow-lg shadow-sky-950/50'
                      : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                  }`}
                  title="Haz clic para simular detección de fuga de agua en tiempo real"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 text-lg">
                      <Droplets className={`w-5 h-5 ${waterLeakDetected ? 'text-sky-300 animate-bounce' : 'text-sky-400'}`} />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Sensor cocina / inundación</span>
                        {waterLeakDetected && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                            ¡FUGA DETECTADA!
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {waterLeakDetected ? 'Notificación crítica enviada · Válvula activada' : 'Prevención de siniestros'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      !waterLeakDetected 
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' 
                        : 'text-white bg-rose-600 border border-rose-400 animate-pulse font-bold'
                    }`}>
                      {!waterLeakDetected ? 'OK · Sin fugas' : '🚨 Fuga Activa'}
                    </span>
                  </div>
                </div>

                {/* 6. Sensor Crítico: Detector de Humo Óptico (Aviso parpadeante en tiempo real) */}
                <div 
                  onClick={toggleSmokeAlarm}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3.5 cursor-pointer transition-all ${
                    smokeDetected 
                      ? 'bg-gradient-to-r from-rose-950/90 to-rose-900/80 border-rose-500 ring-2 ring-rose-500/70 shadow-lg shadow-rose-950/50' 
                      : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                  }`}
                  title="Haz clic para simular detección de humo en tiempo real"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex items-center justify-center">
                      <Flame className={`w-5 h-5 ${smokeDetected ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
                      {smokeDetected && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Sensor de Humo Óptico</span>
                        {smokeDetected && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                            ¡Crítico!
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {smokeDetected ? '🚨 Humo detectado: sirena perimetral y aspersores' : 'Vigilancia continua EN 14604'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                      smokeDetected 
                        ? 'text-white bg-rose-600 border border-rose-400 animate-pulse font-bold' 
                        : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    }`}>
                      {smokeDetected ? '🔥 Humo Activo' : 'Normal'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSmokeAlarm();
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        smokeDetected ? 'bg-rose-600' : 'bg-slate-600'
                      }`}
                      aria-label="Simular sensor de humo"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          smokeDetected ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 7. Sensor Crítico: Detección de Intrusos (Radar PIR + Cámaras) */}
                <div 
                  onClick={toggleIntruderAlarm}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3.5 cursor-pointer transition-all ${
                    intruderDetected 
                      ? 'bg-gradient-to-r from-red-950/90 to-amber-950/80 border-amber-500 ring-2 ring-amber-500/70 shadow-lg shadow-amber-950/50' 
                      : 'bg-[#0a2650]/80 hover:bg-[#0a2650] border-slate-700/50'
                  }`}
                  title="Haz clic para simular detección de intruso en tiempo real"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex items-center justify-center">
                      <UserX className={`w-5 h-5 ${intruderDetected ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                      {intruderDetected && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Detector de Intrusos PIR</span>
                        {intruderDetected && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 animate-pulse">
                            ¡Intrusión!
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {intruderDetected ? '⚠️ Movimiento no autorizado en acceso principal' : 'Zona perimetral armada'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                      intruderDetected 
                        ? 'text-amber-200 bg-amber-900/80 border border-amber-500 animate-pulse font-bold' 
                        : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    }`}>
                      {intruderDetected ? '⚠️ Intruso' : 'Armado'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIntruderAlarm();
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        intruderDetected ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                      aria-label="Simular sensor de intrusos"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          intruderDetected ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sección de Monitorización y Tendencia de Temperatura (7 Días / 24h) con recharts */}
              <div className="mt-4 bg-[#07244c]/95 hover:bg-[#07244c] border border-cyan-800/60 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all">
                {/* Header del Gráfico con selección de Periodo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
                      <Thermometer className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>{timeframe === '7d' ? 'Tendencia Térmica Semanal (7 Días)' : 'Evolución de Temperatura (24h)'}</span>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {timeframe === '7d' ? '7 Días Activo' : 'En directo'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {timeframe === '7d' 
                          ? 'Gráfica de áreas detallada con sensor interior y exterior'
                          : 'Curva horaria continua · Sensor perimetral Aegis'}
                      </div>
                    </div>
                  </div>

                  {/* Selector de periodo: 7 Días vs 24 Horas */}
                  <div className="inline-flex items-center p-1 rounded-xl bg-[#051c3d] border border-slate-700/80 shadow-inner self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setTimeframe('7d')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        timeframe === '7d'
                          ? 'bg-[#009fe3] text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Últimos 7 días</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeframe('24h')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        timeframe === '24h'
                          ? 'bg-[#009fe3] text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>24 Horas</span>
                    </button>
                  </div>
                </div>

                {/* Barra de métricas y capas activas */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pt-2 border-t border-slate-700/50 text-xs">
                  {/* Selector de capas o estancias según el modo */}
                  {timeframe === '7d' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Capas:
                      </span>
                      <div className="inline-flex items-center gap-1 bg-[#051c3d] px-2 py-1 rounded-lg border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                        <span className="text-white font-semibold text-[11px]">Vivienda Interior</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExteriorLayer((prev) => !prev)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          showExteriorLayer
                            ? 'bg-indigo-950/80 border-indigo-600/70 text-indigo-300'
                            : 'bg-[#051c3d] border-slate-700 text-slate-400 hover:text-slate-300'
                        }`}
                        title="Alternar visibilidad del sensor exterior"
                      >
                        <span className={`w-2 h-2 rounded-full ${showExteriorLayer ? 'bg-[#818cf8]' : 'bg-slate-600'}`} />
                        <span>Exterior {showExteriorLayer ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex rounded-lg bg-[#051c3d] p-0.5 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSelectedRoom('salon')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          selectedRoom === 'salon'
                            ? 'bg-[#009fe3] text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Salón (21.8°C)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoom('dormitorio')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          selectedRoom === 'dormitorio'
                            ? 'bg-[#009fe3] text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Dormitorio (20.3°C)
                      </button>
                    </div>
                  )}

                  {/* Resumen numérico rápido */}
                  <div className="flex items-center gap-3 text-[11px]">
                    {timeframe === '7d' ? (
                      <>
                        <div className="flex items-center gap-1" title="Temperatura media de los 7 días">
                          <span className="text-slate-400">Media 7D:</span>
                          <strong className="text-cyan-300 font-black">21.5°C</strong>
                        </div>
                        <div className="hidden xs:flex items-center gap-1" title="Mínima nocturna semanal">
                          <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-slate-400">Mín:</span>
                          <strong className="text-sky-300">19.0°C</strong>
                        </div>
                        <div className="hidden xs:flex items-center gap-1" title="Máxima diurna semanal">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-400">Máx:</span>
                          <strong className="text-amber-300">23.1°C</strong>
                        </div>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-bold" title="Ahorro energético domótico medio">
                          <span>🌱 -18.4%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-slate-400">Mín:</span>
                          <strong className="text-sky-300">{selectedRoom === 'salon' ? '19.4°C' : '18.8°C'}</strong>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-400">Máx:</span>
                          <strong className="text-amber-300">{selectedRoom === 'salon' ? '22.8°C' : '21.2°C'}</strong>
                        </div>
                        <div className="hidden xs:flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-400" />
                          <strong className="text-slate-200">46% HR</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Consigna interactiva */}
                  <div className="flex items-center gap-1.5 text-[11px] bg-[#051c3d] px-2.5 py-1 rounded-lg border border-slate-700/80">
                    <span className="text-amber-300 font-medium">Consigna:</span>
                    <button
                      type="button"
                      onClick={() => setTargetTemp((prev) => Math.max(18, +(prev - 0.5).toFixed(1)))}
                      className="w-4 h-4 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                      title="Bajar consigna"
                    >
                      -
                    </button>
                    <span className="font-bold text-white px-0.5">{targetTemp.toFixed(1)}°C</span>
                    <button
                      type="button"
                      onClick={() => setTargetTemp((prev) => Math.min(26, +(prev + 0.5).toFixed(1)))}
                      className="w-4 h-4 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                      title="Subir consigna"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Contenedor del Gráfico Ampliado de Áreas con Recharts */}
                <div className="h-44 sm:h-52 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    {timeframe === '7d' ? (
                      <AreaChart
                        data={TEMPERATURE_7D_DATA}
                        margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
                      >
                        <defs>
                          {/* Gradiente para Interior Vivienda */}
                          <linearGradient id="tempGradientInterior" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#009fe3" stopOpacity={0.75} />
                            <stop offset="95%" stopColor="#009fe3" stopOpacity={0.05} />
                          </linearGradient>
                          {/* Gradiente para Sensor Exterior */}
                          <linearGradient id="tempGradientExterior" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1b3964" vertical={false} opacity={0.65} />
                        
                        <XAxis
                          dataKey="day"
                          stroke="#64748b"
                          tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }}
                          tickLine={false}
                          axisLine={{ stroke: '#1b3964' }}
                        />
                        
                        <YAxis
                          domain={[10, 26]}
                          stroke="#64748b"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}°C`}
                        />
                        
                        <Tooltip content={<Custom7DayTooltip />} />
                        
                        <ReferenceLine
                          y={targetTemp}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `Consigna ${targetTemp.toFixed(1)}°`,
                            position: 'insideTopRight',
                            fill: '#fbbf24',
                            fontSize: 10,
                          }}
                        />

                        {/* Área 2: Sensor Exterior (Capa de fondo para comparar la oscilación) */}
                        {showExteriorLayer && (
                          <Area
                            type="monotone"
                            dataKey="exterior"
                            name="Exterior"
                            stroke="#818cf8"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            fillOpacity={1}
                            fill="url(#tempGradientExterior)"
                            dot={{ r: 2.5, fill: '#818cf8' }}
                            activeDot={{ r: 4.5, stroke: '#ffffff', strokeWidth: 1.5, fill: '#818cf8' }}
                          />
                        )}

                        {/* Área 1: Interior Vivienda Aegis (Capa principal protagonista) */}
                        <Area
                          type="monotone"
                          dataKey="interior"
                          name="Interior Vivienda"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#tempGradientInterior)"
                          dot={{ r: 3.5, fill: '#38bdf8', stroke: '#031733', strokeWidth: 1.5 }}
                          activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#009fe3' }}
                        />
                      </AreaChart>
                    ) : (
                      <AreaChart
                        data={TEMPERATURE_24H_DATA}
                        margin={{ top: 12, right: 12, left: -26, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="tempGradientAegis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#009fe3" stopOpacity={0.65} />
                            <stop offset="95%" stopColor="#009fe3" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1b3964" vertical={false} opacity={0.6} />
                        <XAxis
                          dataKey="hour"
                          stroke="#64748b"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={{ stroke: '#1b3964' }}
                        />
                        <YAxis
                          domain={[18, 24]}
                          stroke="#64748b"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}°`}
                        />
                        <Tooltip content={<CustomTempTooltip />} />
                        <ReferenceLine
                          y={targetTemp}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `Objetivo ${targetTemp.toFixed(1)}°`,
                            position: 'insideTopRight',
                            fill: '#fbbf24',
                            fontSize: 9,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedRoom}
                          stroke="#38bdf8"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#tempGradientAegis)"
                          dot={{ r: 2, fill: '#38bdf8' }}
                          activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#009fe3' }}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Leyenda y pie explicativo del aislamiento térmico */}
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  {timeframe === '7d' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-2.5 h-1 bg-[#38bdf8] rounded-full" /> Interior: <strong className="text-white">Estabilidad 99.2%</strong>
                        </span>
                        {showExteriorLayer && (
                          <span className="flex items-center gap-1 text-indigo-300">
                            <span className="w-2.5 h-1 bg-[#818cf8] rounded-full" /> Exterior: <strong className="text-indigo-200">Oscilación ±5.8°C</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-medium">Ahorro inteligente activo · Válvulas termostáticas sincronizadas</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>Rango térmico óptimo: <strong className="text-slate-200">20.5°C - 22.5°C</strong></span>
                      </div>
                      <span className="text-slate-400">Actualizado hace 2 min</span>
                    </>
                  )}
                </div>
              </div>

              {/* Routines Action Section */}
              <div className="mt-5 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Routine 1: Salir de casa */}
                  <button
                    type="button"
                    onClick={handleExecuteRoutine}
                    disabled={animatingRoutine}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 cursor-pointer ${
                      animatingRoutine 
                        ? 'bg-[#0088c4] opacity-80' 
                        : 'bg-[#009fe3] hover:bg-[#0088c4] active:scale-98 shadow-[#009fe3]/25'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${animatingRoutine ? 'animate-spin' : ''}`} />
                    <span className="truncate">
                      {deviceStatus.routineActive && !deviceStatus.vacationMode && !deviceStatus.ecoMode
                        ? '«Volver a casa»'
                        : '«Salir de casa»'}
                    </span>
                  </button>

                  {/* Routine 2: Modo Vacaciones (Requested Special Routine) */}
                  <button
                    type="button"
                    onClick={handleToggleVacationMode}
                    disabled={animatingRoutine}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 cursor-pointer border ${
                      deviceStatus.vacationMode
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30 font-black'
                        : 'bg-[#092b52] hover:bg-[#0e3b6f] text-amber-300 border-amber-400/40 shadow-black/20'
                    }`}
                  >
                    <Palmtree className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {deviceStatus.vacationMode
                        ? 'Quitar Vacaciones'
                        : '🌴 «Vacaciones»'}
                    </span>
                  </button>

                  {/* Routine 3: Modo Ahorro (Requested Eco Low-Consumption Mode) */}
                  <button
                    type="button"
                    onClick={handleToggleEcoMode}
                    disabled={animatingRoutine}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 cursor-pointer border ${
                      deviceStatus.ecoMode
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300 shadow-emerald-500/40 ring-1 ring-emerald-300 font-black'
                        : 'bg-[#042828] hover:bg-[#073d3d] text-emerald-300 border-emerald-500/40 shadow-black/20'
                    }`}
                    title="Ajusta automáticamente todos los dispositivos inteligentes a configuraciones de bajo consumo"
                  >
                    <Leaf className={`w-3.5 h-3.5 shrink-0 ${deviceStatus.ecoMode ? 'animate-pulse text-white' : 'text-emerald-400'}`} />
                    <span className="truncate">
                      {deviceStatus.ecoMode
                        ? 'Quitar Ahorro'
                        : '🌱 «Modo Ahorro»'}
                    </span>
                  </button>
                </div>

                {/* Direct voice link to LILI */}
                {onOpenLiliDemo && (
                  <button
                    type="button"
                    onClick={onOpenLiliDemo}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-800/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Controlar rutinas con el Asistente LILI PRO por voz</span>
                  </button>
                )}
              </div>

              {/* Routine Status Output Card */}
              <div className={`mt-4 border rounded-xl p-3.5 text-xs sm:text-sm space-y-2 text-slate-200 transition-colors ${
                deviceStatus.ecoMode
                  ? 'bg-gradient-to-r from-[#032924] to-[#041a36] border-emerald-400/70 ring-1 ring-emerald-400/40 shadow-md shadow-emerald-950/40'
                  : deviceStatus.vacationMode 
                    ? 'bg-gradient-to-r from-[#072d53] to-[#041a36] border-amber-400/60 ring-1 ring-amber-400/30' 
                    : 'bg-[#07244c]/90 border-slate-700/60'
              }`}>
                <div className="font-bold flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    {deviceStatus.ecoMode ? (
                      <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : deviceStatus.vacationMode ? (
                      <Palmtree className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm">{routineMessage}</span>
                  </div>
                  {deviceStatus.ecoMode && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shrink-0">
                      -35% Consumo
                    </span>
                  )}
                  {deviceStatus.vacationMode && !deviceStatus.ecoMode && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                      Simulación Activa
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-300">💡</span> Luces: {deviceStatus.ecoMode ? 'Apagadas (0W consumo standby)' : deviceStatus.vacationMode ? `Aleatorias (${deviceStatus.activeSimulationRoom || 'Salón'})` : deviceStatus.lightsOn ? 'encendidas' : 'apagadas'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-300">🪟</span> Persianas: {deviceStatus.shuttersClosed ? (deviceStatus.ecoMode ? '100% bajadas (aislamiento pasivo)' : '100% cerradas') : 'abiertas'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-300">🌡️</span> Clima: {deviceStatus.ecoMode ? 'Consigna Eco: 19.5°C (-28% energía)' : `Consigna: ${targetTemp.toFixed(1)}°C`}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-300">📹</span> Cámaras: {deviceStatus.ecoMode ? 'Standby ultra bajo consumo' : deviceStatus.camerasActive ? 'conectadas y armadas' : 'desarmadas'}
                  </div>
                </div>
              </div>

              {/* Sección de Descarga de Reporte de Actividad y Consumo */}
              <div className="mt-4 bg-[#07244c]/95 border border-cyan-800/60 rounded-2xl p-4 shadow-xl text-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Reporte de Actividad y Consumo</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                          Exportar
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        Descarga el informe completo con la actividad de tus dispositivos y el histórico energético
                      </p>
                    </div>
                  </div>

                  {/* Botones de Descarga */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleDownloadReport('json')}
                      disabled={isExporting}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#092b52] hover:bg-[#0f3d75] active:scale-95 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
                      title="Descargar reporte en formato JSON"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isExporting ? 'Generando...' : 'Descargar JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadReport('csv')}
                      disabled={isExporting}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 active:scale-95 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                      title="Descargar reporte en formato CSV (Excel / Sheets)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isExporting ? 'Generando...' : 'Descargar CSV'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPreviewModal('json')}
                      className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium flex items-center justify-center transition-all cursor-pointer"
                      title="Ver vista previa de los datos a exportar"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Métricas del Reporte a exportar */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#051c3d]/70 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Dispositivos:</span>
                    <span className="font-semibold text-white">5 sincronizados</span>
                  </div>
                  <div className="bg-[#051c3d]/70 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Histórico semanal:</span>
                    <span className="font-semibold text-white">7 días (44.3 kWh)</span>
                  </div>
                  <div className="bg-[#051c3d]/70 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Ahorro activo:</span>
                    <span className={`font-semibold ${deviceStatus.ecoMode ? 'text-emerald-400 font-bold' : 'text-cyan-300'}`}>
                      {deviceStatus.ecoMode ? '🌱 -35% (Modo Eco)' : '-18.4% Prom.'}
                    </span>
                  </div>
                  <div className="bg-[#051c3d]/70 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Formato:</span>
                    <span className="font-semibold text-amber-300 font-mono">JSON / CSV</span>
                  </div>
                </div>

                {/* Toast de confirmación de descarga */}
                {downloadSuccessToast && (
                  <div className="mt-3 bg-emerald-950/90 border border-emerald-400/80 rounded-xl p-2.5 flex items-center justify-between gap-2.5 text-xs text-white shadow-lg shadow-emerald-950/50 animate-in fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-emerald-300 text-xs">
                          ¡Reporte {downloadSuccessToast.format} generado y descargado!
                        </p>
                        <p className="text-[10px] text-slate-300 font-mono truncate">
                          {downloadSuccessToast.filename}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDownloadSuccessToast(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Sección de Calendario de Mantenimiento Preventivo Inteligente */}
        <MaintenanceCalendar
          orders={orders}
          onNavigate={onNavigate}
          onOpenContactMaint={() => {
            onNavigate('contacto');
          }}
        />
      </div>

      {/* Modal de Vista Previa de Reporte (JSON / CSV) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#051c3d] text-white border border-cyan-800/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Vista Previa del Reporte</h3>
                  <p className="text-xs text-slate-400">Actividad de dispositivos y consumo energético histórico</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Format Switcher Tabs */}
            <div className="px-4 pt-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal('json')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors border-t border-x cursor-pointer ${
                    showPreviewModal === 'json'
                      ? 'bg-[#07244c] text-cyan-300 border-cyan-700/80'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {'{ } JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal('csv')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors border-t border-x cursor-pointer ${
                    showPreviewModal === 'csv'
                      ? 'bg-[#07244c] text-emerald-300 border-emerald-700/80'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  📊 CSV (Excel)
                </button>
              </div>

              <span className="text-[11px] text-slate-400 pb-1 font-mono">
                {showPreviewModal === 'json' ? 'application/json' : 'text/csv'}
              </span>
            </div>

            {/* Modal Body / Preformatted Code */}
            <div className="p-4 flex-1 overflow-auto bg-[#03152c] font-mono text-[11px] text-slate-300 leading-relaxed border-b border-slate-800 max-h-[50vh] select-text">
              <pre className="whitespace-pre">
                {showPreviewModal === 'json'
                  ? generateJSONReport({
                      deviceStatus,
                      selectedRoom,
                      targetTemp,
                      routineMessage,
                      history7d: TEMPERATURE_7D_DATA,
                    })
                  : generateCSVReport({
                      deviceStatus,
                      selectedRoom,
                      targetTemp,
                      routineMessage,
                      history7d: TEMPERATURE_7D_DATA,
                    })}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#07244c]/90 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-slate-400">
                Se descargará un archivo <strong className="text-white">.{showPreviewModal}</strong> en tu navegador.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadReport(showPreviewModal);
                    setShowPreviewModal(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar {showPreviewModal.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Modo Noche & Ritmo Circadiano */}
      <NightModeConfigModal
        isOpen={nightModeModalOpen}
        onClose={() => setNightModeModalOpen(false)}
        deviceStatus={deviceStatus}
        setDeviceStatus={setDeviceStatus}
        onNotify={addToast}
      />
    </section>
  );
};
