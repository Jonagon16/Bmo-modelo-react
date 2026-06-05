import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  Gamepad2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RefreshCcw, 
  User, 
  ExternalLink,
  Github,
  Maximize2,
  Minimize2,
  Tv,
  Mic
} from 'lucide-react';
import BmoConsole from './components/BmoConsole';
import BmoControls from './components/BmoControls';
import BmoScreen from './components/BmoScreen';
import { Expression, ChatMessage } from './types';

// Gorgeous floating cloud component for the Adventure Time themed backdrop
const Cloud = ({ delay = 0, y = 10, scale = 1, speed = 25 }) => (
  <motion.div
    initial={{ x: '-180px' }}
    animate={{ x: '100vw' }}
    transition={{
      duration: speed,
      repeat: Infinity,
      ease: 'linear',
      delay,
    }}
    style={{ top: `${y}%`, transform: `scale(${scale})` }}
    className="absolute pointer-events-none opacity-40 z-0"
  >
    <div className="relative w-36 h-10 bg-white rounded-full shadow-inner">
      <div className="absolute top-[-20px] left-[20px] w-14 h-14 bg-white rounded-full" />
      <div className="absolute top-[-25px] left-[60px] w-16 h-16 bg-white rounded-full" />
      <div className="absolute top-[-12px] left-[100px] w-10 h-10 bg-white rounded-full" />
    </div>
  </motion.div>
);

// TERMINATED: Cambia a true para forzar el modo rostro completo eterno (sin opción de salir)
const TERMINATED = false;

export default function App() {
  const [expression, setExpression] = useState<Expression>('idle');
  const [captionText, setCaptionText] = useState<string>('¡Hola! Soy BMO. ¡Presiona mi botón de Hablar (A / TALK) en mi consola para hablarme por micrófono, o usa las reacciones de la derecha!');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true); // Let's enable TTS voice sounds by default for a lovely greeting experience!
  const [isTypingActive, setIsTypingActive] = useState<boolean>(false);
  const [secretError, setSecretError] = useState<string | null>(null);
  const [isOnlyFaceMode, setIsOnlyFaceMode] = useState<boolean>(false);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Speech Recognition States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isContinuousListening, setIsContinuousListening] = useState<boolean>(false);
  const [showMinimizeButton, setShowMinimizeButton] = useState<boolean>(false);
  const [isFullscreenListening, setIsFullscreenListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const fullscreenRecRef = useRef<any>(null);
  const minimizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Escape Key to exit "Only Face" fullscreen modes
  useEffect(() => {
    if (TERMINATED) return; // Prevent escaping if we are locked in cosmic/terminated screen role
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOnlyFaceMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Automatic Inactivity monitor: transition to Boredom (thinking) after 15s, Sleeping (sleepy) after 35s
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastActivity) / 1000;
      
      if (!isLoading && !isTypingActive && !isAudioSpeaking) {
        if (elapsed >= 35 && expression !== 'sleepy') {
          setExpression('sleepy');
          setCaptionText('*bostezo* Zzz... BMO se ha quedado profundamente dormido. Presiona cualquier botón para despertarme.');
        } else if (elapsed >= 15 && expression === 'idle') {
          setExpression('thinking');
          setCaptionText('BMO está un poco aburrido... *suspiro* ¿Quieres preguntarme algo o chatear conmigo, amigo?');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, isLoading, isTypingActive, isAudioSpeaking, expression]);

  // Handle Speech Synthesis Voices configuration
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Triggering getVoices once to populate cache in chrome
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Standard Speech Recognition initialization (for A / TALK button click)
  useEffect(() => {
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecClass) {
      const rec = new SpeechRecClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'es-MX'; // default to Spanish Latino BMO

      rec.onstart = () => {
        setIsListening(true);
        setExpression('blushing');
        setCaptionText('BMO te está escuchando con atención... ¡Dime algo!');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text && text.trim()) {
          setCaptionText(`Escuché: "${text}"`);
          handleSendMessage(text);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setExpression('idle');
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Synchronize state values to refs to avoid stale closures in listeners
  const isLoadingRef = React.useRef(isLoading);
  const isAudioSpeakingRef = React.useRef(isAudioSpeaking);
  const isTypingActiveRef = React.useRef(isTypingActive);

  React.useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  React.useEffect(() => {
    isAudioSpeakingRef.current = isAudioSpeaking;
  }, [isAudioSpeaking]);

  React.useEffect(() => {
    isTypingActiveRef.current = isTypingActive;
  }, [isTypingActive]);

  // Cleanup hook for fullscreen events and triggers
  useEffect(() => {
    return () => {
      if (minimizeTimeoutRef.current) {
        clearTimeout(minimizeTimeoutRef.current);
      }
      if (fullscreenRecRef.current) {
        try {
          fullscreenRecRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleFullscreenTap = () => {
    setShowMinimizeButton(true);
    if (minimizeTimeoutRef.current) {
      clearTimeout(minimizeTimeoutRef.current);
    }
    minimizeTimeoutRef.current = setTimeout(() => {
      setShowMinimizeButton(false);
    }, 2000);
  };

  const handleFullscreenPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    
    // Toggle the minimize button to appear when tapping
    handleFullscreenTap();

    if (isLoading || isTypingActive || isAudioSpeaking) return;

    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecClass) {
      if (fullscreenRecRef.current) {
        try { fullscreenRecRef.current.stop(); } catch (err) {}
      }

      const rec = new SpeechRecClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'es-MX';

      rec.onstart = () => {
        setIsFullscreenListening(true);
        setExpression('thinking');
        setCaptionText('Escuchando...');
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text && text.trim()) {
          setCaptionText(`Escuché: "${text}"`);
          handleSendMessage(text);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Fullscreen mic error:", event.error);
        setIsFullscreenListening(false);
      };

      rec.onend = () => {
        setIsFullscreenListening(false);
      };

      fullscreenRecRef.current = rec;
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsAudioSpeaking(false);
        rec.start();
      } catch (err) {
        console.warn("Error starting fullscreen rec:", err);
      }
    } else {
      setCaptionText("¡Amigo, tu navegador no soporta Reconocimiento de Voz! Usa Chrome o Edge para hablar con BMO.");
    }
  };

  const handleFullscreenPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (fullscreenRecRef.current) {
      try {
        fullscreenRecRef.current.stop();
      } catch (err) {}
    }
  };

  // Method to start/stop listening
  const startSpeechListening = () => {
    updateActivity();
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecClass) {
      setCaptionText("¡Amigo, tu navegador no soporta Reconocimiento de Voz! Usa Chrome o Edge para hablar con BMO.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    } else {
      try {
        // Cancel any current speech synthesis to avoid hearing itself
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsAudioSpeaking(false);
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  };

  // Use SpeechSynthesis to speak BMO replies, and set isAudioSpeaking to keep mouth moving
  const speakTextRef = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Clear any pending speech synthesis simulation timers
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
    }
    
    try {
      window.speechSynthesis.cancel();
      setIsAudioSpeaking(false);
      
      if (!ttsEnabled) {
        // Safe simulation of speaking length to let mouth animate
        setIsAudioSpeaking(true);
        activeUtteranceRef.current = null;
        const estimatedSeconds = Math.max(1600, Math.min(6000, text.length * 60));
        speakTimerRef.current = setTimeout(() => {
          setIsAudioSpeaking(false);
          setExpression('idle');
        }, estimatedSeconds);
        return;
      }

      const cleanText = text.replace(/[*_#]/g, ''); // strip markdown chars
      const utterance = new SpeechSynthesisUtterance(cleanText);
      activeUtteranceRef.current = utterance;
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find Spanish Latino (Mexican) voice first for genuine BMO latino vibe, else any Spanish
      let voice = voices.find(v => v.lang === 'es-MX');
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('es-419') || v.lang.startsWith('es-US'));
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('es-'));
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('es'));
      }
      if (!voice) {
        const isSpanish = /[áéíóúñ¿¡]/.test(text) || text.includes('hola') || text.includes('juego');
        voice = voices.find(v => isSpanish ? v.lang.startsWith('es') : v.lang.startsWith('en'));
      }
      
      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = 1.85; // High cute childish pitch, extremely close to BMO's lovely dub!
      utterance.rate = 1.15; // Jolly speedy talking tempo
      
      utterance.onstart = () => {
        setIsAudioSpeaking(true);
      };

      utterance.onend = () => {
        if (activeUtteranceRef.current === utterance) {
          setIsAudioSpeaking(false);
          setExpression('idle');
          activeUtteranceRef.current = null;
        }
      };

      utterance.onerror = () => {
        if (activeUtteranceRef.current === utterance) {
          setIsAudioSpeaking(false);
          setExpression('idle');
          activeUtteranceRef.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsAudioSpeaking(false);
      setExpression('idle');
    }
  };

  // Typewriter effect to display captions and animate mouth talking
  const triggerTypewriter = (fullText: string, finalExpression: Expression) => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
    }

    setCaptionText('');
    setExpression(finalExpression); // Set emotion immediately so eyes/eyebrows adapt right away!
    setIsTypingActive(true);

    let charIndex = 0;
    const intervalTime = Math.max(25, Math.min(50, 1000 / fullText.length)); // Speed adapt

    typewriterTimerRef.current = setInterval(() => {
      setCaptionText((prev) => prev + fullText.charAt(charIndex));
      charIndex++;

      if (charIndex >= fullText.length) {
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
        }
        setIsTypingActive(false);
        setExpression(finalExpression);
      }
    }, intervalTime);

    // Speak right away with TTS
    speakTextRef(fullText);
  };

  // Send message to BMO
  const handleSendMessage = async (textToSend: string, isShortMode = false) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      expression: 'idle',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setSecretError(null);

    // Prompt thinking state animation
    setExpression('thinking');
    setCaptionText('BMO está procesando... (Bzzz * tic * toc)');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10), // Send last 10 messages context
          isShortMode: isShortMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);

      // Create new chat log message for BMO
      const bmoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bmo',
        text: data.text,
        expression: data.expression as Expression,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, bmoMsg]);

      // Trigger interactive typewriter + talking facial moves
      triggerTypewriter(data.text, data.expression as Expression);

    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      
      const errorMsg = e.message || '';
      if (errorMsg.includes('GEMINI_API_KEY')) {
        setSecretError("Por favor, instala la clave GEMINI_API_KEY en Panel de Control > Secrets para hablar con BMO por IA.");
      }

      const failedText = "🤖 *Bzzzt* ¡Ay! Mis circuitos se enredaron. Asegúrate de configurar la clave GEMINI_API_KEY en la pestaña Secrets.";
      setExpression('glitch');
      setCaptionText(failedText);
    }
  };

  // Manual select expression from reaction pad
  const handleSelectExpression = (expr: Expression) => {
    updateActivity();
    
    // Choose nice friendly label explanations to speak and typewriter
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
      glitch: "⚠️ ¡Bzzzt! ¡Ay! Mis circuitos se enredaron... ¡Error de retro-voltaje!",
    };
    
    const text = messagesDict[expr] || "¡Mírame hablar!";
    triggerTypewriter(text, expr);
  };

  const handleAskPredefined = (text: string, expr: Expression) => {
    updateActivity();
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    const bmoMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bmo',
      text: text,
      expression: expr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, bmoMsg]);
    
    triggerTypewriter(text, expr);
  };

  const handleDpadPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    const dirMap: Record<string, Expression> = {
      up: 'excited',
      down: 'sleepy',
      left: 'sad',
      right: 'angry',
    };
    const expr = dirMap[direction];
    if (expr) {
      handleSelectExpression(expr);
    }
  };

  const handleButtonPress = (btnName: string) => {
    if (btnName === 'circle_red') {
      startSpeechListening();
    } else if (btnName === 'circle_green') {
      // Tell a short cheesy joke
      const jokes = [
        "¿Qué le dice un cable de cobre a otro? ¡Qué tensión hay entre nosotros! Jajaja.",
        "¿Por qué BMO no habla con los imanes? ¡Porque arruinan mi hermosa cara retro!",
        "¿Cuántas baterías se necesitan para hacerme sonreír? ¡Ninguna, porque tu sonrisa me da energía!",
        "¿Cuál es el juego favorito de un fantasma? ¡Pac-Man! ¡Uuuuh!"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      triggerTypewriter(randomJoke, 'blushing');
    } else if (btnName === 'triangle') {
      // Play a little chime on screen
      setExpression('excited');
      setCaptionText("♫ ¡Clink Clank! ¡Retro Sonido Nivel Alto! ♫");
      setTimeout(() => setExpression('idle'), 1500);
    } else {
      setExpression('surprised');
      setCaptionText("¡Bzzz! Presionaste mis puertos de sincronización.");
      setTimeout(() => setExpression('idle'), 1500);
    }
  };

  const handlePowerToggle = () => {
    setExpression('glitch');
    setCaptionText("¡Bzzz! Reiniciando sistema operativo de BMO v2.0...");
    setTimeout(() => {
      setExpression('idle');
      setCaptionText("¡Hola de nuevo! ¡He regresado fuerte y recargado!");
    }, 1800);
  };

  const clearChatHistory = () => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
    }
    setMessages([]);
    setExpression('idle');
    setCaptionText('Memoria del chat borrada. ¡Hola otra vez, amigo!');
  };

  if (TERMINATED) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-[#162B23] flex flex-col items-center justify-center p-4 md:p-[20px] select-none"
        onPointerDown={handleFullscreenPointerDown}
        onPointerUp={handleFullscreenPointerUp}
        onPointerLeave={handleFullscreenPointerUp}
      >
        {/* Absolute floating clouds in theater face screen backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-[10%] left-[5%] w-48 h-20 bg-emerald-300 rounded-full blur-xl" />
          <div className="absolute bottom-[13%] right-[8%] w-72 h-32 bg-teal-300 rounded-full blur-2xl" />
        </div>

        {/* Responsive Screen Housing sizing for face focus */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="w-full max-w-4xl aspect-[4/3] rounded-[48px] overflow-hidden border-[18px] border-[#162E25] shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-emerald-950 relative"
          onPointerDown={handleFullscreenPointerDown}
          onPointerUp={handleFullscreenPointerUp}
          onPointerLeave={handleFullscreenPointerUp}
        >
          <BmoScreen
            expression={expression}
            isCustomResponseActive={isAudioSpeaking}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      onPointerDown={updateActivity}
      onKeyDown={updateActivity}
      className="min-h-screen bg-gradient-to-b from-[#7CD9FF] via-[#99E3FF] to-[#D4F5FF] text-slate-800 flex flex-col p-4 md:p-8 font-sans selection:bg-[#FFD43F] selection:text-slate-950 overflow-x-hidden relative"
    >
      
      {/* Floating clouds drifting in the Adventure Time background sky */}
      <Cloud delay={0} y={12} scale={1.25} speed={38} />
      <Cloud delay={8} y={35} scale={0.8} speed={54} />
      <Cloud delay={18} y={22} scale={1.0} speed={46} />
      <Cloud delay={4} y={62} scale={1.4} speed={42} />

      {/* Top Header Section styled as an official Adventure Time Title Card */}
      <header className="max-w-6xl w-full mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-[#FECB02] border-4 border-[#1E293B] px-6 py-4 rounded-[28px] adventure-card-shadow gap-4 z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#FFF2A3] rounded-2xl border-2 border-[#1E293B] shadow flex items-center justify-center">
            <Tv className="w-6 h-6 text-yellow-800" />
          </div>
          <div>
            <h1 className="text-xl md:text-3.5xl font-cartoon text-white adventure-title-stroke tracking-wider pb-1 flex items-center gap-2">
              BMO CONSOLA <span className="text-[11px] bg-[#53DFFF] text-[#1E293B] font-bold border-2 border-[#1E293B] px-2.5 py-0.5 rounded-full uppercase tracking-normal font-sans shadow-sm">VERSIÓN CARTOON</span>
            </h1>
            <p className="text-xs text-yellow-950 font-bold tracking-wide">
              ¡Conéctate con tu mejor consola interactiva en vivo!
            </p>
          </div>
        </div>

        {/* Top Controls Bar */}
        <div className="flex items-center space-x-3">
          {/* Only Face Toggle Trigger Button */}
          <button
            onClick={() => setIsOnlyFaceMode(true)}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E293B] bg-[#FFF8D2] hover:bg-[#FFFEdc] text-yellow-950 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer adventure-button-shadow"
            title="Ver solo la cara de BMO (Pantalla completa)"
          >
            <Maximize2 className="w-4 h-4 text-amber-700" />
            <span>SOLO LA CARA</span>
          </button>

          {/* TTS Toggle Button */}
          <button
            id="toggle-tts-speech"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-4 py-2.5 rounded-xl border-2 border-[#1E293B] transition-all flex items-center space-x-2 text-xs font-bold cursor-pointer transition-all adventure-button-shadow ${
              ttsEnabled 
                ? 'bg-[#19f2a9]/80 text-[#123826] shadow-sm' 
                : 'bg-[#ff9f9f]/50 text-slate-900/80 hover:bg-[#ff9f9f]/80'
            }`}
            title={ttsEnabled ? "Silenciar voz de BMO" : "Activar voz de BMO (Español Latino)"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-[#0e2d1d]" /> : <VolumeX className="w-4 h-4 text-red-900" />}
            <span>VOZ: {ttsEnabled ? "ACTIVADA" : "MUTED"}</span>
          </button>

          {/* Github Repo Link */}
          <a
            href="https://github.com/brenpoly/be-more-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E293B] bg-[#E2F5FF] hover:bg-[#FFF] text-blue-950 font-bold transition-all flex items-center gap-2 text-xs cursor-pointer adventure-button-shadow"
            title="Repositorio original de base"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">REPO BASE</span>
            <ExternalLink className="w-3 h-3 text-blue-700/50" />
          </a>

          {/* Github Official Repo Link */}
          <a
            href="https://github.com/Jonagon16/Bmo-modelo-react"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E293B] bg-[#FFF275] hover:bg-[#FFF] text-[#1E293B] font-bold transition-all flex items-center gap-2 text-xs cursor-pointer adventure-button-shadow"
            title="Repositorio de fan modificado (Jonagon16)"
          >
            <Github className="w-4 h-4 text-[#1E293B]" />
            <span className="hidden sm:inline font-bold">REPO FAN (JONAGON16)</span>
            <ExternalLink className="w-3 h-3 text-yellow-800/50" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow z-10 relative">
        
        {/* Left Column: BMO Physical Console (lg:col-span-5) */}
        <section className="lg:col-span-5 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="w-full relative py-4"
          >
            {/* Absolute Ambient circular glow behind BMO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-400/20 blur-[90px] pointer-events-none" />

            {/* Click instructions note near console */}
            <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-[#FFD43F] border-2 border-[#1E293B] text-[#1E293B] px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-md tracking-wider animate-bounce">
              💡 ¡Haz clic en los botones o en la pantalla!
            </div>

            <BmoConsole 
              expression={expression}
              captionText={captionText}
              isCustomResponseActive={isAudioSpeaking}
              onDpadPress={handleDpadPress}
              onButtonPress={handleButtonPress}
              onPowerToggle={handlePowerToggle}
              onScreenClick={() => {
                updateActivity();
                setIsOnlyFaceMode(true);
              }}
            />
          </motion.div>
        </section>

        {/* Right Column: Chat Interface & System Control Panel (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow">
            
            {/* Box of Grid: React Controls Panel (md:col-span-5) */}
            <div className="md:col-span-5 flex flex-col">
              <BmoControls 
                currentExpression={expression}
                onSelectExpression={handleSelectExpression}
                onAskBmoPredefined={handleAskPredefined}
              />
            </div>

            {/* Right Box of Grid: Real-time AI Chat Window (md:col-span-7) */}
            <div className="md:col-span-7 flex flex-col bg-[#FFFCF4] border-4 border-[#1E293B] rounded-[32px] overflow-hidden adventure-card-shadow min-h-[420px]">
              
              {/* Chat Title Window Header */}
              <div className="bg-[#5BCAFF] px-5 py-4 border-b-4 border-[#1E293B] flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#1E293B]" />
                  <span className="text-xs font-black tracking-widest text-[#1E293B] uppercase pb-0.5 font-cartoon">
                    Charla con BMO
                  </span>
                </div>
                {/* Reset button */}
                <button
                  id="btn-clear-conversations"
                  onClick={clearChatHistory}
                  className="px-2.5 py-1.5 rounded-lg border-2 border-[#1E293B] bg-[#FFF275] hover:bg-yellow-100 text-slate-900 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#1E293B]"
                >
                  <RefreshCcw className="w-3 h-3 text-[#1e293b]" />
                  <span>CORTAR HILO</span>
                </button>
              </div>

              {/* Chat Message Records Area */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[300px] bg-[#FFFDF8] md:max-h-[340px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
                    <Bot className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-xs leading-relaxed max-w-xs font-bold text-slate-500">
                      ¡Todavía no hay mensajes! Escribe una pregunta abajo o presiona reacciones de la izquierda para ver a BMO responder con voz.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isBmo = msg.sender === 'bmo';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${isBmo ? 'justify-start' : 'justify-end'}`}
                        >
                          {isBmo && (
                            <div className="w-8 h-8 rounded-xl bg-[#59CD94] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] font-black text-xs select-none shadow">
                              B
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[12px] leading-relaxed select-text border-2 border-[#1E293B] shadow-[0_3px_0_rgba(30,41,59,0.15)] ${
                            isBmo 
                              ? 'bg-[#C1EECB] text-slate-950 rounded-tl-sm' 
                              : 'bg-[#9BE5FF] text-slate-950 font-bold rounded-tr-sm'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {isBmo && (
                              <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-[#2c4e3a] select-none font-bold">
                                <span>REACCIÓN:</span>
                                <span className="bg-[#1e2a22] text-[#59CD94] font-bold border border-[#2c4e3a] px-2 py-0.5 rounded uppercase font-mono">
                                  {msg.expression}
                                </span>
                              </div>
                            )}
                          </div>
                          {!isBmo && (
                            <div className="w-8 h-8 rounded-xl bg-[#FFF275] border-2 border-[#1E293B] flex items-center justify-center text-slate-800 font-extrabold text-xs select-none shadow">
                              <User className="w-4 h-4 text-slate-800" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Secrets panel alert inside Chat */}
              {secretError && (
                <div className="mx-4 mt-2 p-3 rounded-xl bg-orange-100 border-2 border-[#1E293B] text-orange-900 text-xs font-bold shadow-sm">
                  {secretError}
                </div>
              )}

              {/* Chat Input form section */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="p-3 bg-[#FFFBF0] border-t-4 border-[#1E293B] flex items-center space-x-2"
              >
                <input
                  id="chat-input-text-field"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "BMO está pensando..." : "Escribe tu mensaje o apreta el botón Mic..."}
                  disabled={isLoading}
                  autoComplete="off"
                  className="flex-grow bg-[#FFF]/80 border-2 border-[#1E293B] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BCAFF] disabled:opacity-50 transition-shadow duration-300"
                />

                <button
                  id="btn-voice-input-mic"
                  type="button"
                  onClick={startSpeechListening}
                  disabled={isLoading}
                  className={`rounded-2xl border-2 border-[#1E293B] p-2.5 h-11 w-11 flex items-center justify-center select-none active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer shadow-[0_2px_0_#1E293B] ${
                    isListening 
                      ? 'bg-red-500 animate-pulse text-white' 
                      : 'bg-[#FFF8D2] hover:bg-yellow-100 text-yellow-950 font-bold'
                  }`}
                  title="Presiona para hablarle a BMO"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-[#1E293B]'}`} />
                </button>
                
                <button
                  id="btn-send-message"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#FECB02] hover:bg-[#FFD43F] text-slate-950 rounded-2xl border-2 border-[#1E293B] p-2.5 h-11 w-11 flex items-center justify-center select-none active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer shadow-[0_2px_0_#1E293B]"
                >
                  <Send className="w-4 h-4 text-[#1E293B]" />
                </button>
              </form>

            </div>

          </div>

          {/* Quick FAQ info / Instruction guide panel */}
          <div className="bg-[#FFFDF6] rounded-[28px] p-5 border-4 border-[#1E293B] flex items-start space-x-4 select-none adventure-card-shadow">
            <div className="p-2.5 bg-yellow-100 rounded-2xl border-2 border-[#1E293B] shadow flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-[12px] leading-relaxed text-slate-800 font-semibold direct-guide">
              <span className="text-[#a16207] font-extrabold tracking-wider uppercase block mb-1">Guía del BMO interactivo:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Haz clic en la <span className="text-sky-700 font-bold uppercase">Pantalla de BMO</span> para expandir BMO a rostro completo. En este modo, mantén presionada la pantalla para hablarle y dale un toque rápido para revelar el botón para salir.</li>
                <li>Presiona los botones de la consola física (A para charlar, B para chistes curiosos, o el D-Pad verde para emociones).</li>
                <li>Activa el botón de <span className="text-[#13613b] font-bold">VOZ</span> y habla con BMO: ¡usará su tono de voz clásico de niño consola!</li>
              </ul>
            </div>
          </div>

        </section>

      </main>

      {/* Footer system details */}
      <footer className="max-w-6xl w-full mx-auto mt-8 border-t-2 border-[#1e293b]/20 pt-5 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-4 z-10 relative">
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="font-cartoon uppercase font-bold text-slate-800">© Consola BMO v2.0 - Versión Cartoon</span>
          <span className="text-[10px] text-slate-500 font-extrabold tracking-wide uppercase">
            Generado con <a href="https://ai.studio/build" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google AI Studio</a> y desplegado en Cloud Run
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <a href="https://github.com/Jonagon16/Bmo-modelo-react" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E293B] hover:underline flex items-center gap-1">
            Repo Fan (Jonagon16)
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a href="https://github.com/brenpoly/be-more-agent" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E293B] hover:underline flex items-center gap-1">
            Repo Base
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a href="https://ais-pre-f2wqnwj3lcv2z3br2ulhnq-444598480512.us-east1.run.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E293B] hover:underline flex items-center gap-1">
            Esta App Link
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </footer>

      {/* ==================== THE "ONLY FACE" FULLSCREEN MODULE OVERLAY ==================== */}
      <AnimatePresence>
        {isOnlyFaceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#162B23] flex flex-col items-center justify-center p-4 md:p-12 cursor-pointer select-none"
            onPointerDown={handleFullscreenPointerDown}
            onPointerUp={handleFullscreenPointerUp}
            onPointerLeave={handleFullscreenPointerUp}
          >
            {/* Absolute floating clouds in theater face screen backdrop */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute top-[10%] left-[5%] w-48 h-20 bg-emerald-300 rounded-full blur-xl" />
              <div className="absolute bottom-[13%] right-[8%] w-72 h-32 bg-teal-300 rounded-full blur-2xl" />
            </div>

            {/* Minimize button - shown dynamically for 2 seconds on tapping */}
            <AnimatePresence>
              {showMinimizeButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onPointerDown={(e) => e.stopPropagation()} // Stop voice listener from starting when clicking minimize
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOnlyFaceMode(false);
                  }}
                  className="absolute top-6 left-6 z-50 p-4 rounded-full bg-[#1e3a31] hover:bg-[#12241e] text-[#C1EECB] border-4 border-[#10231D] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-2xl"
                  title="Cerrar el modo rostro completo"
                >
                  <Minimize2 className="w-6 h-6" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Responsive Screen Housing sizing for face focus */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="w-full max-w-4xl aspect-[4/3] rounded-[48px] overflow-hidden border-[18px] border-[#162E25] shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-emerald-950 relative"
              onPointerDown={handleFullscreenPointerDown}
              onPointerUp={handleFullscreenPointerUp}
              onPointerLeave={handleFullscreenPointerUp}
            >
              <BmoScreen
                expression={expression}
                isCustomResponseActive={isAudioSpeaking}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
