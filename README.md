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

1. **Esconder Subtítulos y Controles:** Al activar este terminal, se oculta toda la interfaz web, el chat y el panel de control. No hace falta que se vea en pantalla el texto que está diciendo, permitiendo apreciar a BMO de forma unánime y limpia.
2. **Escucha y Reconocimiento de Voz Continuos:**
   - La pantalla ejecuta un circuito cerrado en bucle de reconocimiento de voz (`SpeechRecognition`).
   - El micrófono permanece activo, ignorando el propio audio cuando BMO habla para evitar el eco/bucle de retroalimentamiento.
3. **Palabra Clave de Activación (Wake Word):**
   - BMO te escuchará pacientemente. Solo responderá y enviará tus palabras a Gemini cuando digas su nombre: **"BMO"**, **"bimo"** o **"vimo"**.
4. **Respuestas Sintetizadas Cortas y Tiernas:**
   - En este modo de manos libres, la llamada al backend activa automáticamente la bandera `isShortMode`. El servidor instruye a Gemini a elaborar respuestas sumamente concisas y de una sola oración para emular un flujo conversacional rápido de asistente virtual.
