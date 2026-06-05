# BMO Consola Interactiva - Versión Cartoon 🎮🤖

¡Bienvenido al repositorio de la Consola Interactiva de BMO! Este proyecto recrea con fidelidad absoluta los gestos, voz y encantadora personalidad de **BMO** de *Hora de Aventura*, impulsado por la API de **Gemini** y el motor de síntesis de voz del navegador.

Este proyecto ha sido mejorado y generado conjuntamente con **Google AI Studio**.

---

## 🔗 Enlaces Importantes
- **Repositorio Oficial (Jonagon16):** [https://github.com/Jonagon16/Bmo-modelo-react](https://github.com/Jonagon16/Bmo-modelo-react)
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

## 🚀 Modo Fullscreen "Solo la Cara" (Rostro Terminado)

Para una inmersión completa tipo cosplay o dispositivo dedicado, tienes a tu disposición un botón de **SOLO LA CARA**:

1. **Esconder Subtítulos y Controles:** Al activar este terminal, se oculta toda la interfaz web, el chat y el panel de control. No hace falta que se vea en pantalla el texto que está diciendo, permitiendo apreciar a BMO de forma unánime y limpia, sin textos explicativos ni avisos distractores de interfaz en la pantalla.
2. **Control Walkie-Talkie (Push-to-Talk) Intuitivo:**
   - Para evitar interferencias o falsos disparos del micrófono, la escucha se activa **manteniendo apretada la pantalla de BMO**. Al mantener pulsada la pantalla de BMO, el rostro cambia a la expresión de **pensando (thinking)**. Al soltarla, el mensaje se envía automáticamente.
3. **Gestos de Navegación y Salida Segura:**
   - Para salir del modo de pantalla completa sin interrumpir el flujo accidentalmente, dale **un toque rápido/clic a la pantalla**. Esto revelará un botón de minimizar (`Minimize2`) en la esquina superior izquierda que desaparecerá automáticamente después de 2 segundos. Debes pulsar este botón para volver al panel normal.

---

## 🔐 Variables de Entorno (Environment Variables)

Para ejecutar este proyecto de forma local o desplegarlo en producción, necesitas configurar las siguientes variables de entorno:

- **`GEMINI_API_KEY`**: Clave de API requerida para las llamadas a la Inteligencia Artificial de Gemini. En **AI Studio (Google Cloud)**, esta clave se inyecta de forma segura a nivel de servidor a través de la sección de Secretos, por lo que **nunca se expone ni se hardcodea en tu código frontend (cero fugas de tokens)**.
- **`APP_URL`**: La URL donde se hospeda tu aplicación para autoconsulta y verificación.

Puedes seguir la plantilla de ejemplo que dejamos en el archivo `.env.example` en la raíz del proyecto.
