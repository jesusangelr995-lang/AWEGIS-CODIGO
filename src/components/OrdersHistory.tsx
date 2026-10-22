import React, { useState } from 'react';
import { 
  Package, CheckCircle2, Clock, Truck, Printer, RotateCcw, 
  ExternalLink, ShoppingBag, ShieldCheck, ChevronDown, ChevronUp, Copy, Check,
  Database, RefreshCw, Sparkles, ArrowRight
} from 'lucide-react';
import { Order, NavTab } from '../types';
import { isSupabaseConfigured, syncOrdersToSupabase } from '../lib/supabase';

interface OrdersHistoryProps {
  orders: Order[];
  onNavigate: (tab: NavTab) => void;
  onRepeatOrder: (order: Order) => void;
  onClearOrders?: () => void;
  onOpenAdmin?: () => void;
}

export const OrdersHistory: React.FC<OrdersHistoryProps> = ({
  orders,
  onNavigate,
  onRepeatOrder,
  onOpenAdmin,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const supabaseActive = isSupabaseConfigured();

  const handleQuickSync = async () => {
    if (!supabaseActive) {
      if (onOpenAdmin) onOpenAdmin();
      return;
    }

    setSyncing(true);
    setSyncNotice(null);
    const res = await syncOrdersToSupabase(orders);
    setSyncing(false);

    if (res.error) {
      setSyncNotice(`⚠️ Error al sincronizar: ${res.error}`);
    } else {
      setSyncNotice(`✅ ¡${res.successCount} pedido(s) sincronizado(s) en tu Supabase!`);
    }

    setTimeout(() => setSyncNotice(null), 4000);
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pagado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Pagado y Confirmado
          </span>
        );
      case 'En preparación':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <Clock className="w-3.5 h-3.5 text-[#009fe3]" />
            En preparación
          </span>
        );
      case 'Enviado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            En reparto express
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getPaymentLabel = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'card':
        return '💳 Tarjeta de Crédito';
      case 'bizum':
        return '📱 Bizum';
      case 'paypal':
        return '🅿️ PayPal Seguro';
      case 'transfer':
        return '🏦 Transferencia Bancaria';
      default:
        return 'Pago seguro';
    }
  };

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#009fe3] border border-sky-100 dark:border-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          Garantía y Gestión Oficial AEGIS
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          Mis Pedidos
        </h2>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3 mb-3" />
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          Historial completo de compras confirmadas, comprobantes de pago y estado de envío en tiempo real.
        </p>
      </div>

      {/* Supabase Cloud Sync Status Banner */}
      <div className={`mb-8 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
        supabaseActive
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${supabaseActive ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'}`}>
            <Database className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm flex items-center gap-2">
              <span>{supabaseActive ? 'Base de Datos Supabase Conectada' : 'Modo Local (Supabase no conectado)'}</span>
              <span className={`w-2 h-2 rounded-full ${supabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {supabaseActive
                ? 'Tus compras se archivan en la nube de Supabase en tiempo real.'
                : 'Las compras están guardadas en este navegador. Para archivarlas en tu Supabase en la nube, conéctalo en 1 minuto.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {supabaseActive && orders.length > 0 && (
            <button
              type="button"
              onClick={handleQuickSync}
              disabled={syncing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
            </button>
          )}

          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                supabaseActive
                  ? 'border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100'
                  : 'bg-[#009fe3] hover:bg-[#0088c4] text-white'
              }`}
            >
              <span>{supabaseActive ? 'Ver en Panel Dueño' : 'Conectar Supabase'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {syncNotice && (
        <div className="mb-6 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center animate-fadeIn">
          {syncNotice}
        </div>
      )}

      {/* Orders List or Empty State */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0b1d3a] rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-10 h-10 stroke-1" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#031733] dark:text-white">
              Aún no tienes pedidos registrados
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto leading-relaxed">
              Cuando compres cualquier dispositivo de nuestro catálogo certificado, aparecerá aquí con su factura y número de seguimiento.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('tienda')}
              className="px-6 py-3.5 bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#009fe3]/25 cursor-pointer inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorar Catálogo Certificado</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Cards */}
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0b1d3a] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Order Summary Header Bar */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 sm:p-6 cursor-pointer bg-slate-50/50 dark:bg-[#08182f] hover:bg-slate-50 dark:hover:bg-[#091d37] transition-colors border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="p-2.5 rounded-2xl bg-[#031733] text-white">
                      <Package className="w-5 h-5 text-[#009fe3]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-[#031733] dark:text-white text-base">
                          {order.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(order.id);
                          }}
                          className="text-slate-400 hover:text-[#009fe3] p-1 transition-colors"
                          title="Copiar número de pedido"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {order.date}
                      </span>
                    </div>
                  </div>

                  {/* Badges & Total */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {getStatusBadge(order.status)}

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total abonado</span>
                      <span className="text-lg font-black text-[#009fe3]">
                        {order.total.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6 animate-fadeIn">
                    {/* Customer & Shipping Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-[#07172e] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-[#031733] dark:text-white block mb-1">
                          👤 Destinatario y Contacto
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{order.customer.name}</p>
                        <p className="text-slate-500 dark:text-slate-400">{order.customer.email}</p>
                        {order.customer.phone && (
                          <p className="text-slate-500 dark:text-slate-400">Tel: {order.customer.phone}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-[#031733] dark:text-white block mb-1">
                          📍 Dirección y Método de Pago
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {order.customer.address || 'Envío express directo'}
                        </p>
                        <p className="text-[#009fe3] font-semibold mt-1">
                          {getPaymentLabel(order.paymentMethod)}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Dispositivos en este pedido ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                      </h4>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="p-3.5 sm:p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#031733] text-white flex items-center justify-center font-bold text-xs">
                                ×{item.quantity}
                              </div>
                              <div>
                                <span className="font-bold text-[#031733] dark:text-white block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                                  {item.categoryTag}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-slate-400 block sm:inline mr-2">
                                {item.price.toFixed(2).replace('.', ',')} € c/u
                              </span>
                              <span className="font-bold text-[#031733] dark:text-white">
                                {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>IVA 21% desglosado e incluido · Certificado de Garantía Aegis emitido</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✔ Transporte asegurado con seguimiento SMS
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#009fe3]" />
                          <span>Seguimiento</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Imprimir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRepeatOrder(order)}
                          className="px-4 py-2 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Repetir compra</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Tracking Timeline Modal */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0b1d3a] text-slate-800 dark:text-slate-100 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 animate-fadeIn space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#009fe3]" />
                <h4 className="font-extrabold text-[#031733] dark:text-white">
                  Seguimiento de Envío
                </h4>
              </div>
              <button
                onClick={() => setSelectedTrackingOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400">Número de expedición</p>
              <p className="font-mono font-bold text-[#031733] dark:text-white text-sm">
                EXP-{selectedTrackingOrder.id.replace('AEG-', '')}-ESP
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-[#031733] dark:text-white">Pago recibido y validado</p>
                  <p className="text-[11px] text-slate-400">{selectedTrackingOrder.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 animate-pulse">
                  ●
                </div>
                <div>
                  <p className="text-xs font-bold text-[#031733] dark:text-white">En preparación en centro logístico AEGIS</p>
                  <p className="text-[11px] text-slate-400">Verificación de calibración y firmware de fábrica</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ○
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">En reparto con transportista express</p>
                  <p className="text-[11px] text-slate-400">Entrega estimada: 24 - 48h laborables</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-40">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ○
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Entregado e instalado</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrackingOrder(null)}
              className="w-full py-3 bg-[#009fe3] hover:bg-[#0088c4] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
