import React from 'react';
import { Expression } from '../types';
import { 
  Smile, 
  MessageSquareCode, 
  BrainCircuit, 
  Frown, 
  Angry, 
  Sparkles, 
  Eye, 
  Moon, 
  Heart, 
  Radio, 
  Wand2,
  Glasses,
  Ghost,
  EyeOff
} from 'lucide-react';

interface BmoControlsProps {
  currentExpression: Expression;
  onSelectExpression: (expr: Expression) => void;
  onAskBmoPredefined: (text: string, expression: Expression) => void;
}

export default function BmoControls({
  currentExpression,
  onSelectExpression,
  onAskBmoPredefined,
}: BmoControlsProps) {

  const expressionsList: { value: Expression; label: string; color: string; icon: React.ReactNode }[] = [
    { value: 'idle', label: 'Idle / Feliz', color: 'bg-teal-500 hover:bg-teal-600 shadow-teal-700/40', icon: <Smile className="w-4 h-4" /> },
    { value: 'talking', label: 'Hablando', color: 'bg-blue-500 hover:bg-blue-600 shadow-blue-700/40', icon: <MessageSquareCode className="w-4 h-4" /> },
    { value: 'thinking', label: 'Pensando', color: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-700/40', icon: <BrainCircuit className="w-4 h-4" /> },
    { value: 'sad', label: 'Triste', color: 'bg-amber-600 hover:bg-amber-700 shadow-amber-800/40', icon: <Frown className="w-4 h-4" /> },
    { value: 'angry', label: 'Enojado', color: 'bg-red-500 hover:bg-red-600 shadow-red-700/40', icon: <Angry className="w-4 h-4" /> },
    { value: 'excited', label: 'Entusiasmado', color: 'bg-violet-500 hover:bg-violet-600 shadow-violet-700/40', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'surprised', label: 'Sorprendido', color: 'bg-sky-500 hover:bg-sky-600 shadow-sky-700/40', icon: <Eye className="w-4 h-4" /> },
    { value: 'sleepy', label: 'Dormido', color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-800/40', icon: <Moon className="w-4 h-4" /> },
    { value: 'blushing', label: 'Chiviado', color: 'bg-pink-500 hover:bg-pink-600 shadow-pink-700/40', icon: <Heart className="w-4 h-4" /> },
    { value: 'wink', label: 'Guiño', color: 'bg-teal-600 hover:bg-teal-700 shadow-teal-800/40', icon: <EyeOff className="w-4 h-4" /> },
    { value: 'love', label: 'Enamorado', color: 'bg-red-600 hover:bg-red-700 shadow-red-800/40', icon: <Heart className="w-4 h-4" /> },
    { value: 'cool', label: 'Detective / Cool', color: 'bg-slate-600 hover:bg-slate-700 shadow-slate-800/40', icon: <Glasses className="w-4 h-4" /> },
    { value: 'scared', label: 'Asustado', color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-700/40', icon: <Ghost className="w-4 h-4" /> },
    { value: 'glitch', label: 'Falla / Glitch', color: 'bg-zinc-800 hover:bg-zinc-900 border border-red-500 text-red-400 shadow-red-950/40', icon: <Radio className="w-4 h-4" /> },
  ];
  const predefinedScenarios = [
    { title: "🎮 ¿Quién quiere videojuegos?", text: "¿Quién quiere jugar videojuegos?", expression: "excited", episode: "Fantasía de un día lluvioso" },
    { title: "🔋 Batería baja, apagando", text: "Batería baja. Apagando.", expression: "sleepy", episode: "Fantasía de un día lluvioso" },
    { title: "💻 ¡Esto sí computa!", text: "¡Esto sí computa!", expression: "excited", episode: "Creadores de videos" },
    { title: "📸 ¡BMO es una cámara!", text: "¡BMO es una cámara!", expression: "cool", episode: "La conquista de la lindura" },
    { title: "🌟 Encontrar la luz", text: "Cuando pasan cosas malas... debemos encontrar la luz.", expression: "thinking", episode: "Escalofríos" },
    { title: "😾 Protegeré a Finn", text: "Si alguien intenta herir a Finn... lo mataré.", expression: "angry", episode: "Amor ardiente" },
    { title: "🥋 Inclínate ante tu sensei", text: "Inclínate ante tu sensei.", expression: "cool", episode: "¡Te tengo!" },
    { title: "👊 ¡Golpe de BMO!", text: "¡Golpe de BMO! Si esto fuera un ataque real, estarías muerto.", expression: "angry", episode: "Guerra de cartas" },
    { title: "🐶 ¡Perritos! ¡Perritos!", text: "¡Perritos! ¡Perritos! ¡Perritos!", expression: "love", episode: "Jake el papá" },
    { title: "🤪 ¡Finn tontuelo!", text: "¡Finn, eres un tonto-tonto-tonto-tontuelo pajaruelo!", expression: "sad", episode: "Ser más" },
    { title: "🐣 ¡BMO siempre regresa!", text: "Creo que estoy muriendo. ¡Pero no importa, BMO siempre regresa!", expression: "wink", episode: "Tierras Lejanas: BMO" },
    { title: "🎉 ¡Maté a Jake! ¡Viva BMO!", text: "¡Maté a Jake! ¡Viva BMO!", expression: "excited", episode: "Aventura tonta" },
    { title: "🎨 ¡Mi arte es un arma!", text: "¡Mi arte es un arma!", expression: "surprised", episode: "BMO Artista" },
    { title: "☀️ No tuve sueños", text: "Buenos días a todos. Hoy no tuve ningún sueño.", expression: "idle", episode: "Despertar" },
    { title: "🕵️‍♂️ Conozco esa mirada", text: "Conozco esa mirada... Acabas de liquidar a alguien.", expression: "cool", episode: "Modo Detective" }
  ];

  return (
    <div className="w-full bg-[#FFFCEB] border-4 border-[#1E293B] rounded-[32px] p-5 adventure-card-shadow flex flex-col justify-between h-full select-none text-slate-800">
      <div>
        {/* Panel Header */}
        <div className="flex items-center space-x-2.5 mb-4 border-b-2 border-slate-200/80 pb-3">
          <div className="p-1 px-1.5 bg-[#FFF] border-2 border-[#1E293B] rounded-lg">
            <Wand2 className="w-4 h-4 text-amber-500 animate-bounce" />
          </div>
          <h2 className="text-sm font-cartoon tracking-wider text-slate-800">
            Control de Reacciones
          </h2>
        </div>

        {/* Reaction Tester Section */}
        <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-3">
          Haz clic para cambiar instantáneamente la expresión facial de BMO. Las transiciones de ojos, cejas, boca y mejillas son fluidas y dinámicas. 
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {expressionsList.map((expr) => {
            const isActive = currentExpression === expr.value;
            return (
              <button
                key={expr.value}
                id={`btn-react-${expr.value}`}
                onClick={() => onSelectExpression(expr.value)}
                className={`py-2 px-3 rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer transition-all duration-300 select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-2 border-[#1E293B] ${
                  isActive 
                    ? 'ring-4 ring-[#5BCAFF] brightness-110 scale-[0.98]' 
                    : 'brightness-95 hover:brightness-100 hover:scale-[1.02]'
                } ${expr.color}`}
              >
                <span className={isActive ? 'text-white' : 'opacity-90'}>{expr.icon}</span>
                <span className="truncate">{expr.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic AI Prompts Quick buttons */}
        <div className="border-t-2 border-slate-200/80 pt-4">
          <h3 className="text-sm font-cartoon tracking-wider text-slate-800 mb-2">
            Escenarios de IA Rápidos
          </h3>
          <p className="text-[10.5px] text-slate-600 font-bold leading-relaxed mb-3">
            Inicia un diálogo rápido para ver a BMO responder con voz y adaptar su emoción por inteligencia artificial de forma automática.
          </p>

          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 flex flex-col scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {predefinedScenarios.map((sc, i) => (
              <button
                key={i}
                id={`btn-quick-prompt-${i}`}
                onClick={() => onAskBmoPredefined(sc.text, sc.expression as Expression)}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-[#FFF] border-2 border-[#1E293B] hover:bg-[#E2F5FF] active:translate-y-0.5 transition-all text-xs font-bold flex flex-col gap-0.5 shadow-[0_2.5px_0_#1E293B]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-slate-800 truncate pr-1">{sc.title}</span>
                  <span className="text-[9px] font-black text-[#1E293B] font-mono bg-[#FFF275] border-2 border-[#1E293B] px-1.5 py-0.5 rounded-full shadow-sm shrink-0 font-sans">
                    Voz
                  </span>
                </div>
                {sc.episode && (
                  <span className="text-[9.5px] text-slate-400 font-semibold italic truncate">
                    ep. {sc.episode}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-slate-200/60 pt-3 mt-4 flex items-center justify-between text-[9px] text-slate-500 font-bold font-mono">
        <span>BMO V2.0 // CARTOON THEME</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          ONLINE
        </span>
      </div>
    </div>
  );
}
