import React from 'react';
import { Wifi, Sliders, BellRing, Sparkles } from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

const FEATURES: FeatureCard[] = [
  {
    id: 'conectividad',
    title: 'Conectividad Inalámbrica',
    description: 'Integración total de iluminación, electrodomésticos y sistemas multimedia conectados en red.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    icon: <Wifi className="w-5 h-5 text-[#009fe3]" />,
  },
  {
    id: 'panel-central',
    title: 'Panel de Control Central',
    description: 'Supervisa el estado de cada habitación (puertas, cámaras y cierres) desde una interfaz táctil intuitiva.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    icon: <Sliders className="w-5 h-5 text-[#009fe3]" />,
  },
  {
    id: 'sensores',
    title: 'Automatización y Sensores',
    description: 'Gestión avanzada en cocina y estancias con alertas críticas inmediatas ante cualquier incidencia.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    icon: <BellRing className="w-5 h-5 text-[#009fe3]" />,
  },
  {
    id: 'rutinas',
    title: 'Rutinas Inteligentes',
    description: 'Modos automatizados como «Salir de casa» para apagar sistemas, activar cerraduras y asegurar el hogar.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    icon: <Sparkles className="w-5 h-5 text-[#009fe3]" />,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          ¿Cómo funciona nuestro sistema?
        </h2>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3" />
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-[#0b1d3a] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col hover:-translate-y-1"
          >
            {/* Card Image Banner */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-lg shadow-sm">
                {item.icon}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#031733] dark:text-white mb-2 group-hover:text-[#009fe3] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
