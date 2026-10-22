import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Shield, ShieldCheck, ShieldAlert, Lock, Camera, 
  DoorClosed, Activity, BellRing, Lightbulb, Zap, ToggleRight, 
  Thermometer, Wind, Blinds, Flame, Droplets, Mic, Disc, Leaf, 
  Check, Play, Download, ShoppingBag, Info, Sliders, Search, 
  CheckCircle2, ArrowRight, Layers, RefreshCw, AlertTriangle, 
  SlidersHorizontal, Award, Clock, ArrowUpRight, Copy, CheckCheck
} from 'lucide-react';
import { 
  DeviceCategory, 
  SmartDeviceDef, 
  AutomationRecommendation, 
  NavTab, 
  Product, 
  DeviceStatus, 
  Order 
} from '../types';
import { 
  SMART_DEVICES_CATALOG, 
  PRESET_PROFILES, 
  AUTOMATION_RULES_DATABASE 
} from '../data/deviceAssistantData';
import { PRODUCTS } from '../data/products';

interface DeviceConfigAssistantProps {
  onAddToCart?: (product: Product) => void;
  onNavigate?: (tab: NavTab) => void;
  deviceStatus?: DeviceStatus;
  setDeviceStatus?: React.Dispatch<React.SetStateAction<DeviceStatus>>;
  orders?: Order[];
  addToast?: (type: 'success' | 'info' | 'warning', title: string, description?: string) => void;
}

export const DeviceConfigAssistant: React.FC<DeviceConfigAssistantProps> = ({
  onAddToCart,
  onNavigate,
  deviceStatus,
  setDeviceStatus,
  orders = [],
  addToast,
}) => {
  // State for user's selected devices in home
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aegis_user_devices');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    // Default sensible preset: essential urban home
    return ['cerradura_inteligente', 'bombillas_rgb', 'termostato_smart', 'sensor_apertura', 'altavoz_asistente'];
  });

  // State for activated automations (user enables/disables them)
  const [activeAutomationIds, setActiveAutomationIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aegis_active_automations');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return ['auto_salir_casa_blindaje', 'auto_clima_ventana_abierta', 'auto_llegada_confort'];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('aegis_user_devices', JSON.stringify(selectedDeviceIds));
  }, [selectedDeviceIds]);

  useEffect(() => {
    localStorage.setItem('aegis_active_automations', JSON.stringify(activeAutomationIds));
  }, [activeAutomationIds]);

  // Filters & Search
  const [deviceCategoryFilter, setDeviceCategoryFilter] = useState<string>('all');
  const [deviceSearchQuery, setDeviceSearchQuery] = useState<string>('');
  const [automationCategoryFilter, setAutomationCategoryFilter] = useState<string>('all');
  const [automationStatusFilter, setAutomationStatusFilter] = useState<'all' | 'ready' | 'unlockable'>('all');

  // Simulation modal state
  const [simulatingRule, setSimulatingRule] = useState<AutomationRecommendation | null>(null);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // Helper for rendering icons
  const renderDeviceIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Lock': return <Lock className={className} />;
      case 'Camera': return <Camera className={className} />;
      case 'DoorClosed': return <DoorClosed className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'BellRing': return <BellRing className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ToggleRight': return <ToggleRight className={className} />;
      case 'Thermometer': return <Thermometer className={className} />;
      case 'Wind': return <Wind className={className} />;
      case 'Blinds': return <Blinds className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Toggle single device
  const toggleDevice = (id: string) => {
    setSelectedDeviceIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((d) => d !== id) : [...prev, id];
      const device = SMART_DEVICES_CATALOG.find((d) => d.id === id);
      if (addToast && device) {
        if (!exists) {
          addToast('success', `${device.name} añadido`, 'Nuevas recomendaciones de automatización calculadas.');
        } else {
          addToast('info', `${device.name} eliminado`, 'Se han actualizado las rutinas disponibles.');
        }
      }
      return updated;
    });
  };

  // Apply a preset
  const applyPreset = (presetDevices: string[], presetName: string) => {
    setSelectedDeviceIds(presetDevices);
    if (addToast) {
      addToast('success', `Perfil aplicado: ${presetName}`, `${presetDevices.length} dispositivos configurados.`);
    }
  };

  // Auto-detect from orders
  const importFromOrders = () => {
    const detected: string[] = [];
    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const found = SMART_DEVICES_CATALOG.find((d) => d.storeProductId === item.productId);
        if (found && !detected.includes(found.id)) {
          detected.push(found.id);
        }
      });
    });

    if (detected.length === 0) {
      if (addToast) {
        addToast('info', 'No se detectaron compras', 'No encontramos dispositivos en tu historial de pedidos recientes.');
      }
      return;
    }

    setSelectedDeviceIds((prev) => {
      const merged = Array.from(new Set([...prev, ...detected]));
      if (addToast) {
        addToast('success', '¡Dispositivos importados con éxito!', `Se han añadido ${detected.length} dispositivos de tus compras de Aegis.`);
      }
      return merged;
    });
  };

  // Filtered devices catalog
  const filteredDevices = useMemo(() => {
    return SMART_DEVICES_CATALOG.filter((device) => {
      const matchesCategory = deviceCategoryFilter === 'all' || device.category === deviceCategoryFilter;
      const matchesQuery = 
        deviceSearchQuery.trim() === '' ||
        device.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
        device.description.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
        device.categoryLabel.toLowerCase().includes(deviceSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [deviceCategoryFilter, deviceSearchQuery]);

  // Analyzed Automations: evaluate compatibility with selected devices
  const evaluatedAutomations = useMemo(() => {
    return AUTOMATION_RULES_DATABASE.map((rule) => {
      const hasAllRequired = rule.requiredDeviceIds.every((reqId) => selectedDeviceIds.includes(reqId));
      const missingRequired = rule.requiredDeviceIds.filter((reqId) => !selectedDeviceIds.includes(reqId));
      const hasSomeRequired = rule.requiredDeviceIds.some((reqId) => selectedDeviceIds.includes(reqId));
      
      const missingDevicesInfo = missingRequired.map((id) => {
        return SMART_DEVICES_CATALOG.find((d) => d.id === id) || { id, name: id };
      });

      // Match percentage
      const matchedCount = rule.requiredDeviceIds.filter((id) => selectedDeviceIds.includes(id)).length;
      const matchPct = Math.round((matchedCount / rule.requiredDeviceIds.length) * 100);

      const isReady = hasAllRequired;
      const isUnlockable = !hasAllRequired && (missingRequired.length === 1 || hasSomeRequired);

      return {
        ...rule,
        isReady,
        isUnlockable,
        missingRequired,
        missingDevicesInfo,
        matchPct,
        isActive: activeAutomationIds.includes(rule.id),
      };
    });
  }, [selectedDeviceIds, activeAutomationIds]);

  // Filtered Automations
  const filteredAutomations = useMemo(() => {
    return evaluatedAutomations.filter((auto) => {
      // Category filter
      if (automationCategoryFilter !== 'all' && auto.category !== automationCategoryFilter) {
        return false;
      }
      // Status filter
      if (automationStatusFilter === 'ready' && !auto.isReady) {
        return false;
      }
      if (automationStatusFilter === 'unlockable' && (auto.isReady || !auto.isUnlockable)) {
        return false;
      }
      return true;
    });
  }, [evaluatedAutomations, automationCategoryFilter, automationStatusFilter]);

  // Aggregate Metrics & KPIs
  const metrics = useMemo(() => {
    const readyCount = evaluatedAutomations.filter((a) => a.isReady).length;
    const unlockableCount = evaluatedAutomations.filter((a) => a.isUnlockable).length;
    const activeCount = evaluatedAutomations.filter((a) => a.isReady && a.isActive).length;

    // Estimated energy saving from active or ready energy automations
    const activeEnergyAutos = evaluatedAutomations.filter((a) => a.isReady && a.isActive && a.energySavingPct);
    const maxEnergySaving = activeEnergyAutos.reduce((acc, a) => acc + (a.energySavingPct || 0), 0);
    // realistic capped saving
    const realisticEnergySavingPct = Math.min(36, Math.round(maxEnergySaving * 0.75));

    // Security score
    const hasLock = selectedDeviceIds.includes('cerradura_inteligente');
    const hasCam = selectedDeviceIds.includes('camaras_seguridad');
    const hasSensors = selectedDeviceIds.includes('sensor_apertura') || selectedDeviceIds.includes('sensor_movimiento');
    const hasSafety = selectedDeviceIds.includes('sensor_humo') || selectedDeviceIds.includes('sensor_inundacion');
    
    let secScore = 20;
    if (hasLock) secScore += 25;
    if (hasCam) secScore += 20;
    if (hasSensors) secScore += 18;
    if (hasSafety) secScore += 17;
    secScore = Math.min(100, secScore);

    return {
      selectedCount: selectedDeviceIds.length,
      readyCount,
      unlockableCount,
      activeCount,
      realisticEnergySavingPct,
      secScore,
    };
  }, [selectedDeviceIds, evaluatedAutomations]);

  // Toggle active status of an automation
  const handleToggleAutomation = (ruleId: string) => {
    const rule = evaluatedAutomations.find((r) => r.id === ruleId);
    if (!rule) return;

    if (!rule.isReady) {
      if (addToast) {
        addToast(
          'warning',
          'Dispositivo requerido faltante',
          `Necesitas tener configurado "${rule.missingDevicesInfo.map((d) => d.name).join(', ')}" para activar esta rutina.`
        );
      }
      return;
    }

    setActiveAutomationIds((prev) => {
      const isActive = prev.includes(ruleId);
      const next = isActive ? prev.filter((id) => id !== ruleId) : [...prev, ruleId];
      if (addToast) {
        if (!isActive) {
          addToast('success', `Automatización activada: ${rule.title}`, 'El hub de Aegis ejecutará esta regla en segundo plano.');
        } else {
          addToast('info', `Automatización pausada: ${rule.title}`, 'Puedes reactivarla cuando desees.');
        }
      }
      return next;
    });
  };

  // Start Live Simulation
  const handleStartSimulation = (rule: AutomationRecommendation) => {
    setSimulatingRule(rule);
    setSimulationStep(1);

    // Step 1: Detonante detectado
    setTimeout(() => {
      setSimulationStep(2);
    }, 1400);

    // Step 2: Procesamiento Aegis
    setTimeout(() => {
      setSimulationStep(3);
    }, 2800);

    // Step 3: Acción completada y sincronización con el panel de control real
    setTimeout(() => {
      setSimulationStep(4);
      if (setDeviceStatus) {
        if (rule.id === 'auto_salir_casa_blindaje') {
          setDeviceStatus((prev) => ({
            ...prev,
            lockOpen: false,
            camerasActive: true,
            lightsOn: false,
            routineActive: true,
          }));
        } else if (rule.id === 'auto_llegada_confort') {
          setDeviceStatus((prev) => ({
            ...prev,
            lockOpen: true,
            lightsOn: true,
            camerasActive: false,
          }));
        } else if (rule.id === 'auto_simulacion_presencia') {
          setDeviceStatus((prev) => ({
            ...prev,
            vacationMode: true,
            shuttersClosed: true,
            lightsOn: true,
          }));
        } else if (rule.id === 'auto_modo_noche_circadiano') {
          setDeviceStatus((prev) => ({
            ...prev,
            lightsOn: true,
            nightModeActive: true,
            nightBrightness: 20,
            nightColorTempK: 2200,
          }));
        }
      }

      if (addToast) {
        addToast('success', `Simulación ejecutada: ${rule.title}`, 'Los parámetros en tu panel de control se han actualizado en tiempo real.');
      }
    }, 4200);
  };

  // Direct add store product to cart
  const handleBuyProduct = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product && onAddToCart) {
      onAddToCart(product);
    } else if (onNavigate) {
      onNavigate('tienda');
    }
  };

  // Export Automation Plan to Clipboard or download
  const handleExportPlan = () => {
    const planText = {
      sistema: 'AEGIS Smart Home - Plan de Automatizaciones Personalizado',
      fecha: new Date().toLocaleDateString('es-ES', { dateStyle: 'full' }),
      dispositivos_instalados: selectedDeviceIds.map((id) => {
        const dev = SMART_DEVICES_CATALOG.find((d) => d.id === id);
        return { id, nombre: dev?.name, categoria: dev?.categoryLabel };
      }),
      metricas_estimadas: {
        ahorro_energetico_anual: `${metrics.realisticEnergySavingPct}%`,
        indice_seguridad: `${metrics.secScore}/100`,
        rutinas_activas: metrics.activeCount,
      },
      automatizaciones_activas: evaluatedAutomations
        .filter((a) => a.isReady && a.isActive)
        .map((a) => ({
          titulo: a.title,
          categoria: a.categoryLabel,
          detonante: a.trigger,
          accion: a.action,
        })),
      proximas_mejoras_recomendadas: evaluatedAutomations
        .filter((a) => a.isUnlockable)
        .slice(0, 3)
        .map((a) => ({
          rutina_a_desbloquear: a.title,
          dispositivo_requerido: a.missingDevicesInfo.map((d) => d.name).join(', '),
          producto_tienda: a.recommendedStoreProductName,
        })),
    };

    const jsonString = JSON.stringify(planText, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 3000);
      if (addToast) {
        addToast('success', 'Plan copiado al portapapeles', 'Puedes compartirlo con tu técnico instalador o guardarlo en tus notas.');
      }
    });
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-colors duration-300">
      {/* Hero / Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#031b3c] via-[#07244c] to-[#04162e] border border-cyan-500/30 p-6 sm:p-8 md:p-10 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>MOTOR INTELIGENTE DE CONFIGURACIÓN & RUTINAS</span>
            </div>

            <div className="flex items-center gap-2">
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={importFromOrders}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Detectar automáticamente dispositivos comprados en Aegis"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sincronizar de Mis Pedidos ({orders.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportPlan}
                className="px-3 py-1.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/60 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copiedPlan ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPlan ? '¡Plan Copiado!' : 'Exportar Plan'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Asistente de Configuración de Dispositivos
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Marca los dispositivos inteligentes que ya tienes instalados en tu hogar. Nuestro motor analizará 
            las sinergias posibles para sugerirte <strong className="text-cyan-300 font-semibold">rutinas de automatización personalizadas</strong> de seguridad, confort y ahorro energético sin requerir conocimientos técnicos.
          </p>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-700/70">
            <div className="bg-[#051a36]/80 rounded-2xl p-3.5 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Dispositivos Activos</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{metrics.selectedCount}</span>
                <span className="text-xs text-slate-400 font-medium">de {SMART_DEVICES_CATALOG.length}</span>
              </div>
              <div className="mt-1 text-[11px] text-cyan-300 font-medium truncate">
                {metrics.selectedCount >= 4 ? 'Ecosistema robusto' : 'Kit inicial'}
              </div>
            </div>

            <div className="bg-[#051a36]/80 rounded-2xl p-3.5 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Rutinas Compatibles</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">{metrics.readyCount}</span>
                <span className="text-xs text-slate-400 font-medium">desbloqueadas</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-300 font-medium">
                {metrics.activeCount} activas en tu hub
              </div>
            </div>

            <div className="bg-[#051a36]/80 rounded-2xl p-3.5 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Ahorro Estimado</span>
                <Leaf className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-teal-300">-{metrics.realisticEnergySavingPct}%</span>
                <span className="text-xs text-slate-400 font-medium">luz & gas</span>
              </div>
              <div className="mt-1 text-[11px] text-teal-200 font-medium">
                ~ 340 € / año estimado
              </div>
            </div>

            <div className="bg-[#051a36]/80 rounded-2xl p-3.5 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Índice de Seguridad</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyan-300">{metrics.secScore}</span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </div>
              <div className="mt-1 text-[11px] text-cyan-200 font-medium">
                {metrics.secScore >= 80 ? 'Protección Blindada' : 'Protección Estándar'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div className="bg-white dark:bg-[#071d3a] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#009fe3]" />
              Plantillas Rápidas según tu Tipo de Vivienda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Carga una combinación preconfigurada en 1 clic o personaliza dispositivo por dispositivo:
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDeviceIds([]);
              if (addToast) addToast('info', 'Selección vaciada', 'Marca los dispositivos que tienes en casa.');
            }}
            className="text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpiar todo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_PROFILES.map((preset) => {
            const isFullyActive = preset.devices.every((d) => selectedDeviceIds.includes(d));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.devices, preset.name)}
                className={`p-3 rounded-xl text-left border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                  isFullyActive
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500/60 ring-2 ring-cyan-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#092244] dark:hover:bg-[#0d2a52] border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#009fe3]/15 text-[#009fe3] dark:text-cyan-300">
                      {preset.tag}
                    </span>
                    {isFullyActive && <Check className="w-4 h-4 text-cyan-500" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#009fe3] transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/40 flex items-center justify-between text-[11px] font-semibold text-[#009fe3]">
                  <span>{preset.devices.length} dispositivos</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">Cargar →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Column = Device Selector / Right Column = Personalized Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Device Selection (5 columns on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#071d3a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#009fe3]" />
                  1. Tus Dispositivos Actuales
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona todo lo que ya tienes instalado en tu hogar:
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                {selectedDeviceIds.length} seleccionados
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={deviceSearchQuery}
                onChange={(e) => setDeviceSearchQuery(e.target.value)}
                placeholder="Buscar dispositivo (ej. cerradura, cámara, foco)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#03152c] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
              />
              {deviceSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDeviceSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin mb-3 text-xs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'security', label: 'Seguridad' },
                { id: 'lighting', label: 'Luces' },
                { id: 'climate', label: 'Clima' },
                { id: 'safety', label: 'Prevención' },
                { id: 'appliances', label: 'Otros' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDeviceCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    deviceCategoryFilter === cat.id
                      ? 'bg-[#009fe3] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#03152c] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Device Cards List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredDevices.map((device) => {
                const isSelected = selectedDeviceIds.includes(device.id);
                return (
                  <div
                    key={device.id}
                    onClick={() => toggleDevice(device.id)}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group select-none ${
                      isSelected
                        ? 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500/70 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#041935]/70 hover:bg-slate-100 dark:hover:bg-[#062145] border-slate-200 dark:border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#009fe3] text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#009fe3]'
                        }`}
                      >
                        {renderDeviceIcon(device.icon, 'w-4 h-4')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {device.name}
                          </h4>
                          {device.popular && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                              TOP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {device.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle / Checkbox */}
                    <div className="shrink-0 flex items-center">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-[#009fe3] border-[#009fe3] text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDevices.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron dispositivos con ese criterio de búsqueda.
                </div>
              )}
            </div>

            {/* Quick helper tip */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#03152c] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#009fe3] shrink-0 mt-0.5" />
              <span>
                <strong>Compatibilidad universal:</strong> El asistente soporta dispositivos de cualquier marca compatibles con los estándares <strong>Matter, Zigbee, Z-Wave o WiFi</strong> gestionados por Aegis.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personalized Automation Recommendations (7 columns on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#071d3a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            
            {/* Header with Title and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  2. Recomendaciones Personalizadas de Automatización
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculadas dinámicamente según la combinación de dispositivos que has marcado:
                </p>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAutomationStatusFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    automationStatusFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-cyan-900 dark:text-cyan-200'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Todas ({evaluatedAutomations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAutomationStatusFilter('ready')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    automationStatusFilter === 'ready'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  ✓ Listas ({metrics.readyCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAutomationStatusFilter('unlockable')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    automationStatusFilter === 'unlockable'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  Desbloqueables ({metrics.unlockableCount})
                </button>
              </div>
            </div>

            {/* Category Sub-Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin mb-4 text-xs">
              {[
                { id: 'all', label: 'Todas las Categorías' },
                { id: 'security', label: '🛡️ Seguridad' },
                { id: 'energy', label: '⚡ Ahorro Energético' },
                { id: 'comfort', label: '🛋️ Confort' },
                { id: 'safety', label: '🚨 Prevención Crítica' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAutomationCategoryFilter(f.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    automationCategoryFilter === f.id
                      ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-400/50'
                      : 'bg-slate-100 dark:bg-[#03152c] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Automation Cards List */}
            <div className="space-y-4">
              {filteredAutomations.map((rule) => {
                const isActive = rule.isActive;

                return (
                  <div
                    key={rule.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                      rule.isReady
                        ? isActive
                          ? 'bg-gradient-to-br from-cyan-950/20 via-[#062145]/40 to-slate-900/30 dark:bg-cyan-950/30 border-cyan-500/50 shadow-md'
                          : 'bg-white dark:bg-[#051c3a] border-slate-200 dark:border-slate-800 shadow-sm'
                        : 'bg-slate-50/80 dark:bg-[#03152c]/80 border-dashed border-slate-300 dark:border-slate-700/80'
                    }`}
                  >
                    {/* Card Top: Badges and Title */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {rule.isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                            100% COMPATIBLE CON TUS DISPOSITIVOS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            FALTA {rule.missingRequired.length} DISPOSITIVO PARA ACTIVAR
                          </span>
                        )}

                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rule.categoryLabel}
                        </span>
                      </div>

                      {/* Active Switch Toggle for Ready automations */}
                      {rule.isReady && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {isActive ? 'Activa' : 'Inactiva'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAutomation(rule.id)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 focus:outline-none ${
                              isActive ? 'bg-[#009fe3]' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            aria-label={`Activar automatización ${rule.title}`}
                          >
                            <span
                              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                      {rule.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {rule.description}
                    </p>

                    {/* Automation Logic Box (Detonante / Acción) */}
                    <div className="bg-slate-100/90 dark:bg-[#03152c] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Detonante:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {rule.trigger}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold shrink-0 flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5" /> Acción Aegis:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {rule.action}
                        </span>
                      </div>
                      {rule.condition && (
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold shrink-0">Condición inteligente:</span>
                          <span>{rule.condition}</span>
                        </div>
                      )}
                    </div>

                    {/* Required Devices Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                      <span className="text-slate-400 font-semibold mr-1">Dispositivos:</span>
                      {rule.requiredDeviceIds.map((devId) => {
                        const dev = SMART_DEVICES_CATALOG.find((d) => d.id === devId);
                        const hasIt = selectedDeviceIds.includes(devId);
                        return (
                          <span
                            key={devId}
                            className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                              hasIt
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {hasIt ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="font-bold">✕</span>}
                            <span>{dev?.name || devId}</span>
                          </span>
                        );
                      })}
                    </div>

                    {/* Bottom Row: Metrics & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-xs">
                        {rule.energySavingPct && (
                          <span className="text-teal-600 dark:text-teal-300 font-bold flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5" /> -{rule.energySavingPct}% consumo
                          </span>
                        )}
                        {rule.securityScoreBoost && (
                          <span className="text-cyan-600 dark:text-cyan-300 font-bold flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> +{rule.securityScoreBoost}% seguridad
                          </span>
                        )}
                        {rule.comfortScoreBoost && (
                          <span className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> +{rule.comfortScoreBoost}% confort
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {rule.isReady ? (
                          <button
                            type="button"
                            onClick={() => handleStartSimulation(rule)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2347] dark:hover:bg-[#0f2e5c] text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Simular en Vivo</span>
                          </button>
                        ) : (
                          rule.recommendedStoreProductId && (
                            <button
                              type="button"
                              onClick={() => handleBuyProduct(rule.recommendedStoreProductId!)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Completar con {rule.recommendedStoreProductName?.split(' ')[0]} ({rule.recommendedStoreProductPrice}€)</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAutomations.length === 0 && (
                <div className="text-center py-12 bg-slate-50 dark:bg-[#041935] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No hay recomendaciones con los filtros seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAutomationCategoryFilter('all');
                      setAutomationStatusFilter('all');
                    }}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-[#009fe3] text-white text-xs font-bold cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>

            {/* Assistance Card for Installations */}
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[#031733] to-[#07244c] border border-cyan-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  ¿Prefieres que un técnico Aegis calibre tus rutinas?
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Nuestros instaladores certificados visitan tu domicilio, integran tus dispositivos existentes y configuran el hub local para una latencia de 0 ms.
                </p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('instalaciones')}
                  className="px-4 py-2 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-md active:scale-95 shrink-0"
                >
                  Solicitar Instalación Técnica →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Simulation Step-by-Step Modal */}
      {simulatingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#051c3d] text-white border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Play className="w-4 h-4 fill-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Simulador en Vivo Aegis</h3>
                  <p className="text-xs text-cyan-300">Ejecución interactiva de automatización</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulatingRule(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold text-white mb-1">{simulatingRule.title}</h4>
              <p className="text-xs text-slate-300">{simulatingRule.description}</p>
            </div>

            {/* Stepper Display */}
            <div className="space-y-3 mb-6">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border transition-all ${
                simulationStep >= 1 ? 'bg-cyan-950/60 border-cyan-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      simulationStep >= 1 ? 'bg-[#009fe3] text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      1
                    </span>
                    Sensor / Detonante Activado
                  </span>
                  {simulationStep === 1 && <span className="text-[10px] text-cyan-300 animate-pulse font-mono">Disparando...</span>}
                  {simulationStep > 1 && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 pl-7">{simulatingRule.trigger}</p>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border transition-all ${
                simulationStep >= 2 ? 'bg-cyan-950/60 border-cyan-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      simulationStep >= 2 ? 'bg-[#009fe3] text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      2
                    </span>
                    Hub Local Aegis (Evaluación de Reglas)
                  </span>
                  {simulationStep === 2 && <span className="text-[10px] text-cyan-300 animate-pulse font-mono">Calculando...</span>}
                  {simulationStep > 2 && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 pl-7">
                  Reglas verificadas con latencia 4ms. Condición de seguridad validada positivamente.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border transition-all ${
                simulationStep >= 3 ? 'bg-cyan-950/60 border-cyan-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      simulationStep >= 3 ? 'bg-[#009fe3] text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      3
                    </span>
                    Ejecución en Dispositivos del Hogar
                  </span>
                  {simulationStep === 3 && <span className="text-[10px] text-cyan-300 animate-pulse font-mono">Sincronizando...</span>}
                  {simulationStep > 3 && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 pl-7">{simulatingRule.action}</p>
              </div>

              {/* Step 4: Finished Confirmation */}
              {simulationStep === 4 && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">¡Automatización ejecutada con éxito!</span>
                    <span className="text-[11px] text-emerald-300">
                      Tus dispositivos en el panel de control han respondido instantáneamente.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSimulatingRule(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Cerrar Simulación
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
