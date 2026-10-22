import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, Lock, CreditCard, ShieldCheck, 
  Smartphone, Building2, CheckCircle2, ArrowRight, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { PaymentMethod, AuthUser } from '../types';
import { getPaymentGatewayConfig } from '../lib/supabase';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: PaymentMethod) => void;
  initialMethod?: PaymentMethod;
  currentUser?: AuthUser | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMethod = 'bizum',
  currentUser,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialMethod);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Bizum details
  const [bizumPhone, setBizumPhone] = useState('');
  const [bizumCopied, setBizumCopied] = useState(false);

  // PayPal details
  const [paypalEmail, setPaypalEmail] = useState('');

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9812');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvc, setCardCvc] = useState('834');

  // Gateway config from Admin Panel
  const [gatewayConfig, setGatewayConfig] = useState(getPaymentGatewayConfig());

  useEffect(() => {
    if (isOpen) {
      setGatewayConfig(getPaymentGatewayConfig());
      setPaymentMethod(initialMethod);
      if (currentUser) {
        if (!email && currentUser.email) setEmail(currentUser.email);
        if (!fullName && currentUser.name) setFullName(currentUser.name);
        if (!paypalEmail && currentUser.email) setPaypalEmail(currentUser.email);
      }
    }
  }, [isOpen, initialMethod, currentUser]);

  if (!isOpen) return null;

  const handleCopyBizumPhone = () => {
    const phone = gatewayConfig.bizumPhone || '+34 622 145 980';
    navigator.clipboard.writeText(phone);
    setBizumCopied(true);
    setTimeout(() => setBizumCopied(false), 2500);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Por favor, introduce tu correo para vincular la suscripción.');
      return;
    }

    if (paymentMethod === 'bizum' && !bizumPhone) {
      alert('Por favor, indica tu teléfono para recibir la solicitud de Bizum.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onSuccess(paymentMethod);
    }, 1500);
  };

  const handleClose = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0b1d3a] text-slate-800 dark:text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="bg-[#031733] px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#009fe3]/20 flex items-center justify-center text-[#009fe3] border border-[#009fe3]/30">
              <Sparkles className="w-4 h-4 text-[#009fe3]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg block leading-tight">Pasarela de Suscripción Aegis Plan PRO</span>
              <span className="text-[11px] text-cyan-300 font-semibold">9,99 €/mes · Facturación protegida</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {!success ? (
            <form onSubmit={handleSubscribe} className="space-y-6">
              
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-sky-50 via-cyan-50/50 to-indigo-50/30 dark:from-[#07172e] dark:via-[#092244] dark:to-[#07172e] border border-cyan-200 dark:border-cyan-800/60 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Plan PRO AEGIS</h4>
                    <span className="text-[10px] bg-[#009fe3] text-white font-black px-2 py-0.2 rounded-full">30 días de prueba</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Histórico 2K en la nube + Notificaciones urgentes + LILI PRO
                  </p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#009fe3]">9,99 €</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">/mes</span>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  1. Datos del Titular de la Suscripción
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Nombre y Apellidos
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Martínez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Correo para Facturación y Acceso
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white focus:border-[#009fe3] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR (Bizum, PayPal, Tarjeta) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    2. Selecciona la Pasarela de Pago
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Bizum & PayPal Habilitados
                  </span>
                </div>

                {/* 3 Payment Tabs */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Bizum */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bizum')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                      paymentMethod === 'bizum'
                        ? 'border-[#009fe3] bg-gradient-to-b from-[#009fe3]/15 to-transparent text-[#009fe3] font-bold shadow-md shadow-[#009fe3]/10 ring-2 ring-[#009fe3]/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      📱
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">Bizum</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">1 clic</span>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                      paymentMethod === 'paypal'
                        ? 'border-[#0079c1] bg-gradient-to-b from-[#0079c1]/15 to-transparent text-[#0079c1] font-bold shadow-md shadow-[#0079c1]/10 ring-2 ring-[#0079c1]/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#003087]/15 flex items-center justify-center text-[#0079c1] font-black text-sm">
                      🅿️
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">PayPal</span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Protegido</span>
                  </button>

                  {/* Tarjeta */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                      paymentMethod === 'card'
                        ? 'border-[#009fe3] bg-gradient-to-b from-[#009fe3]/15 to-transparent text-[#009fe3] font-bold shadow-md shadow-[#009fe3]/10 ring-2 ring-[#009fe3]/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">Tarjeta</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Visa / MC</span>
                  </button>
                </div>

                {/* BIZUM FORM BODY */}
                {paymentMethod === 'bizum' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 space-y-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          Suscripción recurrente mediante Bizum
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          Introduce tu número de teléfono móvil. Recibirás una solicitud push instantánea en la app de tu banco para autorizar la cuota mensual de <strong>9,99 €</strong>.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tu número de teléfono móvil (asociado a Bizum) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 612 345 678"
                        value={bizumPhone}
                        onChange={(e) => setBizumPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-[#08182f] text-slate-900 dark:text-white text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {gatewayConfig.bizumPhone && (
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <span>Bizum oficial receptor Aegis:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-white">
                          <span>{gatewayConfig.bizumPhone}</span>
                          <button
                            type="button"
                            onClick={handleCopyBizumPhone}
                            className="p-1 hover:text-emerald-500 cursor-pointer"
                            title="Copiar teléfono receptor"
                          >
                            {bizumCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PAYPAL FORM BODY */}
                {paymentMethod === 'paypal' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-300 dark:border-sky-800/60 space-y-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#003087] text-white flex items-center justify-center font-black text-sm shrink-0">
                        🅿️
                      </div>
                      <div className="text-xs space-y-1">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          Suscripción protegida con PayPal
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          Cobro automático mensual con <strong>Protección del Comprador de PayPal</strong>. Cancela en cualquier momento con un clic desde tu cuenta de PayPal o desde Aegis.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Correo de tu cuenta PayPal *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="cuenta@paypal.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sky-400 dark:border-sky-700 bg-white dark:bg-[#08182f] text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {gatewayConfig.paypalEmail && (
                      <div className="pt-2 border-t border-sky-200 dark:border-sky-800/50 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Cuenta PayPal receptora:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">{gatewayConfig.paypalEmail}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CARD FORM BODY */}
                {paymentMethod === 'card' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#07172e] border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Número de Tarjeta (Visa, Mastercard o Maestro) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white font-mono focus:border-[#009fe3] outline-none"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Caducidad *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white font-mono focus:border-[#009fe3] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          CVC / CVV *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#08182f] text-slate-800 dark:text-white font-mono focus:border-[#009fe3] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#009fe3] to-sky-500 hover:from-sky-500 hover:to-[#009fe3] active:scale-98 transition-all cursor-pointer shadow-lg shadow-[#009fe3]/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando con la pasarela {paymentMethod.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'bizum' && 'Autorizar 9,99 €/mes con Bizum'}
                      {paymentMethod === 'paypal' && 'Pagar 9,99 €/mes con PayPal'}
                      {paymentMethod === 'card' && 'Suscribirse por 9,99 €/mes con Tarjeta'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Cifrado SSL 256-bit
                </span>
                <span>•</span>
                <span>Sin permanencia</span>
                <span>•</span>
                <span>Cancela con 1 clic</span>
              </div>
            </form>
          ) : (
            /* Success confirmation screen */
            <div className="p-4 sm:p-6 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  ¡Plan PRO Activado con Éxito!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1">
                  Tu suscripción de <strong>9,99 €/mes</strong> ha sido vinculada mediante{' '}
                  <strong className="text-[#009fe3] uppercase">{paymentMethod}</strong> a tu cuenta de Aegis.
                </p>
              </div>

              {/* Subscription receipt details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07172e] border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Titular:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{fullName || 'Usuario Aegis'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Correo vinculado:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Método de pago:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {paymentMethod === 'bizum' && `Bizum (${bizumPhone || 'Móvil'})`}
                    {paymentMethod === 'paypal' && `PayPal (${paypalEmail || email})`}
                    {paymentMethod === 'card' && 'Tarjeta Bancaria'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span className="text-slate-500">Próxima renovación:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full max-w-md py-3 px-4 bg-[#009fe3] hover:bg-[#0088c4] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
              >
                Comenzar a disfrutar de LILI PRO y Grabaciones 2K
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
