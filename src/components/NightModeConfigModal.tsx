import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Clock, Sparkles, Sliders, Check, X, 
  RotateCcw, Info, Zap, Lightbulb, Play, Eye
} from 'lucide-react';
import { DeviceStatus } from '../types';
import { 
  getCircadianLightingState, 
  kelvinToHex, 
  getKelvinLabel 
} from '../utils/lightingCircadian';

interface NightModeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceStatus: DeviceStatus;
  setDeviceStatus: React.Dispatch<React.SetStateAction<DeviceStatus>>;
  onNotify?: (type: 'success' | 'info' | 'warning', title: string, description?: string) => void;
}

export const NightModeConfigModal: React.FC<NightModeConfigModalProps> = ({
  isOpen,
  onClose,
  deviceStatus,
  setDeviceStatus,
  onNotify,
}) => {
  // Local state for configuration
  const [autoSchedule, setAutoSchedule] = useState<boolean>(() => deviceStatus.nightModeAutoSchedule !== false);
  const [startHour, setStartHour] = useState<number>(() => deviceStatus.nightModeStartHour ?? 22);
  const [endHour, setEndHour] = useState<number>(() => deviceStatus.nightModeEndHour ?? 7);
  const [nightBrightness, setNightBrightness] = useState<number>(() => deviceStatus.nightBrightness ?? 20);
  const [nightColorTempK, setNightColorTempK] = useState<number>(() => deviceStatus.nightColorTempK ?? 2200);
  const [dayBrightness, setDayBrightness] = useState<number>(() => deviceStatus.dayBrightness ?? 85);
  const [dayColorTempK, setDayColorTempK] = useState<number>(() => deviceStatus.dayColorTempK ?? 4500);
  const [simulatedHour, setSimulatedHour] = useState<number | null>(() => deviceStatus.simulatedSystemHour ?? null);

  // Sync when deviceStatus changes from outside
  useEffect(() => {
    setAutoSchedule(deviceStatus.nightModeAutoSchedule !== false);
    setStartHour(deviceStatus.nightModeStartHour ?? 22);
    setEndHour(deviceStatus.nightModeEndHour ?? 7);
    setNightBrightness(deviceStatus.nightBrightness ?? 20);
    setNightColorTempK(deviceStatus.nightColorTempK ?? 2200);
    setDayBrightness(deviceStatus.dayBrightness ?? 85);
    setDayColorTempK(deviceStatus.dayColorTempK ?? 4500);
    setSimulatedHour(deviceStatus.simulatedSystemHour ?? null);
  }, [deviceStatus, isOpen]);

  if (!isOpen) return null;

  // Compute live preview state based on current modal values
  const previewStatus: DeviceStatus = {
    ...deviceStatus,
    nightModeAutoSchedule: autoSchedule,
    nightModeStartHour: startHour,
    nightModeEndHour: endHour,
    nightBrightness,
    nightColorTempK,
    dayBrightness,
    dayColorTempK,
    simulatedSystemHour: simulatedHour,
  };

  const previewState = getCircadianLightingState(previewStatus);
  const realSystemTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Save changes to deviceStatus
  const handleSave = () => {
    setDeviceStatus((prev) => {
      const updated: DeviceStatus = {
        ...prev,
        nightModeAutoSchedule: autoSchedule,
        nightModeStartHour: startHour,
        nightModeEndHour: endHour,
        nightBrightness,
        nightColorTempK,
        dayBrightness,
        dayColorTempK,
        simulatedSystemHour: simulatedHour,
        nightModeActive: previewState.isNightMode,
      };
      return updated;
    });

    if (onNotify) {
      onNotify(
        'success',
        'Configuración de Modo Noche guardada',
        previewState.isNightMode
          ? `Modo Noche activo (${previewState.effectiveColorTempK}K, ${previewState.effectiveBrightness}% brillo).`
          : `Modo Día activo (${previewState.effectiveColorTempK}K, ${previewState.effectiveBrightness}% brillo). Se atenuará automáticamente a las ${startHour}:00.`
      );
    }

    onClose();
  };

  // Quick preset Kelvin selection
  const applyNightKelvinPreset = (kelvin: number) => {
    setNightColorTempK(kelvin);
  };

  // Quick time simulation
  const handleSimulateTime = (hour: number) => {
    setSimulatedHour(hour);
  };

  const handleResetToRealTime = () => {
    setSimulatedHour(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#051c3d] text-white border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Glow decorativo de fondo */}
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-25"
          style={{ backgroundColor: previewState.effectiveColorHex }}
        />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-700/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Moon className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Configuración de Modo Noche
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Ritmo Circadiano
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Regula automáticamente la temperatura de color y el brillo de las luces inteligentes según la hora.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 relative z-10 text-xs text-slate-200">

          {/* Widget de Vista Previa de Iluminación en Tiempo Real */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Bombilla y Halo Visual */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                {/* Halo luminoso dinámico */}
                <div 
                  className="absolute w-20 h-20 rounded-full blur-xl transition-all duration-500"
                  style={{
                    backgroundColor: previewState.effectiveColorHex,
                    opacity: Math.max(0.25, previewState.effectiveBrightness / 100),
                  }}
                />
                
                {/* Bombilla con color real */}
                <div 
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#0a1d37',
                    borderColor: previewState.effectiveColorHex,
                  }}
                >
                  <Lightbulb 
                    className="w-7 h-7 transition-colors duration-300"
                    style={{
                      color: previewState.effectiveColorHex,
                      fill: previewState.effectiveColorHex,
                      opacity: Math.max(0.4, previewState.effectiveBrightness / 100),
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 ${
                    previewState.isNightMode
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {previewState.isNightMode ? <Moon className="w-3 h-3 text-amber-300" /> : <Sun className="w-3 h-3 text-sky-300" />}
                    <span>{previewState.isNightMode ? 'Modo Noche Activo' : 'Modo Diurno Activo'}</span>
                  </span>

                  {simulatedHour !== null && (
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700/60">
                      Hora Simulada: {String(simulatedHour).padStart(2, '0')}:00
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: previewState.effectiveColorHex }} />
                  <span>{previewState.effectiveColorLabel}</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Temperatura: <strong className="text-white">{previewState.effectiveColorTempK} K</strong> · Intensidad: <strong className="text-white">{previewState.effectiveBrightness}%</strong>
                </p>
              </div>
            </div>

            {/* Simulación rápida de horario */}
            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Probar Horario en Vivo:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateTime(23)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    simulatedHour === 23
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>23:00 (Noche)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateTime(14)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    simulatedHour === 14
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>14:00 (Día)</span>
                </button>
                {simulatedHour !== null && (
                  <button
                    type="button"
                    onClick={handleResetToRealTime}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                    title="Restablecer a la hora real del sistema"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                Hora real del sistema: <strong className="text-slate-200">{realSystemTime}</strong>
              </span>
            </div>
          </div>

          {/* 1. Interruptor Maestro de Programación Automática */}
          <div className="p-4 rounded-2xl bg-[#07244c]/60 border border-slate-700/70 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Activación Automática según Horario del Sistema</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Recomendado
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Aegis sincroniza la iluminación con el reloj de tu dispositivo. Al llegar la noche, cambia gradualmente la luz al tono cálido sin que tengas que pulsar ningún botón.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAutoSchedule(!autoSchedule)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 shrink-0 focus:outline-none ${
                autoSchedule ? 'bg-[#009fe3]' : 'bg-slate-700'
              }`}
              aria-label="Alternar programación automática"
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  autoSchedule ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Rango Horario de Modo Noche */}
          <div className="p-4 rounded-2xl bg-[#041a37] border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Horario Nocturno Programado</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Duración: <strong>{((endHour - startHour + 24) % 24)} horas</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hora de Inicio */}
              <div className="bg-[#03152c] p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  🌙 Hora de Inicio (Atardecer / Noche):
                </label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  disabled={!autoSchedule}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer disabled:opacity-50"
                >
                  <option value={19}>19:00 (Invierno temprano)</option>
                  <option value={20}>20:00 (Ocaso)</option>
                  <option value={21}>21:00 (Cena familiar)</option>
                  <option value={22}>22:00 (Recomendado - 22:00)</option>
                  <option value={23}>23:00 (Noche avanzada)</option>
                  <option value={0}>00:00 (Medianoche)</option>
                </select>
              </div>

              {/* Hora de Fin */}
              <div className="bg-[#03152c] p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  ☀️ Hora de Fin (Amanecer / Despertar):
                </label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  disabled={!autoSchedule}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer disabled:opacity-50"
                >
                  <option value={6}>06:00 (Madrugador)</option>
                  <option value={7}>07:00 (Recomendado - 07:00)</option>
                  <option value={8}>08:00 (Despertar estándar)</option>
                  <option value={9}>09:00 (Fines de semana)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Parámetros de Luz Nocturna (Brillo atenuado y Temperatura Cálida) */}
          <div className="p-4 rounded-2xl bg-[#041a37] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  Ajustes de Luz en Modo Noche (Cálida y Suave)
                </h4>
              </div>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/60">
                No desvela ni interrumpe la melatonina
              </span>
            </div>

            {/* Selector de Temperatura de Color Nocturna */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Temperatura de Color Nocturna:</span>
                <span className="font-bold text-amber-300 font-mono">{nightColorTempK} K ({getKelvinLabel(nightColorTempK)})</span>
              </div>

              {/* Botones de Presets de Kelvin */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: 1800, label: '1800K Vela', desc: 'Ultra cálida' },
                  { k: 2200, label: '2200K Ámbar', desc: 'Circadiano Aegis' },
                  { k: 2700, label: '2700K Blanco Cálido', desc: 'Acogedora' },
                ].map((preset) => {
                  const isSelected = nightColorTempK === preset.k;
                  return (
                    <button
                      key={preset.k}
                      type="button"
                      onClick={() => applyNightKelvinPreset(preset.k)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/70 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: kelvinToHex(preset.k) }} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="font-bold text-[11px] text-white mt-1.5">{preset.label}</div>
                      <div className="text-[10px] text-slate-400">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Slider de Kelvin */}
              <input
                type="range"
                min={1800}
                max={3200}
                step={50}
                value={nightColorTempK}
                onChange={(e) => setNightColorTempK(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-1"
              />
            </div>

            {/* Slider de Brillo Nocturno (Atenuación) */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Intensidad de Brillo Atenuado:</span>
                <span className="font-bold text-amber-300 font-mono">{nightBrightness}% (Suave)</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={nightBrightness}
                onChange={(e) => setNightBrightness(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5% (Mínimo imperceptible)</span>
                <span>20% (Óptimo confort)</span>
                <span>50% (Moderado)</span>
              </div>
            </div>
          </div>

          {/* 4. Parámetros de Modo Día (Comparativa) */}
          <div className="p-4 rounded-2xl bg-[#041a37] border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white">
                  Ajustes en Modo Día (Luz Confort)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                Horas diurnas: {endHour}:00 a {startHour}:00
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#03152c] p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Temperatura de Color Día:</span>
                <div className="flex items-center justify-between font-bold text-sky-300">
                  <span>{dayColorTempK} K (Blanco Neutro Confort)</span>
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: kelvinToHex(dayColorTempK) }} />
                </div>
              </div>

              <div className="bg-[#03152c] p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Brillo Diurno Estándar:</span>
                <div className="font-bold text-sky-300">{dayBrightness}% de Potencia Lumínica</div>
              </div>
            </div>
          </div>

          {/* Info Card Circadiana */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Beneficio para la salud:</strong> Eliminar la luz azul por la noche estimula la segregación natural de melatonina, mejorando la conciliación del sueño profundo y reduciendo la fatiga visual.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#031733] border-t border-slate-700/80 flex items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#009fe3] to-cyan-500 hover:from-[#0088c4] hover:to-cyan-400 text-white text-xs font-bold cursor-pointer shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Guardar Configuración</span>
          </button>
        </div>

      </div>
    </div>
  );
};
