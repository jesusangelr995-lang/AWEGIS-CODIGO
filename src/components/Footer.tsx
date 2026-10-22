import React from 'react';
import { INSTAGRAM_URL, TIKTOK_URL } from '../data/products';
import { NavTab } from '../types';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAdmin?: () => void;
  onOpenSupportChat?: () => void;
  onOpenWelcome?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenAdmin, 
  onOpenSupportChat,
  onOpenWelcome 
}) => {
  return (
    <footer className="bg-[#031733] text-white pt-12 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800/80">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-base font-extrabold text-[#009fe3] tracking-wide">
              AEGIS (IoT) S+P
            </h4>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Seguridad, confort y prevención para tu hogar con dispositivos certificados.
            </p>
          </div>

          {/* Column 2: Secciones */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-base font-extrabold text-[#009fe3] tracking-wide">
              Secciones
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('inicio')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tienda')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tienda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('asistente')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Asistente de Dispositivos</span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-cyan-900 text-cyan-300">Nuevo</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('instalaciones')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Instalaciones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('planes')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Planes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacto')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contacto
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pedidos')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Mis Pedidos</span>
                </button>
              </li>
              {onOpenWelcome && (
                <li>
                  <button
                    onClick={onOpenWelcome}
                    className="hover:text-cyan-300 text-cyan-400 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>✨ Guía de Bienvenida (Primeros pasos)</span>
                  </button>
                </li>
              )}
              {onOpenSupportChat && (
                <li>
                  <button
                    onClick={onOpenSupportChat}
                    className="hover:text-cyan-400 text-cyan-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>💬 Chat en Directo (Atención 24/7)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Síguenos */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-base font-extrabold text-[#009fe3] tracking-wide">
              Síguenos
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#009fe3] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                  title="Visitar perfil de Instagram de AEGIS"
                >
                  <span>Instagram</span>
                  <span className="text-xs text-slate-400 group-hover:text-[#009fe3] opacity-75">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#009fe3] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>TikTok</span>
                  <span className="text-xs text-slate-400 group-hover:text-[#009fe3] opacity-75">↗</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AEGIS Smart Home Technologies. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Aviso Legal</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacidad</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Cookies</span>
            {onOpenAdmin && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hover:text-cyan-400 text-slate-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>🔒 Panel Administrador</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
