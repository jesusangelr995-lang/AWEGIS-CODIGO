import React, { useState, useMemo } from 'react';
import { 
  Calendar, CalendarDays, CalendarClock, Wrench, Clock, Battery, BatteryWarning, 
  CheckCircle2, AlertTriangle, RotateCcw, Sparkles, ShieldCheck, ShoppingBag, 
  Check, ChevronRight, ChevronLeft, Info, ExternalLink, Lock, Flame, Droplets, 
  Camera, Thermometer, Zap, CheckCheck, Award, ArrowUpRight, Plus, RefreshCw
} from 'lucide-react';
import { MaintenanceItem, NavTab, Order } from '../types';
import { generateMaintenanceItems, formatSuggestedDate, getUrgencyFromDaysAndHealth } from '../data/maintenanceData';

interface MaintenanceCalendarProps {
  orders?: Order[];
  onNavigate?: (tab: NavTab) => void;
  onOpenContactMaint?: (deviceName: string) => void;
  onOpenToast?: (title: string, desc?: string) => void;
}

export const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  orders = [],
  onNavigate,
  onOpenContactMaint,
  onOpenToast,
}) => {
  // Estado local para permitir marcar mantenimientos como realizados o reprogramados
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(() => {
    return generateMaintenanceItems(orders);
  });

  // Si cambian las órdenes (ej. compra en la tienda), aseguramos sincronizar
  React.useEffect(() => {
    setMaintenanceItems((prev) => {
      const generated = generateMaintenanceItems(orders);
      // Mantener el estado de completado si ya fue manipulado por el usuario
      return generated.map((gen) => {
        const existing = prev.find((p) => p.id === gen.id);
        if (existing && existing.status === 'completed') {
          return existing;
        }
        return gen;
      });
    });
  }, [orders]);

  // Filtros de visualización
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'store' | 'completed'>('all');
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'next'>('current');
  const [rescheduleModalItem, setRescheduleModalItem] = useState<MaintenanceItem | null>(null);
  const [newSelectedDate, setNewSelectedDate] = useState<string>('');

  // Marcar mantenimiento como completado / revisado hoy
  const handleMarkAsCompleted = (itemId: string) => {
    setMaintenanceItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextDate = formatSuggestedDate(item.cycleIntervalDays);
          return {
            ...item,
            status: 'completed',
            healthPercent: 100,
            daysRemaining: item.cycleIntervalDays,
            urgency: 'good',
            lastMaintenanceDate: `Hoy (${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})`,
            nextSuggestedDate: nextDate,
          };
        }
        return item;
      })
    );

    if (onOpenToast) {
      onOpenToast('¡Mantenimiento registrado con éxito!', 'Ciclo de vida renovado al 100% y próxima fecha recalculada.');
    }
  };

  // Restablecer o simular estado previo
  const handleResetItem = (itemId: string) => {
    const originalList = generateMaintenanceItems(orders);
    const original = originalList.find((i) => i.id === itemId);
    if (original) {
      setMaintenanceItems((prev) =>
        prev.map((item) => (item.id === itemId ? original : item))
      );
      if (onOpenToast) {
        onOpenToast('Ciclo restaurado al estado de telemetría original');
      }
    }
  };

  // Guardar reprogramación de fecha
  const handleSaveReschedule = () => {
    if (!rescheduleModalItem || !newSelectedDate) return;
    
    // Calcular días aproximados
    const target = new Date(newSelectedDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    setMaintenanceItems((prev) =>
      prev.map((item) => {
        if (item.id === rescheduleModalItem.id) {
          const formatted = target.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
          return {
            ...item,
            status: 'scheduled',
            nextSuggestedDate: formatted,
            daysRemaining: diffDays,
            urgency: getUrgencyFromDaysAndHealth(diffDays, item.healthPercent),
          };
        }
        return item;
      })
    );

    setRescheduleModalItem(null);
    setNewSelectedDate('');
    if (onOpenToast) {
      onOpenToast('Fecha de mantenimiento reprogramada', `Nueva fecha asignada para ${rescheduleModalItem.name}.`);
    }
  };

  // Cálculos estadísticos
  const urgentCount = useMemo(() => {
    return maintenanceItems.filter((i) => i.urgency === 'critical' && i.status !== 'completed').length;
  }, [maintenanceItems]);

  const warningCount = useMemo(() => {
    return maintenanceItems.filter((i) => i.urgency === 'warning' && i.status !== 'completed').length;
  }, [maintenanceItems]);

  const averageHealth = useMemo(() => {
    if (maintenanceItems.length === 0) return 100;
    const sum = maintenanceItems.reduce((acc, i) => acc + i.healthPercent, 0);
    return Math.round(sum / maintenanceItems.length);
  }, [maintenanceItems]);

  const storePurchasedCount = useMemo(() => {
    return maintenanceItems.filter((i) => !!i.orderId).length;
  }, [maintenanceItems]);

  // Lista filtrada
  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case 'urgent':
        return maintenanceItems.filter((i) => (i.urgency === 'critical' || i.urgency === 'warning') && i.status !== 'completed');
      case 'store':
        return maintenanceItems.filter((i) => !!i.orderId);
      case 'completed':
        return maintenanceItems.filter((i) => i.status === 'completed');
      default:
        return maintenanceItems;
    }
  }, [maintenanceItems, activeFilter]);

  // Helper de icono por tipo de dispositivo
  const renderDeviceIcon = (productId: string) => {
    switch (productId) {
      case 'cerradura-inteligente':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'sensor-humo':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'sensor-inundacion':
        return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'camara-ip':
        return <Camera className="w-5 h-5 text-cyan-400" />;
      case 'termostato-inteligente':
        return <Thermometer className="w-5 h-5 text-amber-400" />;
      case 'robot-aspirador':
        return <RefreshCw className="w-5 h-5 text-indigo-400" />;
      default:
        return <Wrench className="w-5 h-5 text-[#009fe3]" />;
    }
  };

  // Simulación del calendario mensual
  // Mes actual (Octubre 2026) y Mes siguiente (Noviembre 2026)
  const calendarDays = useMemo(() => {
    const isCurrent = selectedMonth === 'current';
    const monthName = isCurrent ? 'Octubre 2026' : 'Noviembre 2026';
    const totalDays = isCurrent ? 31 : 30;
    const startingDayOfWeek = isCurrent ? 4 : 0; // Jueves para 1 Oct 2026, Domingo para Nov

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      // Buscar si algún dispositivo tiene fecha de mantenimiento en este día
      // Mapeo demostrativo interactivo para Octubre / Noviembre
      let matchingItems: MaintenanceItem[] = [];
      if (isCurrent) {
        if (d === 21) {
          matchingItems = maintenanceItems.filter((i) => i.productId === 'cerradura-inteligente');
        } else if (d === 27) {
          matchingItems = maintenanceItems.filter((i) => i.productId === 'robot-aspirador');
        }
      } else {
        if (d === 2) {
          matchingItems = maintenanceItems.filter((i) => i.productId === 'camara-ip');
        } else if (d === 16) {
          matchingItems = maintenanceItems.filter((i) => i.productId === 'sensor-humo');
        }
      }
      days.push({ dayNumber: d, isCurrentMonth: true, matchingItems });
    }
    return { monthName, days };
  }, [selectedMonth, maintenanceItems]);

  return (
    <section 
      id="calendario-mantenimiento" 
      className="mt-12 sm:mt-16 scroll-mt-24 transition-all"
    >
      {/* Contenedor Principal de la Sección */}
      <div className="bg-white dark:bg-[#051c3d] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 dark:border-slate-700/70 shadow-2xl relative overflow-hidden">
        
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#009fe3]/10 dark:bg-[#009fe3]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado Principal */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6 sm:pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#009fe3]/10 text-[#009fe3] dark:text-cyan-300 border border-[#009fe3]/30 text-xs font-bold uppercase tracking-wider mb-3">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Aegis Care · Calendario de Mantenimiento Preventivo</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#031733] dark:text-white tracking-tight">
              Vida Útil & Fechas de Revisión Sugeridas
            </h2>
            
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Monitoreo continuo del desgaste de componentes y ciclos de batería para los dispositivos comprados en la tienda y equipamiento inteligente. 
              Recibe avisos predictivos antes de que ocurran fallos.
            </p>
          </div>

          {/* Botones de acción superior */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('tienda')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#009fe3]" />
                <span>Tienda de Recambios</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onOpenContactMaint) {
                  onOpenContactMaint('Revisión Técnica Preventiva');
                } else if (onNavigate) {
                  onNavigate('contacto');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#009fe3]/25"
            >
              <Wrench className="w-4 h-4" />
              <span>Solicitar Técnico Oficial</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen Numérico / KPIs de Salud */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6 sm:my-8 relative z-10">
          
          {/* KPI 1: Dispositivos en Seguimiento */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07244c]/70 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-[#009fe3]/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Dispositivos Activos</span>
              <Wrench className="w-4 h-4 text-[#009fe3]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#031733] dark:text-white">
              {maintenanceItems.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {storePurchasedCount > 0 ? `${storePurchasedCount} comprados en tienda` : 'Equipamiento integrado'}
            </p>
          </div>

          {/* KPI 2: Salud Media del Ecosistema */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07244c]/70 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-emerald-500/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Salud Global Promedio</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#031733] dark:text-white">
                {averageHealth}%
              </span>
              <span className={`text-[11px] font-bold ${averageHealth >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {averageHealth >= 70 ? 'Excelente' : 'Atención recomendada'}
              </span>
            </div>
            {/* Barra mini */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  averageHealth >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${averageHealth}%` }}
              />
            </div>
          </div>

          {/* KPI 3: Mantenimiento Próximo / Urgente */}
          <div className={`p-4 rounded-2xl border transition-all ${
            urgentCount > 0
              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80'
              : 'bg-slate-50 dark:bg-[#07244c]/70 border-slate-200/80 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={urgentCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                Atención Próxima
              </span>
              <AlertTriangle className={`w-4 h-4 ${urgentCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black ${urgentCount > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-[#031733] dark:text-white'}`}>
                {urgentCount}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {urgentCount === 1 ? 'dispositivo crítico' : 'dispositivos urgentes'}
              </span>
            </div>
            <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 truncate">
              {urgentCount > 0 ? '⚠️ Revisar cerradura (batería < 20%)' : 'Sin alertas críticas hoy'}
            </p>
          </div>

          {/* KPI 4: Garantía Oficial Aegis Care */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07244c]/70 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-amber-500/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Garantía Oficial</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#031733] dark:text-white">
              3 Años
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Reemplazo express y asistencia técnica incluida
            </p>
          </div>

        </div>

        {/* Sección Dividida: Mini Calendario Mensual Interactivo & Filtros de Dispositivos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
          
          {/* Columna Izquierda: Calendario Visual Mensual (5 columnas) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#031733] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
            
            {/* Header del Calendario Mensual con selector de mes */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#009fe3]" />
                <h4 className="text-sm font-bold text-[#031733] dark:text-white">
                  {calendarDays.monthName}
                </h4>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedMonth('current')}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    selectedMonth === 'current'
                      ? 'bg-[#009fe3] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  Octubre
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonth('next')}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    selectedMonth === 'next'
                      ? 'bg-[#009fe3] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  Noviembre
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Lu</span>
              <span>Ma</span>
              <span>Mi</span>
              <span>Ju</span>
              <span>Vi</span>
              <span>Sá</span>
              <span>Do</span>
            </div>

            {/* Cuadrícula de Días */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.days.map((d, index) => {
                if (!d.isCurrentMonth || !d.dayNumber) {
                  return (
                    <div 
                      key={`empty-${index}`} 
                      className="h-8 sm:h-9 flex items-center justify-center text-slate-300 dark:text-slate-700 select-none text-[10px]"
                    >
                      -
                    </div>
                  );
                }

                const hasMatches = d.matchingItems && d.matchingItems.length > 0;
                const topMatch = hasMatches ? d.matchingItems[0] : null;
                const isCritical = topMatch && topMatch.urgency === 'critical';
                const isCompleted = topMatch && topMatch.status === 'completed';

                return (
                  <div
                    key={`day-${d.dayNumber}`}
                    className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                      hasMatches
                        ? isCompleted
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold'
                          : isCritical
                            ? 'bg-rose-500/20 border border-rose-500/60 text-rose-600 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/40'
                            : 'bg-amber-500/20 border border-amber-500/60 text-amber-600 dark:text-amber-300 font-bold'
                        : d.dayNumber === 9 && selectedMonth === 'current'
                          ? 'bg-[#009fe3]/15 text-[#009fe3] dark:text-cyan-300 font-bold border border-[#009fe3]/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={
                      hasMatches 
                        ? `${d.dayNumber} ${selectedMonth === 'current' ? 'Oct' : 'Nov'}: Mantenimiento de ${topMatch?.name}` 
                        : d.dayNumber === 9 && selectedMonth === 'current' ? 'Hoy' : undefined
                    }
                  >
                    <span className="text-[11px] leading-none">{d.dayNumber}</span>
                    {hasMatches && (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          isCompleted ? 'bg-emerald-500' : isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                        }`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Leyenda y Próximo Hito destacado */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Crítico (≤ 15 días)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Revisión próxima</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Al día</span>
                </span>
              </div>

              {/* Tarjeta de Próximo Hito Inmediato */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                      Próxima Fecha Sugerida
                    </span>
                    <span className="text-xs font-bold text-[#031733] dark:text-white">
                      Cerradura Inteligente · 21 Octubre
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lockItem = maintenanceItems.find((i) => i.productId === 'cerradura-inteligente');
                    if (lockItem) handleMarkAsCompleted(lockItem.id);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer shrink-0 transition-colors"
                >
                  Revisar
                </button>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjetas Detalladas de Dispositivos (7 columnas) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Barra de Filtros */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[#009fe3] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Todos ({maintenanceItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('urgent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeFilter === 'urgent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Requiere Atención ({urgentCount + warningCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('store')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeFilter === 'store'
                      ? 'bg-[#051c3d] text-white border border-cyan-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3 text-[#009fe3]" />
                  <span>Comprados en Tienda ({storePurchasedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>Al día</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                {filteredItems.length} dispositivos mostrados
              </span>
            </div>

            {/* Listado de Tarjetas de Mantenimiento de Dispositivos */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#031733] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <CheckCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-[#031733] dark:text-white">No hay dispositivos en esta categoría</p>
                  <p className="text-xs mt-1">Todos los dispositivos cumplen los criterios o no requieren acción inmediata.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const isCritical = item.urgency === 'critical' && !isCompleted;
                  const isWarning = item.urgency === 'warning' && !isCompleted;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isCompleted
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                          : isCritical
                            ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/50 hover:border-rose-500 shadow-sm'
                            : isWarning
                              ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/40 hover:border-amber-500 shadow-sm'
                              : 'bg-white dark:bg-[#041a36] border-slate-200/90 dark:border-slate-800 hover:border-[#009fe3]/50 shadow-xs'
                      }`}
                    >
                      {/* Cabecera de la tarjeta: Icono, Nombre, Tags */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isCritical
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}>
                            {renderDeviceIcon(item.productId)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-[#031733] dark:text-white">
                                {item.name}
                              </h4>
                              {item.orderId && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 flex items-center gap-1">
                                  <ShoppingBag className="w-2.5 h-2.5" />
                                  <span>Pedido #{item.orderId}</span>
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Al día</span>
                                </span>
                              )}
                              {isCritical && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse">
                                  ⚠️ Acción Inmediata
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.componentName} · {item.estimatedLifespan}
                            </p>
                          </div>
                        </div>

                        {/* Indicador de Fecha Sugerida y Días Restantes */}
                        <div className="sm:text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Próxima fecha sugerida:
                          </span>
                          <span className={`text-xs sm:text-sm font-extrabold block ${
                            isCompleted 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : isCritical 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : isWarning 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-[#009fe3]'
                          }`}>
                            {item.nextSuggestedDate}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {isCompleted 
                              ? `Ciclo renovado (+${item.daysRemaining} días)` 
                              : item.daysRemaining <= 0 
                                ? '¡Vencido hoy!' 
                                : `En ${item.daysRemaining} días`}
                          </span>
                        </div>
                      </div>

                      {/* Barra de Salud / Vida Útil del Componente */}
                      <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                            {item.productId === 'cerradura-inteligente' ? (
                              <Battery className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 text-[#009fe3]" />
                            )}
                            <span>Vida útil estimada restante:</span>
                          </span>
                          <span className={`font-mono font-black ${
                            item.healthPercent <= 25 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : item.healthPercent <= 50 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {item.healthPercent}%
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.healthPercent <= 25 
                                ? 'bg-gradient-to-r from-rose-600 to-rose-400' 
                                : item.healthPercent <= 50 
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${Math.max(5, item.healthPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Recomendación de acción técnica */}
                      <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#03152c] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#009fe3] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item.actionRequired}</span>
                      </div>

                      {/* Botones de acción por dispositivo */}
                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                        <span className="text-[11px] text-slate-400">
                          Última: {item.lastMaintenanceDate}
                        </span>

                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleResetItem(item.id)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                              title="Restaurar a estado original para probar alertas"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restablecer</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkAsCompleted(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-900/30"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Marcar Realizado</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleModalItem(item);
                              // Por defecto fecha en 1 mes
                              const d = new Date();
                              d.setDate(d.getDate() + 30);
                              setNewSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3 text-[#009fe3]" />
                            <span>Reprogramar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenContactMaint) {
                                onOpenContactMaint(`Mantenimiento ${item.name}`);
                              } else if (onNavigate) {
                                onNavigate('contacto');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#009fe3]/10 hover:bg-[#009fe3]/20 text-[#009fe3] dark:text-cyan-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#009fe3]/30"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Pedir Técnico</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Modal de Reprogramación de Fecha */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#051c3d] text-white border border-cyan-800/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Reprogramar Fecha Sugerida</h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Dispositivo:</span>
                <span className="font-bold text-sm text-white">{rescheduleModalItem.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{rescheduleModalItem.componentName}</p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Selecciona la nueva fecha de mantenimiento:
                </label>
                <input
                  type="date"
                  value={newSelectedDate}
                  onChange={(e) => setNewSelectedDate(e.target.value)}
                  className="w-full bg-[#031733] border border-cyan-600/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] leading-relaxed">
                <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
                Aegis reprogramará las alertas en tu panel central para avisarte cuando se aproxime la nueva fecha elegida.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setRescheduleModalItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Guardar Nueva Fecha
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
