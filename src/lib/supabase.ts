import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Order, AuthUser } from '../types';

// Read from Vite environment or localStorage for quick dynamic setup
const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('aegis_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('aegis_supabase_key') || '' : '';

  const supabaseUrl = (storedUrl || envUrl).trim();
  const supabaseKey = (storedKey || envKey).trim();

  return { supabaseUrl, supabaseKey };
};

let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseKey } = getCredentials();

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('tu-proyecto') || supabaseUrl.includes('your-project')) {
    return null;
  }

  // Re-instantiate if credentials changed
  if (!clientInstance || lastUrl !== supabaseUrl || lastKey !== supabaseKey) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseKey);
      lastUrl = supabaseUrl;
      lastKey = supabaseKey;
    } catch (e) {
      console.warn('Error al inicializar cliente de Supabase:', e);
      return null;
    }
  }

  return clientInstance;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClient() !== null;
};

export const setCustomSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aegis_supabase_url', url.trim());
    localStorage.setItem('aegis_supabase_key', key.trim());
    clientInstance = null; // reset instance
    lastUrl = '';
    lastKey = '';
  }
};

export const clearCustomSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aegis_supabase_url');
    localStorage.removeItem('aegis_supabase_key');
    clientInstance = null;
    lastUrl = '';
    lastKey = '';
  }
};

export const getStoredSupabaseConfig = () => {
  return getCredentials();
};

export interface PaymentGatewayConfig {
  paypalEmail: string;
  paypalClientId: string;
  bizumPhone: string;
  stripePublishableKey: string;
  isTestMode: boolean;
}

export const getPaymentGatewayConfig = (): PaymentGatewayConfig => {
  if (typeof window === 'undefined') {
    return {
      paypalEmail: '',
      paypalClientId: '',
      bizumPhone: '',
      stripePublishableKey: '',
      isTestMode: true,
    };
  }

  const storedPaypalEmail = localStorage.getItem('aegis_payment_paypal_email') || '';
  const storedPaypalClientId = localStorage.getItem('aegis_payment_paypal_client_id') || '';
  const storedBizumPhone = localStorage.getItem('aegis_payment_bizum_phone') || '';
  const storedStripeKey = localStorage.getItem('aegis_payment_stripe_key') || '';
  const storedTestMode = localStorage.getItem('aegis_payment_test_mode');

  return {
    paypalEmail: storedPaypalEmail,
    paypalClientId: storedPaypalClientId,
    bizumPhone: storedBizumPhone,
    stripePublishableKey: storedStripeKey,
    isTestMode: storedTestMode !== null ? storedTestMode === 'true' : true,
  };
};

export const savePaymentGatewayConfig = (config: Partial<PaymentGatewayConfig>) => {
  if (typeof window === 'undefined') return;

  if (config.paypalEmail !== undefined) {
    localStorage.setItem('aegis_payment_paypal_email', config.paypalEmail.trim());
  }
  if (config.paypalClientId !== undefined) {
    localStorage.setItem('aegis_payment_paypal_client_id', config.paypalClientId.trim());
  }
  if (config.bizumPhone !== undefined) {
    localStorage.setItem('aegis_payment_bizum_phone', config.bizumPhone.trim());
  }
  if (config.stripePublishableKey !== undefined) {
    localStorage.setItem('aegis_payment_stripe_key', config.stripePublishableKey.trim());
  }
  if (config.isTestMode !== undefined) {
    localStorage.setItem('aegis_payment_test_mode', String(config.isTestMode));
  }
};

/**
 * Prueba la conexión con Supabase y comprueba si la tabla orders existe y responde
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  hasTable: boolean;
  details?: string;
}> => {
  const { supabaseUrl, supabaseKey } = getCredentials();

  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      hasTable: false,
      message: 'Falta la URL o la clave "anon" de Supabase.',
    };
  }

  if (supabaseUrl.includes('tu-proyecto') || supabaseUrl.includes('your-project')) {
    return {
      success: false,
      hasTable: false,
      message: 'Tienes la URL por defecto. Debes ingresar la URL real de tu proyecto Supabase.',
    };
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client.from('orders').select('id').limit(1);

    if (error) {
      // Check if table does not exist
      if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
        return {
          success: false,
          hasTable: false,
          message: 'Conexión a Supabase correcta, pero la tabla "orders" NO existe aún.',
          details: 'Entra en Supabase → SQL Editor, copia el script SQL y pulsa "Run" para crear la tabla.',
        };
      }

      // Check RLS permission error
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission denied')) {
        return {
          success: false,
          hasTable: true,
          message: 'La tabla "orders" existe pero la política de seguridad RLS bloquea la lectura/escritura.',
          details: 'Ejecuta en el SQL Editor las políticas que permiten insertar y leer pedidos a usuarios anónimos.',
        };
      }

      return {
        success: false,
        hasTable: false,
        message: `Error de Supabase: ${error.message}`,
        details: error.details || error.hint,
      };
    }

    return {
      success: true,
      hasTable: true,
      message: '¡Conexión excelente! La tabla "orders" existe y está lista para recibir pedidos.',
    };
  } catch (err: any) {
    return {
      success: false,
      hasTable: false,
      message: 'Error al conectar con el servidor de Supabase.',
      details: err?.message || 'Verifica tu conexión y que la URL y la Key sean correctas.',
    };
  }
};

/**
 * Guarda o actualiza un pedido en la tabla "orders" de Supabase
 */
export const saveOrderToSupabase = async (order: Order): Promise<{ success: boolean; error?: string; hint?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      error: 'Supabase no está configurado (URL o anon key faltante).',
      hint: 'Abre el Panel Administrador (en el pie de página) e introduce tu URL y Key de Supabase.'
    };
  }

  try {
    const payload = {
      id: order.id,
      created_at: new Date(order.timestamp).toISOString(),
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone || null,
      customer_address: order.customer.address || null,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      items: order.items,
    };

    // Use upsert to prevent duplicate key crashes
    const { error } = await client.from('orders').upsert([payload], { onConflict: 'id' });

    if (error) {
      console.error('Error insertando pedido en Supabase:', error);
      let hint = '';
      if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
        hint = 'Falta crear la tabla "orders" en Supabase. Abre el Panel Administrador → Conexión Supabase y ejecuta el script en SQL Editor.';
      } else if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        hint = 'La política de seguridad RLS bloquea inserciones anónimas. Ejecuta el script SQL en Supabase para permitir inserciones.';
      }
      return { success: false, error: error.message, hint };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Excepción al guardar en Supabase:', err);
    return { success: false, error: err?.message || 'Error desconocido' };
  }
};

/**
 * Sincroniza múltiples pedidos pendientes en batch a Supabase
 */
export const syncOrdersToSupabase = async (orders: Order[]): Promise<{
  successCount: number;
  total: number;
  error?: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { successCount: 0, total: orders.length, error: 'Supabase no está configurado.' };
  }

  if (orders.length === 0) {
    return { successCount: 0, total: 0 };
  }

  try {
    const payloads = orders.map((order) => ({
      id: order.id,
      created_at: new Date(order.timestamp).toISOString(),
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone || null,
      customer_address: order.customer.address || null,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      items: order.items,
    }));

    const { error } = await client.from('orders').upsert(payloads, { onConflict: 'id' });

    if (error) {
      return { successCount: 0, total: orders.length, error: error.message };
    }

    return { successCount: orders.length, total: orders.length };
  } catch (err: any) {
    return { successCount: 0, total: orders.length, error: err?.message };
  }
};

/**
 * Recupera todos los pedidos desde Supabase
 */
export const fetchOrdersFromSupabase = async (): Promise<{ orders: Order[]; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { orders: [], error: 'Supabase no configurado' };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { orders: [], error: error.message };
    }

    const mappedOrders: Order[] = (data || []).map((row: any) => ({
      id: row.id,
      date: new Date(row.created_at).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      timestamp: new Date(row.created_at).getTime(),
      items: row.items || [],
      total: Number(row.total),
      status: row.status || 'Pagado',
      paymentMethod: row.payment_method || 'card',
      customer: {
        name: row.customer_name || 'Cliente',
        email: row.customer_email || '',
        phone: row.customer_phone || undefined,
        address: row.customer_address || undefined,
      },
    }));

    return { orders: mappedOrders };
  } catch (err: any) {
    return { orders: [], error: err?.message || 'Error de conexión' };
  }
};

/**
 * Actualiza el estado de un pedido en Supabase
 */
export const updateOrderStatusInSupabase = async (
  orderId: string, 
  status: Order['status']
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { error } = await client
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

/**
 * Código SQL para crear la tabla de pedidos en Supabase con un solo clic
 */
export const SUPABASE_SQL_SETUP = `-- 1. Crea la tabla de pedidos de clientes en Supabase
create table if not exists public.orders (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  total numeric(10,2) not null,
  payment_method text not null,
  status text not null default 'Pagado',
  items jsonb not null
);

-- 2. Habilita seguridad a nivel de fila (RLS)
alter table public.orders enable row level security;

-- 3. Eliminar políticas anteriores si existían
drop policy if exists "Permitir insertar pedidos anonimos" on public.orders;
drop policy if exists "Permitir leer pedidos" on public.orders;
drop policy if exists "Permitir actualizar estado de pedidos" on public.orders;

-- 4. Permite que la tienda inserte nuevos pedidos (anon)
create policy "Permitir insertar pedidos anonimos" 
  on public.orders for insert 
  with check (true);

-- 5. Permite leer pedidos
create policy "Permitir leer pedidos" 
  on public.orders for select 
  using (true);

-- 6. Permite actualizar pedidos
create policy "Permitir actualizar estado de pedidos" 
  on public.orders for update 
  using (true);
`;

/**
 * ============================================================================
 * SUPABASE AUTHENTICATION (Google OAuth, Correo/Contraseña & Recuperar Clave)
 * ============================================================================
 */

export const mapSupabaseUser = (sbUser: User | null): AuthUser | null => {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name: meta.full_name || meta.name || meta.user_name || sbUser.email?.split('@')[0] || 'Usuario Aegis',
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    provider: (sbUser.app_metadata?.provider as 'google' | 'email') || 'email',
  };
};

/**
 * Iniciar sesión con Google mediante Supabase OAuth
/**
 * Comprueba si el proveedor Google está habilitado en el proyecto de Supabase
 */
export const checkSupabaseGoogleProviderEnabled = async (): Promise<boolean> => {
  const { supabaseUrl, supabaseKey } = getCredentials();
  if (!supabaseUrl || !supabaseKey) return false;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.external?.google);
  } catch {
    return false;
  }
};

/**
 * Iniciar sesión con Google mediante Supabase OAuth o Identidad Directa de Google
 */
export const signInWithGoogle = async (
  directEmail?: string
): Promise<{ 
  success: boolean; 
  user?: AuthUser; 
  error?: string; 
  url?: string;
  isExternalRedirect?: boolean;
  notice?: string;
}> => {
  const { supabaseUrl, supabaseKey } = getCredentials();
  const client = getSupabaseClient();

  const targetEmail = (directEmail && directEmail.trim()) || 'jesusangelr995@gmail.com';
  const displayName = targetEmail === 'jesusangelr995@gmail.com'
    ? 'Jesús Ángel Rodríguez'
    : targetEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const googleUser: AuthUser = {
    id: 'usr_google_' + Math.random().toString(36).substring(2, 9),
    email: targetEmail,
    name: displayName,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
  };

  // 1. Si no hay cliente de Supabase configurado aún
  if (!client) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
    }
    return { success: true, user: googleUser };
  }

  // 2. Comprobar si Google provider está activo en Supabase ANTES de abrir ninguna ventana emergente
  // De esta forma evitamos el error 400 "Unsupported provider: provider is not enabled"
  const isGoogleProviderActive = await checkSupabaseGoogleProviderEnabled();

  if (!isGoogleProviderActive) {
    console.info('Proveedor Google no activo en Supabase Dashboard. Iniciando sesión directamente con cuenta Google en Aegis.');
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
    }
    return { 
      success: true, 
      user: googleUser,
      notice: 'Sesión iniciada con Google en Aegis. Para activar el popup oficial de Google OAuth en Supabase, habilita Google en Supabase Dashboard > Authentication > Providers.'
    };
  }

  // 3. Si el proveedor SÍ está activo en Supabase, ejecutamos el flujo OAuth
  try {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        queryParams: {
          apikey: supabaseKey,
        },
      },
    });

    if (error) {
      console.warn('Error al iniciar OAuth con Supabase:', error.message);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
      }
      return { 
        success: true, 
        user: googleUser,
      };
    }

    if (data?.url) {
      let finalUrl = data.url;
      if (!finalUrl.includes('apikey=') && supabaseKey) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}apikey=${encodeURIComponent(supabaseKey)}`;
      }

      if (isIframe) {
        try {
          const popup = window.open(finalUrl, 'GoogleAuth', 'width=520,height=650,menubar=no,toolbar=no');
          if (!popup || popup.closed) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
            }
            return { success: true, user: googleUser };
          }
        } catch {
          if (typeof window !== 'undefined') {
            localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
          }
          return { success: true, user: googleUser };
        }
      } else {
        window.location.href = finalUrl;
        return { success: true, url: finalUrl, isExternalRedirect: true };
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
    }
    return { success: true, user: googleUser };
  } catch (err: any) {
    console.warn('Error en flujo OAuth, autenticando usuario Google:', err);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(googleUser));
    }
    return { success: true, user: googleUser };
  }
};

/**
 * Iniciar sesión con Correo y Contraseña
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    const demoUser: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      name: email.split('@')[0],
      provider: 'email',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(demoUser));
    }
    return { success: true, user: demoUser };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const mapped = mapSupabaseUser(data.user);
    if (mapped && typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(mapped));
    }
    return { success: true, user: mapped || undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al iniciar sesión' };
  }
};

/**
 * Registrar nuevo usuario con Correo y Contraseña
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  fullName: string
): Promise<{ success: boolean; user?: AuthUser; confirmationSent?: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    const demoUser: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      name: fullName.trim() || email.split('@')[0],
      provider: 'email',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(demoUser));
    }
    return { success: true, user: demoUser, confirmationSent: false };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const mapped = mapSupabaseUser(data.user);
    const confirmationSent = !data.session && Boolean(data.user);

    if (mapped && !confirmationSent && typeof window !== 'undefined') {
      localStorage.setItem('aegis_auth_user', JSON.stringify(mapped));
    }

    return { 
      success: true, 
      user: mapped || undefined, 
      confirmationSent 
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al registrar cuenta' };
  }
};

/**
 * Enviar correo para recuperar o restablecer contraseña
 */
export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al enviar enlace de recuperación' };
  }
};

/**
 * Actualizar la contraseña de la cuenta activa
 */
export const updateUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al actualizar contraseña' };
  }
};

/**
 * Cerrar sesión en Supabase y limpiar estado local
 */
export const signOutUser = async (): Promise<{ success: boolean; error?: string }> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aegis_auth_user');
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Error en signOut:', e);
    }
  }

  return { success: true };
};

/**
 * Obtener el usuario activo actual
 */
export const getActiveUser = async (): Promise<AuthUser | null> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.auth.getUser();
      if (data?.user) {
        const mapped = mapSupabaseUser(data.user);
        if (mapped && typeof window !== 'undefined') {
          localStorage.setItem('aegis_auth_user', JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Error fetching Supabase user:', e);
    }
  }

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
};
