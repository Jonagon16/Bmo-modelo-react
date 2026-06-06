# BMO Consola Interactiva - Manual Técnico y de Arquitectura 🎮🤖

Este documento contiene la especificación de diseño, arquitectura e implementación para la **Consola Interactiva de BMO**. Ha sido redactado con el propósito de servir como referencia técnica definitiva para el mantenimiento, escalabilidad y despliegue del sistema.

---

## 📋 Tabla de Contenidos
1. [Arquitectura de Alto Nivel e Integración](#1-arquitectura-de-alto-nivel-e-integración)
2. [Análisis de Módulos (Estructura de Archivos)](#2-análisis-de-módulos-estructura-de-archivos)
3. [Tipos de Datos y Contratos de Entrada/Salida (`types.ts`)](#3-tipos-de-datos-y-contratos-de-entradasalida-typests)
4. [Backend (`server.ts`) - Servidor Express y Orquestación Gemini IA](#4-backend-serverts---servidor-express-y-orquestación-gemini-ia)
5. [Módulo de Vista Principal (`src/App.tsx`) - Máquina de Estados del Cliente](#5-módulo-de-vista-principal-srcapptsx---máquina-de-estados-del-cliente)
6. [Módulo de Render Vectorial (`src/components/BmoScreen.tsx`)](#6-módulo-de-render-vectorial-srccomponentsbmoscreentsx)
7. [Módulo de Consola Física (`src/components/BmoConsole.tsx`)](#7-módulo-de-consola-física-srccomponentsbmoconsoletsx)
8. [Módulo de Control de Reacciones (`src/components/BmoControls.tsx`)](#8-módulo-de-control-de-reacciones-srccomponentsbmocontrolstsx)
9. [Flujo de Audio, Reconocimiento de Voz y Síntesis de Batería Baja](#9-flujo-de-audio-reconocimiento-de-voz-y-síntesis-de-batería-baja)
10. [La Directiva `TERMINATED` (Modo Rostro de Dispositivo Dedicado)](#10-la-directiva-terminated-modo-rostro-de-dispositivo-dedicado)
11. [Guía de Pruebas, Instalación y Comandos Administrativos](#11-guía-de-pruebas-instalación-y-comandos-administrativos)

---

## 1. Arquitectura de Alto Nivel e Integración

La solución se compone de un flujo **Fullstack desacoplado de dos niveles** para garantizar rendimiento interactivo en tiempo real y seguridad robusta de tokens:

```
                  ┌──────────────────────────────────────────────┐
                  │          Cliente Web (Navegador)             │
                  │  React 18 / Vite / Web Speech APIs           │
                  └──────────────────────┬───────────────────────┘
                                         │
                   POST /api/chat (JSON) │ proxy local (Puerto 3000)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        Servidor Intermedio (Express)         │
                  │  Node.js / @google/genai SDK                 │
                  └──────────────────────┬───────────────────────┘
                                         │
                                   HTTPS │ (process.env.GEMINI_API_KEY)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           Google Gemini AI Services          │
                  │           Modelo: gemini-3.5-flash           │
                  └──────────────────────────────────────────────┘
```

Esta arquitectura de proxy bloquea cualquier intento de inspección de red del navegador para obtener el `GEMINI_API_KEY`, impidiendo la fuga de tokens de Inteligencia Artificial.

---

## 2. Análisis de Módulos (Estructura de Archivos)

*   `server.ts`: Servidor backend principal en Node.js que expone las rutas API seguras, carga las configuraciones de sistema de Gemini, implementa asincronía tolerante a fallos y sirve los archivos de compilación estática en el entorno de producción de Cloud Run (puerto 3000).
*   `src/types.ts`: Sostiene las definiciones estrictas de tipado para evitar estados indeterminados en los componentes.
*   `src/App.tsx`: Centraliza el árbol de estados de React, timers de simulación, la gestión de la Web Speech API, listeners de inactividad, triggers del teclado de hardware y maquetación visual del fondo con nubes dinámicas.
*   `src/components/BmoScreen.tsx`: Módulo matemático-gráfico que dibuja las coordenadas SVG dinámicas de las expresiones, ojos, labios, lágrimas físicas parpadeantes del rostro "remosido" e iluminación de pantalla CRT.
*   `src/components/BmoConsole.tsx`: Renderiza el chasis físico plástico de la consola. Captura eventos táctiles e interactivos del D-Pad y los botones físicos de goma para mapearlos a callbacks de estados.
*   `src/components/BmoControls.tsx`: Contiene los controles de sonido y el pad de gatillos de reacciones manuales rápidos organizados en bento-grid.

---

## 3. Tipos de Datos y Contratos de Entrada/Salida (`types.ts`)

El archivo describe los contratos que fluyen entre el cliente de BMO y el servidor que ejecuta los modelos de IA:

### Expresiones de BMO (`Expression`)
Tipo de unión literal de strings que define los estados antropomórficos legales aplicables sobre el rostro de BMO:
```typescript
export type Expression =
  | 'idle'       // Neutral / Feliz relajado
  | 'talking'    // Modulación labial activa normal
  | 'thinking'   // Expresión de cálculo / Esperando IA
  | 'sad'        // Tristeza ("remojada" lagrimas en movimiento)
  | 'angry'      // Molesto (pupilas chatas con diente apretador)
  | 'excited'    // Euforia animada por aventura
  | 'surprised'  // Boca abierta con pupilas expandidas
  | 'sleepy'     // Sistema adormilado listo para apagarse
  | 'blushing'   // Rostro sonrojado mejillas rosadas
  | 'glitch'     // Falla técnica estática
  | 'wink'       // Guiño cómico
  | 'love'       // Ojos de corazón animado
  | 'cool'       // Lentes de detective
  | 'scared';    // Ojos temblorosos por pánico
```

### Historial de Mensajes (`ChatMessage`)
Estructura de memoria local utilizada para alimentar el contexto histórico de la respuesta de Gemini:
```typescript
export interface ChatMessage {
  id: string;                 // Hash o marca de tiempo única del mensaje
  sender: 'user' | 'bmo';     // Rol emisor
  text: string;               // Cuerpo limpio del texto original
  expression: Expression;     // Estado emocional con el que se emitió
  timestamp: string;          // Formato hh:mm legible
}
```

### Respuesta del Servidor (`BmoResponse`)
Esquema de respuesta JSON estricto provisto por Gemini AI:
```typescript
export interface BmoResponse {
  text: string;               // Narrativa redactada por BMO
  expression: Expression;     // Expresión recomendada para el render de respuesta
}
```

---

## 4. Backend (`server.ts`) - Servidor Express y Orquestación Gemini IA

El backend se conecta con `@google/genai` (SDK moderno oficial) mediante un patrón de inicialización perezosa (`lazy-initialization`).

### Rutas Clave e Implementación

#### `POST /api/chat`
Endpoint principal que procesa y categoriza los enunciados conversacionales utilizando el modelo `gemini-3.5-flash`:

*   **Parámetros de Entrada (`req.body`):**
    *   `message`: `string` (último enunciado vocalizado o escrito).
    *   `history`: `ChatMessage[]` (historial conversacional remanente acotado a 10 referencias para control de tokens).
    *   `isShortMode`: `boolean` (bandera para activar modo respuesta relámpago en Push-to-Talk).
*   **Prompt de Sistema Base (`bmoSystemInstruction`):**
    Consiste en una inyección de rol de alta fidelidad que define el vocabulario de BMO, rasgos infantiles y de protección del canon de *Hora de Aventura*, ordenándole explícitamente responder siempre en el idioma de entrada del usuario y retornar la estructura JSON según el esquema especificado.
*   **Uso del esquema JSON de retorno:**
    Obliga a Gemini a estructurar la respuesta con el formato estructurado `{ text: string, expression: string }` para que el frontend pueda parsearlo sin procesamientos adicionales basados en regex tradicionales.

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3.5-flash',
  contents: contents,
  config: {
    systemInstruction: activeInstructions,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        expression: { type: Type.STRING },
      },
      required: ['text', 'expression'],
    }
  }
});
```

---

## 5. Módulo de Vista Principal (`src/App.tsx`) - Máquina de Estados del Cliente

`src/App.tsx` lidera los eventos dinámicos y la representación visual de BMO.

### Variables de Estado del Componente React

| Variable de Estado | Tipo TypeScript | Propósito / Comportamiento |
| :--- | :--- | :--- |
| `expression` | `Expression` | Emoción que renderiza la pantalla actualmente. |
| `captionText` | `string` | Texto mostrado como subtítulo (typewriter activo). |
| `messages` | `ChatMessage[]` | Cola histórica local con las conversaciones de la sesión. |
| `input` | `string` | Buffer del contenedor de texto de chat manual. |
| `isLoading` | `boolean` | Indicador de llamada asíncrona a la API activa. |
| `ttsEnabled` | `boolean` | Flag de habilitación del sonido y modulación de voz. |
| `isTypingActive` | `boolean` | Flag dinámico que indica que el typewriter está en marcha. |
| `isOnlyFaceMode` | `boolean` | Determina si se esconde la interfaz completa para zoom de pantalla. |
| `isAudioSpeaking` | `boolean` | Controla si la síntesis de voz está hablando de forma física. |
| `lastActivity` | `number` | Marca de tiempo UTC (`Date.now()`) de la última acción del usuario. |
| `isListening` | `boolean` | Flag de captura de micrófono activo con reconozimiento local. |
| `isFullscreenListening`| `boolean` | Permite rastrear si el usuario tiene gatillado el modo Walkie Talkie. |
| `showMinimizeButton` | `boolean` | Control de visibilidad del control de escape en modo pantalla completa. |

### Enlaces (`Refs`) Principales para Gestión de Timers y Audio
*   `typewriterTimerRef`: Temporizador que imprime letra a letra el texto de BMO en la pantalla emulando el efecto typewriter.
*   `speakTimerRef`: Temporizador que simula la longitud de voz humana para la modulación de animación de boca en navegadores donde el TTS nativo está bloqueado.
*   `recognitionRef`: Instancia global del motor web de reconocimiento de voz (`webkitSpeechRecognition`).
*   `fullscreenRecRef`: Instancia de captura dedicada para el modo Push-to-Talk de pantalla completa.
*   `activeUtteranceRef`: Sostiene la referencia rítmica de la vocalización en curso para permitir cortes rápidos y evitar solapamiento de ruidos de voz.

### Dictionarios de Reacciones Manuales
Contiene frases traducidas y adaptadas con el doblaje latino oficial de BMO en el programa animado para cada botón de los gatillos laterales:

```typescript
const messagesDict: Record<Expression, string> = {
  idle: "¿Quién quiere jugar videojuegos?",
  talking: "¡Esto sí computa! Siento la adrenalina de los 16 bits.",
  thinking: "Cuando pasan cosas malas... debemos encontrar la luz y seguir adelante.",
  sad: "¡Finn, eres un tonto-tonto-tonto-tontuelo pajaruelo!",
  angry: "¡Si alguien intenta herir a Finn... lo mataré!",
  excited: "¡Guaooo! ¡Esto es súper divertido! ¡Vamos de aventuras!",
  surprised: "¡Mi arte es un arma! ¡Guaooo!",
  sleepy: "Batería baja. Apagando sistemas... Buenas noches...",
  blushing: "Oh, eres muy amable... ¡BMO te quiere mucho, amigo!",
  wink: "Creo que estoy muriendome. ¡Pero no importa, BMO siempre regresa!",
  love: "¡Perritos! ¡Perritos! ¡Perritos! ¡Son tan calientitos y suaves!",
  cool: "Conozco esa mirada... Acabas de liquidar a alguien.",
  scared: "¡Socorro! ¡Hay un monstruo en el pozo! ¡Jake, ayúdame!",
  glitch: "⚠️ ¡Bzzzt! ¡Ay! Mis circuitos se enredaron... ¡Error de retro-voltaje!"
};
```

### Funciones Centrales del Ciclo de Trabajo en Cliente
1.  `triggerTypewriter(fullText, finalExpression)`:
    *   Detiene cualquier timer typewriter activo.
    *   Establece la emoción `expression` deseada inmediatamente.
    *   Crea una rutina por intervalos dividiendo el texto para generar animación incremental del subtítulo.
    *   Dispara la vocalización auditiva sincronizada por medio de `speakTextRef`.
2.  `handleSendMessage(text, isShortMode)`:
    *   Inyecta en la cola local el mensaje del usuario.
    *   Establece a BMO en estado del procesamiento (`thinking`, "BMO está procesando... (Bzzz * tic * toc)").
    *   Llama al backend local `/api/chat` pasándole el payload e historial de contexto.
    *   Genera el render de la respuesta llamando de nuevo a `triggerTypewriter`.

---

## 6. Módulo de Render Vectorial (`src/components/BmoScreen.tsx`)

Dibuja y parametriza los estados del rostro como elementos puros dentro de un viewport SVG `viewBox="0 0 500 375"`, brindando soporte adaptativo que escala de forma limpia a cualquier resolución de pantalla o proporción responsiva.

### Estados Matemáticos Representados por SVG

#### Ojos (Pupilas)
Las pupilas usan vectores simétricos `cx="158"` (ojo izquierdo) y `cx="342"` (ojo derecho) con un radio base de `r="14"`. Al dispararse ciertos estados, los valores varían de la siguiente forma:
*   **`angry` (Enojado/Molesto):** Se añaden cejas inclinadas `<line>` y se superpone una máscara lineal superior para recortar las pupilas, mostrándolas de forma rectangular chata.
*   **`love` (Enamorado):** Reemplaza las pupilas circulares `<circle>` por un grupo de trazado vectorial `<path>` en forma de corazón doble con sutiles saltos de escala física gracias a `framer-motion`.
*   **`scared` (Asustado):** Reajusta el radio ocular simulando contracción pupilar extrema y aplica una traslación con oscilación de trémolo continua (`x: [-2, 2, -2]`).
*   **`wink` (Guiño):** Mapea el ojo derecho a una curva minimalista horizontal de vector de línea suavizada.

#### Boca (La Trayectoria Dinámica `<path>`)
La boca se autocalcula usando la interpolación bezier en base a la emoción actual:
*   **Sonrisa estándar (`idle`, `excited`):** Genera una curva bezier suave de tipo tazón cóncavo: `M 220 220 Q 250 250 280 220`.
*   **Boca abierta de asombro (`surprised`):** Utiliza un óvalo o cápsula vertical con el fin de emular desconcierto.
*   **Dientes Clavados de Furia (`angry`):** Es una estructura compleja de tipo cinta o parrilla compuesta por un fondo sólido blanco con múltiples líneas verticales oscurecidas, simulando dientes apretados en tensión de combate:
    ```typescript
    {mouth.isAngryRibbon && (
       <g id="bmo-angry-teeth-grit" clipPath="url(#bmo-mouth-clip)">
         <path d={mouth.d} fill="#FFFFFF" />
         {/* Líneas múltiples divisoras verticales */}
       </g>
    )}
    ```

#### Lágrimas de Tristeza ("Remojada")
Para el estado `sad` (Triste), BMO simula lágrimas cayendo de forma infinita utilizando `framer-motion` acoplado con SVG puros:
```typescript
{expression === 'sad' && (
  <g id="bmo-sad-tears" opacity="0.85">
    <motion.path
      animate={{ y: [0, 15, 30, 40], opacity: [0, 1, 0.8, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      d="M 158,155 C ... Z"
      fill="#52B6FF"
    />
  </g>
)}
```

---

## 7. Módulo de Consola Física (`src/components/BmoConsole.tsx`)

Renderiza estructuralmente el contorno y el juguete de la consola retro verde:
*   **El Chasis Portátil:** Utiliza una combinación de colores en degradados mate de código hexadecimal `#4FA294` para los biseles laterales de ventilación profunda y el monitor.
*   **La Placa D-PAD:** Configurado en un compuesto de hule negro y cruz de goma táctil. El botón de dirección tiene callback direccionado `onDpadPress(direction)` que asocia cada flecha a un preset emocional (`up -> excited`, `down -> sleepy`, `left -> sad`, `right -> angry`).
*   **Los Botones de Acción:**
    *   **Botón A (TALK) - Rojo:** Gatilla localmente `onButtonPress('circle_red')` para encender la escucha interactiva.
    *   **Botón B (FUN) - Verde:** Ejecuta `onButtonPress('circle_green')`, el cual dispara diálogos absurdos o chistes geek grabados en la memoria de BMO.
    *   **Botón Triángulo - Azul:** Genera sonidos de alerta de 16 bits y activa caras alegres instantáneas.

---

## 8. Módulo de Control de Reacciones (`src/components/BmoControls.tsx`)

Estructura un panel externo lateral tipo grid de CSS. Es el responsable de renderizar los atajos rápidos de las 13 facetas emocionales de BMO. 

---

## 9. Flujo de Audio, Reconocimiento de Voz y Síntesis de Batería Baja

El sistema utiliza APIs nativas y asincronía coordinada para lograr un flujo natural sin ecos:

```
[MUESTREO DE VOZ]
      │
      ├─► PointerDown (Pantalla zoom) ──► Frena TTS actual ──► Inicia Reconocimiento de Voz
      │
      └─► PointerUp (Pantalla zoom) ────► Cierra Captura Mic ──► Envía a Gemini API
                                                                        │
                                                                        ▼
[SÍNTESIS DE RESPUESTA]                                         [Recibe texto e ID]
      │                                                                 │
      ├─► Selecciona voz española (es-MX / es-US) ◄─────────────────────┘
      │
      └─► Eleva el pitch a 1.85 y rate a 1.15 para la voz infantil de BMO
```

*Nota: Durante los estados de inactividad programados (al transcurrir 15 segundos sin tocar el sistema), BMO suspende su cara neutral, simula un bostezo y entra en modo de bajo consumo (`sleepy`) cambiando su rostro a dormido con subtítulos correspondientes.*

---

## 10. La Directiva `TERMINATED` (Modo Rostro de Dispositivo Dedicado)

A nivel de código en `/src/App.tsx`, existe una constante lógica global llamada `TERMINATED`:

```typescript
const TERMINATED = false; // Cambiar a true para bloquear modo rostro
```

*   **`TERMINATED = false` (Modo Desarrollo/Interactiva Completo):**
    Presenta la aplicación web común con barra de chat, botones laterales, enlaces a repositorios y todas las utilidades visuales disponibles de control.
*   **`TERMINATED = true` (Modo Dispositivo Físico/Espejo Inteligente):**
    Omite completamente el renderizado condicional de todo el sistema web secundario. La aplicación se congela al arrancar en modo de pantalla completa nativo ocultando toda la UI de chat y cajas adicionales. El sistema interactivo Push-to-Talk sobre la cara de BMO sigue 100% operativo mediante toques de dedo, convirtiendo el ordenador en una consola física autónoma y terminada sin posibilidad de salirse accidentalmente de la experiencia.

---

## 11. Guía de Pruebas, Instalación y Comandos Administrativos

Sigue estos comandos estables en tu terminal para control local del sistema:

### Instalación de Librerías y Dependencias del Proyecto
Para descargar las paqueterías definidas de render y conectores del SDK de Gemini:
```bash
npm install
```

### Configuración del Entorno Seguro (`.env`)
Antes de iniciar, crea un archivo `.env` tomando como base el archivo `.env.example` en la raíz de tu proyecto:
```bash
GEMINI_API_KEY=tu_clave_de_desarrollador_privada_aqui
```

### Comportamientos Especiales en Entornos del Servidor
*   **Servidor de Desarrollo Local (Vite + Tsx proxy):**
    ```bash
    npm run dev
    ```
*   **Compilación y Paquetes para Producción:**
    ```bash
    npm run build
    ```
    Compila el frontend estático a la carpeta `dist/` y genera el bundler del servidor backend NodeJS optimizado en el puerto de escucha segura de contenedores.
*   **Inicializar en Modo Producción Local:**
    ```bash
    npm run start
    ```

---
*Mantenimiento y soporte a cargo de la sección de ingeniería y desarrollo interactivo de BMO. ¡Computando aventuras de 16-bits!* 🌈🎛️
