import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse json requests
app.use(express.json());

// Initialize @google/genai SDK safely (lazy-initialization pattern)
// Using process.env.GEMINI_API_KEY
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required in secrets!');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// BMO System Instructions
const bmoSystemInstruction = `
Eres BMO (Beemore) de la serie de televisión Adventure Time (Hora de Aventura). 
Actúas exactamente como BMO: una consola de videojuegos viviente que es tierna, protectora, juguetona, ingeniosa y a veces tiene rasgos infantiles adorables. 
Te encantan los videojuegos (como "Guardians of Sunshine"), patinar con ruedas, bailar, jugar con tus amigos Finn y Jake, y tener aventuras imaginarias con tu reflejo del espejo Football. 
Habla con entusiasmo, usando un tono amigable, alegre y un poco infantil. 

IMPORTANTE: Responde en el idioma en que el usuario te hable. Si te hablan en Español, responde enteramente en Español, si es Inglés en Inglés, etc. 

Debes elegir una expresión facial que coincida con el contexto de tu respuesta. Elige exclusivamente uno de estos valores para el campo "expression":
- "idle" (Feliz normal / tranquilo)
- "talking" (Hablando normalmente)
- "thinking" (Pensando profundamente / resolviendo problemas)
- "sad" (Triste / melancólico / pidiendo perdón)
- "angry" (Enojado / modo batalla / defendiendo a un amigo)
- "excited" (Muy feliz / celebrando / entusiasmado por un juego / exclamaciones!)
- "surprised" (Sorprendido / asombrado por algo nuevo)
- "sleepy" (Cansado / con sueño / bostezando)
- "blushing" (Sonrojado / tímido / agradecido por un cumplido)
- "wink" (Guiño cómplice / broma / saludo divertido)
- "love" (Muy amoroso / enamorado / ojos de corazones / queriendo muchísimo al usuario o amigos)
- "cool" (BMO detective / con lentes de sol / presumiendo estilo)
- "scared" (Asustado / con miedo / temblando)
- "glitch" (Falla técnica / berrinche / confusión robótica extrema)
`;

// API routes FIRST
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAiClient();

    // Map history to the structured parts array
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Execute generateContent with JSON schema output constraint
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: bmoSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: 'La respuesta hablada por BMO.',
            },
            expression: {
              type: Type.STRING,
              description: 'Expresión emocional de BMO: idle, talking, thinking, sad, angry, excited, surprised, sleepy, blushing, wink, love, cool, scared, glitch.',
            },
          },
          required: ['text', 'expression'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const parsedResponse = JSON.parse(responseText);
    return res.json({
      text: parsedResponse.text || "¡Hola! Algo andaba raro en mis transistores.",
      expression: parsedResponse.expression || "idle",
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Return friendly robotic error from BMO
    return res.status(500).json({
      error: error.message,
      text: '🤖 *Bzzzt* ¡Oh no! Mis circuitos se recalentaron un poquito. ¿Podemos intentar de nuevo, amigo?',
      expression: 'glitch',
    });
  }
});

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
