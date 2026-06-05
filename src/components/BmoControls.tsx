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
  onAskBmoPredefined: (scenario: string) => void;
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
    { title: "BMO, ¿De dónde eres?", prompt: "BMO, tell me where you come from and who made you!" },
    { title: "Cuéntame un chiste gamer", prompt: "Tell me a video game joke as BMO!" },
    { title: "BMO se enoja", prompt: "Say something angry because someone stole your video game controller!" },
    { title: "BMO cansado", prompt: "Say you are getting so sleepy and yawn as BMO" },
  ];

  return (
    <div className="w-full bg-[#1e2a22] border-2 border-teal-900 rounded-[28px] p-5 shadow-xl flex flex-col justify-between h-full select-none text-white">
      <div>
        {/* Panel Header */}
        <div className="flex items-center space-x-2 mb-4 border-b border-teal-800/50 pb-3">
          <Wand2 className="w-5 h-5 text-teal-400 animate-pulse" />
          <h2 className="text-sm font-bold tracking-widest text-teal-300 uppercase font-mono">
            Control de Reacciones
          </h2>
        </div>

        {/* Reaction Tester Section */}
        <p className="text-[10px] text-teal-200/70 mb-3 font-mono leading-relaxed">
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
                className={`py-2 px-3 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer transition-all duration-300 select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_2px_4px_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${
                  isActive 
                    ? 'ring-2 ring-teal-300 ring-offset-2 ring-offset-[#1e2a22] scale-95 brightness-110' 
                    : 'brightness-95'
                } ${expr.color}`}
              >
                <span className={isActive ? 'text-white' : 'opacity-85'}>{expr.icon}</span>
                <span className="truncate">{expr.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic AI Prompts Quick buttons */}
        <div className="border-t border-teal-800/50 pt-4">
          <h3 className="text-xs font-bold tracking-wider text-teal-300 mb-3 font-mono uppercase">
            Escenarios de IA Rápidos
          </h3>
          <p className="text-[9px] text-teal-200/60 mb-3 font-mono leading-relaxed">
            Envía una pregunta prediseñada para ver a BMO responder con su voz (cuerpo del chat) y cambiar sus emociones de forma automática según la respuesta generada por Gemini.
          </p>

          <div className="space-y-2">
            {predefinedScenarios.map((sc, i) => (
              <button
                key={i}
                id={`btn-quick-prompt-${i}`}
                onClick={() => onAskBmoPredefined(sc.prompt)}
                className="w-full text-left p-2.5 rounded-lg bg-teal-900/30 border border-teal-800/40 text-teal-100 hover:bg-teal-900/60 active:scale-[0.98] transition-all text-xs flex items-center justify-between"
              >
                <span className="font-medium truncate">{sc.title}</span>
                <span className="text-[9.5px] font-bold text-teal-400 font-mono bg-[#152019] px-2 py-0.5 rounded-full border border-teal-900/80">
                  IA
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-teal-800/40 pt-3 mt-4 flex items-center justify-between text-[9px] text-teal-500 font-mono">
        <span>BMO V2.0 // RETRO SCREEN</span>
        <span>STATUS: INLINE</span>
      </div>
    </div>
  );
}
