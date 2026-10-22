import React from 'react';
import { 
  Check, X, Sparkles, Smartphone, CreditCard, ShieldCheck, 
  Lock, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { PaymentMethod } from '../types';

interface PlansSectionProps {
  onSubscribePro: (method?: PaymentMethod) => void;
  onSelectFree: () => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  onSubscribePro,
  onSelectFree,
}) => {
  return (
    <section id="planes" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009fe3]/15 text-[#009fe3] dark:text-cyan-300 text-xs font-bold border border-[#009fe3]/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suscripción Flexible sin Permanencia</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          Planes de Suscripción Aegis
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
          Elige entre el acceso estándar gratuito o potencia tu vivienda con el Plan PRO con soporte para pago por <strong>Bizum, PayPal y Tarjeta</strong>.
        </p>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3" />
      </div>

      {/* 2 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* Card 1: Plan Normal */}
        <div className="bg-white dark:bg-[#0b1d3a] rounded-3xl p-8 sm:p-10 shadow-md border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
          <div>
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-[#031733] dark:text-white">
                Plan Normal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Control esencial de tu vivienda</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#009fe3]">
                  Gratis
                </span>
                <span className="text-xs text-slate-500 block font-semibold">Para siempre</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 my-8 text-sm sm:text-base text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Control manual desde la web y simulador</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Compra de productos certificados en tienda</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Acceso al Asistente de Configuración IA</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <X className="w-5 h-5 text-rose-500 shrink-0 font-bold" />
                <span className="line-through decoration-slate-300 dark:decoration-slate-600">Histórico de grabaciones en la nube</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <X className="w-5 h-5 text-rose-500 shrink-0 font-bold" />
                <span className="line-through decoration-slate-300 dark:decoration-slate-600">Alertas SMS / WhatsApp prioritarias</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onSelectFree}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-[#031733] hover:bg-[#07244c] dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
          >
            Continuar con Plan Normal Gratis
          </button>
        </div>

        {/* Card 2: Plan PRO */}
        <div className="bg-white dark:bg-[#0b1d3a] rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-[#009fe3] relative flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* Top Pill Recommended */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#009fe3] to-sky-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
            RECOMENDADO
          </div>

          <div>
            <div className="text-center pt-2">
              <h3 className="text-2xl font-extrabold text-[#031733] dark:text-white flex items-center justify-center gap-1.5">
                Plan PRO
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Máxima seguridad, grabaciones y LILI PRO</p>
              <div className="mt-4 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#009fe3]">
                  9,99 €
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">/mes</span>
              </div>

              {/* Supported payment badges inside card */}
              <div className="flex items-center justify-center gap-2 flex-wrap pb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span>📱</span> Bizum
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                  <span>🅿️</span> PayPal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                  <span>💳</span> Tarjeta
                </span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3.5 my-6 text-sm sm:text-base text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Histórico ilimitado de cámaras en la nube (2K)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Alertas por SMS / WhatsApp instantáneas</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Rutinas automáticas avanzadas & Modo Vacaciones</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 font-bold" />
                <span>Gestor de incidencias y mantenimiento predictivo</span>
              </li>
              <li className="flex items-center gap-3 font-semibold text-[#031733] dark:text-white">
                <Check className="w-5 h-5 text-[#009fe3] shrink-0 font-bold" />
                <span>Asistente de voz LILI PRO completo</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-2">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => onSubscribePro('bizum')}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#009fe3] to-sky-500 hover:from-sky-500 hover:to-[#009fe3] active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-[#009fe3]/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Suscribirme al Plan PRO (9,99 €/mes)</span>
            </button>

            {/* Quick 1-click gateway shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSubscribePro('bizum')}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title="Pagar suscripción mediante Bizum"
              >
                <span>📱 Pagar con Bizum</span>
              </button>

              <button
                type="button"
                onClick={() => onSubscribePro('paypal')}
                className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title="Pagar suscripción mediante PayPal"
              >
                <span>🅿️ Pagar con PayPal</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Gateways Banner */}
      <div className="bg-white dark:bg-[#07172e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#009fe3] mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Pasarelas de Pago Seguras & Verificadas</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ¿Cómo funcionan los cobros de suscripción en Aegis?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Disfruta de total transparencia: sin comisiones ocultas, sin permanencia y con cancelación en 1 clic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bizum feature */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
              <span className="text-base">📱</span>
              <span>Bizum Empresas</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Recibe la notificación push instantánea en tu teléfono móvil y autoriza la cuota mensual desde tu banco sin teclear números de tarjeta.
            </p>
          </div>

          {/* PayPal feature */}
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300 text-sm">
              <span className="text-base">🅿️</span>
              <span>Protección PayPal</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Gestiona tu suscripción con la garantía oficial de PayPal. Cancela o pausa cuando desees desde tu propio panel de PayPal.
            </p>
          </div>

          {/* Card feature */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c223f] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
              <CreditCard className="w-4 h-4 text-[#009fe3]" />
              <span>Tarjeta Bancaria SSL</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Cobro recurrente cifrado con protocolo AES-256 de alta seguridad, compatible con Visa, Mastercard y tarjetas europeas.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Cifrado de grado bancario
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#009fe3]" />
            Factura legal con IVA desglosado
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-400" />
            Sin permanencia ni penalizaciones
          </span>
        </div>
      </div>
    </section>
  );
};
