import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, Sun, Moon, MessageCircle, Mic, User as UserIcon, LogOut, Package, Sparkles, ChevronDown } from 'lucide-react';
import { AegisLogo } from './AegisLogo';
import { NavTab, AuthUser } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  ordersCount?: number;
  onOpenSupportChat?: () => void;
  onOpenLiliDemo?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  onOpenCart,
  darkMode,
  onToggleTheme,
  ordersCount = 0,
  onOpenSupportChat,
  onOpenLiliDemo,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: NavTab; label: string; badge?: number | string }[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'tienda', label: 'Tienda' },
    { id: 'asistente', label: 'Asistente IA', badge: 'Nuevo' },
    { id: 'instalaciones', label: 'Instalaciones' },
    { id: 'planes', label: 'Planes' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'pedidos', label: 'Mis Pedidos', badge: ordersCount > 0 ? ordersCount : undefined },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#031733] border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div onClick={() => handleSelectTab('inicio')}>
            <AegisLogo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[#009fe3]/25 text-[#009fe3] border border-[#009fe3]/40">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#009fe3] rounded-full transition-all duration-300 animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle, LILI Voice, Support Chat, Cart & Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* LILI Voice Assistant trigger button */}
            {onOpenLiliDemo && (
              <button
                type="button"
                onClick={onOpenLiliDemo}
                className="relative px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#009fe3]/20 to-sky-500/20 hover:from-[#009fe3]/30 hover:to-sky-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 group"
                title="Abrir Asistente de Voz LILI PRO (Rutinas y Modo Vacaciones)"
                aria-label="Abrir asistente de voz LILI"
              >
                <Mic className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="text-xs font-bold hidden lg:inline">LILI PRO</span>
              </button>
            )}

            {/* Live Support Chat Button */}
            {onOpenSupportChat && (
              <button
                type="button"
                onClick={onOpenSupportChat}
                className="relative p-2 rounded-lg bg-[#0c223f] hover:bg-[#133056] text-slate-300 hover:text-white border border-slate-700/80 transition-all duration-200 active:scale-95 cursor-pointer shadow-inner flex items-center justify-center group"
                title="Chat en directo · ¿Cómo puedo ayudarte?"
                aria-label="Abrir chat en directo de atención al cliente"
              >
                <MessageCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-[#0c223f] hover:bg-[#133056] text-slate-300 hover:text-white border border-slate-700/80 transition-all duration-200 active:scale-95 cursor-pointer shadow-inner flex items-center justify-center group"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-sky-200 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#0c223f] hover:bg-[#133056] text-white pl-2 pr-2.5 py-1.5 rounded-lg border border-cyan-500/40 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm group"
                  aria-expanded={userMenuOpen}
                  aria-label="Menú de usuario"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name || 'Usuario'}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#009fe3] to-sky-400 text-white font-bold text-xs flex items-center justify-center">
                      {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[85px] truncate hidden xl:inline">
                    {currentUser.name?.split(' ')[0] || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#07172e] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn text-slate-200">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-[11px] text-slate-400 font-medium">Sesión iniciada como</p>
                      <p className="text-sm font-bold text-white truncate">{currentUser.name || 'Usuario Aegis'}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                      
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] bg-[#009fe3]/15 text-cyan-300 border border-[#009fe3]/30 px-2 py-0.5 rounded-full font-bold w-fit">
                        {currentUser.provider === 'google' ? '⚡ Google Sign-In' : '🛡️ Cuenta Supabase'}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTab('pedidos');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-[#009fe3]" />
                        <span>Mis Pedidos & Envíos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTab('asistente');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Asistente Hogar IA</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSignOut && onSignOut();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2.5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-[#0c223f] hover:bg-[#133056] text-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-cyan-500/40 hover:border-cyan-400 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm text-xs font-bold group"
                title="Iniciar sesión o registrarse"
              >
                <UserIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="group relative flex items-center gap-2 bg-[#0c223f] hover:bg-[#133056] text-white px-3.5 py-1.5 rounded-lg border border-slate-700/80 transition-all duration-200 active:scale-95 cursor-pointer shadow-inner"
              title="Ver tu carrito"
            >
              <ShoppingCart className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium hidden sm:inline">Carrito</span>
              <span className="bg-[#009fe3] text-white text-xs font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                {cartCount}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#051c3d] border-b border-slate-700 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-base font-medium flex items-center justify-between ${
                  isActive
                    ? 'bg-[#009fe3]/15 text-[#009fe3] font-bold border-l-4 border-[#009fe3]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-xs font-black px-1.5 py-0.5 rounded-full bg-[#009fe3] text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#009fe3]"></span>}
              </button>
            );
          })}

          {/* LILI Voice Assistant in mobile drawer */}
          {onOpenLiliDemo && (
            <button
              type="button"
              onClick={() => {
                onOpenLiliDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-md text-base font-semibold text-cyan-300 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Asistente de Voz LILI PRO</span>
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full font-bold">
                🌴 Modo Vacaciones
              </span>
            </button>
          )}

          {/* Support Chat in mobile drawer */}
          {onOpenSupportChat && (
            <button
              type="button"
              onClick={() => {
                onOpenSupportChat();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-md text-base font-semibold text-cyan-300 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <span>Chat en Directo</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>En línea</span>
              </span>
            </button>
          )}

          {/* User profile / Auth in mobile drawer */}
          <div className="pt-3 border-t border-slate-700/80 mt-2 px-3 py-1">
            {currentUser ? (
              <div className="bg-[#0c223f] border border-cyan-500/30 rounded-xl p-3 text-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name || 'Usuario'}
                      className="w-9 h-9 rounded-full object-cover border border-cyan-400"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#009fe3] to-sky-400 text-white font-bold text-sm flex items-center justify-center">
                      {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{currentUser.name || 'Usuario Aegis'}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] text-cyan-300 font-semibold">
                      {currentUser.provider === 'google' ? '⚡ Google Sign-In' : '🛡️ Supabase Auth'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut && onSignOut();
                  }}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth && onOpenAuth();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#009fe3] to-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-transform"
              >
                <UserIcon className="w-4 h-4" />
                <span>Iniciar Sesión / Crear Cuenta</span>
              </button>
            )}
          </div>

          {/* Theme switcher in mobile drawer */}
          <div className="pt-3 border-t border-slate-700/80 mt-2 flex items-center justify-between px-3 py-2 text-slate-300">
            <span className="text-sm font-medium">Tema: {darkMode ? 'Oscuro' : 'Claro'}</span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg bg-[#0c223f] hover:bg-[#133056] text-white flex items-center gap-2 text-xs font-semibold border border-slate-700"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-sky-200" />}
              <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

