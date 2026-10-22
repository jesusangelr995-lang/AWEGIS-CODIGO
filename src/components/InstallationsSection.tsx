import React from 'react';
import { Mic, CheckCircle, Video, Headset, Home } from 'lucide-react';
import { NavTab } from '../types';

interface InstallationsSectionProps {
  onNavigate: (tab: NavTab) => void;
  onOpenLiliDemo: () => void;
  onSelectInstallRequest: () => void;
}

export const InstallationsSection: React.FC<InstallationsSectionProps> = ({
  onNavigate,
  onOpenLiliDemo,
  onSelectInstallRequest,
}) => {
  return (
    <section id="instalaciones" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          Instalaciones y Soporte
        </h2>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3" />
      </div>

      {/* Main Wide Banner Card */}
      <div className="bg-white dark:bg-[#0b1d3a] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Image of Wall Tablet in modern room */}
          <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full min-h-[340px] bg-slate-900 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80"
              alt="Instalación y Panel LILI"
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            
            {/* Floating Live Badge */}
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-slate-200/60 dark:border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#031733] dark:text-white">Soporte Certificado 24/7</span>
            </div>
          </div>

          {/* Right Column: LILI Voice & Features */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#009fe3] bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-md mb-2 border border-sky-100 dark:border-sky-800/50">
                <Mic className="w-3.5 h-3.5" />
                Asistente Virtual Exclusivo
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#031733] dark:text-white">
                LILI: Voz Inteligente
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Integra todos tus dispositivos con <strong className="text-[#031733] dark:text-white">LILI</strong>, nuestro asistente de voz avanzado. Pídele a LILI que bloquee las puertas, revise la temperatura o te dé un informe de seguridad.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#031733] dark:bg-sky-400 mt-2.5 shrink-0" />
                <span>Vídeos tutoriales de instalación paso a paso.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#031733] dark:bg-sky-400 mt-2.5 shrink-0" />
                <span>Resolución de consultas técnicas 24/7.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#031733] dark:bg-sky-400 mt-2.5 shrink-0" />
                <span>Configuración especializada para viviendas Airbnb.</span>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onSelectInstallRequest}
                className="px-6 py-3.5 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-sm sm:text-base shadow-md shadow-[#009fe3]/25 transition-all duration-200 cursor-pointer"
              >
                Solicitar instalación
              </button>

              <button
                type="button"
                onClick={onOpenLiliDemo}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 text-[#031733] dark:text-white font-bold text-sm sm:text-base border-2 border-[#031733] dark:border-slate-500 transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-[#009fe3]" />
                <span>Conocer a LILI PRO</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
