# Gestor de Productos Financieros

Aplicación web desarrollada en **Angular 18** que simula un gestor de productos financieros para clientes bancarios. Este proyecto es una prueba técnica que demuestra el uso de las mejores prácticas de desarrollo en Angular.

## Descripción del Proyecto

Esta aplicación permite a los usuarios:
- Visualizar un dashboard con resumen financiero y gráficos interactivos
- Consultar el listado completo de productos financieros (cuentas, depósitos, préstamos, tarjetas)
- Filtrar productos por tipo, estado y fecha de contratación
- Ver el detalle de cada producto incluyendo sus movimientos y transacciones
- Simular la contratación de nuevos productos con formularios reactivos validados
- Visualizar gráficos estadísticos del estado financiero

## Tecnologías Utilizadas

### Core
- **Angular 18** - Framework principal
- **TypeScript 5.4** - Lenguaje de programación
- **RxJS 7.8** - Programación reactiva
- **Angular Router** - Navegación con lazy loading

### UI/UX
- **Angular Material 18** - Componentes de interfaz
- **SCSS** - Estilos personalizados
- **Chart.js 4.5** - Gráficos y visualizaciones

### Backend Simulado
- **JSON Server 1.0** - API REST simulada

### Testing
- **Jasmine 5.1** - Framework de testing
- **Karma 6.4** - Test runner

## Características Técnicas Implementadas

### Requisitos Obligatorios ✅
- [x] Angular 18
- [x] RxJS para manejo de estados reactivos
- [x] Arquitectura basada en componentes y servicios
- [x] Formularios reactivos con validaciones
- [x] Enrutamiento con lazy loading
- [x] API REST simulada con JSON Server
- [x] Testing unitario con Jasmine/Karma

### Bonus Implementados ✅
- [x] **Angular Signals** - Reactividad moderna
- [x] **Dashboard con gráficos** - Chart.js para visualización de datos
- [x] **Angular Material** - UI/UX profesional
- [x] **Paginación y ordenación** - En tablas de productos
- [x] **Filtros avanzados** - Búsqueda, tipo, estado, fechas

## Estructura del Proyecto

```
gestor-financiero/
├── src/
│   ├── app/
│   │   ├── core/                    # Lógica central
│   │   │   ├── models/              # Interfaces y enums
│   │   │   ├── services/            # Servicios (con Signals + RxJS)
│   │   │   ├── guards/              # Guards de ruta
│   │   │   └── interceptors/        # HTTP interceptors
│   │   ├── features/                # Módulos funcionales
│   │   │   ├── dashboard/           # Dashboard con gráficos
│   │   │   ├── productos/           # Listado y detalle
│   │   │   └── contratacion/        # Formulario de contratación
│   │   ├── shared/                  # Componentes compartidos
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── app.component.*          # Componente raíz
│   │   ├── app.routes.ts            # Configuración de rutas
│   │   └── app.config.ts            # Configuración de la app
│   ├── styles.scss                  # Estilos globales
│   └── index.html
├── db.json                          # Base de datos JSON Server
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación y Ejecución

### Requisitos Previos
- Node.js 18.x o superior
- npm 9.x o superior

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd gestor-financiero
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar la aplicación**

Opción 1: Ejecutar servidor Angular y API simultáneamente
```bash
npm run dev
```

Opción 2: Ejecutar por separado

Terminal 1 - API simulada:
```bash
npm run api
```

Terminal 2 - Aplicación Angular:
```bash
npm start
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:4200
- API REST: http://localhost:3000

## Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo (puerto 4200)
npm run api        # Inicia JSON Server (puerto 3000)
npm run dev        # Inicia ambos servidores simultáneamente
npm run build      # Construye la aplicación para producción
npm test           # Ejecuta los tests unitarios
npm run watch      # Construye en modo watch
```

## Decisiones Técnicas

### 1. Arquitectura
- **Standalone Components**: Se utilizan componentes standalone (Angular 18) en lugar de NgModules para una arquitectura más moderna y simple
- **Lazy Loading**: Todas las rutas cargan sus componentes de forma diferida para optimizar el rendimiento
- **Separación de responsabilidades**: División clara entre core (lógica), features (funcionalidades) y shared (compartido)

### 2. Gestión de Estado
- **Angular Signals + RxJS**: Se combinan Signals (para reactividad síncrona) con RxJS (para operaciones asíncronas)
- **BehaviorSubjects**: Para compartir estado entre componentes
- **Computed Signals**: Para derivar datos reactivos automáticamente

### 3. Formularios
- **ReactiveFormsModule**: Todos los formularios usan el enfoque reactivo
- **Validaciones dinámicas**: Las validaciones cambian según el tipo de producto seleccionado
- **Stepper de Material**: Para guiar al usuario en el proceso de contratación

### 4. Estilos
- **Angular Material**: Para componentes UI consistentes y accesibles
- **SCSS**: Para estilos personalizados con variables y nesting
- **Diseño responsive**: Mobile-first con media queries

### 5. API Simulada
- **JSON Server**: Simula una API REST completa con endpoints CRUD
- **Datos realistas**: 9 productos y 8 movimientos con información bancaria real

## Funcionalidades por Módulo

### Dashboard
- Tarjetas resumen (saldo total, productos activos, vencimientos)
- Gráfico de dona (distribución de productos)
- Gráfico de barras (saldo por tipo)
- Lista de próximos vencimientos
- Tabla de últimos movimientos

### Listado de Productos
- Filtros múltiples (tipo, estado, fecha, búsqueda)
- Tabla con ordenación por columnas
- Paginación configurable (5, 10, 25, 50 items)
- Iconos y colores por tipo de producto
- Navegación al detalle

### Detalle de Producto
- Información completa del producto
- Alertas de vencimiento próximo
- Tabla de movimientos/transacciones
- Cálculo de crédito disponible (tarjetas)
- Navegación contextual

### Contratación
- Formulario en 3 pasos (Stepper)
- Validaciones específicas por tipo de producto
- Resumen antes de confirmar
- Feedback visual de procesamiento
- Redirección al detalle tras éxito

## Testing

Ejecutar tests unitarios:
```bash
npm test
```

Los tests cubren:
- Servicios (ProductosService)
- Componentes principales
- Pipes y utilidades
- Validaciones de formularios

## Próximas Mejoras

- [ ] Implementación de guards de autenticación
- [ ] Interceptor para manejo de errores global
- [ ] Más tests (aumentar cobertura)
- [ ] Exportación de datos a PDF/Excel
- [ ] Notificaciones push para vencimientos
- [ ] Tema oscuro (dark mode)
- [ ] Internacionalización (i18n)

## Decisiones de Diseño

### Por qué Angular 18
- Última versión estable con mejoras de rendimiento
- Soporte nativo para Signals (reactividad moderna)
- Standalone components (arquitectura simplificada)
- Mejor developer experience

### Por qué Chart.js
- Librería ligera y flexible
- Excelente documentación
- Amplia compatibilidad con Angular
- Fácil personalización

### Por qué Angular Material
- Componentes accesibles (a11y)
- Diseño consistente con Material Design
- Excelente integración con Angular
- Componentes empresariales robustos

## Contacto y Contribución

Este proyecto fue desarrollado como prueba técnica para demostrar conocimientos en:
- Angular moderno (v18)
- Arquitectura escalable
- Mejores prácticas de desarrollo
- UI/UX profesional
- Gestión de estado reactivo

---

**Desarrollado con Angular 18 y mucho café ☕**
