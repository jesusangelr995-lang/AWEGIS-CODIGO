import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { StoreSection } from './components/StoreSection';
import { InstallationsSection } from './components/InstallationsSection';
import { PlansSection } from './components/PlansSection';
import { ContactSection } from './components/ContactSection';
import { OrdersHistory } from './components/OrdersHistory';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LiliVoiceModal } from './components/LiliVoiceModal';
import { ToastContainer, ToastMessage, ToastType, ToastAction, playCriticalAlertSound } from './components/Toast';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LiveSupportChat } from './components/LiveSupportChat';
import { DeviceConfigAssistant } from './components/DeviceConfigAssistant';
import { AuthModal } from './components/AuthModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { NavTab, CartItem, Product, DeviceStatus, Order, AuthUser, PaymentMethod } from './types';
import { PRODUCTS } from './data/products';
import { saveOrderToSupabase, getActiveUser, signOutUser } from './lib/supabase';
import { getCircadianLightingState, isHourInNightRange } from './utils/lightingCircadian';

export default function App() {
  // Theme state: initialized from localStorage or system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('aegis_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme with document class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aegis_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aegis_theme', 'light');
    }
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      addToast('info', next ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
      return next;
    });
  };

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');

  // Interactive Central Control Panel status (as seen in Screenshot 1)
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(() => {
    const currentHour = new Date().getHours();
    const isNight = isHourInNightRange(currentHour, 22, 7);
    return {
      lightsOn: true,
      lockOpen: true,
      camerasActive: false,
      kitchenSensorOk: true,
      routineActive: true,
      vacationMode: false,
      shuttersClosed: false,
      activeSimulationRoom: 'Salón Principal',
      simulationStep: 0,
      nightModeActive: isNight,
      nightModeAutoSchedule: true,
      nightModeStartHour: 22,
      nightModeEndHour: 7,
      nightBrightness: 20,
      nightColorTempK: 2200,
      dayBrightness: 85,
      dayColorTempK: 4500,
      simulatedSystemHour: null,
    };
  });

  // Monitoreo Automático de Modo Noche según el reloj del sistema & Ritmo Circadiano
  useEffect(() => {
    const evaluateNightMode = () => {
      const circadian = getCircadianLightingState(deviceStatus);
      if (deviceStatus.nightModeActive !== circadian.isNightMode) {
        setDeviceStatus((prev) => ({
          ...prev,
          nightModeActive: circadian.isNightMode,
        }));

        if (circadian.isNightMode) {
          addToast(
            'info',
            '🌙 Modo Noche activado automáticamente',
            `Ajustado según horario a ${circadian.effectiveColorTempK}K (ámbar cálido) y ${circadian.effectiveBrightness}% de brillo para descanso visual.`
          );
        } else {
          addToast(
            'info',
            '☀️ Modo Diurno activado',
            `Iluminación restablecida a ${circadian.effectiveColorTempK}K (luz natural) y ${circadian.effectiveBrightness}% de brillo.`
          );
        }
      }
    };

    evaluateNightMode();
    const interval = setInterval(evaluateNightMode, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [
    deviceStatus.nightModeAutoSchedule,
    deviceStatus.nightModeStartHour,
    deviceStatus.nightModeEndHour,
    deviceStatus.simulatedSystemHour,
    deviceStatus.nightBrightness,
    deviceStatus.nightColorTempK,
    deviceStatus.dayBrightness,
    deviceStatus.dayColorTempK,
  ]);

  // Vacation Mode Presence Simulation: Random lights alternating across rooms to deter intruders
  useEffect(() => {
    if (!deviceStatus.vacationMode) return;

    const SIMULATION_ROOMS = [
      'Salón Principal',
      'Cocina',
      'Dormitorio Suite',
      'Despacho',
      'Pasillo / Entrada',
      'Terraza',
    ];

    const interval = setInterval(() => {
      const nextRoom = SIMULATION_ROOMS[Math.floor(Math.random() * SIMULATION_ROOMS.length)];
      setDeviceStatus((prev) => {
        if (!prev.vacationMode) return prev;
        return {
          ...prev,
          lightsOn: true,
          activeSimulationRoom: nextRoom,
          simulationStep: (prev.simulationStep || 0) + 1,
        };
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [deviceStatus.vacationMode]);

  // Cart state - initialized with Cerradura Inteligente Aegis (as in Screenshot 1 & 7)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[1], // Cerradura Inteligente Aegis 220 €
      quantity: 1,
    },
  ]);

  // Orders state - persisted in localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aegis_orders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall back to sample
        }
      }
    }
    // Initial sample order matching Screenshot 1/7 so user has instant data
    const initialOrder: Order = {
      id: 'AEG-739214',
      date: '05/10/2026, 08:50',
      timestamp: Date.now() - 3600000,
      items: [
        {
          productId: 'cerradura-inteligente',
          name: 'Cerradura Inteligente Aegis',
          categoryTag: 'SEGURIDAD AVANZADA',
          price: 220.00,
          quantity: 1,
        },
      ],
      total: 220.00,
      status: 'Pagado',
      paymentMethod: 'card',
      customer: {
        name: 'Jesús Ángel Rodríguez',
        email: 'jesusangelr995@gmail.com',
        phone: '+34 622 145 980',
        address: 'Calle Mayor 45, 2º A, Madrid',
      },
    };
    return [initialOrder];
  });

  // Persist orders to localStorage
  useEffect(() => {
    localStorage.setItem('aegis_orders', JSON.stringify(orders));
  }, [orders]);

  // Drawer & Modals state
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subInitialMethod, setSubInitialMethod] = useState<PaymentMethod>('bizum');
  const [liliDemoOpen, setLiliDemoOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'orders' | 'supabase'>('orders');
  const [contactMotive, setContactMotive] = useState<string>('Pedido');
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  // Authentication State (Google OAuth & Email/Password via Supabase)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_auth_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

  // Welcome Onboarding Modal State (Option 2: Guided First-time Experience)
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // If visitor has not dismissed welcome guide and is not logged in, show on initial visit
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('aegis_welcome_dismissed');
      if (!dismissed && !currentUser) {
        const timer = setTimeout(() => {
          setWelcomeModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const handleExploreDemo = () => {
    setWelcomeModalOpen(false);
    addToast(
      'info',
      '👁️ Modo Demostración activo',
      'Puedes probar los interruptores de luces, simular alarmas de seguridad y explorar la tienda con total libertad.'
    );
  };

  // Check Supabase active session or recovery URL hash on mount
  useEffect(() => {
    getActiveUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    if (typeof window !== 'undefined' && window.location.hash) {
      if (
        window.location.hash.includes('reset-password') || 
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('error_description')
      ) {
        setAuthModalMode('reset');
        setAuthModalOpen(true);
      }
    }
  }, []);

  const handleAuthSuccess = (user: AuthUser, message?: string) => {
    setCurrentUser(user);
    if (message) {
      addToast('success', 'Sesión iniciada', message);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    addToast('info', 'Sesión cerrada', 'Has cerrado tu sesión de usuario.');
  };

  const handleOpenAdminWithTab = (tab: 'orders' | 'supabase' = 'orders') => {
    setAdminInitialTab(tab);
    setAdminOpen(true);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: ToastType,
    title: string,
    description?: string,
    options?: {
      action?: ToastAction;
      secondaryAction?: ToastAction;
      duration?: number;
      sensorAnomalyKey?: 'water_leak' | 'smoke' | 'intruder' | 'gas';
      soundAlert?: boolean;
    }
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (type === 'critical' || type === 'emergency' || options?.soundAlert) {
      playCriticalAlertSound();
    }

    const duration = options?.duration ?? (type === 'critical' || type === 'emergency' ? 15000 : 4500);

    const newToast: ToastMessage = {
      id,
      type,
      title,
      description,
      timestamp,
      duration,
      action: options?.action,
      secondaryAction: options?.secondaryAction,
      sensorAnomalyKey: options?.sensorAnomalyKey,
      soundAlert: options?.soundAlert,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Monitoreo Automático de Sensores y Disparo de Notificaciones Críticas (Toasts)
  const prevDeviceStatusRef = useRef<DeviceStatus>(deviceStatus);
  const activeAlertKeysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const prev = prevDeviceStatusRef.current;
    const current = deviceStatus;

    // 1. ANOMALÍA: Fuga de Agua / Inundación en cocina o baño
    const isWaterLeakNow = !current.kitchenSensorOk || Boolean(current.waterLeakDetected);
    const wasWaterLeakBefore = !prev.kitchenSensorOk || Boolean(prev.waterLeakDetected);

    if (isWaterLeakNow && !wasWaterLeakBefore) {
      activeAlertKeysRef.current['water_leak'] = true;
      addToast(
        'critical',
        '🚨 ¡FUGA DE AGUA DETECTADA EN COCINA!',
        'El sensor de inundación ha detectado presencia de agua en el suelo. Protocolo Aegis: Desconectando electrodomésticos en riesgo y cerrando electroválvula general.',
        {
          sensorAnomalyKey: 'water_leak',
          duration: 16000,
          soundAlert: true,
          action: {
            label: 'Restablecer Sensor',
            onClick: () => {
              setDeviceStatus((s) => ({ ...s, kitchenSensorOk: true, waterLeakDetected: false }));
            },
          },
          secondaryAction: {
            label: 'Cortar Válvula General',
            onClick: () => {
              addToast('info', 'Electroválvula Aegis cerrada', 'Suministro general aislado para evitar desbordamiento.');
            },
          },
        }
      );
    } else if (!isWaterLeakNow && wasWaterLeakBefore) {
      if (activeAlertKeysRef.current['water_leak']) {
        activeAlertKeysRef.current['water_leak'] = false;
        addToast(
          'success',
          '💧 Sensor de agua normalizado',
          'La fuga ha sido controlada. Suministro y sensores en estado seguro.'
        );
      }
    }

    // 2. ANOMALÍA: Sensor de Humo / Gas / Incendio
    const isSmokeNow = Boolean(current.smokeDetected);
    const wasSmokeBefore = Boolean(prev.smokeDetected);

    if (isSmokeNow && !wasSmokeBefore) {
      activeAlertKeysRef.current['smoke'] = true;
      addToast(
        'critical',
        '🔥 ¡EMERGENCIA CRÍTICA: HUMO DETECTADO!',
        'Sensor óptico disparado en tiempo real. Sirena 90dB activa. Luces al 100% en vías de escape y cerradura liberada para evacuación segura.',
        {
          sensorAnomalyKey: 'smoke',
          duration: 16000,
          soundAlert: true,
          action: {
            label: 'Silenciar Sirena',
            onClick: () => {
              setDeviceStatus((s) => ({ ...s, smokeDetected: false }));
            },
          },
          secondaryAction: {
            label: 'Ver Protocolo 112',
            onClick: () => {
              addToast('warning', 'Protocolo de Emergencia', 'Compruebe el origen de la combustión, ventile y llame al 112 si es fuego descontrolado.');
            },
          },
        }
      );
    } else if (!isSmokeNow && wasSmokeBefore) {
      if (activeAlertKeysRef.current['smoke']) {
        activeAlertKeysRef.current['smoke'] = false;
        addToast(
          'success',
          '✅ Sensor de humo restablecido',
          'Alarma silenciada y niveles de calidad del aire normalizados.'
        );
      }
    }

    // 3. ANOMALÍA: Detección de Intrusión / Movimiento sospechoso
    const isIntruderNow = Boolean(current.intruderDetected);
    const wasIntruderBefore = Boolean(prev.intruderDetected);

    if (isIntruderNow && !wasIntruderBefore) {
      activeAlertKeysRef.current['intruder'] = true;
      addToast(
        'critical',
        '🛡️ ¡ALERTA CRÍTICA: INTRUSIÓN DETECTADA!',
        'Sensor PIR perimetral detectó paso no autorizado. Grabación 2K activa en cámaras y cerrojos blindados.',
        {
          sensorAnomalyKey: 'intruder',
          duration: 16000,
          soundAlert: true,
          action: {
            label: 'Desactivar Alarma',
            onClick: () => {
              setDeviceStatus((s) => ({ ...s, intruderDetected: false }));
            },
          },
          secondaryAction: {
            label: 'Ver Cámaras en Vivo',
            onClick: () => {
              addToast('info', 'Cámaras Aegis 2K', 'Transmitiendo señal cifrada a tu dispositivo móvil.');
            },
          },
        }
      );
    } else if (!isIntruderNow && wasIntruderBefore) {
      if (activeAlertKeysRef.current['intruder']) {
        activeAlertKeysRef.current['intruder'] = false;
        addToast(
          'info',
          'Perímetro asegurado',
          'Alerta de intrusión cancelada por el usuario.'
        );
      }
    }

    prevDeviceStatusRef.current = current;
  }, [deviceStatus]);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    addToast('success', 'Producto añadido al carrito', `${product.name} listo para tramitar.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('info', 'Producto eliminado del carrito');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // LILI voice routine action synchronization
  const handleVoiceCommandAction = (actionKey: string) => {
    if (actionKey === 'lock') {
      setDeviceStatus((prev) => ({ ...prev, lockOpen: false }));
      addToast('success', 'LILI: Cerradura bloqueada con seguridad');
    } else if (actionKey === 'lights_off') {
      setDeviceStatus((prev) => ({ ...prev, lightsOn: false }));
      addToast('info', 'LILI: Luces apagadas');
    } else if (actionKey === 'temp') {
      addToast('info', 'LILI: Clima interior 21.5 ºC');
    } else if (actionKey === 'routine') {
      setDeviceStatus((prev) => ({
        ...prev,
        lightsOn: false,
        lockOpen: false,
        camerasActive: true,
        kitchenSensorOk: true,
        routineActive: true,
        vacationMode: false,
      }));
      addToast('success', 'LILI: Rutina «Salir de casa» activada');
    } else if (actionKey === 'vacation_mode' || actionKey === 'vacation') {
      setDeviceStatus((prev) => {
        const nextVacation = !prev.vacationMode;
        if (nextVacation) {
          addToast(
            'success',
            '🌴 LILI: «Modo Vacaciones» activado',
            'Simulando presencia con luces aleatorias. Persianas y puertas inteligentes 100% cerradas.'
          );
          return {
            ...prev,
            vacationMode: true,
            shuttersClosed: true,
            lockOpen: false,
            camerasActive: true,
            lightsOn: true,
            activeSimulationRoom: 'Salón Principal',
            routineActive: true,
          };
        } else {
          addToast(
            'info',
            '☀️ LILI: «Modo Vacaciones» desactivado',
            'Bienvenido de vuelta. Persianas abiertas y simulación de presencia detenida.'
          );
          return {
            ...prev,
            vacationMode: false,
            shuttersClosed: false,
            lockOpen: true,
            activeSimulationRoom: undefined,
          };
        }
      });
    }
  };

  // Payment completed callback with Order persistence
  const handlePaymentSuccess = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    addToast('success', '¡Pago procesado con éxito!', `Pedido #${newOrder.id} guardado en Mis Pedidos.`);
    // Clear cart after checkout
    setCartItems([]);

    // Asynchronously save to Supabase cloud if configured
    try {
      const res = await saveOrderToSupabase(newOrder);
      if (res.success) {
        addToast('success', '☁️ Sincronizado en Supabase', `El pedido #${newOrder.id} se ha guardado en tu base de datos.`);
      } else {
        if (res.hint) {
          addToast('warning', 'Aviso de Supabase', `${res.error} ${res.hint}`);
        } else {
          addToast('info', 'Guardado localmente', 'Para archivar compras en Supabase, conecta tu proyecto en Mis Pedidos → Conectar Supabase.');
        }
      }
    } catch (e: any) {
      console.warn('Error sincronizando con Supabase:', e);
      addToast('warning', 'Error con Supabase', e?.message || 'Error de conexión.');
    }
  };

  const handleUpdateLocalOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Repeat an order from history
  const handleRepeatOrder = (order: Order) => {
    order.items.forEach((orderItem) => {
      const existingProduct = PRODUCTS.find((p) => p.id === orderItem.productId) || {
        id: orderItem.productId,
        name: orderItem.name,
        categoryTag: orderItem.categoryTag,
        description: 'Dispositivo certificado Aegis.',
        price: orderItem.price,
        image: 'lock',
      };

      setCartItems((prev) => {
        const found = prev.find((i) => i.product.id === existingProduct.id);
        if (found) {
          return prev.map((i) =>
            i.product.id === existingProduct.id
              ? { ...i, quantity: i.quantity + orderItem.quantity }
              : i
          );
        }
        return [...prev, { product: existingProduct, quantity: orderItem.quantity }];
      });
    });

    setCartOpen(true);
    addToast('success', 'Pedido añadido al carrito', 'Listo para tramitar nuevamente.');
  };

  // Handle Tab Navigation with Smooth Scroll or View Switch
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstallationRequest = () => {
    setContactMotive('Instalación');
    setActiveTab('contacto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('info', 'Formulario preparado', 'Hemos seleccionado la solicitud de instalación técnica para ti.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] dark:bg-[#071326] text-slate-800 dark:text-slate-100 font-sans selection:bg-[#009fe3] selection:text-white transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        ordersCount={orders.length}
        onOpenSupportChat={() => setSupportChatOpen(true)}
        onOpenLiliDemo={() => setLiliDemoOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Rendered according to Active Tab */}
      <main className="flex-1 transition-all duration-300">
        {/* Tab 1: INICIO (Screenshots 1 & 2) */}
        {activeTab === 'inicio' && (
          <div className="animate-fadeIn">
            <HeroSection
              onNavigate={handleTabChange}
              deviceStatus={deviceStatus}
              setDeviceStatus={setDeviceStatus}
              onOpenLiliDemo={() => setLiliDemoOpen(true)}
              orders={orders}
              addToast={addToast}
              currentUser={currentUser}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
            />
            <HowItWorks />
          </div>
        )}

        {/* Tab 2: TIENDA (Screenshot 3) */}
        {activeTab === 'tienda' && (
          <div className="animate-fadeIn">
            <StoreSection
              onAddToCart={handleAddToCart}
              onOpenCart={() => setCartOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: INSTALACIONES (Screenshot 4) */}
        {activeTab === 'instalaciones' && (
          <div className="animate-fadeIn">
            <InstallationsSection
              onNavigate={handleTabChange}
              onOpenLiliDemo={() => setLiliDemoOpen(true)}
              onSelectInstallRequest={handleInstallationRequest}
            />
          </div>
        )}

        {/* Tab 4: PLANES (Screenshot 5) */}
        {activeTab === 'planes' && (
          <div className="animate-fadeIn">
            <PlansSection
              onSubscribePro={(method) => {
                if (method) setSubInitialMethod(method);
                setSubModalOpen(true);
              }}
              onSelectFree={() => {
                addToast('success', 'Plan Normal Activo', 'Tienes acceso a control manual y catálogo certificado.');
              }}
            />
          </div>
        )}

        {/* Tab: ASISTENTE DE CONFIGURACIÓN DE DISPOSITIVOS & RECOMENDACIONES */}
        {activeTab === 'asistente' && (
          <div className="animate-fadeIn">
            <DeviceConfigAssistant
              onAddToCart={handleAddToCart}
              onNavigate={handleTabChange}
              deviceStatus={deviceStatus}
              setDeviceStatus={setDeviceStatus}
              orders={orders}
              addToast={addToast}
            />
          </div>
        )}

        {/* Tab 5: CONTACTO (Screenshot 6) */}
        {activeTab === 'contacto' && (
          <div className="animate-fadeIn">
            <ContactSection
              cartItems={cartItems}
              cartTotal={totalCartPrice}
              selectedMotive={contactMotive}
              onOpenSupportChat={() => setSupportChatOpen(true)}
            />
          </div>
        )}

        {/* Tab 6: MIS PEDIDOS (Order History & Tracking) */}
        {activeTab === 'pedidos' && (
          <div className="animate-fadeIn">
            <OrdersHistory
              orders={orders}
              onNavigate={handleTabChange}
              onRepeatOrder={handleRepeatOrder}
              onOpenAdmin={() => handleOpenAdminWithTab('supabase')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer 
        onNavigate={handleTabChange} 
        onOpenAdmin={() => handleOpenAdminWithTab('orders')}
        onOpenSupportChat={() => setSupportChatOpen(true)}
        onOpenWelcome={() => setWelcomeModalOpen(true)}
      />

      {/* Slide-over Cart Drawer (Screenshot 7) */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        total={totalCartPrice}
        onProceedToCheckout={() => setCheckoutOpen(true)}
      />

      {/* Realistic Interactive Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        total={totalCartPrice}
        onPaymentSuccess={handlePaymentSuccess}
        onViewOrders={() => handleTabChange('pedidos')}
        currentUser={currentUser}
      />

      {/* Private Admin Panel Modal (Store Owner Only) */}
      <AdminPanelModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        localOrders={orders}
        onUpdateLocalOrderStatus={handleUpdateLocalOrderStatus}
        initialTab={adminInitialTab}
      />

      {/* Plan PRO Subscription Modal */}
      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSuccess={(method) => {
          const methodLabel = method === 'bizum' ? 'Bizum' : method === 'paypal' ? 'PayPal' : 'Tarjeta';
          addToast('success', '¡Plan PRO activado!', `Suscripción vinculada mediante ${methodLabel}. Disfrutas de histórico en la nube y LILI PRO.`);
        }}
        initialMethod={subInitialMethod}
        currentUser={currentUser}
      />

      {/* LILI Voice Assistant Demo Modal */}
      <LiliVoiceModal
        isOpen={liliDemoOpen}
        onClose={() => setLiliDemoOpen(false)}
        onRunVoiceRoutine={handleVoiceCommandAction}
        deviceStatus={deviceStatus}
      />

      {/* Live Customer Support Chat Widget */}
      <LiveSupportChat
        orders={orders}
        onNavigate={handleTabChange}
        isOpenExternal={supportChatOpen}
        onCloseExternal={() => setSupportChatOpen(false)}
        onOpenExternal={() => setSupportChatOpen(true)}
      />

      {/* Supabase Authentication Modal (Google Sign-In, Email & Password Recovery) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Welcome Onboarding Modal for First-Time Visitors (Option 2) */}
      <WelcomeOnboardingModal
        isOpen={welcomeModalOpen}
        onClose={() => setWelcomeModalOpen(false)}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onExploreDemo={handleExploreDemo}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
