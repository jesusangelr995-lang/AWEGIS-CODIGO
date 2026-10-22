import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, ShieldCheck, CreditCard, Smartphone, Building2, 
  Lock, ArrowRight, Printer, Share2, AlertCircle, ShoppingBag, Package,
  ExternalLink, Check, Copy, Info
} from 'lucide-react';
import { CartItem, PaymentMethod, Order, AuthUser } from '../types';
import { getPaymentGatewayConfig } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onPaymentSuccess: (order: Order) => void;
  onViewOrders?: () => void;
  currentUser?: AuthUser | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  total,
  onPaymentSuccess,
  onViewOrders,
  currentUser,
}) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bizum');
  
  // Customer info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Bizum specific state
  const [bizumPhoneInput, setBizumPhoneInput] = useState('');
  const [bizumCopied, setBizumCopied] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('742');
  const [cardHolder, setCardHolder] = useState('');

  // Order Details
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');

  // Live Gateway Configurations (configured in Admin Panel by the store owner)
  const [gatewayConfig, setGatewayConfig] = useState(getPaymentGatewayConfig());

  useEffect(() => {
    if (isOpen) {
      const cfg = getPaymentGatewayConfig();
      setGatewayConfig(cfg);
      if (phone && !bizumPhoneInput) {
        setBizumPhoneInput(phone);
      }
      if (currentUser) {
        if (!name && currentUser.name) setName(currentUser.name);
        if (!email && currentUser.email) setEmail(currentUser.email);
      }
    }
  }, [isOpen, phone, currentUser]);

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Por favor, completa al menos tu nombre y correo electrónico.');
      return;
    }

    if (paymentMethod === 'bizum' && !bizumPhoneInput && !phone) {
      alert('Por favor, introduce tu número de teléfono móvil para autorizar la solicitud de Bizum.');
      return;
    }

    setStep('processing');
    
    // Simulate real banking gateway verification & authorization
    setTimeout(() => {
      const generatedOrderId = `AEG-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const newOrder: Order = {
        id: generatedOrderId,
        date: now,
        timestamp: Date.now(),
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          categoryTag: i.product.categoryTag,
          price: i.product.price,
          quantity: i.quantity,
        })),
        total,
        status: 'Pagado',
        paymentMethod,
        customer: {
          name,
          email,
          phone: paymentMethod === 'bizum' ? (bizumPhoneInput || phone) : phone,
          address: address ? `${address}${city ? `, ${city}` : ''}` : undefined,
        },
      };

      setOrderId(generatedOrderId);
      setOrderDate(now);
      setStep('success');
      onPaymentSuccess(newOrder);
    }, 2200);
  };

  const handleCloseAndReset = () => {
    setStep('form');
    onClose();
  };

  const copyBizumReceiver = () => {
    const receiver = gatewayConfig.bizumPhone || '+34 612 345 678';
    navigator.clipboard.writeText(receiver.replace(/\s+/g, ''));
    setBizumCopied(true);
    setTimeout(() => setBizumCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative bg-white dark:bg-[#0b1d3a] text-slate-800 dark:text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Top Header */}
        <div className="bg-[#031733] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#009fe3]" />
            <span className="font-extrabold text-lg">Pasarela de Pago Segura AEGIS</span>
          </div>
          {step !== 'processing' && (
            <button
              onClick={handleCloseAndReset}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Step 1: Checkout Form & Breakdown */}
        {step === 'form' && (
          <form onSubmit={handleStartPayment} className="p-6 sm:p-8 space-y-6">
            
            {/* Order Items Breakdown */}
            <div className="bg-slate-50 dark:bg-[#07172e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm font-bold text-[#031733] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#009fe3]" />
                Resumen de tu pedido a pagar
              </h4>

              <div className="divide-y divide-slate-200/80 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#031733] dark:text-white">
                      {(item.product.price * item.quantity).toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{(total * 0.8264).toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21% incluido):</span>
                  <span>{(total * 0.1736).toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Envío Express Asegurado AEGIS:</span>
                  <span>GRATIS</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#031733] dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total a pagar:</span>
                  <span className="text-[#009fe3] text-xl">
                    {total.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#031733] dark:text-white">
                1. Datos de Envío y Contacto
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre y Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Martínez García"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de contacto / entrega *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+34 600 000 000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!bizumPhoneInput) setBizumPhoneInput(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dirección de entrega
                  </label>
                  <input
                    type="text"
                    placeholder="Calle Gran Vía 12, 3º B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] focus:ring-1 focus:ring-[#009fe3] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector - Highlight PayPal & Bizum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#031733] dark:text-white">
                  2. Selecciona tu Método de Pago
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Bizum & PayPal Habilitados
                </span>
              </div>

              {/* 4 Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Bizum */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bizum')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'bizum'
                      ? 'border-[#009fe3] bg-gradient-to-b from-[#009fe3]/15 to-transparent text-[#009fe3] font-bold shadow-md shadow-[#009fe3]/10 ring-2 ring-[#009fe3]/40'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#00a5a5]/10 flex items-center justify-center text-[#00a5a5] font-black text-sm">
                    📱
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">Bizum</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Instantáneo</span>
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'paypal'
                      ? 'border-[#0079c1] bg-gradient-to-b from-[#0079c1]/15 to-transparent text-[#0079c1] font-bold shadow-md shadow-[#0079c1]/10 ring-2 ring-[#0079c1]/40'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#003087]/10 flex items-center justify-center text-[#003087] dark:text-[#0079c1] font-black text-sm">
                    🅿️
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">PayPal</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Protegido</span>
                </button>

                {/* Tarjeta */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'card'
                      ? 'border-[#009fe3] bg-gradient-to-b from-[#009fe3]/15 to-transparent text-[#009fe3] font-bold shadow-md shadow-[#009fe3]/10 ring-2 ring-[#009fe3]/40'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <CreditCard className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">Tarjeta</span>
                  <span className="text-[10px] text-slate-500 font-medium">Visa / MC</span>
                </button>

                {/* Transferencia */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'transfer'
                      ? 'border-[#009fe3] bg-gradient-to-b from-[#009fe3]/15 to-transparent text-[#009fe3] font-bold shadow-md shadow-[#009fe3]/10 ring-2 ring-[#009fe3]/40'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Building2 className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">Transferencia</span>
                  <span className="text-[10px] text-slate-500 font-medium">IBAN Directo</span>
                </button>
              </div>

              {/* BIZUM FORM INTERACTION */}
              {paymentMethod === 'bizum' && (
                <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        Biz
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-[#031733] dark:text-white">
                          Pasarela Directa Bizum
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Cobro instantáneo seguro entre cuentas bancarias españolas
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      Sin Comisiones
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#07172e] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-emerald-600">1.</span>
                      <span>Introduce tu número de teléfono móvil vinculado a Bizum:</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 612 345 678"
                        value={bizumPhoneInput || phone}
                        onChange={(e) => setBizumPhoneInput(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-[#08182f] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      📲 Al hacer clic en <strong>«Pagar con Bizum»</strong>, se enviará la solicitud de pago por valor de <strong className="text-slate-800 dark:text-white">{total.toFixed(2).replace('.', ',')} €</strong> a tu app bancaria (CaixaBank, BBVA, Santander, ING, etc.) para que autorices con tu huella/FaceID o SMS.
                    </p>

                    {/* Store owner Bizum Receiver info */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Número de recepción de la tienda: <strong className="text-slate-700 dark:text-slate-300 font-mono">{gatewayConfig.bizumPhone || '+34 612 345 678'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={copyBizumReceiver}
                        className="text-[#009fe3] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {bizumCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{bizumCopied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYPAL FORM INTERACTION */}
              {paymentMethod === 'paypal' && (
                <div className="bg-gradient-to-br from-[#003087]/10 via-[#0079c1]/5 to-transparent border border-[#0079c1]/30 dark:border-[#0079c1]/40 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-sm">
                        P
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-[#031733] dark:text-white">
                          Pasarela Oficial PayPal
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Protección del comprador y pago rápido en 1 clic
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-full border border-sky-300 dark:border-sky-800">
                      Garantía PayPal
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#07172e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>Cuenta receptora de la tienda:</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono text-[11px]">
                        {gatewayConfig.paypalEmail || 'pagos@aegis-security.es'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-900 dark:text-sky-200 leading-relaxed">
                      🔒 Al pulsar en el botón de pago serás redirigido a la ventana segura de <strong>PayPal Express</strong> para autenticarte con tu cuenta PayPal o pagar con tu saldo/tarjeta vinculada. El pedido se registrará automáticamente al completar el proceso.
                    </div>

                    {/* Official PayPal Lookalike Button */}
                    <div className="pt-1">
                      <div className="w-full py-3 px-4 rounded-xl bg-[#ffc439] hover:bg-[#f4bb36] text-[#003087] font-black text-sm text-center shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <span>Pagar con</span>
                        <span className="italic font-black text-[#003087] text-base">PayPal</span>
                        <span className="font-sans text-xs font-bold text-slate-700">({total.toFixed(2).replace('.', ',')} €)</span>
                      </div>
                      <p className="text-center text-[10px] text-slate-400 mt-1.5">
                        El método de pago más seguro y utilizado del mundo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-inner border border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Tarjeta de débito / crédito (3D Secure 2)</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Número de tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-white outline-none focus:border-[#009fe3]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Caducidad</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#009fe3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#009fe3]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Details */}
              {paymentMethod === 'transfer' && (
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 text-sky-900 dark:text-sky-200 text-sm space-y-2">
                  <p className="font-semibold">Transferencia Bancaria Inmediata (SEPA)</p>
                  <p className="text-xs text-sky-700 dark:text-sky-300">
                    Al confirmar el pedido recibirás el IBAN de la cuenta española de Aegis Security para completar la transferencia. Los dispositivos se despachan al instante una vez recibido el justificante.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl font-bold text-base text-white active:scale-98 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                  paymentMethod === 'bizum'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    : paymentMethod === 'paypal'
                    ? 'bg-gradient-to-r from-[#003087] to-[#0079c1] hover:from-[#002569] hover:to-[#006bb0] shadow-sky-600/30'
                    : 'bg-[#009fe3] hover:bg-[#0088c4] shadow-[#009fe3]/30'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {paymentMethod === 'bizum' && `Confirmar y Pagar con Bizum (${total.toFixed(2).replace('.', ',')} €)`}
                  {paymentMethod === 'paypal' && `Continuar a PayPal (${total.toFixed(2).replace('.', ',')} €)`}
                  {paymentMethod === 'card' && `Pagar con Tarjeta ${total.toFixed(2).replace('.', ',')} €`}
                  {paymentMethod === 'transfer' && `Confirmar Pedido (${total.toFixed(2).replace('.', ',')} €)`}
                </span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
                <span>🔒 Pasarela SSL 256 bits</span>
                <span>•</span>
                <span>Cumple con normativa bancaria PCI-DSS</span>
              </p>
            </div>

          </form>
        )}

        {/* Step 2: Simulated Banking Gateway Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className={`w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-spin ${
                paymentMethod === 'bizum' ? 'border-t-emerald-500' : paymentMethod === 'paypal' ? 'border-t-[#0079c1]' : 'border-t-[#009fe3]'
              }`} />
              <Lock className={`w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                paymentMethod === 'bizum' ? 'text-emerald-500' : paymentMethod === 'paypal' ? 'text-[#0079c1]' : 'text-[#009fe3]'
              }`} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#031733] dark:text-white">
                {paymentMethod === 'bizum' && 'Conectando con la pasarela Bizum...'}
                {paymentMethod === 'paypal' && 'Verificando con la pasarela de PayPal...'}
                {paymentMethod === 'card' && 'Procesando pago con tarjeta bancaria...'}
                {paymentMethod === 'transfer' && 'Generando orden de transferencia...'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                {paymentMethod === 'bizum' 
                  ? `Esperando confirmación en tu móvil (${bizumPhoneInput || phone}). Autorización de ${total.toFixed(2).replace('.', ',')} € en curso...`
                  : paymentMethod === 'paypal'
                  ? `Verificando fondos y emitiendo autorización oficial de PayPal por ${total.toFixed(2).replace('.', ',')} €.`
                  : `Verificando fondos y emitiendo certificado de garantía oficial AEGIS por un total de ${total.toFixed(2).replace('.', ',')} €.`}
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className={`w-full h-full animate-pulse ${
                paymentMethod === 'bizum' ? 'bg-emerald-500' : paymentMethod === 'paypal' ? 'bg-[#0079c1]' : 'bg-[#009fe3]'
              }`} />
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation Receipt */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            {/* Success Banner */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-md">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[#031733] dark:text-white">
                ¡Pago confirmado con éxito!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {paymentMethod === 'bizum' && 'Cobro verificado instantáneamente vía Bizum. Tu pedido está en marcha.'}
                {paymentMethod === 'paypal' && 'Transacción de PayPal completada con éxito y asegurada por la protección del comprador.'}
                {paymentMethod === 'card' && 'Cobro de tarjeta de crédito/débito autorizado. Pedido archivado.'}
                {paymentMethod === 'transfer' && 'Orden registrada correctamente. Te hemos enviado las instrucciones al email.'}
              </p>
            </div>

            {/* Official Digital Receipt */}
            <div className="bg-slate-50 dark:bg-[#07172e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Número de Pedido</span>
                  <span className="font-mono font-bold text-[#031733] dark:text-white text-base">{orderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Método de Pago</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {paymentMethod === 'bizum' && '📱 BIZUM INSTANTÁNEO'}
                    {paymentMethod === 'paypal' && '🅿️ PAYPAL OFICIAL'}
                    {paymentMethod === 'card' && '💳 TARJETA BANCARIA'}
                    {paymentMethod === 'transfer' && '🏦 TRANSFERENCIA SEPA'}
                  </span>
                </div>
              </div>

              {/* Items in Receipt */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Artículos Abonados
                </span>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-800 dark:text-slate-200">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-[#031733] dark:text-white">
                      {(item.product.price * item.quantity).toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Paid Badge */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-extrabold text-[#031733] dark:text-white">Importe Total Pagado:</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {total.toFixed(2).replace('.', ',')} € (CONFIRMADO)
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Comprobante enviado a: <strong className="text-slate-700 dark:text-slate-300">{email}</strong> a nombre de <strong className="text-slate-700 dark:text-slate-300">{name}</strong>.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>

              {onViewOrders && (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseAndReset();
                    onViewOrders();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#031733] dark:text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Package className="w-4 h-4 text-[#009fe3]" />
                  <span>Ver en Mis Pedidos</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseAndReset}
                className="flex-1 py-3 px-4 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#009fe3]/25 transition-colors"
              >
                <span>Continuar en AEGIS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
