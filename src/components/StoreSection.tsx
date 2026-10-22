import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, Search, Filter, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface StoreSectionProps {
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
}

type CategoryFilter = 'all' | 'seguridad' | 'confort' | 'prevencion' | 'limpieza';

export const StoreSection: React.FC<StoreSectionProps> = ({ onAddToCart, onOpenCart }) => {
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      const matchesCategory = (() => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'seguridad') {
          return ['cerradura-inteligente', 'camara-ip', 'sensor-apertura'].includes(product.id);
        }
        if (selectedCategory === 'confort') {
          return ['enchufe-inteligente', 'termostato-inteligente', 'foco-inteligente'].includes(product.id);
        }
        if (selectedCategory === 'prevencion') {
          return ['sensor-inundacion', 'sensor-humo'].includes(product.id);
        }
        if (selectedCategory === 'limpieza') {
          return product.id === 'robot-aspirador';
        }
        return true;
      })();

      // Search query filter
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="tienda" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#009fe3] border border-sky-100 dark:border-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Dispositivos Certificados AEGIS IoT
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          Catálogo Certificado
        </h2>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3 mb-3" />
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          Gama completa de domótica y seguridad inteligente compatible con el ecosistema centralizado AEGIS y asistencia de voz LILI.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#009fe3] text-white shadow-md shadow-[#009fe3]/25'
                : 'bg-white dark:bg-[#0b1d3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({PRODUCTS.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('seguridad')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'seguridad'
                ? 'bg-[#009fe3] text-white shadow-md shadow-[#009fe3]/25'
                : 'bg-white dark:bg-[#0b1d3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Seguridad & Vigilancia (3)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('confort')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'confort'
                ? 'bg-[#009fe3] text-white shadow-md shadow-[#009fe3]/25'
                : 'bg-white dark:bg-[#0b1d3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Confort & Clima (3)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('prevencion')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'prevencion'
                ? 'bg-[#009fe3] text-white shadow-md shadow-[#009fe3]/25'
                : 'bg-white dark:bg-[#0b1d3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Prevención & Sensores (2)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('limpieza')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'limpieza'
                ? 'bg-[#009fe3] text-white shadow-md shadow-[#009fe3]/25'
                : 'bg-white dark:bg-[#0b1d3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Limpieza (1)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar dispositivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#0b1d3a] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3] transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const isJustAdded = addedProductId === product.id;

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-[#0b1d3a] rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Header Category Tag Bar */}
                <div className="bg-[#031733] py-2.5 px-4 text-center">
                  <span className="text-xs font-black tracking-wider text-white uppercase">
                    {product.categoryTag}
                  </span>
                </div>

                {/* Product Visual Presentation */}
                <div className="h-56 bg-gradient-to-b from-[#061e40] to-[#04152c] relative flex items-center justify-center p-6 overflow-hidden">
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-radial from-[#009fe3]/15 to-transparent opacity-60" />

                  {/* 1. Enchufe Inteligente */}
                  {product.id === 'enchufe-inteligente' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600/80 shadow-2xl flex items-center justify-center relative">
                        {/* Socket pins */}
                        <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
                        </div>
                        {/* Power LED */}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2 py-0.5 rounded-full border border-[#0284c7]/40">
                        16A · Medidor W
                      </div>
                    </div>
                  )}

                  {/* 2. Cerradura Inteligente */}
                  {product.id === 'cerradura-inteligente' && (
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      <div className="w-24 h-44 rounded-2xl bg-gradient-to-b from-stone-900 via-zinc-800 to-stone-950 border-2 border-stone-600 p-2.5 shadow-2xl flex flex-col justify-between items-center">
                        <div className="w-full bg-black/60 rounded-lg p-1.5 border border-zinc-700/60">
                          <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-zinc-300 text-center">
                            <span>1</span><span>2</span><span>3</span>
                            <span>4</span><span>5</span><span>6</span>
                            <span>7</span><span>8</span><span>9</span>
                            <span>*</span><span>0</span><span>#</span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/80 flex items-center justify-center shadow-inner">
                          <div className="w-4 h-4 rounded-full border border-cyan-400/80 opacity-80" />
                        </div>
                        <div className="w-16 h-4 bg-zinc-700 rounded-sm shadow-md border-t border-zinc-500" />
                      </div>
                      <div className="text-[10px] space-y-1 text-slate-300">
                        <div className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">👆 Huella digital</div>
                        <div className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">🔢 Código PIN</div>
                        <div className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">💳 Tarjeta RFID</div>
                      </div>
                    </div>
                  )}

                  {/* 3. Termostato Inteligente */}
                  {product.id === 'termostato-inteligente' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-black border-4 border-slate-700 shadow-2xl flex flex-col items-center justify-center relative">
                        <div className="text-2xl font-bold text-white font-mono flex items-start">
                          21<span className="text-sm text-cyan-400">.5°</span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-medium">Clima óptimo</div>
                        <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/40 pointer-events-none" />
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2 py-0.5 rounded-full border border-[#0284c7]/40">
                        Auto-Eco AEGIS
                      </div>
                    </div>
                  )}

                  {/* 4. Cámara IP de Seguridad 2K */}
                  {product.id === 'camara-ip' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-24 h-32 flex flex-col items-center justify-between">
                        {/* Camera Sphere */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 border-slate-600 shadow-2xl flex items-center justify-center relative">
                          {/* Outer blue ring */}
                          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/80 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            {/* Glass Lens reflection */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-950 via-black to-slate-900 border border-slate-600 flex items-center justify-center relative">
                              <div className="w-3 h-3 rounded-full bg-cyan-400 opacity-90 shadow-sm shadow-cyan-400" />
                              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                            </div>
                          </div>
                          {/* IR LED dot */}
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        {/* Pan/Tilt Base */}
                        <div className="w-24 h-9 bg-gradient-to-b from-slate-800 to-slate-950 rounded-t-xl rounded-b-lg border border-slate-700 shadow-md flex items-center justify-center">
                          <span className="text-[9px] font-mono tracking-wider text-slate-300 uppercase">360° PAN/TILT</span>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        2K QHD · Visión Color
                      </div>
                    </div>
                  )}

                  {/* 5. Foco Inteligente LED RGB+W */}
                  {product.id === 'foco-inteligente' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative flex flex-col items-center">
                        {/* Bulb aura glow */}
                        <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/30 via-cyan-400/30 to-purple-500/30 rounded-full blur-md" />
                        {/* Glass dome */}
                        <div className="relative w-20 h-22 rounded-t-full bg-gradient-to-b from-amber-100/90 via-sky-100/80 to-slate-200 border-2 border-slate-400/80 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-300 via-rose-400 to-cyan-400 blur-xs opacity-80 animate-pulse" />
                          <Sparkles className="w-4 h-4 text-amber-500 absolute top-3" />
                        </div>
                        {/* Screw Base E27 */}
                        <div className="w-12 h-6 bg-gradient-to-b from-amber-700 via-amber-800 to-zinc-900 rounded-b-md border border-amber-600 flex flex-col justify-around py-0.5">
                          <div className="h-0.5 bg-amber-500/70 mx-1 rounded" />
                          <div className="h-0.5 bg-amber-500/70 mx-1 rounded" />
                          <div className="h-0.5 bg-amber-500/70 mx-1 rounded" />
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        RGB + Blanco Regulable
                      </div>
                    </div>
                  )}

                  {/* 6. Sensor de Apertura Puertas y Ventanas */}
                  {product.id === 'sensor-apertura' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex items-center gap-2.5">
                        {/* Main transmitter unit */}
                        <div className="w-14 h-28 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 border-slate-600 shadow-2xl p-2 flex flex-col justify-between items-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mt-1" />
                          <div className="text-[8px] font-mono text-slate-400 uppercase text-center">AEGIS SENSOR</div>
                          <div className="w-6 h-1 rounded-full bg-slate-700" />
                        </div>
                        {/* Magnetic contact bar */}
                        <div className="w-6 h-28 rounded-xl bg-gradient-to-b from-slate-800 to-zinc-950 border-2 border-slate-600 shadow-xl flex items-center justify-center">
                          <div className="w-1 h-14 rounded-full bg-cyan-500/60" />
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        Magnético · Alerta Push
                      </div>
                    </div>
                  )}

                  {/* 7. Sensor de Inundación */}
                  {product.id === 'sensor-inundacion' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        {/* Ripple animation */}
                        <div className="absolute w-28 h-28 rounded-full border border-sky-400/40 animate-ping opacity-60" />
                        <div className="absolute w-24 h-24 rounded-full bg-sky-500/10 blur-xs" />
                        
                        {/* Sensor Puck */}
                        <div className="relative w-22 h-22 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-sky-400/80 shadow-2xl flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-500/70 flex items-center justify-center text-sky-400">
                            <span className="text-xl">💧</span>
                          </div>
                          <span className="text-[8px] font-bold tracking-wider text-sky-300 mt-1 uppercase">IP67 WATER</span>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        Sondas Platino · Sirena 85dB
                      </div>
                    </div>
                  )}

                  {/* 8. Sensor de Humo y Gas */}
                  {product.id === 'sensor-humo' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border-4 border-slate-700 shadow-2xl flex flex-col items-center justify-center relative">
                        {/* Intake mesh slots */}
                        <div className="w-20 h-20 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                          {/* Center alert button */}
                          <div className="w-11 h-11 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 flex flex-col items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500" />
                            <span className="text-[7px] text-zinc-400 font-bold mt-0.5">TEST</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        Fotoeléctrico · Sirena 90dB
                      </div>
                    </div>
                  )}

                  {/* 9. Robot Aspirador */}
                  {product.id === 'robot-aspirador' && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative w-30 h-30 rounded-full bg-gradient-to-b from-zinc-900 via-slate-900 to-black border-4 border-zinc-700 shadow-2xl flex items-center justify-center">
                        {/* LiDAR top turret */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-950 via-slate-800 to-black border-2 border-cyan-500/80 shadow-md flex items-center justify-center relative">
                          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                          <div className="absolute inset-1 rounded-full border border-cyan-400/40 animate-spin" />
                        </div>
                        {/* Front bumper accent line */}
                        <div className="absolute top-1.5 w-16 h-1 bg-cyan-500/60 rounded-full" />
                        {/* Control buttons */}
                        <div className="absolute bottom-2 flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold tracking-wider text-cyan-300 uppercase bg-[#0284c7]/20 px-2.5 py-0.5 rounded-full border border-[#0284c7]/40">
                        Láser LiDAR · 4000 Pa · Mopa
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#031733] dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[44px]">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-[#009fe3]">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5 font-medium">IVA incl.</span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      En stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md ${
                    isJustAdded
                      ? 'bg-emerald-600 scale-[0.98]'
                      : 'bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 shadow-[#009fe3]/25'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>¡Añadido al carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <span>Añadir al carrito</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search Result */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#0b1d3a] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400 text-base">
            No se encontraron dispositivos para tu búsqueda "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Ver todos los dispositivos
          </button>
        </div>
      )}
    </section>
  );
};
