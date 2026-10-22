import React, { useState } from 'react';
import { 
  X, ShieldCheck, Sparkles, Lightbulb, Compass, User, 
  ArrowRight, ShieldAlert, Cpu, Check, HelpCircle
} from 'lucide-react';
import { AegisLogo } from './AegisLogo';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onExploreDemo: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  onExploreDemo,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const handleFinish = (action: 'login' | 'demo') => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('aegis_welcome_dismissed', 'true');
    }
    onClose();
    if (action === 'login') {
      onOpenLogin();
    } else {
      onExploreDemo();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#07172e] border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        {/* Top Header Gradient Glow */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-[#009fe3] to-blue-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={() => handleFinish('demo')}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Cerrar bienvenida"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto">
            <div className="flex items-center justify-center mb-3">
              <AegisLogo />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009fe3]/15 text-[#009fe3] dark:text-cyan-300 text-xs font-bold border border-[#009fe3]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Bienvenido a tu Hogar Inteligente</span>
            </div>

            <h2 id="welcome-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ¿Cómo te gustaría empezar hoy?
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              En Aegis puedes explorar libremente nuestra <strong>demostración interactiva</strong> antes de registrarte, o <strong>iniciar sesión</strong> para vincular los sensores reales de tu casa.
            </p>
          </div>

          {/* 3 Pillars Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c223f] border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-[#009fe3] flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                1. Prevención Crítica
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Detección de humo, fugas de agua e intrusos con notificaciones Toasts automáticas y sirenas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c223f] border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                2. Modo Noche & Ritmo
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Ajuste automático de temperatura de color (ámbar cálido 2200K) y reducción de brillo según la hora solar.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c223f] border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                3. Asistente IA & Tienda
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Recomendaciones personalizadas según los dispositivos que ya tengas en casa y catálogo certificado.
              </p>
            </div>
          </div>

          {/* Action Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option A: Explore Demo */}
            <div 
              onClick={() => handleFinish('demo')}
              className="group p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c223f] hover:border-[#009fe3] dark:hover:border-[#009fe3] transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#009fe3] flex items-center justify-center">
                    <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    Sin registro
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Probar Demostración
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Curiosea libremente, prueba a encender luces, simula alertas de seguridad y explora la tienda sin compromiso.
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-[#009fe3] group-hover:text-white"
              >
                <span>Explorar la Web</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Option B: Log In / Sign Up */}
            <div 
              onClick={() => handleFinish('login')}
              className="group p-5 rounded-2xl border-2 border-[#009fe3]/50 bg-gradient-to-b from-[#009fe3]/10 to-transparent hover:border-[#009fe3] transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#009fe3] text-white flex items-center justify-center shadow-md shadow-[#009fe3]/30">
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#009fe3] text-white px-2 py-0.5 rounded-full shadow-sm">
                    Recomendado
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Iniciar Sesión / Registro
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Entra con Google o tu correo para vincular tu vivienda real, guardar pedidos y sincronizar con la nube de Supabase.
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#009fe3] to-sky-500 hover:from-sky-500 hover:to-[#009fe3] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#009fe3]/25 active:scale-95"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer note & remember preference */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-[#009fe3] border-slate-300 rounded focus:ring-[#009fe3] accent-[#009fe3]"
              />
              <span>No volver a mostrar automáticamente en este navegador</span>
            </label>

            <button
              type="button"
              onClick={() => handleFinish('demo')}
              className="text-[#009fe3] hover:underline font-semibold cursor-pointer ml-auto"
            >
              Continuar como invitado →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
