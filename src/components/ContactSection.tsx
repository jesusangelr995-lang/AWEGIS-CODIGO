import React, { useState, useEffect } from 'react';
import { Instagram, Send, CheckCircle2, MessageSquare, Clock, Users, MessageCircle, Sparkles } from 'lucide-react';
import { INSTAGRAM_URL } from '../data/products';
import { CartItem } from '../types';

interface ContactSectionProps {
  cartItems: CartItem[];
  cartTotal: number;
  selectedMotive?: string;
  onOpenSupportChat?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  cartItems,
  cartTotal,
  selectedMotive = 'Pedido',
  onOpenSupportChat,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [motive, setMotive] = useState(selectedMotive);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Generate suggested cart inquiry if empty or updated
  useEffect(() => {
    if (motive === 'Pedido' && cartItems.length > 0 && (!message || message.includes('Hola, me gustaría solicitar el siguiente pedido:'))) {
      const itemsList = cartItems
        .map((item) => `- ${item.product.name} × ${item.quantity} (${(item.product.price * item.quantity).toFixed(2).replace('.', ',')} €)`)
        .join('\n');
      setMessage(`Hola, me gustaría solicitar el siguiente pedido:\n${itemsList}\nTotal: ${cartTotal.toFixed(2).replace('.', ',')} €`);
    } else if (motive === 'Instalación' && !message) {
      setMessage('Hola, solicito información para la instalación técnica de domótica AEGIS en mi vivienda / apartamento vacacional.');
    }
  }, [cartItems, cartTotal, motive]);

  // Update motive if prop changes
  useEffect(() => {
    if (selectedMotive) {
      setMotive(selectedMotive);
    }
  }, [selectedMotive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setSubmitted(true);
    setTimeout(() => {
      // Keep feedback for a few seconds
    }, 4000);
  };

  return (
    <section id="contacto" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031733] dark:text-white tracking-tight">
          Comunidad y Contacto
        </h2>
        <div className="h-1 w-12 bg-[#009fe3] mx-auto rounded-full mt-3" />
      </div>

      {/* 2 Columns Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Customer Support & Socials */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0b1d3a] rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 dark:border-slate-800 space-y-8">
          {/* Atención al cliente */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-[#031733] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#009fe3]" />
              Atención al Cliente
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="text-[#031733] dark:text-white font-semibold">Horario:</strong> Lunes a Viernes (8:00 - 19:00)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Escríbenos mediante el formulario y te responderemos por correo lo antes posible.
            </p>

            {/* Live Chat Direct Banner */}
            {onOpenSupportChat && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenSupportChat}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#009fe3]/15 via-cyan-500/10 to-sky-500/15 hover:from-[#009fe3]/25 hover:to-sky-500/25 border border-[#009fe3]/30 dark:border-[#009fe3]/40 text-left transition-all duration-200 cursor-pointer group shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#009fe3] text-white flex items-center justify-center font-bold text-xs shadow-md">
                        AG
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0b1d3a]"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#031733] dark:text-white">Chat en directo</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">
                          En línea
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        ¿Cómo puedo ayudarte? · Respuesta &lt; 1 min
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#009fe3] group-hover:translate-x-1 transition-transform">
                    Abrir →
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Redes Sociales y Eventos */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-[#031733] dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#009fe3]" />
              Redes Sociales y Eventos
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Síguenos en <strong className="text-[#031733] dark:text-white font-semibold">Instagram</strong> y <strong className="text-[#031733] dark:text-white font-semibold">TikTok</strong> para ver demos, sorteos exclusivos y lanzamientos.
            </p>

            {/* Instagram Direct Link Button (as requested by user) */}
            <div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d62976] via-[#fa7e1e] to-[#962fbf] hover:opacity-95 active:scale-95 text-white font-bold text-sm shadow-md shadow-pink-500/20 transition-all duration-200 cursor-pointer"
              >
                <Instagram className="w-5 h-5" />
                <span>@AegisOficial en Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Card: Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0b1d3a] rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 dark:border-slate-800">
          <h3 className="text-xl font-bold text-[#031733] dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#009fe3]" />
            Contacta con nosotros
          </h3>

          {submitted ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">¡Mensaje enviado con éxito!</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Gracias {fullName || 'por escribirnos'}. Nuestro equipo técnico de AEGIS se pondrá en contacto contigo a través de {email} en menos de 24 horas laborables.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-semibold text-[#031733] dark:text-slate-200 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre y apellidos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#08182f] focus:border-[#009fe3] focus:ring-2 focus:ring-[#009fe3]/20 outline-none text-slate-800 dark:text-white text-sm transition-all"
                />
              </div>

              {/* Correo electrónico */}
              <div>
                <label className="block text-sm font-semibold text-[#031733] dark:text-slate-200 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="tuemail@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#08182f] focus:border-[#009fe3] focus:ring-2 focus:ring-[#009fe3]/20 outline-none text-slate-800 dark:text-white text-sm transition-all"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-semibold text-[#031733] dark:text-slate-200 mb-1.5">
                  Motivo
                </label>
                <select
                  value={motive}
                  onChange={(e) => setMotive(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-[#009fe3] focus:ring-2 focus:ring-[#009fe3]/20 outline-none text-slate-800 dark:text-white text-sm bg-white dark:bg-[#08182f] transition-all cursor-pointer"
                >
                  <option value="Pedido">Pedido</option>
                  <option value="Instalación">Instalación técnica</option>
                  <option value="Consulta técnica">Consulta técnica</option>
                  <option value="Planes PRO">Planes PRO</option>
                  <option value="Otro">Otro asunto</option>
                </select>
              </div>

              {/* ¿En qué te podemos ayudar? */}
              <div>
                <label className="block text-sm font-semibold text-[#031733] dark:text-slate-200 mb-1.5">
                  ¿En qué te podemos ayudar?
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu consulta o los detalles de tu solicitud..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#08182f] focus:border-[#009fe3] focus:ring-2 focus:ring-[#009fe3]/20 outline-none text-slate-800 dark:text-white text-sm font-mono transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 transition-all duration-200 cursor-pointer shadow-md shadow-[#009fe3]/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar mensaje</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
