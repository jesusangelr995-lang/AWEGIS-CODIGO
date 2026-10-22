# AEGIS - Domótica y Seguridad Inteligente

Plataforma web integral para el control centralizado del hogar inteligente, domótica certificada, seguridad y prevención crítica de incidentes.

---

## 🚀 Características Principales

* **Control Centralizado:** Gestión en tiempo real de luces, climatización, persianas motorizadas y cerraduras inteligentes.
* **Prevención Crítica:** Detección automática y alertas sonoras de humo, fugas de agua e intrusiones perimetrales.
* **Modo Noche & Ritmo Circadiano:** Atenuación automática a tonos cálidos (2200K) y reducción de luminosidad según el ciclo solar.
* **Tienda Domótica Integrada:** Catálogo de dispositivos inteligentes compatibles con pasarelas de pago (Tarjeta, PayPal y Bizum).
* **Autenticación Multicanal:** Inicio de sesión con Google (OAuth), registro mediante correo y contraseña, y recuperación segura de credenciales.
* **Base de Datos Supabase:** Registro y sincronización en tiempo real de pedidos de clientes en la nube.
* **Panel de Administración:** Gestión de pedidos, configuración de pasarelas de pago y diagnóstico de base de datos.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Iconografía:** Lucide React
* **Backend / Base de Datos:** Supabase (@supabase/supabase-js)
* **Animaciones & Audio:** Web Audio API (alarmas y sirenas de seguridad críticas)

---

## 💻 Ejecución en Local

### Requisitos previos
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* npm o bun

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd aegis
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Configura tus credenciales de Supabase en un archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```
   *(Nota: También puedes introducir tus credenciales directamente desde el Panel de Administración en la propia web).*

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Construir para producción:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Desarrollado para **AEGIS Security & Domótica Inteligente**. Todos los derechos reservados.
