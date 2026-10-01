# 🌱 Huella Diaria — Android Commuter Edition

> **Aplicación móvil Android diseñada para estudiantes y trabajadores urbanos: registro diario de desplazamientos, control financiero de pasajes, combustible y peajes, cálculo de huella de carbono (CO₂) y cuidado de la salud mediante hidratación durante trayectos.**

---

## 📱 Descripción General

**Huella Diaria** es una solución integral que acompaña a quienes se desplazan a diario en las ciudades. Permite a estudiantes universitarios y trabajadores registrar sus trayectos cotidianos, supervisar con precisión su presupuesto de transporte (evitando sorpresas a fin de mes) y comprender el impacto ambiental positivo de optar por opciones de movilidad sostenible (metro, autobús, bicicleta o caminata).

La interfaz replica fielmente las directrices de diseño **Material 3 / Jetpack Compose** de Android, incluyendo marco de smartphone con barra de estado dinámica, píldora de navegación inferior (*Scaffold BottomBar*), alertas hápticas y soporte de modo claro/oscuro.

---

## ✨ Características Principales

### 1. 🔐 Autenticación y Selección de Rol (`feat(auth)`)
- **Pantalla de Bienvenida y Login:** Sin auto-inicio invasivo. El usuario elige explícitamente su perfil antes de acceder.
- **Perfiles Predefinidos:**
  - 🎓 **Estudiante (Camila Ríos):** Tarifas preferenciales de transporte público, trayectos a facultades y presupuestos ajustados.
  - 💼 **Trabajador (Rodrigo Morales):** Registro de combustible, peajes autopistas y traslados a centros corporativos.
- **Perfil Personalizado:** Posibilidad de registrarse con nombre propio, institución/empresa, moneda local y límites de gasto a medida.

### 2. 🧭 Navegación Material 3 Scaffold (`feat(ui)`)
- **Pestañas Fijas sin Reinicios (`Keep-Alive`):** Las 3 secciones principales (**Inicio**, **Gastos**, **Mi Impacto**) se mantienen vivas en memoria. Cambiar de pestaña nunca borra tus formularios, filtros ni posición de scroll.
- **BottomNavigationBar Fija:** Píldora de selección con animación suave, iconos vectoriales y *badges* dinámicos en tiempo real (conteo de trayectos del día y monto acumulado).
- **Marco Android Realista:** Barra de estado con reloj en vivo, conectividad 5G, nivel de batería, cámara punch-hole y barra de gestos inferior.

### 3. ⏱️ Registro Rápido de Trayectos (`feat(tracker)`)
- **Modo Express (1 minuto):** Formulario integrado en la pantalla principal para ingresar:
  - Punto de Origen
  - Punto de Destino
  - Medio de Transporte (🚇 Metro, 🚌 Bus, 🚗 Auto, 🏍️ Moto, 🚲 Bici, 🚶 A pie)
  - Duración en minutos
- **Cálculo Automático:** Estimación instantánea de distancia (km), tiempo invertido y kilogramos de CO₂ emitidos vs. ahorrados contra el uso de un automóvil particular.
- **Historial Diario y Filtros:** Navegación por fechas (Hoy, Ayer, Días previos), duplicación rápida de viajes recurrentes y eliminación con confirmación.

### 4. 💳 Control Financiero y Presupuestos (`feat(expenses)`)
- **Categorización Específica:**
  - 🚌 **Pasajes:** Metro, autobús, tren suburbano.
  - ⛽ **Combustible:** Registro de carga de gasolina o diésel con cálculo de litros y precio por litro.
  - 🛣️ **Peajes:** Tags de autopista, cabinas de peaje urbano e interurbano.
  - 💳 **Recargas:** Tarjetas de transporte público (BIP, SUBE, Metrocard, etc.).
- **Desglose Mensual en 3 Columnas:** Visualización comparativa de Pasajes vs. Gasolina vs. Peajes.
- **Límites Inteligentes y Alertas (`MetaPresupuesto`):**
  - Barra de progreso diaria y mensual.
  - ⚠️ **Alerta Preventiva al 80%:** Notificación de aviso al acercarse al límite presupuestario.
  - 🚨 **Alerta Crítica al 100%:** Alerta visual destacada cuando se supera el presupuesto asignado.

### 5. 🌍 Analítica de Huella de Carbono y Tiempo (`feat(analytics)`)
- **Factores de Emisión Científicos:**
  - Auto particular: ~0.170 kg CO₂/km
  - Motocicleta: ~0.095 kg CO₂/km
  - Autobús urbano: ~0.045 kg CO₂/km por pasajero
  - Metro / Tren eléctrico: ~0.025 kg CO₂/km por pasajero
  - Bicicleta y Caminata: 0.000 kg CO₂ (cero emisiones directas)
- **Equivalencias Ecológicas:** Árboles equivalentes plantados, emisiones evitadas y calorías quemadas en movilidad activa.
- **Simulador Interactivo:** Proyección de ahorro mensual al sustituir días de auto por transporte público o bicicleta.

### 6. 💧 Salud e Hidratación en Trayectos (`feat(health)`)
- **Widget de Hidratación:** Registro de ingesta de agua durante o antes de los viajes para combatir la fatiga y golpes de calor en horas punta.
- Opciones de un toque (+250 ml vaso, +500 ml termo o botella).
- Meta diaria ajustable y porcentaje de cumplimiento.

### 7. 🗄️ Arquitectura Room Database Android (`feat(database)`)
- Inspector interactivo integrado en la barra superior que expone:
  - `@Entity(tableName = "trayecto")`
  - `@Entity(tableName = "gasto")`
  - `@Entity(tableName = "meta_presupuesto")`
- Consultas DAO SQL ejecutables en vivo (`@Query("SELECT AVG(durationMinutes) FROM trayecto")`, `@Query("SELECT SUM(amount) FROM gasto...")`).
- Fragmentos de código Kotlin listos para exportar e implementar en **Android Studio**.

### 8. 🎨 Modo Oscuro y Accesibilidad Háptica (`style(theme)`)
- **Paleta de Colores:** Verde Esmeralda (`#2ECC71`), Azul Marino Oscuro (`#2C3E50` / `#1A252F`) y acentos contrastantes.
- **Selector de Tema:** Alternancia instantánea entre Modo Oscuro y Modo Claro.
- **Sonidos y Vibración Háptica:** Retroalimentación auditiva sintetizada mediante Web Audio API al pulsar botones, registrar viajes y alternar estados.

---

## 📁 Estructura del Código

```text
├── src/
│   ├── components/
│   │   ├── AndroidFrame.tsx          # Marco de dispositivo Android con Status Bar y BottomBar
│   │   ├── BottomNavigation.tsx      # Barra de navegación Jetpack Compose con badges
│   │   ├── HydrationWidget.tsx       # Módulo de hidratación y consumo de agua en viajes
│   │   ├── Auth/
│   │   │   └── LoginScreen.tsx       # Selección de perfil (Estudiante / Trabajador / Custom)
│   │   ├── Modals/
│   │   │   ├── NewTripModal.tsx      # Formulario modal detallado para nuevos trayectos
│   │   │   ├── ProfileModal.tsx      # Ajustes de perfil, presupuesto y reinicio de datos
│   │   │   └── RoomInspectorModal.tsx# Inspector de tablas Room y código Kotlin Compose
│   │   └── screens/
│   │       ├── HomeScreen.tsx        # Pantalla 'Inicio': Resumen diario, tracker express y timeline
│   │       ├── ExpensesScreen.tsx    # Pantalla 'Gastos': Pasajes, combustible, peajes y alertas
│   │       └── ImpactScreen.tsx      # Pantalla 'Mi Impacto': Gráficos CO2, tiempo y simulador
│   ├── data/
│   │   └── seedData.ts               # Semillas iniciales realistas para estudiantes y trabajadores
│   ├── db/
│   │   └── roomDatabase.ts           # Modelos de DAOs, Entidades Room y snippets Kotlin
│   ├── utils/
│   │   ├── haptics.ts                # Motor de sonido háptico con Web Audio API
│   │   └── transportUtils.ts         # Factores de emisión y cálculo matemático de CO2
│   ├── types.ts                      # Tipos de TypeScript (Trip, Expense, UserProfile, etc.)
│   ├── App.tsx                       # Controlador principal, persistencia local y estado
│   └── main.tsx                      # Punto de entrada de React 19
├── package.json
└── README.md
```

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** v18 o superior
- **npm** o **pnpm**

### Pasos

1. **Clonar o descargar el repositorio:**
   ```bash
   cd huella-diaria
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Validar código TypeScript:**
   ```bash
   npm run lint
   ```

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🛠️ Tecnologías Empleadas

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador y Servidor:** [Vite 6](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Efectos y Háptica:** Web Audio API & Web Vibration API
- **Arquitectura de Datos Móvil:** Patrones de [Android Jetpack Room](https://developer.android.com/training/data-storage/room) y [Material 3 Compose](https://developer.android.com/jetpack/compose)

---

## 📄 Licencia

Este proyecto se distribuye con fines educativos y de demostración de arquitectura móvil moderna.
