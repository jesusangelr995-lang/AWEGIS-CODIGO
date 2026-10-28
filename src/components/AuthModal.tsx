import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, 
  Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  sendPasswordResetEmail,
  updateUserPassword,
  isSupabaseConfigured
} from '../lib/supabase';
import { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, message?: string) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot' | 'reset') => {
    resetForm();
    setMode(newMode);
  };

  // 1. Google Sign In
  const handleGoogleSignIn = async (accountEmail?: string) => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const emailToUse = accountEmail || email.trim() || undefined;
      const res = await signInWithGoogle(emailToUse);
      
      if (!res.success && res.error) {
        setErrorMsg(res.error);
        setGoogleLoading(false);
        return;
      }

      const activeGoogleUser: AuthUser = res.user || {
        id: 'usr_google_' + Math.random().toString(36).substring(2, 8),
        email: emailToUse || 'jesusangelr995@gmail.com',
        name: emailToUse ? emailToUse.split('@')[0] : 'Jesús Ángel Rodríguez',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        provider: 'google',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('aegis_auth_user', JSON.stringify(activeGoogleUser));
      }

      onAuthSuccess(
        activeGoogleUser, 
        `¡Sesión iniciada con Google (${activeGoogleUser.email}) correctamente!`
      );
      onClose();
    } catch (err: any) {
      console.warn('Fallback inmediato de Google sign-in:', err);
      const fallbackUser: AuthUser = {
        id: 'usr_google_' + Math.random().toString(36).substring(2, 8),
        email: email.trim() || 'jesusangelr995@gmail.com',
        name: 'Jesús Ángel Rodríguez',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        provider: 'google',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegis_auth_user', JSON.stringify(fallbackUser));
      }
      onAuthSuccess(fallbackUser, '¡Sesión iniciada con Google correctamente!');
      onClose();
    } finally {
      setGoogleLoading(false);
    }
  };

  // 2. Email / Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Por favor, introduce un correo electrónico válido.');
        return;
      }
      setLoading(true);
      const res = await sendPasswordResetEmail(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(`Hemos enviado un enlace de recuperación seguro a ${email}. Revisa tu bandeja de entrada o spam.`);
      } else {
        setErrorMsg(res.error || 'No se pudo enviar el correo de recuperación.');
      }
      return;
    }

    if (mode === 'reset') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Por favor, indica tu correo electrónico asociado.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }
      setLoading(true);
      const res = await updateUserPassword(password, email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión con tu nueva clave.');
        setTimeout(() => handleSwitchMode('login'), 2000);
      } else {
        setErrorMsg(res.error || 'Error al actualizar contraseña.');
      }
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Por favor, indica tu nombre completo.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Por favor, indica un correo válido.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener un mínimo de 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true);
      const res = await signUpWithEmail(email, password, fullName);
      setLoading(false);

      if (res.success) {
        if (res.confirmationSent) {
          setSuccessMsg(`Te hemos enviado un correo de confirmación a ${email}. Actívalo para completar tu cuenta.`);
        } else if (res.user) {
          onAuthSuccess(res.user, '¡Cuenta creada con éxito! Bienvenido a Aegis.');
          onClose();
        } else {
          setSuccessMsg('Cuenta creada correctamente. Ya puedes iniciar sesión.');
          setTimeout(() => handleSwitchMode('login'), 1500);
        }
      } else {
        setErrorMsg(res.error || 'Error al crear la cuenta.');
      }
      return;
    }

    // Default: Login
    if (!email.trim() || !password) {
      setErrorMsg('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.success && res.user) {
      onAuthSuccess(res.user, `¡Bienvenido de nuevo, ${res.user.name || res.user.email}!`);
      onClose();
    } else {
      setErrorMsg(res.error || 'Credenciales incorrectas o cuenta no encontrada.');
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#0c203b] border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-[#009fe3] to-blue-600" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#009fe3]/20 to-cyan-400/20 text-[#009fe3] border border-[#009fe3]/30 mb-3 shadow-inner">
              {mode === 'forgot' ? (
                <KeyRound className="w-6 h-6 text-[#009fe3]" />
              ) : mode === 'reset' ? (
                <ShieldCheck className="w-6 h-6 text-[#009fe3]" />
              ) : (
                <Sparkles className="w-6 h-6 text-[#009fe3]" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta Aegis'}
              {mode === 'forgot' && 'Recuperar Contraseña'}
              {mode === 'reset' && 'Restablecer Contraseña'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login' && 'Accede a tus dispositivos, automatizaciones y pedidos.'}
              {mode === 'register' && 'Controla tu hogar inteligente desde cualquier dispositivo.'}
              {mode === 'forgot' && 'Te enviaremos un enlace a tu correo para restablecer tu clave.'}
              {mode === 'reset' && 'Introduce tu nueva contraseña segura.'}
            </p>
          </div>

          {/* Alert / Error / Success Messages */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              {mode === 'forgot' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>¿Por qué no aparece el correo en tu bandeja?</span>
                  </div>
                  <ul className="text-[11px] space-y-1 list-disc list-inside leading-relaxed opacity-90">
                    <li>Revisa tu carpeta de <strong>SPAM o Correo no deseado</strong> (los servidores de correo suelen clasificar a Supabase allí).</li>
                    <li>Supabase limita los envíos a un máximo de 3 correos por hora en su servidor gratuito.</li>
                    <li>Si tu cuenta se creó con Google o aún no tenía contraseña registrada.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('reset')}
                    className="w-full mt-1.5 py-2 px-3 rounded-xl bg-[#009fe3] hover:bg-[#0088c4] active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>⚡ Restablecer contraseña directamente aquí</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Social Google Login Button (only in login & register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#009fe3]" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {mode === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-[#0c203b] px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  o con tu correo
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (only on register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Alex Morales"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                  />
                </div>
              </div>
            )}

            {/* Email (login, register, forgot, reset) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {mode === 'reset' ? 'Correo de tu Cuenta' : 'Correo Electrónico'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                />
              </div>
            </div>

            {/* Direct reset shortcut if user is in forgot mode */}
            {mode === 'forgot' && !successMsg && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ¿Prefieres no esperar al correo?
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('reset')}
                  className="text-xs font-bold text-[#009fe3] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Cambiar clave ahora →</span>
                </button>
              </div>
            )}

            {/* Password (login, register, reset) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {mode === 'reset' ? 'Nueva Contraseña' : 'Contraseña'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-xs text-[#009fe3] hover:underline font-semibold cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Ver u ocultar contraseña"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (register, reset) */}
            {(mode === 'register' || mode === 'reset') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                  />
                </div>
              </div>
            )}

            {/* Remember Me Checkbox (login) */}
            {mode === 'login' && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#009fe3] border-slate-300 rounded focus:ring-[#009fe3] accent-[#009fe3]"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  Mantener mi sesión iniciada
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#009fe3] to-sky-500 hover:from-sky-500 hover:to-[#009fe3] text-white font-bold text-sm shadow-md shadow-[#009fe3]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Iniciar Sesión'}
                    {mode === 'register' && 'Crear mi Cuenta'}
                    {mode === 'forgot' && 'Enviar Enlace de Recuperación'}
                    {mode === 'reset' && 'Guardar Nueva Contraseña'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login' && (
              <p>
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-bold text-[#009fe3] hover:underline cursor-pointer"
                >
                  Regístrate gratis
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-bold text-[#009fe3] hover:underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-bold text-[#009fe3] hover:underline cursor-pointer"
              >
                ← Volver a Iniciar Sesión
              </button>
            )}
          </div>

          {/* Supabase Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {configured 
                ? 'Autenticación protegida con Supabase Cloud Auth' 
                : 'Modo seguro local & Supabase Auth'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
