# OLIMPO GYM — Implementation Plan Completo
## Sistema de Administración de Gimnasios + App Móvil (Futuro)

---

## CONTEXTO DEL PROYECTO

Olimpo Gym es un negocio familiar con dos sedes de gimnasio en San Marcos, Guatemala:
- **Sede 1:** Río Blanco, San Marcos
- **Sede 2:** Sibilia, San Marcos (nueva apertura)

Solo hay un instructor que rota 3 días en Río Blanco y 2 en Sibilia. El sistema necesita resolver la gestión de inscripciones, pagos, membresías, grupos, anuncios y notificaciones.

**Fase actual:** Panel de administración web (prioridad inmediata — ya hay gente inscribiéndose).
**Fase futura:** App móvil PWA para los usuarios del gimnasio (rutinas, progreso, cuerpo 3D, motivación).

---

## BRANDING

- **Nombre:** Olimpo Gym
- **Temática:** Griega/mitológica — león de Zeus, borde de greca griega
- **Logo:** Circular con león estilizado, mancuernas, y texto "OLIMPO GYM"
- **Paleta de colores:**
  - Fondo principal: `#0A0A0A` (negro)
  - Superficie/cards: `#141414`, `#1A1A1A`
  - Dorado principal: `#C5A55A`
  - Dorado claro: `#D4B96E`
  - Dorado oscuro: `#A68B3E`
  - Texto principal: `#F0F0E8`
  - Texto secundario: `#777777`
  - Verde (al día): `#4CAF50`
  - Rojo (mora): `#E53935`
  - Naranja (vencido): `#FF9800`
  - Azul (Río Blanco): `#42A5F5`
  - Púrpura (grupos): `#AB47BC`
- **Tipografía títulos:** Cinzel (Google Fonts) — serif clásica griega
- **Tema:** Dark mode forzado en toda la aplicación
- **El dorado se usa para:** sede Sibilia y como acento general. El azul para: sede Río Blanco.

---

## STACK TECNOLÓGICO

| Componente | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Base de datos | Neon (PostgreSQL serverless) |
| Auth | NextAuth.js v5 con Google OAuth + JWT |
| Hosting | Vercel |
| Imágenes | Cloudinary |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| WhatsApp (futuro) | API de WhatsApp Business vía Meta |
| ORM | Drizzle ORM o Prisma |

---

## SISTEMA DE AUTENTICACIÓN

### Inicio de Sesión
- Login exclusivamente con cuenta de Google (OAuth 2.0)
- JWT para manejo de sesiones
- Solo cuentas pre-autorizadas por el admin pueden acceder
- No hay registro público — el admin agrega usuarios del sistema manualmente

### Roles del Sistema

| Rol | Acceso | Puede modificar precios | Ve datos de |
|---|---|---|---|
| `admin` | Total | ✅ Sí | Ambas sedes |
| `secretaria_rb` | Limitado | ❌ No | Solo Río Blanco |
| `secretaria_sb` | Limitado | ❌ No | Solo Sibilia |

### Permisos Detallados

**Admin (ejemplo: el dueño o Rony):**
- Ve dashboard de ambas sedes
- Inscribe miembros en cualquier sede
- Puede modificar el precio al inscribir (campo editable)
- Modifica precios por defecto de cada sede
- Crea anuncios para una sede o ambas
- Envía notificaciones a cualquier sede
- Gestiona roles (agregar/quitar usuarios del sistema)
- Ve y gestiona pagos de ambas sedes
- Accede a reportes completos

**Secretaria de Río Blanco:**
- Ve dashboard SOLO con datos de Río Blanco
- Inscribe miembros SOLO en Río Blanco
- El precio aparece fijo (no editable) — usa el que definió el admin
- Crea anuncios que SOLO llegan a usuarios de Río Blanco
- Envía notificaciones SOLO a usuarios de Río Blanco
- Ve pagos SOLO de Río Blanco
- NO puede modificar precios
- NO puede gestionar roles
- NO ve datos de Sibilia en ninguna sección

**Secretaria de Sibilia:**
- Idéntico a la de Río Blanco pero solo para Sibilia

---

## SISTEMA DE CÓDIGOS / CARNÉS

Cada usuario recibe un código único que también es su número de carné físico.

### Formato: `OG[SEDE]-[GRUPO]-[CORRELATIVO]`

| Segmento | Significado | Ejemplo |
|---|---|---|
| `OG` | Olimpo Gym (fijo) | `OG` |
| `[SEDE]` | `RB` = Río Blanco, `SB` = Sibilia | `RB` |
| `[GRUPO]` | 3 dígitos, `000` = sin grupo | `001` |
| `[CORRELATIVO]` | 3 dígitos, correlativo POR SEDE | `005` |

### Reglas de generación:
- El correlativo es único y secuencial por sede (no global)
- `OGRB-000-001` = primer inscrito en Río Blanco, sin grupo
- `OGRB-001-002` = segundo inscrito en Río Blanco, pertenece al grupo 1
- `OGRB-001-003` = tercer inscrito, mismo grupo 1
- `OGRB-000-004` = cuarto inscrito, sin grupo
- `OGSB-000-001` = primer inscrito en Sibilia, sin grupo
- `OGSB-001-002` = segundo inscrito en Sibilia, grupo 1 de Sibilia
- Los primeros 3 dígitos (grupo) indican a qué grupo pertenece (000 = individual)
- Los últimos 3 dígitos (correlativo) llevan el conteo total de inscritos por sede
- El número de grupo se auto-incrementa por sede al crear un nuevo grupo
- El código se genera automáticamente al inscribir — no se ingresa manualmente

---

## SISTEMA DE GRUPOS

### Concepto de Negocio
- Se permite inscribir grupos de 3 o más personas
- A los grupos se les da un descuento (precio menor por persona)
- Cada grupo tiene UN representante (responsable)
- El representante recoge el dinero de todos los del grupo y hace UN solo pago al gimnasio
- El gimnasio solo se arregla con el representante, no con cada miembro individual

### Regla de Mora Grupal (MUY IMPORTANTE)
- Si el representante NO ha pagado el monto completo del grupo, TODO el grupo queda en mora/bloqueado
- No se sabe internamente quién del grupo no pagó — eso lo resuelven entre ellos
- En el sistema, la mora es a nivel de GRUPO, no a nivel individual dentro del grupo
- Si un grupo está en mora, NINGÚN miembro de ese grupo puede ingresar al gimnasio
- Al marcar "Grupo Pagó", todos los miembros se activan automáticamente

### Funcionalidades de Grupos
- Crear nuevo grupo (se asigna número automático por sede)
- Agregar miembros a un grupo existente
- Quitar miembros de un grupo
- Cambiar el representante de un grupo
- Editar el precio grupal (solo admin)
- Notificar al representante cuando hay mora
- Buscar/filtrar por grupo
- Ver todos los miembros de un grupo desde la vista de grupo

### Datos del Grupo
- ID de grupo (auto-incremental por sede)
- Sede (Río Blanco o Sibilia)
- Representante (referencia al miembro que es rep)
- Precio por persona
- Estado de pago (pagó el grupo completo: sí/no)
- Fecha del último pago
- Número de miembros

---

## SISTEMA DE PRECIOS

### Precios por Sede
Cada sede tiene sus propios precios independientes:

- Mensualidad individual
- Trimestral
- Anual
- Precio grupal por defecto (por persona)

### Reglas
- El admin configura los precios por defecto de cada sede en la sección "Precios"
- Al inscribir, el precio se llena automáticamente según la sede seleccionada
- El admin PUEDE modificar el precio al inscribir (campo editable)
- Las secretarias NO pueden modificar el precio — les aparece fijo/no editable
- Cambiar precios en configuración NO afecta a miembros ya inscritos
- Cada grupo puede tener un precio diferente (a discreción del dueño)
- El precio grupal por defecto se usa solo como sugerencia al crear un nuevo grupo

---

## DATOS DE MIEMBROS (INSCRIPCIÓN)

### Campos del formulario de inscripción

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| Nombre completo | text | ✅ | |
| Teléfono | tel | ✅ | Formato Guatemala: 5555-1234 |
| Email | email | ✅ | Para notificaciones y cumpleaños |
| Fecha de nacimiento | date | ✅ | Para felicitaciones automáticas |
| Edad | number | Auto | Se calcula de la fecha de nacimiento |
| Sexo | select | ✅ | Masculino / Femenino |
| Sede | select | ✅ | Río Blanco / Sibilia (fijo para secretarias) |
| Tipo inscripción | select | ✅ | Individual / Grupo |
| Plan | select | ✅ | Mensual / Trimestral / Anual |
| Precio | number | Auto | Se llena auto, editable solo por admin |
| Fecha de inicio | date | ✅ | Default: fecha actual |
| Método de pago | select | ✅ | Efectivo / Transferencia |
| Código / Carné | auto | Auto | Se genera automáticamente |

### Para inscripción de GRUPO, campos adicionales:
- Precio grupal por persona (auto desde config, editable solo admin)
- Miembro 1 = Representante (marcado con ★)
- Miembro 2, 3, 4... (mínimo 3)
- Botón "+ Agregar otro miembro al grupo"
- Cada miembro del grupo tiene: nombre, teléfono, email, fecha nacimiento, sexo
- A cada uno se le genera su código individual dentro del mismo grupo

---

## BASE DE DATOS — ESQUEMA

### Tabla: `system_users` (usuarios del panel admin)
```
id              UUID PK
email           VARCHAR UNIQUE NOT NULL (cuenta Google)
name            VARCHAR NOT NULL
role            ENUM('admin', 'secretaria_rb', 'secretaria_sb')
gym_id          FK → gyms (NULL para admin)
avatar_url      VARCHAR
active          BOOLEAN DEFAULT true
created_at      TIMESTAMP
```

### Tabla: `gyms` (sedes)
```
id              UUID PK
name            VARCHAR NOT NULL (Río Blanco, Sibilia)
code_prefix     VARCHAR NOT NULL (OGRB, OGSB)
address         VARCHAR
phone           VARCHAR
schedule        TEXT
photo_url       VARCHAR
pricing_monthly       DECIMAL NOT NULL
pricing_quarterly     DECIMAL
pricing_annual        DECIMAL
pricing_group_default DECIMAL NOT NULL
next_member_seq       INTEGER DEFAULT 1 (correlativo de miembros)
next_group_seq        INTEGER DEFAULT 1 (correlativo de grupos)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabla: `groups` (grupos de inscripción)
```
id              UUID PK
gym_id          FK → gyms NOT NULL
group_number    INTEGER NOT NULL (auto-incremental por sede)
representative_id FK → members (el responsable del grupo)
price_per_person DECIMAL NOT NULL
paid_full       BOOLEAN DEFAULT false
last_payment_date DATE
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
UNIQUE(gym_id, group_number)
```

### Tabla: `members` (miembros del gimnasio)
```
id              UUID PK
code            VARCHAR UNIQUE NOT NULL (OGRB-001-005)
gym_id          FK → gyms NOT NULL
group_id        FK → groups (NULL si es individual)
is_representative BOOLEAN DEFAULT false
name            VARCHAR NOT NULL
phone           VARCHAR NOT NULL
email           VARCHAR NOT NULL
birth_date      DATE NOT NULL
sex             ENUM('M', 'F')
plan            ENUM('mensual', 'trimestral', 'anual')
price           DECIMAL NOT NULL
membership_start DATE NOT NULL
membership_end  DATE NOT NULL
status          ENUM('activo', 'mora', 'vencido', 'bloqueado') DEFAULT 'activo'
paid            BOOLEAN DEFAULT false
payment_method  ENUM('efectivo', 'transferencia')
last_visit      DATE
photo_url       VARCHAR
notes           TEXT
registered_by   FK → system_users
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabla: `payments` (historial de pagos)
```
id              UUID PK
gym_id          FK → gyms NOT NULL
member_id       FK → members (NULL si es pago grupal)
group_id        FK → groups (NULL si es pago individual)
amount          DECIMAL NOT NULL
payment_date    DATE NOT NULL
payment_method  ENUM('efectivo', 'transferencia')
period_start    DATE
period_end      DATE
reference       VARCHAR
registered_by   FK → system_users
notes           TEXT
created_at      TIMESTAMP
```

### Tabla: `announcements` (anuncios)
```
id              UUID PK
title           VARCHAR NOT NULL
body            TEXT NOT NULL
gym_id          FK → gyms (NULL = ambas sedes)
send_push       BOOLEAN DEFAULT false
published       BOOLEAN DEFAULT true
created_by      FK → system_users NOT NULL
created_at      TIMESTAMP
```

### Tabla: `notifications` (registro de notificaciones enviadas)
```
id              UUID PK
type            ENUM('payment_reminder', 'motivation', 'birthday', 'group_reminder', 'custom', 'announcement')
title           VARCHAR
message         TEXT NOT NULL
gym_id          FK → gyms (NULL = ambas)
target_member_id FK → members (NULL si es masivo)
target_group_id  FK → groups (NULL si no es a grupo)
channel         ENUM('push', 'whatsapp', 'email')
sent_at         TIMESTAMP
sent_by         FK → system_users
delivered_count INTEGER DEFAULT 0
```

### Tabla: `push_subscriptions` (para push notifications del navegador/PWA futuro)
```
id              UUID PK
member_id       FK → members
endpoint        TEXT NOT NULL
keys_json       TEXT NOT NULL
active          BOOLEAN DEFAULT true
created_at      TIMESTAMP
```

---

## FUNCIONALIDADES DEL PANEL ADMIN — DETALLE

### 1. DASHBOARD
- Tarjetas resumen: total miembros, en mora (individuales + grupos), ingresos del mes
- Si hay cumpleaños este mes, mostrar tarjeta con contador
- **Sección "Grupos en Mora":**
  - Muestra el grupo completo como unidad (NO miembros individuales)
  - Dice: "Grupo 1 — RB: Todo el grupo bloqueado"
  - Muestra nombre y teléfono del representante
  - Botón "✓ Grupo Pagó" → activa todo el grupo
  - Botón "📱 WhatsApp" → abre WhatsApp con el representante
- **Sección "Individuales en Mora":** lista separada de los que no están en grupo
- **Sección "Cumpleaños este mes":** lista con botón de felicitar
- Filtrado por sede según el rol del usuario logueado

### 2. MIEMBROS
- Tabla con columnas: Código, Nombre, Sede, Grupo, Estado
- Filtros: búsqueda por nombre/teléfono/código, estado (al día/mora/bloqueado), sede, individual/grupo
- Click en miembro → vista detalle con todos los datos
- En detalle: se muestran todos los miembros del grupo si pertenece a uno
- Para secretarias: solo se muestran miembros de su sede

### 3. GRUPOS
- Lista de todos los grupos con: número, sede, representante, precio, estado de pago
- Dentro de cada grupo: lista de miembros con sus códigos
- Botones: Agregar miembro, Quitar miembro, Editar precio (solo admin), Notificar representante
- Si un grupo está en mora: badge "⚠ Grupo en mora" y todos los miembros aparecen como "Bloqueado"
- Nota visible: "El pago del grupo se maneja únicamente con el representante"

### 4. INSCRIBIR
- Toggle entre Individual y Grupo
- Selector de sede (admin elige, secretaria fijo)
- Código se genera y muestra automáticamente (no editable)
- Precio: auto-llenado desde configuración. Editable para admin, fijo para secretarias.
- Para grupos: mínimo 3 miembros, primer miembro = representante
- Botón "+ Agregar otro miembro" para grupos
- Al inscribir: se genera el código, se crea el registro, se calcula fecha de vencimiento según plan

### 5. PAGOS
- Separados en: Grupos Pendientes (cobro al representante, monto = precio × miembros) e Individuales Pendientes
- Botón "✓ Grupo Pagó" → actualiza el grupo completo
- Botón "✓ Pagado" en individuales → actualiza solo ese miembro
- Historial de pagos con: monto, fecha, método, quién lo registró
- Nota: "Al marcar pagado, el usuario lo verá reflejado en su app al instante" (para cuando exista la app)

### 6. PRECIOS (Solo admin)
- Config de precios por sede: mensual, trimestral, anual, grupo por defecto
- Cada sede tiene sus valores independientes
- Cambiar aquí solo afecta nuevas inscripciones
- Nota explicativa visible en la UI

### 7. ROLES (Solo admin)
- Lista de usuarios del sistema con email, nombre, rol, sede
- Agregar nuevos usuarios del sistema
- Asignar/cambiar roles
- Tabla de permisos por rol visible

### 8. ANUNCIOS
- Crear anuncio: título, mensaje, sede destino
- Admin puede elegir: Ambos, Río Blanco, Sibilia
- Secretaria: el destino es automáticamente su sede (no elige)
- Opción de enviar Push Notification junto con el anuncio
- Lista de anuncios publicados con: título, fecha, sede, quién lo publicó
- Nota para secretarias: "Los anuncios que publiques solo llegarán a usuarios de [su sede]"

### 9. NOTIFICACIONES
- Plantillas predefinidas:
  - Recordatorio de pago (a morosos)
  - Cobro a representantes de grupo
  - Motivación diaria
  - Felicitación de cumpleaños
  - WhatsApp personalizado
  - Mensaje personalizado a usuario o grupo
- Historial de envíos: mensaje, destinatario, fecha, canal, cantidad entregada
- Secretarias solo pueden notificar a usuarios de su sede

### 10. CUMPLEAÑOS
- Filtro por mes (12 botones)
- Lista de miembros que cumplen ese mes, ordenados por día
- Muestra: nombre, fecha exacta, edad que cumple, sede
- Botones: "🎉 Felicitar" (push) y "📱 WhatsApp"
- Filtrado por sede según rol

---

## LÓGICA DE NEGOCIO CRÍTICA

### Vencimiento de Membresía
- La fecha de vencimiento se calcula automáticamente: inicio + 30 días (mensual), + 90 días (trimestral), + 365 días (anual)
- 5 días antes del vencimiento: enviar notificación automática de renovación
- Al vencer: estado cambia a "vencido"
- Si pasa más de X días vencido sin pagar: estado "mora"

### Mora Grupal vs Individual
- **Individual:** cada persona maneja su propio pago y estado
- **Grupo:** el estado de pago es DEL GRUPO, no de miembros individuales
  - Si `group.paid_full = false` → todos los miembros del grupo tienen status = "bloqueado"
  - Si `group.paid_full = true` → todos tienen status = "activo"
  - Al marcar "Grupo Pagó": se actualiza `group.paid_full = true` y TODOS los miembros pasan a "activo"
  - Al renovar: se resetea `group.paid_full = false` al inicio del nuevo período

### WhatsApp
- Botón que abre `https://wa.me/502XXXXXXXX?text=mensaje` con el número del representante o miembro
- API de WhatsApp Business (futuro) para mensajes automatizados
- Los primeros 1,000 mensajes/mes por la API de Meta son gratis

---

## ESTRUCTURA DE RUTAS (NEXT.JS APP ROUTER)

```
/                           → Redirect a /login o /dashboard
/login                      → Login con Google OAuth
/dashboard                  → Dashboard principal (filtrado por rol)
/members                    → Lista de miembros
/members/[id]               → Detalle de miembro
/groups                     → Lista de grupos
/groups/[id]                → Detalle de grupo
/register                   → Formulario de inscripción
/register/group             → Inscripción grupal
/payments                   → Control de pagos
/pricing                    → Configuración de precios (admin only)
/roles                      → Gestión de roles (admin only)
/announcements              → Anuncios
/announcements/new          → Crear anuncio
/notifications              → Centro de notificaciones
/birthdays                  → Cumpleaños del mes
/api/auth/[...nextauth]     → NextAuth endpoints
/api/members                → CRUD miembros
/api/groups                 → CRUD grupos
/api/payments               → CRUD pagos
/api/announcements          → CRUD anuncios
/api/notifications          → Envío de notificaciones
/api/pricing                → Config precios
/api/roles                  → Gestión roles
```

---

## MIDDLEWARE DE AUTORIZACIÓN

```
Middleware en cada ruta API y página:

1. Verificar JWT válido
2. Obtener rol del usuario
3. Si es secretaria_rb: filtrar todo por gym_id = Río Blanco
4. Si es secretaria_sb: filtrar todo por gym_id = Sibilia
5. Si es admin: sin filtro
6. Bloquear acceso a /pricing y /roles si no es admin
7. En inscripción: si no es admin, el campo precio es read-only
```

---

## PANTALLAS DE LA APP MÓVIL (FASE FUTURA — NO CONSTRUIR AÚN)

Estas funcionalidades deben aparecer en el sidebar del admin como opciones deshabilitadas (grayed out, con etiqueta "Próximamente"):

- **Rutinas:** El instructor crea rutinas y las asigna a usuarios. El usuario ve su rutina del día con videos y puede marcar ejercicios completados.
- **Ejercicios:** Catálogo de ejercicios con video, instrucciones, grupo muscular, errores comunes.
- **Cuerpo 3D:** Modelo 3D interactivo del cuerpo humano (Three.js + GLTF). Al tocar un músculo, muestra ejercicios relacionados. Al seleccionar una máquina del gimnasio, se iluminan los músculos que trabaja.
- **Motivación:** Mensajes motivacionales diarios, racha de entrenamiento, ranking semanal.
- **Progreso:** Tracking de peso, medidas corporales, fotos de progreso, gráficas.

Estas opciones deben estar visibles pero NO funcionales en el admin. Se activarán cuando se construya la PWA.

---

## CONSIDERACIONES TÉCNICAS

### SEO/Performance
- Server-side rendering donde sea posible
- API routes protegidas con JWT middleware
- Optimistic UI updates (al marcar pagado, actualizar UI inmediatamente)

### Base de datos
- Usar Drizzle ORM o Prisma con Neon PostgreSQL
- Índices en: code (members), gym_id (todos), group_id (members), status (members)
- Soft delete en miembros (no borrar, marcar como inactivo)

### Deploy
- Vercel con variables de entorno para:
  - `DATABASE_URL` (Neon)
  - `NEXTAUTH_SECRET` (JWT secret)
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `CLOUDINARY_URL`
  - `FIREBASE_CONFIG` (para push)

---

## PRIORIDAD DE IMPLEMENTACIÓN

1. **Setup proyecto** — Next.js 15, Neon DB, NextAuth con Google, esquema de DB
2. **Auth + Roles** — Login, middleware de roles, protección de rutas
3. **CRUD Miembros** — Inscripción individual, códigos auto-generados, listado, detalle
4. **Sistema de Grupos** — Inscripción grupal, representante, mora grupal
5. **Pagos** — Control de pagos individual y grupal, historial
6. **Dashboard** — Vista resumen con métricas, alertas de mora, cumpleaños
7. **Precios** — Configuración por sede (admin only)
8. **Roles** — Gestión de usuarios del sistema
9. **Anuncios** — CRUD con filtro por sede según rol
10. **Notificaciones** — Push (Firebase), WhatsApp link, cumpleaños
11. **Polish** — Responsive, loading states, error handling, validaciones

---

*Documento generado para Rony Alberto Méndez Fuentes — Olimpo Gym — Junio 2026*
*Todas las funcionalidades descritas aquí fueron validadas en mockups interactivos antes de este documento.*

---

## Fase 6: Dashboard Principal y Métricas

### Objetivo
Reemplazar los datos estáticos del Dashboard por métricas reales en vivo, filtradas por los permisos del rol del usuario (Admin ve todo o puede filtrar, Secretarias ven solo su sede), e incluir la lógica de Mora con 7 días de gracia a nivel de base de datos.

### User Review Required
> [!IMPORTANT]
> - **Lógica de Mora:** Implementaré que el sistema considere "Moroso" a alguien en el dashboard solo si han pasado más de 7 días de su `membershipEnd`.
> - **Ingresos del Mes:** Sumaré todos los cobros (mensualidades + carnés + inscripciones) que se hayan pagado *en el mes calendario actual*. ¿Es correcto?
> - **Grupos en Mora:** El dashboard mostrará a los grupos morosos indicando el nombre de su representante para facilitar enviarles un WhatsApp.

### Cambios Propuestos

#### [NEW] `src/actions/dashboard.ts`
Crearemos acciones de servidor específicas para el dashboard:
- `getDashboardMetrics(gymId?)`: Calcula total de activos, en mora, e ingresos del mes (usando la tabla `payments`).
- `getGroupsInMora(gymId?)`: Busca representantes de grupos cuyo `membershipEnd` + 7 días ya venció.
- `getBirthdaysThisMonth(gymId?)`: Busca miembros cuyo mes de nacimiento coincida con el actual.

#### [MODIFY] `src/app/(dashboard)/page.tsx`
- Refactorizar para obtener los datos reales mediante `getDashboardMetrics`, pasándole el `gymId` si el usuario es Secretaria.
- Reemplazar los componentes hardcodeados por iteraciones sobre los datos reales de la DB.
- El botón de "WhatsApp" abrirá `wa.me/502<numero>`.

### Verificación
- Iniciar sesión como Admin y verificar ingresos totales.
- Iniciar sesión como Secretaria y verificar que los números cambien (solo su sede).
- Comprobar que los morosos no aparezcan hasta pasado el día 7 de gracia.

---

## Fase 7: Configuración de Precios por Sede

### Objetivo
Permitir que únicamente el Administrador pueda editar los costos base de cada sede (Mensualidad, Inscripción, Carné, etc.) para que los formularios de registro calculen el total automáticamente según la sede seleccionada.

### User Review Required
> [!IMPORTANT]
> - **Nuevos campos en DB:** Modificaré la tabla `gyms` para agregar `enrollmentFee` (costo de inscripción) y `cardFee` (costo del carné). 
> - **Valores por defecto:** Por lo que me comentaste antes, Sibilia tendrá valores mayores a 0 en inscripción y carné, mientras que Río Blanco los tendrá en 0 temporalmente.
> - **Precios de Grupos:** ¿El precio de los grupos es el mismo por integrante que el precio normal, o hay un "pricingGroupDefault" especial que también quieres editar aquí?

### Cambios Propuestos

#### [MODIFY] `src/db/schema.ts`
- Añadir `enrollmentFee: decimal` y `cardFee: decimal` a la tabla `gyms`.
- Ejecutar `drizzle-kit push` para actualizar la base de datos.

#### [NEW] `src/actions/pricing.ts`
- `updateGymPricing(gymId, data)`: Acción protegida (solo admin) para guardar los nuevos precios.

#### [NEW] `src/app/(dashboard)/pricing/page.tsx`
- Pantalla accesible solo para Administradores (`if (role !== "admin") redirect("/")`).
- Interfaz con un selector de sede y un formulario con tarjetas para editar:
  - Mensualidad Base
  - Costo de Inscripción
  - Costo de Carné
  - (Opcional) Precio Trimestral/Anual

### Verificación
- Modificar los precios de Sibilia.
- Ir a "Nuevo Miembro", seleccionar Sibilia y verificar que el total auto-calculado suma Mensualidad + Inscripción + Carné.
- Verificar que las secretarias no tengan acceso a esta ruta `/pricing`.

---

## Fase 8: Roles y Gestión de Usuarios del Sistema

### Objetivo
Construir el panel donde tú (como Administrador) puedas dar acceso al sistema a tus secretarias, asignarles a qué sede pertenecen y revocar su acceso cuando sea necesario.

### User Review Required
> [!IMPORTANT]
> - **Autenticación:** Actualmente, el sistema permite iniciar sesión usando Google. Para que una secretaria pueda entrar, su correo de Gmail debe estar registrado aquí previamente. Si intenta entrar y no está registrada o está inactiva, el sistema no la dejará pasar.
> - **Acceso a sedes:** Cuando registres a una secretaria, tendrás que elegir su `Rol` (Secretaria) y su `Sede` (Sibilia o Río Blanco). Esto es lo que automáticamente le bloqueará ver los datos de la otra sede.
> - ¿Estás de acuerdo con manejar el acceso por cuentas de Google, o prefieres un usuario y contraseña clásico para ellas? (Google es más seguro y fácil, ya lo tenemos casi listo).

### Cambios Propuestos

#### [NEW] `src/actions/users.ts`
- `getSystemUsers()`: Lista los usuarios.
- `createSystemUser(data)`: Crea una nueva secretaria, asocia su correo, nombre, rol y sede.
- `toggleUserStatus(userId, active)`: Activa/desactiva el acceso de un usuario.
- `deleteSystemUser(userId)`: Elimina el registro por completo.

#### [NEW] `src/app/(dashboard)/roles/page.tsx`
- Pantalla exclusiva para el Administrador.
- Mostrará una tabla interactiva con todos los usuarios que tienen acceso al panel de Olimpo Gym.
- Botón "Nuevo Usuario" para abrir el formulario de invitación.

#### [NEW] `src/components/roles/UserFormModal.tsx`
- Formulario modal para ingresar el correo, nombre, rol ("admin" o "secretaria") y seleccionar la sede correspondiente.

### Verificación
- Iniciar sesión como Admin, ir a "Roles", crear un usuario de prueba como "Secretaria de Sibilia".
- Simular inicio de sesión con ese correo (o confiar en la lógica ya implementada en NextAuth).

---

## Fase 9: Anuncios (CRUD y Filtros por Sede)

### Objetivo
Permitir a los administradores y secretarias crear avisos o anuncios que se mostrarán en la futura aplicación de los miembros o en el panel.

### User Review Required
> [!IMPORTANT]
> - **Visibilidad:** Si tú (como Admin) creas un anuncio sin especificar sede, lo verán *todos* los miembros de *todas* las sedes. Si eliges una sede en específico, solo lo verán los de ahí.
> - **Secretarias:** Ellas solo podrán crear anuncios para su propia sede y no tendrán la opción de enviarlo a "Todas las sedes".
> - **Notificaciones Push:** Agregaremos un switch de "Enviar como notificación Push" (para dejar la base lista para la app móvil).
> - ¿Hay algo más que te gustaría incluir en los anuncios? (Ej: Subir una imagen o afiche, o con solo texto por ahora está bien).

### Cambios Propuestos

#### [NEW] `src/actions/announcements.ts`
- `getAnnouncements()`: Obtiene la lista filtrada por la sede del usuario (el admin ve todos).
- `createAnnouncement(data)`: Crea un anuncio.
- `toggleAnnouncementStatus(id, published)`: Pausa o activa un anuncio.
- `deleteAnnouncement(id)`: Elimina el anuncio.

#### [NEW] `src/app/(dashboard)/announcements/page.tsx`
- Lista de anuncios actuales en forma de tarjetas o tabla.
- Botón para "Nuevo Anuncio".

#### [NEW] `src/components/announcements/AnnouncementForm.tsx`
- Modal o página para crear el anuncio. El Admin verá un selector de sedes (incluyendo "Todas"), mientras que las secretarias lo tendrán fijo en su sede.

### Verificación
- Como admin, crear un anuncio global y otro específico para Río Blanco.
- Comprobar que en la tabla aparezcan ambos correctamente.

---

## Fase 10: Notificaciones (Preparación para App Móvil)

### Objetivo
Construir la infraestructura en el Panel de Administración (Backend) para poder enviar notificaciones Push a los teléfonos de los clientes, y manejar la lógica de suscripción de dispositivos para la futura App Móvil.

### User Review Required
> [!IMPORTANT]
> - **App Móvil Pendiente:** Como aún no hemos desarrollado la aplicación que los clientes instalarán en sus teléfonos, no podemos *enviar* notificaciones reales ahora mismo (porque no hay teléfonos registrados).
> - **¿Qué haremos en esta fase?:**
>   1. Crearemos las rutas de la API (Backend) para que la futura app pueda registrar el teléfono del cliente (`push_subscriptions`).
>   2. Crearemos la lógica que, al guardar un Anuncio con el switch de "Push" encendido, intente enviar el mensaje usando *Firebase Cloud Messaging (FCM)*.
> - **Requisito Firebase:** Para que el envío funcione en un futuro, necesitaremos que crees un proyecto en Firebase y me pases las credenciales (si no quieres hacerlo ahora, puedo dejar la estructura lista y comentada para no generar errores). ¿Prefieres que lo dejemos listo/simulado por ahora, o ya tienes una cuenta de Firebase lista para enlazar?

### Cambios Propuestos

#### [NEW] `src/app/api/notifications/subscribe/route.ts`
- Endpoint para que la futura App Móvil envíe el token de FCM del usuario junto con su `memberId` y se guarde en la tabla `pushSubscriptions`.

#### [NEW] `src/lib/firebase.ts` (Opcional/Simulado)
- Configuración del SDK de Firebase Admin para enviar los mensajes.

#### [MODIFY] `src/actions/announcements.ts`
- Si `sendPush` es true, recuperar todos los tokens de los miembros de esa sede y disparar la función `sendNotification` a Firebase.

### Verificación
- Probar el Endpoint de suscripción usando herramientas de prueba (Postman/cURL) simulando ser un celular.
- Crear un anuncio con el switch activo y verificar que la consola del servidor intente enviar el mensaje.
