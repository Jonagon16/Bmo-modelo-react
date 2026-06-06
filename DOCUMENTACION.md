# BMO Consola Interactiva - Documentación Técnica y Funcional 🎮🤖

Esta documentación describe en detalle la arquitectura, tecnologías, características principales, cómo funciona internamente y cómo puedes modificar el proyecto para adaptarlo a tus necesidades.

---

## 📋 Índice
1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Proyecto (Fullstack)](#2-arquitectura-del-proyecto-fullstack)
3. [Características Principales](#3-características-principales)
4. [Estructura de Archivos](#4-estructura-de-archivos)
5. [Constante `TERMINATED` (Modo Rostro Dedicado)](#5-constante-terminated-modo-rostro-dedicado)
6. [Sistema de Expresiones y Animaciones Vectores](#6-sistema-de-expresiones-y-animaciones-vectores)
7. [Control de Audio y Voz (Synthesizer & Push-to-Talk)](#7-control-de-audio-y-voz-synthesizer--push-to-talk)
8. [Integración con la IA de Gemini (Seguridad de API Keys)](#8-integración-con-la-ia-de-gemini-seguridad-de-api-keys)
9. [Guía de Personalización y Desarrollo Local](#9-guía-de-personalización-y-desarrollo-local)

---

## 1. Descripción General
Este proyecto recrea una réplica interactiva, animada y conversacional de **BMO**, el adorable robot con forma de consola de la serie animada *Hora de Aventura*. 

BMO reacciona visualmente con expresiones faciales animadas por código (SVG interactivos + Framer Motion) basados en comandos del usuario, botones pulsables físicos en su consola retro, o mediante voz natural, actuando como un asistente inteligente personalizado de voz en español latino impulsado por la IA de Google Gemini.

---

## 2. Arquitectura del Proyecto (Fullstack)
La aplicación utiliza un diseño fullstack moderno y seguro para evitar vulnerabilidades de fuga de claves:

*   **Frontend (Cliente):** Escrito en **React 18 + TypeScript + Vite**. Genera el render del chasis, la pantalla animada por SVG y maneja eventos tipo puntero de navegador (`PointerEvents`) y reconocimiento de voz nativo en el cliente (`webkitSpeechRecognition`).
*   **Backend (Servidor Express):** Un servidor Node.js en `/server.ts` que sirve como proxy intermediario para procesar llamadas a la API de **Gemini** sin exponer la clave privada `GEMINI_API_KEY` al navegador del usuario final.
*   **Diseño de Estilos:** Utiliza **Tailwind CSS** para un diseño moderno responsivo ajustado de paleta de colores de juguete retro y tipografías personalizadas (como *Space Grotesk* e *Inter*).

---

## 3. Características Principales

*   **Panel de Personas / Consola Interactive:** Simula el chasis físico del BMO incluyendo el D-Pad verde de emociones, los botones de colores (A / TALK, B / FUN) y ranuras de ventilación.
*   **Panel de Reacciones Modificadas:** Permite activar hasta 13 estados emocionales de forma instantánea. Cada botón de reacción ejecuta una frase clásica doblada por la consola con su característico tono latino.
*   **Push-to-Talk (Control Walkie-Talkie):** Al mantener pulsada la pantalla de BMO (en modo completo), BMO entra inmediatamente en estado de escucha silencioso bajo la bandera de expresión **Thinking** u "Haciendo cálculos". Al soltar la pantalla, BMO procesa lo recabado y responde, protegiendo al usuario de loops infinitos de ruido acústico.
*   **Rostro Exclusivo (Modo Cine):** Elimina toda la UI web colindante de chat, barras laterales y guías explicativas para dejar brillar el monitor verde de BMO en gran pantalla.

---

## 4. Estructura de Archivos
A continuación el mapa de navegación de los componentes principales:

```bash
├── server.ts                 # Servidor backend Express (conecta con Gemini de forma segura)
├── metadata.json             # Metadatos del micro-entorno de AI Studio
├── index.html                # Punto de entrada HTML
├── package.json              # Configuración de dependencias y scripts de construcción
├── .env.example              # Variables requeridas de entorno (sin exponer credenciales)
├── README.md                 # Leeme base del proyecto
├── src/
│   ├── main.tsx              # Inicializador React
│   ├── index.css             # Importador global de Google Fonts y temas Tailwind CSS
│   ├── App.tsx               # Núcleo de la app (gestión de voz, chat, triggers y maquetación)
│   ├── types.ts              # Declaración estricta de expresiones soportadas por BMO
│   └── components/
│       ├── BmoScreen.tsx     # Lienzo vectorial SVG con las proporciones del monitor e hilos de render del rostro
│       └── BmoConsole.tsx    # Maquetación del chasis verde, el d-pad de goma y los botones físicos
```

---

## 5. Constante `TERMINATED` (Modo Rostro Dedicado)
Una de las funcionalidades de diseño para cosplay o portabilidad física es la constante `TERMINATED` ubicada en `/src/App.tsx`.

*   **`const TERMINATED = false;` (Por Defecto)**
    Muestra la aplicación con su diseño de consola. Permite abrir el chat de texto, presionar los botones amarillos del tablero de sonido lateral, ver las listas de mensajes y presionar el botón interactivo superior para hacer zoom o pantalla completa.
*   **`const TERMINATED = true;` (Orientado a Pantalla Física / Espejo Inteligente)**
    Inutiliza y remueve totalmente el renderizador de la web tradicional. Al cargar la app, se mostrará **únicamente** la cara de BMO ocupando toda la ventana del navegador. No existen botones de minimizar, menús de salida ni scrollbars. Está diseñado para montarse sobre tabletas viejas, pantallas portátiles o espejos interactivos de forma permanente usando solamente la interacción de pulsar/tocar pantalla para hablar.

---

## 6. Sistema de Expresiones y Animaciones Vectores
Las expresiones se representan como componentes vectoriales puros en `BmoScreen.tsx` que admiten transiciones fluidas de `framer-motion`:

*   **Wink / Guiño:** Encogimiento controlado de los vectores simétricos de los ojos.
*   **Sad / Tristeza ("Remojada"):** Renderiza un lagrimeo constante cayendo asincrónicamente por debajo de las pupilas, simulando el look mojado de un sistema en cortocircuito.
*   **Angry / Enojado:** Genera pupilas planas acompañadas de cejas sesgadas y una boca con grilla blanca que simula dientes apretados en tensión de 16-bits.
*   **Glitch / Falla:** Reemplaza el monitor por líneas de estática horizontales, colores invertidos y avisos de error de retro-voltaje.

### Código de ejemplo para cambiar estados en el cliente:
Para forzar una emoción por código, simplemente actualiza el setter de React provisto:
```typescript
setExpression('scared'); // Opciones: 'idle' | 'sad' | 'angry' | 'wink' | 'sleepy' | 'excited' | etc.
```

---

## 7. Control de Audio y Voz (Synthesizer & Push-to-Talk)
BMO aprovecha la API de TTS instalada nativamente en el navegador (`window.speechSynthesis`).

Para lograr su tono agudo, divertido y nostálgico de juguete, el cargador de voz realiza las siguientes operaciones:
1.  Busca la voz preferida de niños en español como **`Google español de Estados Unidos`** o **`Microsoft Sabina`**.
2.  Ajusta el volumen a un nivel óptimo de amplificación (`utterance.volume = 1.0`).
3.  Modula la velocidad de habla para sonar adorable (`utterance.rate = 1.15` a `1.22`).
4.  Eleva el tono de voz para recrear su voz característica de infante (`utterance.pitch = 1.6` o superior).
5.  Cancela cualquier reproducción previa usando `window.speechSynthesis.cancel()` antes de vocalizar una nueva frase para evitar que las ráfagas rápidas de clics se empalmen entre sí.

---

## 8. Integración con la IA de Gemini (Seguridad de API Keys)
El flujo para comunicarse con Gemini de forma segura es el siguiente:

```
[Cliente App (Navegador)] 
       │
       │ (Push-to-Talk capturado por Micrófono)
       ▼
[Webhook /api/chat (server.ts)] ────► [Lee localmente process.env.GEMINI_API_KEY]
       │                                            │
       │ (Autenticación interna segura)             │
       ▼                                            ▼
[Servidor de Google Gemini AI] ◄────────────────────┘
       │
       │ (Retorna texto optimizado / corto)
       ▼
[Audio Sintetizado por el Navegador en el Cliente]
```

*Nota: Gracias al sistema de protección por proxy del servidor, la clave privada nunca se expone en la sección "Network/Red" del inspector web de tus usuarios.*

---

## 9. Guía de Personalización y Desarrollo Local

### Configuración del archivo `.env`
Copia el archivo modelo de entrada para configurar tus variables locales:
```bash
cp .env.example .env
```
Y añade tu clave de desarrollo de Gemini:
```env
GEMINI_API_KEY=tu_clave_privada_aqui
```

### Comandos de Ejecución
*   **Instalación inicial:** `npm install`
*   **Modo de Desarrollo:** `npm run dev`
*   **Construcción del Paquete de Producción:** `npm run build`
*   **Levantar Servidor de Producción localmente:** `npm run start` (Compilará y levantará la aplicación sobre el puerto `3000` con el servidor express de soporte).

---
*Hecho con cariño para los fanáticos de Hora de Aventura y BMO. ¡Sigue creando cosas geniales! 🌈🌟*
