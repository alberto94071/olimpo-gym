# IMPLEMENTATION PLAN — Olimpo Gym App Móvil + APIs

> **INSTRUCCIONES PARA CLAUDE CODE:** Este documento describe TODO lo que hay que implementar.
> Lee este archivo completo antes de empezar cualquier tarea. Contiene el contexto del proyecto,
> la arquitectura actual, las APIs que hay que crear, y el plan de la app móvil.
> Ejecuta las tareas en el orden indicado. No te saltes pasos.

---

## CONTEXTO DEL PROYECTO

**Olimpo Gym** — Negocio familiar con 2 gimnasios en San Marcos, Guatemala (Río Blanco y Sibilia).

Ya existe un **CRM/Panel de administración** en este repositorio que maneja:
- Inscripción de miembros (individual y grupal)
- Control de pagos y membresías
- Anuncios
- Roles (admin, secretaria_rb, secretaria_sb)
- Config de precios por sede
- Códigos de carné auto-generados (OGRB-XXXX-XXXX / OGSB-XXXX-XXXX)

**Lo que falta construir:**
1. API REST pública para que una app móvil consuma los datos
2. Sistema real de push notifications (Expo Push API)
3. App móvil en React Native + Expo

---

## ARQUITECTURA ACTUAL DEL CRM

### Stack
- Next.js 16 (App Router)
- Drizzle ORM + Neon PostgreSQL
- NextAuth v5 (Google OAuth + Credentials)
- Cloudinary (fotos)
- Tailwind CSS v4

### Estructura relevante
```
src/
├── actions/          ← Server Actions (lógica de negocio actual)
│   ├── members.ts    ← CRUD miembros, inscripción individual
│   ├── groups.ts     ← CRUD grupos, inscripción grupal
│   ├── payments.ts   ← Pagos individual y grupal
│   ├── announcements.ts ← CRUD anuncios (push es mock/console.log)
│   ├── dashboard.ts  ← Métricas, mora, cumpleaños
│   ├── pricing.ts    ← Config precios por sede
│   └── users.ts      ← Gestión usuarios del sistema
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  ← Auth del panel admin
│   │   └── notifications/subscribe/route.ts ← Push subscription (Web Push, hay que migrar a Expo)
│   └── (dashboard)/  ← Páginas del panel admin
├── auth.ts           ← Config NextAuth (Google + Credentials)
├── db/
│   ├── schema.ts     ← Esquema Drizzle completo
│   └── index.ts      ← Conexión a Neon
└── components/       ← UI del panel admin
```

### Base de datos (tablas existentes)
- `gyms` — Sedes con precios y secuencias
- `system_users` — Usuarios del panel admin (admin, secretarias)
- `groups` — Grupos con representante, precio, estado de pago
- `members` — Miembros con código, grupo, estado, membresía
- `payments` — Historial de pagos
- `announcements` — Anuncios
- `notifications` — Registro de notificaciones enviadas
- `push_subscriptions` — Suscripciones push (actualmente Web Push, migrar a Expo)

### Lógica de negocio importante
- **Mora grupal:** Si el representante no pagó, TODO el grupo queda bloqueado. La mora es a nivel de grupo, no individual.
- **Códigos:** Formato OGRB-XXXX-XXXX o OGSB-XXXX-XXXX. Auto-generados con secuencia por sede.
- **Roles:** Admin ve todo. Secretarias ven solo su sede. Secretarias no pueden cambiar precios.
- **Auth miembros (NUEVO):** Los miembros se autentican con Google OAuth (su email debe existir en tabla `members`).

---

## PARTE 1: APIs REST EN EL CRM (crear en este repo)

Todas las rutas van en `src/app/api/mobile/`. Comparten la misma DB y schema.

### 1.1 — Auth de miembros

La app móvil necesita su propio sistema de auth separado del admin.

**Crear:** `src/lib/mobile-auth.ts`
```typescript
// Funciones para:
// - Generar JWT para miembros (usar jose o jsonwebtoken)
// - Verificar JWT de miembros
// - Middleware para proteger rutas /api/mobile/*
// - El JWT debe contener: { memberId, email, gymId }
// - Firmar con process.env.MOBILE_JWT_SECRET (nueva env var)
```

**Crear:** `src/app/api/mobile/auth/google/route.ts`
```
POST /api/mobile/auth/google
Body: { idToken: "token-de-google-del-celular" }

Lógica:
1. Verificar el idToken con Google (google-auth-library o fetch a googleapis)
2. Extraer email del token
3. Buscar en tabla `members` WHERE email = extracted_email
4. Si NO existe → return { error: "No estás inscrito", status: 404 }
5. Si existe → generar JWT propio con { memberId, email, gymId }
6. Return { token, member: { id, name, code, gym, status, photoUrl } }
```

**Crear:** `src/app/api/mobile/auth/verify/route.ts`
```
POST /api/mobile/auth/verify
Headers: Authorization: Bearer <token>

Lógica:
1. Verificar JWT
2. Buscar miembro en DB
3. Return { valid: true, member: { ... } } o { valid: false }
```

### 1.2 — Perfil del miembro

**Crear:** `src/app/api/mobile/me/route.ts`
```
GET /api/mobile/me
Headers: Authorization: Bearer <token>

Response: {
  id, code, name, phone, email, birthDate, sex, photoUrl,
  gym: { id, name, address, phone, schedule },
  plan, price,
  membershipStart, membershipEnd,
  daysRemaining, // calculado: membershipEnd - today
  status, // "activo" | "mora" | "bloqueado" | "vencido"
  paid,
  group: {
    id, groupNumber, repName, repPhone, paidFull, memberCount
  } | null,
  paymentHistory: [{ id, amount, date, method, notes }]
}

Notas:
- Si el miembro pertenece a un grupo y group.paidFull = false,
  el status debe mostrarse como "bloqueado" independientemente
  del status individual.
- daysRemaining = max(0, diff entre membershipEnd y hoy)
```

### 1.3 — Anuncios

**Crear:** `src/app/api/mobile/announcements/route.ts`
```
GET /api/mobile/announcements
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20

Lógica:
1. Obtener gymId del token JWT
2. Filtrar anuncios WHERE (gymId = miembro.gymId OR gymId IS NULL)
   AND published = true
3. Ordenar por createdAt DESC
4. Paginar

Response: {
  data: [{ id, title, body, gymName, createdAt }],
  totalCount, page, totalPages
}
```

### 1.4 — Push Token Registration

**Modificar schema:** En `src/db/schema.ts`, actualizar `pushSubscriptions`:
```typescript
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  expoPushToken: varchar("expo_push_token", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 20 }), // "android" | "ios"
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Nota:** Hay que crear una migración para esto. Los campos viejos (endpoint, keysJson) se reemplazan por expoPushToken y platform. Correr `npx drizzle-kit generate` y `npx drizzle-kit migrate`.

**Crear:** `src/app/api/mobile/push-token/route.ts`
```
PUT /api/mobile/push-token
Headers: Authorization: Bearer <token>
Body: { expoPushToken: "ExponentPushToken[xxxx]", platform: "android" }

Lógica:
1. Verificar JWT, obtener memberId
2. Buscar si ya existe un registro con ese expoPushToken
3. Si existe → actualizar memberId y active = true
4. Si no → insertar nuevo
5. Return { success: true }
```

### 1.5 — Envío real de Push Notifications

**Crear:** `src/lib/expo-push.ts`
```typescript
// Función para enviar push via Expo Push API (GRATIS)
// URL: https://exp.host/--/api/v2/push/send
// Acepta hasta 100 mensajes por request
// Cada mensaje: { to: "ExponentPushToken[xxx]", title, body, data }

export async function sendExpoPush(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  const messages = tokens.map(token => ({
    to: token,
    sound: "default" as const,
    title,
    body,
    data: data || {},
  }));

  // Chunked: max 100 por request
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(chunk),
    });
  }
}
```

**Modificar:** `src/actions/announcements.ts`
Reemplazar el bloque `if (data.sendPush)` que tiene `console.log` con:
```typescript
if (data.sendPush) {
  const { sendExpoPush } = await import("@/lib/expo-push");

  // Obtener tokens de la sede
  const subs = await db.select({
    token: pushSubscriptions.expoPushToken,
  })
  .from(pushSubscriptions)
  .innerJoin(members, eq(pushSubscriptions.memberId, members.id))
  .where(and(
    eq(pushSubscriptions.active, true),
    finalGymId ? eq(members.gymId, finalGymId) : undefined
  ));

  const tokens = subs.map(s => s.token).filter(Boolean);

  if (tokens.length > 0) {
    await sendExpoPush(tokens, data.title, data.body, {
      type: "announcement",
    });
  }
}
```

**Crear:** `src/app/api/notifications/send/route.ts`
```
POST /api/notifications/send
Body: {
  title: string,
  body: string,
  targetGymId?: string | null,  // null = ambas sedes
  targetMemberId?: string,
  type: "payment_reminder" | "motivation" | "birthday" | "custom"
}

Lógica:
1. Verificar que es un system_user autenticado (admin o secretaria)
2. Obtener tokens según target:
   - Si targetMemberId → solo ese miembro
   - Si targetGymId → todos los de esa sede
   - Si null → todos
3. Enviar via sendExpoPush()
4. Registrar en tabla `notifications`
5. Return { success: true, sentCount: N }
```

### 1.6 — Notificaciones del miembro

**Agregar tabla al schema:** `src/db/schema.ts`
```typescript
export const memberNotifications = pgTable("member_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  read: boolean("read").default(false).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
```

**Crear:** `src/app/api/mobile/notifications/route.ts`
```
GET /api/mobile/notifications
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20

Response: {
  data: [{ id, title, body, type, read, sentAt }],
  unreadCount, totalCount
}
```

**Crear:** `src/app/api/mobile/notifications/read/route.ts`
```
PUT /api/mobile/notifications/read
Headers: Authorization: Bearer <token>
Body: { notificationId: "uuid" }  // o { all: true } para marcar todas

Response: { success: true }
```

---

## PARTE 2: APP MÓVIL (repo separado)

### Crear nuevo proyecto
```bash
npx create-expo-app olimpo-gym-app --template blank-typescript
cd olimpo-gym-app
npx expo install expo-router expo-auth-session expo-web-browser
npx expo install expo-notifications expo-device expo-constants
npx expo install expo-secure-store expo-image expo-splash-screen
npx expo install @expo-google-fonts/cinzel
npx expo install react-native-svg
```

### Variables de entorno
```
EXPO_PUBLIC_API_URL=https://tu-crm.vercel.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Estructura del proyecto
```
app/
├── _layout.tsx              ← Root layout: AuthProvider, fontsLoaded
├── (auth)/
│   ├── _layout.tsx          ← Stack sin tabs
│   └── login.tsx            ← Pantalla de login con Google
├── (tabs)/
│   ├── _layout.tsx          ← Tab navigator con 4 tabs
│   ├── index.tsx            ← Tab 1: Dashboard (membresía, anuncios recientes)
│   ├── announcements.tsx    ← Tab 2: Lista de anuncios
│   ├── membership.tsx       ← Tab 3: Detalle membresía + historial pagos
│   └── profile.tsx          ← Tab 4: Perfil, config, cerrar sesión
├── announcement/
│   └── [id].tsx             ← Detalle de un anuncio
└── +not-found.tsx

lib/
├── api.ts                   ← Fetch wrapper: agrega JWT, maneja errores
├── auth.ts                  ← AuthContext: login, logout, token en SecureStore
├── push.ts                  ← Registro de Expo Push Token
└── types.ts                 ← Tipos TypeScript (Member, Announcement, etc)

components/
├── MembershipCard.tsx       ← Card con estado de membresía (al día/mora)
├── AnnouncementCard.tsx     ← Card de anuncio
├── StatusBadge.tsx          ← Badge de estado con colores
├── GroupCard.tsx             ← Info del grupo si pertenece a uno
└── Header.tsx               ← Header con logo Olimpo Gym

constants/
├── colors.ts                ← Paleta de colores (GOLD, BG, etc)
└── config.ts                ← URL del API, etc
```

### Branding/Tema
```typescript
// constants/colors.ts
export const Colors = {
  gold: "#C5A55A",
  goldLight: "#D4B96E",
  goldDark: "#A68B3E",
  bg: "#0A0A0A",
  card: "#141414",
  card2: "#1A1A1A",
  text: "#F0F0E8",
  dim: "#777777",
  green: "#4CAF50",
  red: "#E53935",
  orange: "#FF9800",
  blue: "#42A5F5",
  purple: "#AB47BC",
};
```
- Dark mode forzado
- Tipografía Cinzel para títulos (expo-google-fonts)
- Tema griego/mitológico consistente con el CRM

### Auth Flow
```
1. App abre → revisa si hay JWT en SecureStore
2. Si hay → POST /api/mobile/auth/verify
   - Si válido → navegar a (tabs)
   - Si inválido → borrar token, ir a login
3. Si no hay → ir a login
4. Login: Google Sign-In → obtener idToken
5. POST /api/mobile/auth/google con idToken
6. Si exitoso → guardar JWT en SecureStore → navegar a (tabs)
7. Si error 404 → "No estás inscrito en Olimpo Gym"
```

### Push Notifications Setup
```
1. Al hacer login exitoso:
   - Pedir permisos de notificación
   - Obtener Expo Push Token
   - PUT /api/mobile/push-token
2. Cuando llega una push:
   - Si app en foreground → mostrar banner/toast
   - Si app en background → notificación del sistema
   - Al tocar → navegar a la pantalla correspondiente
```

### Pantallas

**Login:**
- Fondo negro con logo Olimpo Gym centrado
- Botón "Iniciar sesión con Google" (blanco, con ícono de Google)
- Texto: "Solo para miembros inscritos"

**Dashboard (Tab 1 — Inicio):**
- Header con logo + nombre del gym
- MembershipCard: estado (al día/mora/bloqueado), días restantes, barra de progreso
- Si está en grupo y el grupo está en mora: alerta roja "Tu grupo tiene un pago pendiente"
- Anuncios recientes (últimos 3)
- Botón "Ver todos los anuncios"

**Anuncios (Tab 2):**
- Lista scrollable de anuncios
- Cada card: título, preview del body, fecha, badge de sede
- Pull-to-refresh
- Paginación infinita

**Membresía (Tab 3):**
- Estado grande con ícono (✓ verde o ⚠ rojo)
- Datos: plan, precio, inicio, vencimiento, días restantes
- Si tiene grupo: card con info del grupo, representante, estado de pago
- Historial de pagos: lista con monto, fecha, método

**Perfil (Tab 4):**
- Foto de perfil (editable via Cloudinary)
- Datos: nombre, teléfono, email, código/carné, sede
- Sección de configuración (notificaciones on/off)
- Botón "Cerrar sesión"

---

## PARTE 3: FUNCIONALIDADES FUTURAS (NO IMPLEMENTAR AHORA)

Dejar estas rutas/pantallas planificadas pero SIN código:

### APIs futuras (agregar al CRM cuando se necesite)
```
GET  /api/mobile/routines/today
GET  /api/mobile/routines/:id
POST /api/mobile/workouts
GET  /api/mobile/workouts/history
GET  /api/mobile/exercises
GET  /api/mobile/exercises/:id
GET  /api/mobile/machines
POST /api/mobile/measurements
GET  /api/mobile/measurements/history
POST /api/mobile/progress-photos
```

### Pantallas futuras de la app
- Rutina del día (con timer de descanso)
- Catálogo de ejercicios (con video)
- Modelo 3D del cuerpo (SVG interactivo primero, Three.js después)
- Registro de entrenamiento
- Progreso (gráficas, medidas, fotos)
- Mensajes motivacionales

---

## ORDEN DE EJECUCIÓN

### Fase 1: APIs en el CRM (este repo)
```
Paso 1: Crear src/lib/mobile-auth.ts (JWT para miembros)
Paso 2: Crear src/app/api/mobile/auth/google/route.ts
Paso 3: Crear src/app/api/mobile/auth/verify/route.ts
Paso 4: Crear src/app/api/mobile/me/route.ts
Paso 5: Modificar schema (pushSubscriptions → expoPushToken)
Paso 6: Correr migración de DB
Paso 7: Crear src/app/api/mobile/push-token/route.ts
Paso 8: Crear src/lib/expo-push.ts
Paso 9: Modificar src/actions/announcements.ts (push real)
Paso 10: Crear src/app/api/mobile/announcements/route.ts
Paso 11: Agregar tabla memberNotifications al schema + migrar
Paso 12: Crear src/app/api/mobile/notifications/route.ts
Paso 13: Crear src/app/api/mobile/notifications/read/route.ts
Paso 14: Crear src/app/api/notifications/send/route.ts (para el CRM)
Paso 15: Probar todas las APIs con curl o Postman
```

### Fase 2: App Móvil (repo nuevo)
```
Paso 1: Crear proyecto Expo + instalar dependencias
Paso 2: Configurar estructura de carpetas (app/, lib/, components/, constants/)
Paso 3: Implementar constants/colors.ts y types
Paso 4: Implementar lib/api.ts (fetch wrapper con JWT)
Paso 5: Implementar lib/auth.ts (AuthContext + SecureStore)
Paso 6: Implementar pantalla de Login con Google
Paso 7: Implementar _layout.tsx con auth guard
Paso 8: Implementar Tab 1: Dashboard
Paso 9: Implementar Tab 3: Membresía
Paso 10: Implementar Tab 2: Anuncios
Paso 11: Implementar Tab 4: Perfil
Paso 12: Implementar lib/push.ts (registro de push token)
Paso 13: Implementar manejo de push notifications
Paso 14: Probar en dispositivo físico Android
Paso 15: Build APK con EAS Build
```

### Fase 3: Integración y testing
```
Paso 1: Admin crea anuncio con push → verificar que llega al celular
Paso 2: Secretaria marca pago → verificar que la app refleja "al día"
Paso 3: Probar con grupo en mora → app muestra "bloqueado"
Paso 4: Probar login con email no inscrito → error correcto
Paso 5: Probar push a sede específica → solo llega a esa sede
```

---

## VARIABLES DE ENTORNO NUEVAS (agregar a .env)

```env
# En el CRM (este repo)
MOBILE_JWT_SECRET=un-secret-largo-y-seguro-para-jwt-de-miembros
GOOGLE_CLIENT_ID_MOBILE=xxxxx.apps.googleusercontent.com  # Puede ser el mismo o uno nuevo

# En la app Expo
EXPO_PUBLIC_API_URL=https://tu-crm.vercel.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## NOTAS IMPORTANTES

1. **No tocar el auth del admin.** El sistema de NextAuth para system_users sigue igual. Las APIs mobile usan su propio JWT separado.
2. **No modificar Server Actions existentes** salvo el bloque de push en announcements.ts. Las APIs mobile son endpoints NUEVOS.
3. **Los miembros NO pueden hacer pagos desde la app.** Solo ven su estado. Los pagos se hacen presencialmente.
4. **Expo Push API es gratis.** No necesitas Firebase. Solo HTTP POST a exp.host.
5. **Probar siempre en dispositivo físico.** Los emuladores no soportan bien expo-gl ni push notifications.
6. **El modelo 3D es para DESPUÉS.** En esta fase solo hacemos: auth, perfil, membresía, anuncios, y push.
