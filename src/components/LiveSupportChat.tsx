import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Sparkles, Phone, CheckCircle2, 
  HelpCircle, ChevronDown, RotateCcw, Volume2, VolumeX,
  ExternalLink, User, ShoppingBag, Truck, ShieldCheck, 
  Clock, Zap, Check, PhoneCall
} from 'lucide-react';
import { Order, NavTab } from '../types';

interface Message {
  id: string;
  sender: 'agent' | 'user' | 'system';
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: string;
    primary?: boolean;
  }>;
}

interface FAQItem {
  id: string;
  question: string;
  shortLabel: string;
  icon: string;
  category: 'pedidos' | 'envios' | 'productos' | 'instalacion' | 'garantia';
  answer: string;
  suggestedAction?: {
    label: string;
    tab?: NavTab;
    call?: boolean;
    whatsapp?: boolean;
  };
}

interface LiveSupportChatProps {
  orders?: Order[];
  onNavigate?: (tab: NavTab) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  onOpenExternal?: () => void;
}

const FAQS: FAQItem[] = [
  {
    id: 'seguimiento',
    question: '¿Cómo hago el seguimiento de mi pedido?',
    shortLabel: '📦 Seguimiento de mi pedido',
    icon: '📦',
    category: 'pedidos',
    answer: 'Puedes consultar el estado en tiempo real de todas tus compras en la sección "Mis Pedidos" de la web. Allí verás si tu pedido está en preparación, enviado con número de tracking o entregado.',
    suggestedAction: { label: 'Ver mis pedidos', tab: 'pedidos' }
  },
  {
    id: 'envio',
    question: '¿Cuánto tarda el envío y cuánto cuesta?',
    shortLabel: '⏱️ Tiempos de envío y coste',
    icon: '⏱️',
    category: 'envios',
    answer: 'Los envíos tardan entre 24 y 48 horas laborables en toda la Península con MRW/SEUR Express. El envío es totalmente GRATUITO en compras superiores a 50 € (en pedidos menores el coste es de solo 3,90 €).',
    suggestedAction: { label: 'Ver tienda', tab: 'tienda' }
  },
  {
    id: 'garantia',
    question: '¿Qué garantía tienen los dispositivos inteligentes?',
    shortLabel: '🛡️ Garantía y devoluciones',
    icon: '🛡️',
    category: 'garantia',
    answer: 'Todos los productos AEGIS cuentan con 3 años de garantía oficial española y 30 días naturales de prueba sin compromiso. Si algo no te convence, gestionamos la recogida y devolución gratuita.',
  },
  {
    id: 'instalacion',
    question: '¿Es difícil instalar las cámaras y sensores?',
    shortLabel: '🛠️ Instalación y configuración',
    icon: '🛠️',
    category: 'instalacion',
    answer: '¡Es súper fácil! Todos los dispositivos son 100% inalámbricos y se colocan en 2 minutos con adhesivos 3M o anclajes magnéticos incluidos. Solo descargas la app, escaneas el código QR del producto y queda vinculado al instante. Además, ofrecemos instalación profesional a domicilio si lo prefieres.',
    suggestedAction: { label: 'Ver instalaciones', tab: 'instalaciones' }
  },
  {
    id: 'modo-vacaciones',
    question: '¿Cómo funciona la rutina especial «Modo Vacaciones» de LILI?',
    shortLabel: '🌴 «Modo Vacaciones» LILI',
    icon: '🌴',
    category: 'instalacion',
    answer: 'La rutina «Modo Vacaciones» de LILI está diseñada para proteger tu hogar cuando estás fuera:\n1. **Simulación de presencia activa**: Enciende y apaga luces aleatoriamente entre salón, cocina y dormitorios para que desde fuera parezca que hay gente en casa.\n2. **Persianas inteligentes**: Baja y blinda todas las persianas motorizadas.\n3. **Cerraduras y puertas**: Bloquea con cerrojo de seguridad todas las entradas inteligentes.\n4. **Cámaras perimetrales**: Activa detección de movimiento y alertas inmediatas al móvil.\n\nPuedes activarla con un clic en la interfaz de LILI o diciendo por voz: "LILI, activa el Modo Vacaciones".',
    suggestedAction: { label: 'Conocer LILI PRO', tab: 'instalaciones' }
  },
  {
    id: 'metodos-pago',
    question: '¿Qué métodos de pago aceptan?',
    shortLabel: '💳 Métodos de pago',
    icon: '💳',
    category: 'pedidos',
    answer: 'Aceptamos Tarjeta de Débito/Crédito (Visa, Mastercard, Maestro a través de Stripe cifrado), Bizum instantáneo para España, y Transferencia Bancaria directa con confirmación automática.',
  },
  {
    id: 'supabase-pedidos',
    question: '¿Cómo se guardan las compras y dónde las veo?',
    shortLabel: '☁️ Base de datos y archivo',
    icon: '☁️',
    category: 'pedidos',
    answer: 'Tus pedidos se guardan tanto en tu historial local como en tu base de datos Supabase en la nube. Además, el dueño de la tienda tiene acceso exclusivo al "Panel de Administrador" (abajo en el pie de página, PIN 1234) para gestionar clientes y envíos de forma 100% privada.',
  },
  {
    id: 'agente-humano',
    question: 'Quiero hablar con un agente humano o pedir una llamada',
    shortLabel: '📞 Solicitar llamada de un agente',
    icon: '📞',
    category: 'garantia',
    answer: '¡Por supuesto! Puedes dejarnos tu número de teléfono aquí en el chat para que te llamemos en menos de 15 minutos, o escribirnos directamente a nuestro WhatsApp de atención inmediata.',
    suggestedAction: { label: 'Solicitar llamada gratis', call: true }
  }
];

export const LiveSupportChat: React.FC<LiveSupportChatProps> = ({
  orders = [],
  onNavigate,
  isOpenExternal,
  onCloseExternal,
  onOpenExternal,
}) => {
  // Internal open state or controlled externally
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : isOpenInternal;

  const [hasUnread, setHasUnread] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phoneCallModal, setPhoneCallModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callRequested, setCallRequested] = useState(false);
  const [showFaqDrawer, setShowFaqDrawer] = useState(true);

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: '¡Hola! 👋 Bienvenido al servicio de atención al cliente en directo de AEGIS.\n\n¿Cómo puedo ayudarte hoy?',
      timestamp: 'Ahora'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  // Audio tone
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Ignore audio context restriction
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      if (onCloseExternal) onCloseExternal();
      else setIsOpenInternal(false);
    } else {
      if (onOpenExternal) onOpenExternal();
      else setIsOpenInternal(true);
      setHasUnread(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'agent',
        text: '¡Hola de nuevo! 👋 Soy Alex del equipo de atención al cliente de AEGIS.\n\n¿Cómo puedo ayudarte?',
        timestamp: 'Ahora'
      }
    ]);
    setShowFaqDrawer(true);
  };

  const handleSelectFAQ = (faq: FAQItem) => {
    // Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: faq.question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      playChime();

      const actions: Message['actions'] = [];

      if (faq.suggestedAction?.tab && onNavigate) {
        actions.push({
          label: faq.suggestedAction.label,
          action: () => {
            onNavigate(faq.suggestedAction!.tab!);
            if (window.innerWidth < 640) handleToggle();
          },
          primary: true
        });
      }

      if (faq.suggestedAction?.call) {
        actions.push({
          label: '📞 Pedir llamada inmediata',
          action: () => setPhoneCallModal(true),
          primary: true
        });
      }

      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: faq.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: actions.length > 0 ? actions : undefined
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (!isOpen) setHasUnread(true);
    }, 650);
  };

  const generateSmartReply = (query: string): { text: string; actions?: Message['actions'] } => {
    const q = query.toLowerCase().trim();

    // 1. Order tracking & Orders
    if (q.includes('pedido') || q.includes('seguimiento') || q.includes('tracking') || q.includes('compr') || q.includes('envio') || q.includes('dónde está')) {
      if (orders.length > 0) {
        const latest = orders[0];
        return {
          text: `He localizado tu último pedido (#${latest.id.slice(-6).toUpperCase()}) realizado el ${latest.date}.\n\nEstado actual: **${latest.status}**\nTotal: **${latest.total.toFixed(2).replace('.', ',')} €**\nProductos: ${latest.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}.\n\nPuedes ver todos los detalles en tu historial.`,
          actions: onNavigate ? [
            {
              label: 'Ver mi historial de pedidos',
              action: () => onNavigate('pedidos'),
              primary: true
            }
          ] : undefined
        };
      }
      return {
        text: 'Para consultar el estado de cualquier compra realizada, ve a la pestaña "Mis Pedidos". Si necesitas que localicemos tu envío manualmente, facilítanos tu nombre o correo electrónico.',
        actions: onNavigate ? [
          {
            label: 'Ir a Mis Pedidos',
            action: () => onNavigate('pedidos'),
            primary: true
          }
        ] : undefined
      };
    }

    // 2. Shipping / Delivery times
    if (q.includes('tarda') || q.includes('plazo') || q.includes('entrega') || q.includes('coste envio') || q.includes('transporte')) {
      return {
        text: 'Nuestros envíos se entregan en **24 a 48 horas laborables** mediante mensajería urgente (MRW / SEUR) en toda España peninsular e Islas Baleares.\n\n• **Gratis** a partir de 50 € de compra.\n• **3,90 €** para importes inferiores.\n• Incluye seguro a todo riesgo y enlace de seguimiento por SMS.'
      };
    }

    // 3. Products: Cameras
    if (q.includes('camara') || q.includes('cámara') || q.includes('vision nocturna') || q.includes('ip')) {
      return {
        text: 'Nuestra **Cámara de Seguridad IP Wi-Fi 2K** (49,90 €) incluye:\n• Calidad 2K QHD con visión nocturna infrarroja y a color.\n• Audio bidireccional (puedes escuchar y hablar desde el móvil).\n• Detección inteligente de personas (sin falsas alarmas).\n• Resistencia al agua IP66 para exterior o interior.\n• Sin suscripciones obligatorias (guarda en micro-SD o nube opcional).',
        actions: onNavigate ? [
          {
            label: 'Ver Cámara en Tienda',
            action: () => onNavigate('tienda'),
            primary: true
          }
        ] : undefined
      };
    }

    // 4. Products: Smart lights
    if (q.includes('foco') || q.includes('bombilla') || q.includes('luz') || q.includes('luces') || q.includes('iluminacion')) {
      return {
        text: 'El **Foco Inteligente LED RGB+CCT** (14,90 €) te permite elegir entre 16 millones de colores y regular el blanco cálido/frío. Compatible con Alexa, Google Home y rutinas de voz LILI. Rosca estándar E27 y consumo ultra bajo de 9W (equivalente a 80W tradicionales).',
        actions: onNavigate ? [
          {
            label: 'Ver Focos Inteligentes',
            action: () => onNavigate('tienda'),
            primary: true
          }
        ] : undefined
      };
    }

    // 5. Products: Sensors (window/door, flood, smoke/gas)
    if (q.includes('sensor') || q.includes('ventana') || q.includes('puerta') || q.includes('humo') || q.includes('gas') || q.includes('inundacion') || q.includes('agua')) {
      return {
        text: 'Disponemos de sensores de alta precisión para blindar tu hogar:\n• **Sensor de Apertura Puertas/Ventanas** (12,90 €): Aviso instantáneo si se abre un acceso.\n• **Sensor de Inundación y Fuga de Agua** (18,90 €): Alerta sonora y móvil ante fugas en cocina/baño.\n• **Sensor de Humo y Gas Pro** (24,90 €): Sirena integrada de 85dB y notificación inmediata.\n\nTodos funcionan con pilas de larga duración (más de 2 años) y adhesivo 3M de instalación rápida.',
        actions: onNavigate ? [
          {
            label: 'Ver Sensores en Tienda',
            action: () => onNavigate('tienda'),
            primary: true
          }
        ] : undefined
      };
    }

    // 6. Products: Vacuum robot
    if (q.includes('robot') || q.includes('aspirador') || q.includes('fregar') || q.includes('limpieza')) {
      return {
        text: 'El **Robot Aspirador y Fregador Inteligente Laser L1** (189,00 €) cuenta con:\n• Navegación láser LiDAR 360º para mapeo ultra preciso de tu hogar.\n• 4000 Pa de potencia de succión.\n• Depósito mixto 2 en 1 (aspira y friega a la vez).\n• Batería de 150 min con regreso automático a base de carga.\n• Programación por habitaciones desde la app AEGIS.',
        actions: onNavigate ? [
          {
            label: 'Ver Robot en Tienda',
            action: () => onNavigate('tienda'),
            primary: true
          }
        ] : undefined
      };
    }

    // 7. Human agent or phone call
    if (q.includes('humano') || q.includes('persona') || q.includes('llamada') || q.includes('llamar') || q.includes('telefono') || q.includes('teléfono') || q.includes('whatsapp') || q.includes('contacto')) {
      return {
        text: '¡Con mucho gusto! Nuestro equipo de soporte humano está disponible de lunes a sábado de 9:00 a 21:00.\n\nPuedes pulsar el botón inferior para que **te llamemos gratis en menos de 15 minutos**, o llamarnos directamente al **+34 900 839 214**.',
        actions: [
          {
            label: '📞 Solicitar llamada telefónica',
            action: () => setPhoneCallModal(true),
            primary: true
          }
        ]
      };
    }

    // 8. Installation service
    if (q.includes('instal') || q.includes('montar') || q.includes('tecnico') || q.includes('técnico') || q.includes('obra')) {
      return {
        text: 'Los dispositivos AEGIS no requieren obras ni taladros para funcionar. Si prefieres que un técnico certificado AEGIS acuda a tu domicilio a instalar y sincronizar todo, disponemos de servicio técnico en toda España peninsular.',
        actions: onNavigate ? [
          {
            label: 'Ver planes e instalaciones',
            action: () => onNavigate('instalaciones'),
            primary: true
          }
        ] : undefined
      };
    }

    // 9. Vacation Mode / LILI routines
    if (q.includes('vacacion') || q.includes('vacaciones') || q.includes('lili') || q.includes('presencia') || q.includes('persiana')) {
      return {
        text: 'La rutina **«Modo Vacaciones»** de LILI simula presencia encendiendo y alternando luces aleatoriamente entre habitaciones para disuadir posibles intrusos, al tiempo que baja y bloquea todas las persianas y puertas inteligentes con cerrojo digital.\n\nPuedes activarla desde la barra superior en **LILI PRO** o en el panel interactivo del Inicio.',
        actions: onNavigate ? [
          {
            label: 'Ver instalaciones y LILI PRO',
            action: () => onNavigate('instalaciones'),
            primary: true
          }
        ] : undefined
      };
    }

    // 10. Guarantee, returns, refund
    if (q.includes('devoluc') || q.includes('garant') || q.includes('devolver') || q.includes('reembolso')) {
      return {
        text: 'Cuentas con **3 años de garantía oficial española** y **30 días de periodo de prueba**. Si por cualquier razón no quedas satisfecho, te gestionamos la devolución gratuita y te reembolsamos el 100% de tu dinero.'
      };
    }

    // 10. Greetings
    if (q.includes('hola') || q.includes('buenas') || q.includes('hey') || q.includes('buenos dias') || q.includes('buenas tardes')) {
      return {
        text: '¡Hola! Qué alegría saludarte. ¿Cómo puedo ayudarte hoy? Puedes preguntarme sobre tus pedidos, características de nuestros productos, envíos o solicitar una llamada con un técnico.',
        actions: onNavigate ? [
          {
            label: 'Ver catálogo de la tienda',
            action: () => onNavigate('tienda'),
            primary: true
          }
        ] : undefined
      };
    }

    // Default helpful customer response
    return {
      text: `Entiendo tu consulta sobre "${query}".\n\n¿Quieres que te detallemos más información, ver nuestros productos disponibles o prefieres que un asesor te llame por teléfono para resolverlo juntos?`,
      actions: [
        {
          label: '📞 Pedir llamada gratis',
          action: () => setPhoneCallModal(true),
          primary: true
        },
        ...(onNavigate ? [{
          label: 'Ver tienda',
          action: () => onNavigate('tienda')
        }] : [])
      ]
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      playChime();

      const reply = generateSmartReply(userText);
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: reply.actions
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (!isOpen) setHasUnread(true);
    }, 700);
  };

  const handleRequestPhoneCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setCallRequested(true);
    setTimeout(() => {
      setPhoneCallModal(false);
      setCallRequested(false);
      const phoneSaved = phoneNumber;
      setPhoneNumber('');

      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: `✅ ¡Solicitud registrada con éxito!\n\nUn especialista de atención al cliente de AEGIS te llamará al número **${phoneSaved}** en menos de 15 minutos.\n\n¿Hay algo más en lo que pueda ayudarte mientras tanto?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);
      playChime();
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Subtle proactive bubble when closed */}
        {!isOpen && (
          <div 
            onClick={handleToggle}
            className="hidden sm:flex items-center gap-2.5 bg-white dark:bg-[#071c36] text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:scale-102 transition-all animate-fadeIn group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#009fe3] to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                AG
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#071c36]"></span>
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Atención en directo</span>
                <span className="text-[10px] text-emerald-500 font-bold">● En línea</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400">¿Cómo puedo ayudarte?</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Close preview bubble permanently for session
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={handleToggle}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer group active:scale-95 ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-700 rotate-90'
              : 'bg-linear-to-tr from-[#009fe3] to-[#0284c7] text-white hover:from-[#008bc7] hover:to-[#0369a1] hover:shadow-cyan-500/25'
          }`}
          title={isOpen ? 'Cerrar chat de atención al cliente' : 'Abrir chat en directo · ¿Cómo puedo ayudarte?'}
          aria-label="Abrir chat en directo"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
              {/* Green online pulse indicator */}
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#031733]"></span>
              </span>
              {/* Unread badge */}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Live Support Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] h-[640px] bg-white dark:bg-[#071c36] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden animate-fadeIn"
          role="dialog"
          aria-label="Chat de atención al cliente en directo"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#031733] via-[#05244f] to-[#009fe3] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                  <User className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#031733] ring-1 ring-emerald-500/50"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Alex García</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    En directo
                  </span>
                </div>
                <p className="text-xs text-cyan-200/90 flex items-center gap-1.5">
                  <span>Atención al Cliente AEGIS</span>
                  <span>·</span>
                  <span className="text-slate-300">Respuesta &lt; 1 min</span>
                </p>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={soundEnabled ? 'Silenciar notificaciones' : 'Activar sonido'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Support Ribbon */}
          <div className="bg-slate-100 dark:bg-[#0c274c] px-4 py-2 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#009fe3]" />
              <span className="font-medium">Soporte oficial para España</span>
            </div>
            <button
              type="button"
              onClick={() => setPhoneCallModal(true)}
              className="font-bold text-[#009fe3] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>Pedir llamada gratis</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#05172e]">
            {/* Security banner */}
            <div className="text-center my-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b2444] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Chat seguro y cifrado con asesores de AEGIS
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#009fe3] to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-1 shadow-xs">
                      AG
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-linear-to-r from-[#009fe3] to-[#0284c7] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#0f2d52] text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/90 dark:border-slate-700'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    {/* Interactive Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-600/60 flex flex-wrap gap-2">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={act.action}
                            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                              act.primary
                                ? 'bg-[#009fe3] hover:bg-[#008bc7] text-white'
                                : 'bg-slate-100 dark:bg-[#1a3d69] hover:bg-slate-200 dark:hover:bg-[#224e85] text-slate-800 dark:text-white'
                            }`}
                          >
                            <span>{act.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Agent Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#009fe3] to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                  AG
                </div>
                <div className="bg-white dark:bg-[#0f2d52] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-[#009fe3]">Alex está escribiendo</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009fe3] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009fe3] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009fe3] animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Suggestions Section ("Preguntas Frecuentes") */}
          <div className="bg-white dark:bg-[#071c36] border-t border-slate-200 dark:border-slate-700/80 px-4 pt-2.5 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#009fe3]" />
                <span>Preguntas Frecuentes (Respuestas instantáneas):</span>
              </span>
              <button
                type="button"
                onClick={() => setShowFaqDrawer(!showFaqDrawer)}
                className="text-[11px] text-[#009fe3] dark:text-cyan-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showFaqDrawer ? 'Ocultar' : 'Mostrar'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFaqDrawer ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFaqDrawer && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {FAQS.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => handleSelectFAQ(faq)}
                    className="shrink-0 bg-slate-100 hover:bg-[#009fe3]/10 dark:bg-[#0d274a] dark:hover:bg-[#133767] text-slate-700 dark:text-slate-200 hover:text-[#009fe3] dark:hover:text-cyan-300 border border-slate-200/90 dark:border-slate-700/70 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium active:scale-95"
                  >
                    {faq.shortLabel}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-[#071c36] border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu duda o consulta aquí..."
              className="flex-1 bg-slate-100 dark:bg-[#0d2547] text-slate-900 dark:text-white placeholder-slate-400 text-sm px-4 py-2.5 rounded-2xl border border-transparent focus:border-[#009fe3] focus:bg-white dark:focus:bg-[#0b203d] focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-[#009fe3] hover:bg-[#008bc7] disabled:opacity-40 disabled:hover:bg-[#009fe3] text-white transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center shrink-0"
              title="Enviar mensaje"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Modal: Solicitar Llamada Telefónica Inmediata */}
      {phoneCallModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#071c36] text-slate-900 dark:text-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              type="button"
              onClick={() => setPhoneCallModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#009fe3]/15 text-[#009fe3] flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Te llamamos gratis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Atención personalizada en menos de 15 minutos</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Introduce tu número de teléfono y un especialista de soporte de AEGIS se pondrá en contacto contigo inmediatamente sin ningún coste.
            </p>

            <form onSubmit={handleRequestPhoneCall} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Número de teléfono móvil o fijo:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">🇪🇸 +34</span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="612 34 56 78"
                    className="w-full pl-18 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2447] border border-slate-200 dark:border-slate-700 text-sm focus:border-[#009fe3] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Horario ininterrumpido: Lunes a Sábado de 09:00 a 21:00</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhoneCallModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={callRequested || !phoneNumber.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#009fe3] hover:bg-[#008bc7] text-white shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {callRequested ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registrando llamada...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      <span>Solicitar llamada</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
