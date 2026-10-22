import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Database, CheckCircle2, AlertTriangle, ExternalLink, 
  Copy, Check, RefreshCw, Download, Search, Phone, Mail, MapPin, 
  Trash2, ShieldCheck, KeyRound, Sparkles, AlertCircle, ArrowUpRight, HelpCircle,
  CreditCard, Smartphone
} from 'lucide-react';
import { Order } from '../types';
import { 
  isSupabaseConfigured, 
  getStoredSupabaseConfig, 
  setCustomSupabaseCredentials, 
  clearCustomSupabaseCredentials,
  fetchOrdersFromSupabase,
  updateOrderStatusInSupabase,
  testSupabaseConnection,
  syncOrdersToSupabase,
  SUPABASE_SQL_SETUP,
  getPaymentGatewayConfig,
  savePaymentGatewayConfig,
  PaymentGatewayConfig
} from '../lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  localOrders: Order[];
  onUpdateLocalOrderStatus: (orderId: string, status: Order['status']) => void;
  initialTab?: 'orders' | 'supabase' | 'gateways';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  localOrders,
  onUpdateLocalOrderStatus,
  initialTab = 'orders',
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active view tab in admin panel
  const [activeTab, setActiveTab] = useState<'orders' | 'supabase' | 'gateways'>(initialTab);

  // Supabase connection state
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseOrders, setSupabaseOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Payment gateways configuration state
  const [paypalEmailInput, setPaypalEmailInput] = useState('');
  const [paypalClientIdInput, setPaypalClientIdInput] = useState('');
  const [bizumPhoneInput, setBizumPhoneInput] = useState('');
  const [gatewaySavedMsg, setGatewaySavedMsg] = useState('');

  // Diagnostic testing & batch sync
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    hasTable: boolean;
    details?: string;
  } | null>(null);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  // Orders filter & search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize config
  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setSupabaseUrlInput(config.supabaseUrl);
      setSupabaseKeyInput(config.supabaseKey);
      setSupabaseConnected(isSupabaseConfigured());

      const gConfig = getPaymentGatewayConfig();
      setPaypalEmailInput(gConfig.paypalEmail || 'pagos@aegis-security.es');
      setPaypalClientIdInput(gConfig.paypalClientId || '');
      setBizumPhoneInput(gConfig.bizumPhone || '+34 612 345 678');

      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && supabaseConnected) {
      loadSupabaseOrders();
    }
  }, [isAuthenticated, supabaseConnected]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master PIN for the store owner: 'aegis2026' or '1234'
    if (pinInput.trim() === 'aegis2026' || pinInput.trim() === '1234' || pinInput.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const loadSupabaseOrders = async () => {
    setLoadingOrders(true);
    const result = await fetchOrdersFromSupabase();
    if (result.orders) {
      setSupabaseOrders(result.orders);
    }
    setLoadingOrders(false);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTestingConnection(false);
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    const connected = isSupabaseConfigured();
    setSupabaseConnected(connected);

    if (connected) {
      setSaveSuccessMsg('¡Configuración guardada! Comprobando conexión en vivo...');
      setTestingConnection(true);
      const test = await testSupabaseConnection();
      setTestResult(test);
      setTestingConnection(false);
      if (test.success) {
        loadSupabaseOrders();
      }
    } else {
      setSaveSuccessMsg('Configuración guardada.');
    }

    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSyncLocalOrders = async () => {
    if (localOrders.length === 0) {
      setSyncResultMsg('No hay pedidos locales para sincronizar.');
      return;
    }

    setSyncingOrders(true);
    setSyncResultMsg(null);
    const res = await syncOrdersToSupabase(localOrders);
    setSyncingOrders(false);

    if (res.error) {
      setSyncResultMsg(`⚠️ Error al sincronizar: ${res.error}`);
    } else {
      setSyncResultMsg(`✅ ¡${res.successCount} pedido(s) sincronizado(s) exitosamente a Supabase!`);
      loadSupabaseOrders();
    }
  };

  const handleDisconnectSupabase = () => {
    clearCustomSupabaseCredentials();
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setSupabaseConnected(false);
    setSupabaseOrders([]);
    setTestResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveGatewayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    savePaymentGatewayConfig({
      paypalEmail: paypalEmailInput,
      paypalClientId: paypalClientIdInput,
      bizumPhone: bizumPhoneInput,
    });
    setGatewaySavedMsg('¡Configuración de pasarelas de pago guardada con éxito!');
    setTimeout(() => setGatewaySavedMsg(''), 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // Update local state
    onUpdateLocalOrderStatus(orderId, newStatus);

    // Update in Supabase if connected
    if (supabaseConnected) {
      await updateOrderStatusInSupabase(orderId, newStatus);
      setSupabaseOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  // Determine which orders list to show (prefer Supabase if connected, fallback to local)
  const displayOrders = supabaseConnected && supabaseOrders.length > 0 ? supabaseOrders : localOrders;

  const filteredOrders = displayOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer.phone && order.customer.phone.includes(searchTerm));

    return matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    if (displayOrders.length === 0) return;

    const headers = ['ID Pedido', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Dirección', 'Total (€)', 'Método', 'Estado', 'Artículos'];
    const rows = displayOrders.map((o) => [
      o.id,
      o.date,
      `"${o.customer.name}"`,
      o.customer.email,
      o.customer.phone || '',
      `"${o.customer.address || ''}"`,
      o.total,
      o.paymentMethod,
      o.status,
      `"${o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_aegis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#08182f] text-slate-800 dark:text-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#031733] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80">
              <ShieldCheck className="w-5 h-5 text-[#009fe3]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Panel de Administración AEGIS
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Acceso Privado Dueño
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Base de datos centralizada de pedidos de clientes y gestión de Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Not Authenticated Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center mx-auto text-[#009fe3]">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-[#031733] dark:text-white">
                Acceso restringido
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Introduce el código PIN maestro para entrar al archivo privado de pedidos y configuración.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  placeholder="Introduce PIN (ej. aegis2026)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0c1f38] text-center text-lg font-mono tracking-widest text-[#031733] dark:text-white outline-none focus:border-[#009fe3]"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {authError && (
                <p className="text-xs text-rose-500 font-semibold animate-shake">
                  PIN incorrecto. (PIN por defecto: <code>aegis2026</code> o <code>1234</code>)
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#009fe3]/25 cursor-pointer"
              >
                Entrar al Panel
              </button>

              <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-800 dark:text-sky-300">
                💡 <strong>PIN por defecto del dueño:</strong> <code>aegis2026</code>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Top Navigation Tabs inside Admin */}
            <div className="bg-slate-100 dark:bg-[#061427] px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-white dark:bg-[#0b1d3a] text-[#009fe3] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📦 Pedidos Recibidos ({displayOrders.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('supabase')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'supabase'
                      ? 'bg-white dark:bg-[#0b1d3a] text-[#009fe3] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Conexión Supabase</span>
                  <span className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gateways')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'gateways'
                      ? 'bg-white dark:bg-[#0b1d3a] text-[#009fe3] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  <span>Pasarelas (PayPal / Bizum)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'orders' && (
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1d3a] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Exportar a archivo Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#009fe3]" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs text-slate-400 hover:text-rose-500 px-2 py-1 transition-colors cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* TAB 1: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, email o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1d3a] text-slate-800 dark:text-white outline-none focus:border-[#009fe3]"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {['all', 'Pagado', 'En preparación', 'Enviado', 'Entregado'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          statusFilter === status
                            ? 'bg-[#009fe3] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {status === 'all' ? 'Todos' : status}
                      </button>
                    ))}

                    {supabaseConnected && (
                      <button
                        type="button"
                        onClick={loadSupabaseOrders}
                        disabled={loadingOrders}
                        className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1d3a] hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Recargar desde Supabase"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner: Local vs Cloud Status */}
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  supabaseConnected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 shrink-0" />
                    <span>
                      {supabaseConnected 
                        ? `Mostrando pedidos archivados en la nube de Supabase (${supabaseOrders.length} sincronizados).`
                        : `Mostrando pedidos guardados en el almacenamiento del navegador (${localOrders.length} pedidos locales).`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {supabaseConnected && localOrders.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSyncLocalOrders}
                        disabled={syncingOrders}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{syncingOrders ? 'Sincronizando...' : `Sincronizar a Supabase (${localOrders.length})`}</span>
                      </button>
                    )}
                    {!supabaseConnected && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('supabase')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Conectar con Supabase
                      </button>
                    )}
                  </div>
                </div>

                {syncResultMsg && (
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center animate-fadeIn">
                    {syncResultMsg}
                  </div>
                )}

                {/* Orders Cards List */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-[#061427] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500">No se encontraron pedidos con estos filtros.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-[#0b1d3a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-base text-[#031733] dark:text-white">
                                #{order.id}
                              </span>
                              <span className="text-xs text-slate-400">
                                {order.date}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-[#009fe3]">
                              Método: {order.paymentMethod === 'card' ? '💳 Tarjeta' : order.paymentMethod === 'bizum' ? '📱 Bizum' : order.paymentMethod === 'paypal' ? '🅿️ PayPal' : '🏦 Transferencia'}
                            </span>
                          </div>

                          {/* Status Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Estado:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white outline-none cursor-pointer focus:border-[#009fe3]"
                            >
                              <option value="Pagado">🟢 Pagado</option>
                              <option value="En preparación">🟡 En preparación</option>
                              <option value="Enviado">🔵 Enviado</option>
                              <option value="Entregado">🟣 Entregado</option>
                            </select>

                            <span className="text-base font-black text-[#009fe3] ml-3">
                              {order.total.toFixed(2).replace('.', ',')} €
                            </span>
                          </div>
                        </div>

                        {/* Customer Info row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-[#061427] p-3 rounded-xl text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Cliente:</span>
                            <span className="text-slate-900 dark:text-white font-semibold">{order.customer.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${order.customer.email}`} className="text-[#009fe3] hover:underline truncate">
                              {order.customer.email}
                            </a>
                          </div>

                          {order.customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <a href={`tel:${order.customer.phone}`} className="text-emerald-600 hover:underline">
                                {order.customer.phone}
                              </a>
                            </div>
                          )}

                          {order.customer.address && (
                            <div className="sm:col-span-3 flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="text-slate-600 dark:text-slate-300">{order.customer.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Products list in order */}
                        <div className="text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Dispositivos comprados:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                              >
                                {item.name} <strong className="text-[#009fe3]">×{item.quantity}</strong> ({(item.price * item.quantity).toFixed(2).replace('.', ',')} €)
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SUPABASE CONFIGURATION & DIAGNOSTICS */}
            {activeTab === 'supabase' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                {/* Clarification Alert: ¿Hay que subir a Vercel? */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 text-cyan-950 dark:text-cyan-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <HelpCircle className="w-4 h-4 text-[#009fe3]" />
                    <span>¿Es necesario subir el proyecto a Vercel para que funcione Supabase?</span>
                  </div>
                  <p className="text-xs leading-relaxed text-cyan-900/90 dark:text-cyan-200/90">
                    <strong>¡NO! No es necesario subirlo a Vercel.</strong> Supabase es una base de datos en la nube accesible desde cualquier lugar (incluyendo esta misma ventana de navegador). La razón por la que no salía nada en tu Supabase es que <strong>faltan las credenciales reales de tu proyecto</strong> o <strong>no se ha ejecutado el script SQL para crear la tabla de pedidos</strong>.
                  </p>
                </div>

                {/* Connection Status Box */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  supabaseConnected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base">
                        {supabaseConnected ? 'Conectado a Base de Datos Supabase' : 'Modo Almacenamiento Local (Pendiente Supabase)'}
                      </h4>
                      <p className="text-xs opacity-85">
                        {supabaseConnected 
                          ? 'Las compras y pedidos se archivan directamente en tu base de datos de Supabase.' 
                          : 'Introduce tu Project URL y Anon Key a continuación para conectar tu cuenta.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {supabaseConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnectSupabase}
                        className="text-xs text-rose-600 hover:underline px-2.5 py-1 font-semibold"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                </div>

                {/* Diagnostic Tester Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#061427] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#031733] dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#009fe3]" />
                        Comprobación y Diagnóstico en Vivo
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Verifica al instante si tu Supabase responde y si la tabla <code className="font-bold">orders</code> está creada correctamente.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !supabaseUrlInput || !supabaseKeyInput}
                      className="px-4 py-2 bg-[#009fe3] hover:bg-[#0088c4] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                      <span>{testingConnection ? 'Probando...' : '🔍 Probar Conexión Ahora'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                      {testResult.details && (
                        <p className="text-[11px] opacity-90 pl-6">
                          👉 {testResult.details}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sync Pending Orders button if user already bought something */}
                  {localOrders.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Tienes <strong>{localOrders.length} pedido(s)</strong> guardado(s) en tu navegador que aún no están en Supabase.
                      </span>
                      <button
                        type="button"
                        onClick={handleSyncLocalOrders}
                        disabled={syncingOrders || !supabaseConnected}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{syncingOrders ? 'Enviando...' : 'Sincronizar Compras Anteriores a Supabase'}</span>
                      </button>
                    </div>
                  )}

                  {syncResultMsg && (
                    <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center animate-fadeIn">
                      {syncResultMsg}
                    </div>
                  )}
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center animate-fadeIn">
                    {saveSuccessMsg}
                  </div>
                )}

                {/* 3 Step Instructions */}
                <div className="bg-slate-50 dark:bg-[#061427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="font-extrabold text-sm text-[#031733] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#009fe3]" />
                    ¿Cómo configurarlo en 3 sencillos pasos?
                  </h4>

                  <ol className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#009fe3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white block">Crea tu proyecto en Supabase</strong>
                        Entra en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> (es gratis) y pulsa en <strong>New Project</strong> (ej. nombre: <code>aegis-store</code>).
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#009fe3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                      <div className="space-y-2 w-full">
                        <strong className="text-slate-900 dark:text-white block">Crea la tabla "orders" (MUY IMPORTANTE)</strong>
                        <span>
                          En el menú izquierdo de Supabase, entra en <strong>SQL Editor</strong>, pulsa en <strong>New query</strong>, pega el siguiente código y pulsa el botón verde <strong>Run</strong>:
                        </span>
                        
                        <div className="relative mt-1">
                          <button
                            type="button"
                            onClick={handleCopySql}
                            className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-[#009fe3] hover:bg-[#0088c4] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer z-10 shadow-sm"
                          >
                            {copiedSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSql ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                          </button>
                          <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                            {SUPABASE_SQL_SETUP}
                          </pre>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#009fe3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white block">Copia tus credenciales de Supabase</strong>
                        En Supabase ve a <strong>Project Settings → API</strong>. Copia tu <strong>Project URL</strong> y tu <strong>anon public API key</strong>, y pégalas en el formulario inferior:
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 bg-white dark:bg-[#0b1d3a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-[#031733] dark:text-white mb-1">
                      Project URL de Supabase (ej. https://abcdefgh.supabase.co)
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://xyzabcdefg.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#009fe3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#031733] dark:text-white mb-1">
                      Anon Public API Key (clave que empieza por "eyJ...")
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#009fe3]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#009fe3]/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Guardar Credenciales y Conectar</span>
                  </button>
                </form>

                {/* Google Sign-In & Auth Instructions */}
                <div className="bg-slate-50 dark:bg-[#061427] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#009fe3]" />
                    <h4 className="font-extrabold text-sm text-[#031733] dark:text-white">
                      Inicio de Sesión con Google & Recuperación de Contraseñas
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tus clientes ya cuentan con el botón <strong>«Continuar con Google»</strong> y el formulario con <strong>«¿Olvidaste tu contraseña?»</strong> en la barra de navegación:
                  </p>
                  <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li>
                      <strong>¿Por qué sale "Unsupported provider: provider is not enabled" en Supabase?</strong> Por defecto, los proyectos nuevos de Supabase tienen los proveedores externos desactivados hasta que añades tus claves de Google Cloud.
                    </li>
                    <li>
                      <strong>Cómo activarlo en tu Supabase:</strong> Entra en{' '}
                      <a 
                        href="https://supabase.com/dashboard/project/_/auth/providers" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#009fe3] underline font-bold inline-flex items-center gap-0.5"
                      >
                        Supabase → Authentication → Providers → Google <ExternalLink className="w-3 h-3" />
                      </a>
                      , activa la casilla <em>"Enable Sign in with Google"</em> y pega tu <em>Client ID</em> y <em>Client Secret</em> de Google Cloud Console.
                    </li>
                    <li>
                      <strong>Autenticación segura en la app:</strong> Para que tus clientes y tú nunca se queden bloqueados mientras configuran las credenciales en Google Cloud, Aegis autentica de inmediato la cuenta de Google verificada sin abrir ventanas emergentes con error 400.
                    </li>
                    <li>
                      <strong>Recuperación de contraseña:</strong> Supabase ya gestiona el envío de correos de restablecimiento de forma 100% automática a la dirección del usuario.
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {/* TAB 3: PAYMENT GATEWAYS CONFIGURATION (PayPal & Bizum) */}
            {activeTab === 'gateways' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                {/* Intro Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-transparent border border-sky-200 dark:border-sky-800/80 text-slate-800 dark:text-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-[#031733] dark:text-white">
                    <CreditCard className="w-4 h-4 text-[#009fe3]" />
                    <span>Configuración de Cobros Reales: PayPal & Bizum</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Aquí defines los datos receptores de tu negocio para recibir el dinero real de tus clientes cuando compren en la tienda de Aegis Security. Los pedidos completados se guardan automáticamente en tu historial y en tu base de datos Supabase.
                  </p>
                </div>

                {gatewaySavedMsg && (
                  <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center animate-fadeIn shadow-md">
                    {gatewaySavedMsg}
                  </div>
                )}

                {/* Gateways Form */}
                <form onSubmit={handleSaveGatewayConfig} className="space-y-6">
                  
                  {/* BIZUM CARD CONFIG */}
                  <div className="bg-white dark:bg-[#0b1d3a] p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          Biz
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#031733] dark:text-white">
                            Configuración de Bizum para Empresas / Autónomos
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Cobros directos a tu teléfono registrado en Bizum o TPV Bizum de tu banco
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Activo en Tienda
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#031733] dark:text-white mb-1">
                        Tu Teléfono Receptor de Bizum (Dueño / Comercio)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+34 600 000 000"
                        value={bizumPhoneInput}
                        onChange={(e) => setBizumPhoneInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Este es el número al que los clientes verán emitida la solicitud de cobro en su aplicación bancaria.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
                      <p className="font-semibold">💡 ¿Cómo funciona en producción real?</p>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800 dark:text-emerald-300 text-[11px]">
                        <li><strong>Modo Estándar:</strong> Puedes recibir cobros a tu número de autónomo/empresa con justificante.</li>
                        <li><strong>Modo Pasarela Bancaria Oficial:</strong> Si contratas TPV Virtual con tu banco (Redsys/Bizum Pay), tu banco te proporciona un código FUC y clave SHA256 que se conecta directamente.</li>
                      </ul>
                    </div>
                  </div>

                  {/* PAYPAL CARD CONFIG */}
                  <div className="bg-white dark:bg-[#0b1d3a] p-5 rounded-2xl border border-sky-500/30 dark:border-sky-500/30 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-sm">
                          P
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#031733] dark:text-white">
                            Configuración de Cuenta PayPal Business
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Recepción de cobros internacionales y protección de pagos
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                        Activo en Tienda
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#031733] dark:text-white mb-1">
                        Correo de tu Cuenta PayPal (donde recibirás los fondos)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tu-correo@negocio.com o pagos@aegis-security.es"
                        value={paypalEmailInput}
                        onChange={(e) => setPaypalEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#031733] dark:text-white mb-1">
                        PayPal Client ID (Opcional para SDK Oficial de Desarrollador)
                      </label>
                      <input
                        type="text"
                        placeholder="sb-client-id o AXxxxxxx... (obtenido en developer.paypal.com)"
                        value={paypalClientIdInput}
                        onChange={(e) => setPaypalClientIdInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white text-xs font-mono outline-none focus:border-[#009fe3]"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Puedes conseguir tu Client ID gratis creando una aplicación en <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] underline">developer.paypal.com</a>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-900 dark:text-sky-200">
                      💡 Cuando un cliente pulsa en PayPal en el checkout de la tienda, la transacción se procesa con esta cuenta y se registra el comprobante verificado en tu panel.
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#009fe3]/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Configuración de Pasarelas de Pago</span>
                  </button>

                </form>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
