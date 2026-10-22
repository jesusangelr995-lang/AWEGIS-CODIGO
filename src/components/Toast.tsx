import React, { useEffect } from 'react';
import { 
  CheckCircle2, Info, AlertTriangle, X, Flame, Droplets, 
  ShieldAlert, Siren, Volume2, VolumeX, ArrowRight, RotateCcw
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'critical' | 'emergency';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'subtle';
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  timestamp?: string;
  duration?: number;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  sensorAnomalyKey?: 'water_leak' | 'smoke' | 'intruder' | 'gas';
  soundAlert?: boolean;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

// Generador de tono acústico de emergencia usando Web Audio API
export const playCriticalAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    // Sirena bi-tono rápida (A5 -> E5 -> A5)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.58);
  } catch {
    // Si el navegador bloquea el audio automático, no interrumpe el flujo visual
  }
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      role="region"
      aria-live="assertive"
      aria-label="Notificaciones del sistema"
    >
      {toasts.map((toast) => {
        const isCritical = toast.type === 'critical' || toast.type === 'emergency';
        const isWaterLeak = toast.sensorAnomalyKey === 'water_leak' || toast.title.toLowerCase().includes('agua') || toast.title.toLowerCase().includes('fuga');
        const isSmoke = toast.sensorAnomalyKey === 'smoke' || toast.title.toLowerCase().includes('humo') || toast.title.toLowerCase().includes('incendio');
        const isIntruder = toast.sensorAnomalyKey === 'intruder' || toast.title.toLowerCase().includes('intrus');

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-md animate-slideInRight ${
              isCritical
                ? 'bg-gradient-to-br from-[#3b0811] via-[#24050b] to-[#160206] text-white border-2 border-rose-500/90 shadow-rose-950/80 ring-2 ring-rose-500/40'
                : toast.type === 'warning'
                  ? 'bg-[#1e1708] text-amber-100 border border-amber-500/70 shadow-amber-950/50'
                  : toast.type === 'success'
                    ? 'bg-[#031d1a] text-emerald-100 border border-emerald-500/60 shadow-emerald-950/50'
                    : 'bg-[#031733] text-white border border-slate-700/80 shadow-slate-950/60'
            }`}
          >
            {/* Barra superior de estado crítico parpadeante */}
            {isCritical && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />
            )}

            <div className="flex items-start gap-3">
              {/* Icono de Estado */}
              <div className="shrink-0 mt-0.5">
                {isCritical ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500/80 flex items-center justify-center text-rose-400 shadow-md shadow-rose-950/60 animate-pulse">
                    {isSmoke ? (
                      <Flame className="w-5 h-5 text-rose-400 fill-rose-500/30" />
                    ) : isWaterLeak ? (
                      <Droplets className="w-5 h-5 text-sky-400 fill-sky-500/30" />
                    ) : isIntruder ? (
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Siren className="w-5 h-5 text-rose-400 animate-bounce" />
                    )}
                  </div>
                ) : toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : toast.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Info className="w-5 h-5 text-[#009fe3]" />
                )}
              </div>

              {/* Contenido del Toast */}
              <div className="flex-1 min-w-0">
                {/* Header con Etiqueta de Urgencia */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isCritical ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-600 text-white shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      ALERTA CRÍTICA EN TIEMPO REAL
                    </span>
                  ) : toast.type === 'warning' ? (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      AVISO DE SENSOR
                    </span>
                  ) : null}

                  {toast.timestamp && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {toast.timestamp}
                    </span>
                  )}
                </div>

                <h5 className={`text-sm font-bold leading-tight ${isCritical ? 'text-white' : 'text-slate-100'}`}>
                  {toast.title}
                </h5>

                {toast.description && (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {toast.description}
                  </p>
                )}

                {/* Botones de Acción Directa en el Toast */}
                {(toast.action || toast.secondaryAction) && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap pt-2 border-t border-slate-700/60">
                    {toast.action && (
                      <button
                        type="button"
                        onClick={() => {
                          toast.action?.onClick();
                          onDismiss(toast.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 ${
                          toast.action.variant === 'danger'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
                            : isCritical
                              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 font-black'
                              : 'bg-[#009fe3] hover:bg-[#0088c4] text-white'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{toast.action.label}</span>
                      </button>
                    )}

                    {toast.secondaryAction && (
                      <button
                        type="button"
                        onClick={() => {
                          toast.secondaryAction?.onClick();
                          onDismiss(toast.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/80 text-xs font-semibold transition-all cursor-pointer"
                      >
                        {toast.secondaryAction.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de Cerrar */}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                title="Descartar notificación"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
