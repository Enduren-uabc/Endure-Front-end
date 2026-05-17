# Definicion del codigo fuente - Apartado 7.1

## Proposito

Este documento sirve como insumo tecnico para redactar formalmente el apartado 7.1 del plan de pruebas. Describe la composicion del codigo fuente del proyecto `front-enduren`, una aplicacion movil/web de Endure desarrollada con Expo, React Native y TypeScript.

El contenido es factual y esta orientado a que otro LLM pueda convertirlo en una redaccion formal del plan de pruebas.

## Alcance del analisis

El analisis considera el codigo fuente funcional ubicado en `src/` y los archivos raiz de configuracion necesarios para compilar, ejecutar y tipar la aplicacion:

- `index.ts`
- `package.json`
- `tsconfig.json`
- `app.json`
- `babel.config.js`

Se excluyen del analisis narrativo `dist/`, `node_modules/`, imagenes, recursos binarios y `package-lock.json`, porque no representan codigo fuente funcional directo de la aplicacion.

No se documentan valores reales de `.env`. La configuracion de la API se describe solo mediante la variable `EXPO_PUBLIC_API_URL`.

## Tecnologias principales

| Elemento | Descripcion |
| --- | --- |
| Lenguaje principal | TypeScript con React Native/TSX |
| Framework base | Expo `~54.0.33` |
| React | `19.1.0` |
| React Native | `0.81.5` |
| Estado local | Zustand, con persistencia mediante AsyncStorage |
| Almacenamiento de tokens | Expo SecureStore en movil y `localStorage` en web |
| Cliente HTTP | Axios |
| Validacion | Zod |
| Formularios | React Hook Form |
| Navegacion | React Navigation: stack, tabs y drawer |

## Resumen cuantitativo

| Metrica | Valor |
| --- | ---: |
| Archivos fuente en `src/` | 60 |
| Lineas en `src/` | 7,262 |
| Archivos raiz relevantes | 5 |
| Lineas en archivos raiz relevantes | 109 |
| Total fuente/configuracion relevante | 7,371 |
| Archivos `.tsx` en `src/` | 31 |
| Archivos `.ts` en `src/` | 29 |

## Distribucion por modulo

| Modulo o grupo | Lineas | Responsabilidad principal |
| --- | ---: | --- |
| `features/training` | 4,051 | Rutinas, detalle, builder, catalogo de ejercicios, configuracion de series y estrategias de entrenamiento |
| `features/auth` | 1,148 | Registro, inicio de sesion, recuperacion/restablecimiento de contrasena y sesion persistente |
| `features/onboarding` | 846 | Objetivo, datos basicos, nivel, resumen y envio de perfil |
| `navigation`, `components`, `lib`, `theme` | 1,033 | Navegacion, componentes UI reutilizables, cliente API y tema visual |
| `features/home`, `features/settings`, `features/help` | 167 | Pantallas auxiliares de inicio, configuracion y ayuda |
| `App.tsx` | 17 | Composicion raiz de proveedores y navegador principal |

## Tabla de lineas por archivo

### Codigo en `src/`

| Archivo | Lineas |
| --- | ---: |
| `src/App.tsx` | 17 |
| `src/navigation/OnboardingStack.tsx` | 27 |
| `src/navigation/AppDrawer.tsx` | 58 |
| `src/navigation/AuthStack.tsx` | 29 |
| `src/navigation/TrainingStack.tsx` | 26 |
| `src/navigation/AppTabs.tsx` | 49 |
| `src/navigation/RootNavigator.tsx` | 164 |
| `src/navigation/types.ts` | 42 |
| `src/theme/colors.ts` | 23 |
| `src/theme/index.ts` | 17 |
| `src/theme/radius.ts` | 10 |
| `src/theme/spacing.ts` | 12 |
| `src/theme/shadows.ts` | 27 |
| `src/theme/typography.ts` | 13 |
| `src/lib/query-client.ts` | 11 |
| `src/lib/api-client.ts` | 153 |
| `src/lib/api-endpoints.ts` | 53 |
| `src/lib/secure-token-store.ts` | 62 |
| `src/features/settings/screens/settings.tsx` | 39 |
| `src/features/onboarding/hooks/use-onboarding.ts` | 62 |
| `src/features/training/hooks/use-training-strategies.ts` | 20 |
| `src/features/training/hooks/use-set-routine-strategy.ts` | 25 |
| `src/features/training/hooks/use-exercise-catalog.ts` | 63 |
| `src/features/training/hooks/use-routines.ts` | 83 |
| `src/features/training/hooks/use-sync-routine.ts` | 56 |
| `src/features/training/hooks/use-generate-exercise-sets.ts` | 37 |
| `src/features/onboarding/validations/onboarding.ts` | 32 |
| `src/features/auth/screens/register.tsx` | 269 |
| `src/features/auth/hooks/use-auth.ts` | 103 |
| `src/features/auth/screens/login.tsx` | 187 |
| `src/features/auth/screens/welcome.tsx` | 74 |
| `src/features/auth/screens/forgot-password.tsx` | 165 |
| `src/features/auth/screens/reset-password.tsx` | 233 |
| `src/features/home/screens/home.tsx` | 89 |
| `src/features/onboarding/screens/goal.tsx` | 102 |
| `src/features/onboarding/screens/level.tsx` | 156 |
| `src/features/onboarding/screens/basic-data.tsx` | 231 |
| `src/features/training/validations/routine.ts` | 10 |
| `src/features/onboarding/screens/summary.tsx` | 199 |
| `src/features/training/validations/exercise-catalog.ts` | 10 |
| `src/features/auth/stores/session-store.ts` | 62 |
| `src/features/auth/validations/auth.ts` | 55 |
| `src/features/onboarding/stores/onboarding-store.ts` | 64 |
| `src/features/training/stores/routine-draft-store.ts` | 109 |
| `src/features/training/components/ExerciseSetsTable.tsx` | 183 |
| `src/features/training/components/TrainingStrategySelector.tsx` | 79 |
| `src/features/training/screens/exercise-detail.tsx` | 504 |
| `src/features/training/screens/exercise-catalog.tsx` | 336 |
| `src/features/training/screens/routines-list.tsx` | 461 |
| `src/features/training/screens/routine-detail.tsx` | 789 |
| `src/features/training/screens/routine-builder.tsx` | 1,161 |
| `src/features/training/types/routine.ts` | 63 |
| `src/features/training/types/exercise-catalog.ts` | 48 |
| `src/features/training/types/training-strategy.ts` | 14 |
| `src/components/ui/BaseCard.tsx` | 26 |
| `src/components/ui/SecondaryButton.tsx` | 48 |
| `src/components/ui/Chip.tsx` | 59 |
| `src/components/ui/TextInput.tsx` | 76 |
| `src/components/ui/PrimaryButton.tsx` | 48 |
| `src/features/help/screens/help.tsx` | 39 |
| **Total `src/`** | **7,262** |

### Archivos raiz relevantes

| Archivo | Lineas |
| --- | ---: |
| `index.ts` | 6 |
| `package.json` | 44 |
| `tsconfig.json` | 10 |
| `app.json` | 34 |
| `babel.config.js` | 15 |
| **Total archivos raiz relevantes** | **109** |

## Descripcion funcional por area

### Autenticacion

El modulo `features/auth` contiene pantallas y logica para registro, inicio de sesion, bienvenida, recuperacion de contrasena y restablecimiento de contrasena. La sesion se administra con Zustand en `session-store.ts`, con persistencia parcial en AsyncStorage. Los hooks de autenticacion consumen el cliente API y exponen mutaciones para las operaciones principales.

### Onboarding

El modulo `features/onboarding` contiene el flujo inicial del usuario: seleccion de objetivo, captura de datos basicos, nivel de experiencia, resumen y envio de perfil. Usa un store Zustand para mantener el borrador local del perfil durante el flujo y esquemas Zod para validar datos del formulario.

### Entrenamiento

El modulo `features/training` es el area de mayor volumen. Incluye listado y detalle de rutinas, constructor de rutinas, catalogo y detalle de ejercicios, configuracion de series, seleccion de estrategias de entrenamiento, sincronizacion de rutinas y generacion de series. Tambien incluye tipos TypeScript, validaciones Zod, componentes especializados y un store local para el borrador de rutina.

### Navegacion

El directorio `navigation` define la navegacion principal con stacks, tabs, drawer y deep linking. `RootNavigator.tsx` decide el flujo activo segun autenticacion, hidratacion de sesion y estado de onboarding. Tambien declara rutas para pantallas de autenticacion, onboarding, tabs principales, configuracion, ayuda y modal de catalogo de ejercicios.

### API

El directorio `lib` centraliza el acceso a servicios externos. `api-client.ts` configura Axios con `EXPO_PUBLIC_API_URL`, headers base, interceptores de request/response, refresh token, cola de solicitudes durante refresh y limpieza de sesion ante errores 401. `api-endpoints.ts` concentra rutas de autenticacion, onboarding, perfil, rutinas, ejercicios, estrategias y sesiones de entrenamiento.

### Estado local y almacenamiento

La aplicacion usa Zustand para estado local de sesion, onboarding y borrador de rutina. La sesion se persiste con AsyncStorage. Los tokens de acceso y refresh se manejan mediante `secure-token-store.ts`, que usa Expo SecureStore en movil y `localStorage` en web.

### UI reutilizable y tema visual

El directorio `components/ui` contiene componentes reutilizables como botones, tarjetas, chips y entradas de texto. El directorio `theme` centraliza colores, radios, espaciado, sombras y tipografia, permitiendo consistencia visual entre pantallas.

### Pantallas auxiliares

Los modulos `features/home`, `features/settings` y `features/help` contienen pantallas auxiliares para inicio, configuracion y ayuda. Su volumen total es menor frente a los modulos funcionales principales.

## Estructura de codigo

No se identifica una estructura orientada a clases. El codigo esta organizado principalmente mediante:

- Componentes funcionales React Native.
- Hooks personalizados.
- Stores Zustand.
- Tipos e interfaces TypeScript.
- Esquemas de validacion Zod.
- Objetos de configuracion y constantes.

La unica clase explicita identificada en `src/` es `ApiError`, declarada en `src/lib/api-client.ts` para normalizar errores del cliente API.

## Validacion y pruebas

La validacion de datos se implementa con Zod en formularios de autenticacion, onboarding y entrenamiento. Se encontraron validaciones especificas para:

- Login, recuperacion de contrasena y restablecimiento de contrasena.
- Datos de onboarding.
- Configuracion de series de ejercicios.
- Filtros del catalogo de ejercicios.

No se encontraron archivos de prueba con patrones `*.test*`, `*.spec*` ni directorios `__tests__` en el arbol del proyecto analizado.

## Supuestos para la redaccion formal

- El plan de pruebas debe considerar `src/` como fuente funcional principal.
- Los archivos raiz listados se consideran configuracion relevante para ejecucion, compilacion y tipado.
- `dist/`, `node_modules/`, imagenes y `package-lock.json` quedan fuera del analisis narrativo por no ser codigo fuente funcional directo.
- No deben incluirse valores reales de `.env`; solo se debe mencionar que la API se configura mediante `EXPO_PUBLIC_API_URL`.
- El documento final del plan puede convertir estas observaciones en lenguaje formal, manteniendo los conteos y alcances aqui registrados.
