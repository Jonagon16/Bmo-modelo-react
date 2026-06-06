# BMO Consola Interactiva - Versión Cartoon 🎮🤖

¡Bienvenido al repositorio de la Consola Interactiva de BMO! Este proyecto recrea con fidelidad absoluta los gestos, voz y encantadora personalidad de **BMO** de *Hora de Aventura*, impulsado por la API de **Gemini** y el motor de síntesis de voz del navegador.

Este proyecto ha sido mejorado y generado conjuntamente con **Google AI Studio**.

---

## 🔗 Enlaces Importantes
- **Repositorio de Fan (Jonagon16):** [https://github.com/Jonagon16/Bmo-modelo-react](https://github.com/Jonagon16/Bmo-modelo-react)
- **Repositorio Original Base:** [https://github.com/brenpoly/be-more-agent](https://github.com/brenpoly/be-more-agent)
- **Generado Con:** [Google AI Studio](https://ai.studio/build)
- **Aplicación en Producción:** [https://ais-pre-f2wqnwj3lcv2z3br2ulhnq-444598480512.us-east1.run.app](https://ais-pre-f2wqnwj3lcv2z3br2ulhnq-444598480512.us-east1.run.app)

---

## ⚙️ Conexión al Backend (Arquitectura Fullstack)

La aplicación utiliza un flujo completo **client-to-server** seguro para proteger las claves de API (como `GEMINI_API_KEY`):

1. **Cliente (React/Vite):** El frontend recopila el historial de conversación (últimos 10 mensajes) y el nuevo mensaje ingresado, luego los envía mediante una solicitud HTTP `POST` a `/api/chat`.
2. **Servidor (Express):** El backend `/server.ts` recibe la solicitud, inicializa de forma segura el SDK de `@google/genai` con la credencial `process.env.GEMINI_API_KEY` en el servidor (nunca visible en el navegador client-side) de forma perezosa (*lazy*), y le envía las directrices del sistema de BMO.
3. **Esquema de Salida JSON:** El modelo Gemini entrega un objeto estructurado que contiene:
   - `text`: La respuesta escrita.
   - `expression`: La emoción ideal para acompañar el mensaje (ej. `excited`, `sad`, `blushing`, `sleepy`, `angry`).

---

## 🎬 Reproducción en Pantalla (Mouth-Speaking Synchronization)

Para que BMO mueva la boca al compás del audio hablado real de manera fluida y armónica:

1. **Detección de Narración Real:** El cliente utiliza las rutinas de la API nativa de Síntesis de Voz del Navegador (`window.speechSynthesis`).
2. **Eventos `onstart` y `onend`:** Al iniciar la lectura del párrafo, se establece el estado global `isAudioSpeaking` a `true`. Al culminar la lectura el evento `onend` lo restablece a `false` inmediatamente y BMO retorna a su rostro tranquilo por defecto (`idle`).
3. **Animación en SVG:** El componente `/src/components/BmoScreen.tsx` escucha el indicador `isAudioSpeaking`. Si es positivo, ejecuta una animación oscilatoria mediante un vector de escala en boca (`scaleY` o `d` path), emulando un ritmo de de habla dinámico cartoon.

---

## 🚀 Modos de Pantalla y Configuración (`TERMINATED`)

La aplicación cuenta con una constante central llamada `TERMINATED` (ubicada en `/src/App.tsx`) que modifica el comportamiento visual y la operativa de la pantalla completa del BMO de la siguiente manera:

### 1. Con `TERMINATED = false` (Modo Estándar / Desarrollo)
La aplicación carga la página completa con todas las herramientas de chat, tablero de sonido, selección de reacciones manuales y guía interactiva. 
- Al hacer clic sobre la pantalla de BMO, esta se expande a pantalla completa.
- **Control por Voz (Push-to-Talk):** Mantén presionada la pantalla para hablar (BMO cambia instantáneamente a la expresión de *pensando*). Al soltar la pantalla, el mensaje de voz es procesado y enviado.
- **Salida:** Un toque rápido / clic en la pantalla revela temporalmente (por 2 segundos) el botón de minimizar en la esquina superior izquierda para regresar al panel general.

### 2. Con `TERMINATED = true` (Modo Rostro Dedicado)
La interfaz completa se elimina y la aplicación arranca de forma inmediata directamente en modo pantalla completa, sirviendo como un portal de rostro puro y limpio.
- **Sin Controles:** No hay barras de navegación, campos de chat ni posibilidad de salir de la cara o minimizarla.
- **Control por Voz Activo:** Sigue operativa la función Push-to-Talk (mantener presionado para hablar y cambiar a expresión de *pensando*, soltar para enviar). El rostro se comporta como un dispositivo inteligente puro.

---

## 🔐 Variables de Entorno (Environment Variables)

Para ejecutar este proyecto de forma local o desplegarlo en producción, necesitas configurar las siguientes variables de entorno:

- **`GEMINI_API_KEY`**: Clave de API requerida para las llamadas a la Inteligencia Artificial de Gemini. En **AI Studio (Google Cloud)**, esta clave se inyecta de forma segura a nivel de servidor a través de la sección de Secretos, por lo que **nunca se expone ni se hardcodea en tu código frontend (cero fugas de tokens)**.
- **`APP_URL`**: La URL donde se hospeda tu aplicación para autoconsulta y verificación.

Puedes seguir la plantilla de ejemplo que dejamos en el archivo `.env.example` en la raíz del proyecto.
