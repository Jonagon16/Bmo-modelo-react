import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expression } from '../types';

interface BmoScreenProps {
  expression: Expression;
  captionText?: string; // Kept in signature for compatibility but not displayed on face
  isCustomResponseActive?: boolean;
}

export default function BmoScreen({
  expression,
  captionText = '',
  isCustomResponseActive = false,
}: BmoScreenProps) {
  const [blink, setBlink] = useState(false);
  const [speakCycle, setSpeakCycle] = useState(0);
  const [zzzs, setZzzs] = useState<{ id: number; delay: number }[]>([]);
  const [scaredOffset, setScaredOffset] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Clear eye-look coordinate tracking offsets automatically after a brief pause
  useEffect(() => {
    if (eyeOffset.x !== 0 || eyeOffset.y !== 0) {
      const timer = setTimeout(() => {
        setEyeOffset({ x: 0, y: 0 });
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [eyeOffset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Relative coordinates (-0.5 to 0.5) from the center
    const relX = (clickX / rect.width) - 0.5;
    const relY = (clickY / rect.height) - 0.5;

    // Standard high bounds for shift tracking
    const maxLookX = 22;
    const maxLookY = 16;

    setEyeOffset({
      x: relX * maxLookX,
      y: relY * maxLookY,
    });
  };

  // Periodic blinking effect for standard circular eye states
  useEffect(() => {
    const sleepOrGlitchOrLoveScared = 
      expression === 'sleepy' || 
      expression === 'glitch' || 
      expression === 'scared' || 
      expression === 'love' ||
      expression === 'excited' || // Arches
      expression === 'angry';     // Grits/Squints

    if (sleepOrGlitchOrLoveScared) {
      setBlink(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setBlink(true);
      const timeout = setTimeout(() => {
        setBlink(false);
      }, 150);

      return () => clearTimeout(timeout);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, [expression]);

  // Speaking mouth cycle ticker (keeps cycling if BMO is thinking, replying, or typing)
  useEffect(() => {
    const speakInterval = setInterval(() => {
      setSpeakCycle((prev) => (prev + 1) % 4);
    }, 110);

    return () => clearInterval(speakInterval);
  }, []);

  // Soft floating ZzZs generator for sleeping state
  useEffect(() => {
    if (expression !== 'sleepy') {
      setZzzs([]);
      return;
    }

    const interval = setInterval(() => {
      setZzzs((prev) => {
        const next = [...prev, { id: Date.now(), delay: Math.random() * 0.5 }];
        if (next.length > 5) next.shift();
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [expression]);

  // Scared vibration offsets
  useEffect(() => {
    if (expression !== 'scared') {
      setScaredOffset({ x: 0, y: 0 });
      return;
    }

    const vibeInterval = setInterval(() => {
      setScaredOffset({
        x: (Math.random() - 0.5) * 3.5,
        y: (Math.random() - 0.5) * 3.5,
      });
    }, 55);

    return () => clearInterval(vibeInterval);
  }, [expression]);

  // Speaking indicator flag
  const isSpeaking = isCustomResponseActive;

  // Compute mouth path AND design metadata
  const getMouthData = () => {
    // Normal friendly neutral smiley line
    const defaultData = {
      d: 'M 215,215 Q 250,230 285,215',
      strokeWidth: 5.5,
      fill: 'none',
      color: '#1B2C24',
      isCavity: false,
      isAngryRibbon: false,
    };

    // If BMO is actively speaking (generating response), make the mouth talk dynamically
    if (isSpeaking) {
      if (expression === 'angry') {
        return {
          d: 'M 210,214 L 290,214 A 10,10 0 0,1 290,234 L 210,234 A 10,10 0 0,1 210,214 Z',
          strokeWidth: 4.5,
          fill: '#FFFFFF',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: true,
        };
      }

      const isDownturn = expression === 'sad' || expression === 'scared';
      if (isDownturn) {
        const frownMouthStates = [
          'M 215,235 Q 250,195 285,235 Z', // Large drooping bean
          'M 218,228 Q 250,210 282,228 Z', // Tight drooping wedge
          'M 215,240 L 285,240 C 285,240 280,185 250,185 C 220,185 215,240 215,240 Z', // Huge crying gasp
          'M 217,230 Q 250,202 283,230 Z', // Medium downturned wedge
        ];
        return {
          d: frownMouthStates[speakCycle],
          strokeWidth: 4.5,
          fill: '#134F3C',
          color: '#1B2C24',
          isCavity: true,
          isAngryRibbon: false,
        };
      }

      // Normal happy-go-lucky speaking open cavities
      const happyMouthStates = [
        'M 215,210 Q 250,248 285,210 Z', // Open happy bean
        'M 218,214 Q 250,224 282,214 Z', // Semi-flat open wedge
        'M 212,208 L 288,208 C 288,208 280,254 250,254 C 220,254 212,208 212,208 Z', // Giant round open jaw
        'M 216,212 Q 250,236 284,212 Z', // Medium open bean
      ];
      return {
        d: happyMouthStates[speakCycle],
        strokeWidth: 4.5,
        fill: '#134F3C',
        color: '#1B2C24',
        isCavity: true,
        isAngryRibbon: false,
      };
    }

    // Static mouth paths based on expression
    switch (expression) {
      case 'idle':
        return defaultData;

      case 'talking':
        return {
          d: 'M 215,210 Q 250,246 285,210 Z',
          strokeWidth: 4.5,
          fill: '#134F3C',
          color: '#1B2C24',
          isCavity: true,
          isAngryRibbon: false,
        };

      case 'thinking':
        // Slight curious smirk/flat line mouth for analytic BMO
        return {
          d: 'M 232,220 L 268,220',
          strokeWidth: 5.5,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'sad':
        // Simple elegant thin curved frown line matching Image 1 (no cavity)
        return {
          d: 'M 215,225 Q 250,190 285,225',
          strokeWidth: 5.5,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'angry':
        // Authentic clenching wavy rectangle teeth grit
        return {
          d: 'M 212,213 L 288,213 A 10,10 0 0,1 288,233 L 212,233 A 10,10 0 0,1 212,213 Z',
          strokeWidth: 4.5,
          fill: '#FFFFFF',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: true,
        };

      case 'excited':
        // Giant laughing open wedge (Adventure Time signature)
        return {
          d: 'M 205,208 Q 250,262 295,208 Z',
          strokeWidth: 4,
          fill: '#134F3C',
          color: '#1B2C24',
          isCavity: true,
          isAngryRibbon: false,
        };

      case 'surprised':
        // Simple cute wide circle gasp (gasping loop)
        return {
          d: 'M 235,224 A 15,15 0 1,1 265,224 A 15,15 0 1,1 235,224 Z',
          strokeWidth: 4.8,
          fill: '#134F3C',
          color: '#1B2C24',
          isCavity: true,
          isAngryRibbon: false,
        };

      case 'sleepy':
        // Faint sleeping tiny circle gap
        return {
          d: 'M 240,222 A 10,10 0 1,1 260,222 A 10,10 0 1,1 240,222 Z',
          strokeWidth: 4,
          fill: '#134F3C',
          color: '#2C4036',
          isCavity: true,
          isAngryRibbon: false,
        };

      case 'blushing':
        // Extremely cute kitten double-smile "w"
        return {
          d: 'M 226,212 Q 238,225 250,215 Q 262,225 274,212',
          strokeWidth: 5.5,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'wink':
        // Crooked playfulness smirk
        return {
          d: 'M 224,214 Q 248,232 276,214',
          strokeWidth: 5,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'love':
        // Massive joyful open smile cavity
        return {
          d: 'M 210,210 Q 250,256 290,210 Z',
          strokeWidth: 4,
          fill: '#134F3C',
          color: '#1B2C24',
          isCavity: true,
          isAngryRibbon: false,
        };

      case 'cool':
        // Smug sideways confidence smirk
        return {
          d: 'M 228,214 Q 252,226 272,213',
          strokeWidth: 5.5,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'scared':
        // Trembling fear squiggle line
        return {
          d: `M 220,${222 + scaredOffset.y} L 235,${227 - scaredOffset.y} L 250,${219 + scaredOffset.y} L 265,${226 - scaredOffset.y} L 280,${220 + scaredOffset.y}`,
          strokeWidth: 4.8,
          fill: 'none',
          color: '#1B2C24',
          isCavity: false,
          isAngryRibbon: false,
        };

      case 'glitch':
        // Shivering jagged lightning path
        return {
          d: 'M 218,211 L 234,226 L 250,210 L 266,226 L 282,211',
          strokeWidth: 6,
          fill: 'none',
          color: '#00F5D4',
          isCavity: false,
          isAngryRibbon: false,
        };

      default:
        return defaultData;
    }
  };

  const mouth = getMouthData();
  const showBlush = expression === 'blushing' || expression === 'excited' || expression === 'love' || expression === 'wink';

  return (
    <div 
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
      className="relative w-full aspect-[4/3] bg-[#C1EECB] rounded-[30px] border-[12px] border-[#25473D] shadow-inner overflow-hidden select-none flex flex-col items-center justify-between p-4"
    >
      {/* Dynamic CRT Screen Glass Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#ffffff0c] to-[#0000001e] z-10" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.06)_50%)] bg-[size:100%_4px] z-10" />
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 z-10 ${
        expression === 'glitch' 
          ? 'bg-[#ff00ff14] opacity-80 animate-pulse' 
          : 'bg-[#55ffd206] opacity-30'
      }`} />

      {/* Sleepy ZzZ floating elements */}
      {expression === 'sleepy' && (
        <div className="absolute top-8 right-12 z-20 pointer-events-none">
          <AnimatePresence>
            {zzzs.map((z, idx) => (
              <motion.div
                key={z.id}
                initial={{ opacity: 0, y: 15, x: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 0.8, 1, 0.5, 0],
                  y: -85 - idx * 10,
                  x: [0, 15, -10, 12],
                  scale: 1.25,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4.8, ease: 'easeOut', delay: z.delay }}
                className="absolute text-xl font-mono text-[#25473D] font-bold"
              >
                {idx % 2 === 0 ? 'Zzz' : 'zZ'}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Glitch Overlay Banner Text */}
      {expression === 'glitch' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
          <motion.div
            animate={{ y: [0, 240, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            className="h-[2.5px] w-full bg-[#ff2e6377] shadow-[0_0_8px_#ff2e63]"
          />
          <motion.div
            animate={{ opacity: [0, 0.75, 0.2, 0.6, 0] }}
            transition={{ duration: 0.35, repeat: Infinity }}
            className="absolute inset-0 bg-teal-950/15 mix-blend-color-dodge flex items-center justify-center font-mono text-[9px] text-[#00F5D4] font-bold p-2 overflow-hidden leading-tight whitespace-pre"
          >
            {`⚠️ CORE VOLTAGE SPIKE_ERROR\nINTERMODULE_GLITCH_MODE_ENGAGED\nBMO_OPERATING_SYSTEM_BOOT_CRITICAL`}
          </motion.div>
        </div>
      )}

      {/* SVG Container: Canvas size 500x350 is standardized */}
      <svg
        viewBox="0 0 500 350"
        className="w-full h-full flex-grow py-3 px-6"
        id="bmo-svg-face"
      >
        {/* Defs block: Houses clipping path linked to current mouth shape */}
        <defs>
          <clipPath id="bmo-mouth-clip">
            {/* Dynamic shape path for clipping mouth interior elements */}
            {mouth.d && <path d={mouth.d} />}
          </clipPath>
        </defs>

        {/* Rosy/Blushing cheeks */}
        <AnimatePresence>
          {showBlush && (
            <g id="bmo-cheeks">
              <motion.circle
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.35, scale: [1, 1.06, 1] }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 0.4 },
                }}
                cx="105"
                cy="175"
                r="25"
                fill="#FF6B6B"
              />
              <motion.circle
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.35, scale: [1, 1.06, 1] }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
                  opacity: { duration: 0.4 },
                }}
                cx="395"
                cy="175"
                r="25"
                fill="#FF6B6B"
              />
            </g>
          )}
        </AnimatePresence>

        {/* -------------------- EYEBROWS RENDERER -------------------- */}
        {expression === 'sad' && (
          <g id="bmo-sad-eyebrows">
            <motion.line
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 0.85, y: 0 }}
              x1="135" y1="112" x2="180" y2="130"
              stroke="#1B2C24" strokeWidth="5.5" strokeLinecap="round"
            />
            <motion.line
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 0.85, y: 0 }}
              x1="365" y1="112" x2="320" y2="130"
              stroke="#1B2C24" strokeWidth="5.5" strokeLinecap="round"
            />
          </g>
        )}

        {expression === 'angry' && (
          <g id="bmo-angry-eyebrows">
            <motion.line
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.9, y: 0 }}
              x1="130" y1="115" x2="190" y2="135"
              stroke="#1B2C24" strokeWidth="6" strokeLinecap="round"
            />
            <motion.line
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.9, y: 0 }}
              x1="370" y1="115" x2="310" y2="135"
              stroke="#1B2C24" strokeWidth="6" strokeLinecap="round"
            />
          </g>
        )}

        {expression === 'scared' && (
          <g id="bmo-scared-eyebrows">
            <motion.path
              animate={{ d: `M 135,${110 + scaredOffset.y} Q 165,${88 + scaredOffset.y} 185,${115 + scaredOffset.y}` }}
              stroke="#1B2C24" strokeWidth="5" fill="none" strokeLinecap="round"
            />
            <motion.path
              animate={{ d: `M 315,${115 + scaredOffset.y} Q 335,${88 + scaredOffset.y} 365,${110 + scaredOffset.y}` }}
              stroke="#1B2C24" strokeWidth="5" fill="none" strokeLinecap="round"
            />
          </g>
        )}

        {/* -------------------- EYES RENDERER (CARTOON EXACT) -------------------- */}
        <motion.g 
          id="bmo-eyes"
          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
          transition={{ type: 'spring', stiffness: 180, damping: 15 }}
        >
          {expression === 'excited' ? (
            /* Arched Happy Eyes ^ ^ */
            <g id="bmo-excited-eyes">
              <path
                d="M 136,156 Q 160,126 184,156"
                stroke="#1B2C24"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 316,156 Q 340,126 364,156"
                stroke="#1B2C24"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : expression === 'thinking' ? (
            /* Wide-spaced half circular analytical eyes with flat lids - Row 3 Col 3 */
            <g id="bmo-thinking-eyes">
              <path
                d="M 145,145 L 175,145 A 15,15 0 0,1 145,145 Z"
                fill="#1B2C24"
              />
              <path
                d="M 325,145 L 355,145 A 15,15 0 0,1 325,145 Z"
                fill="#1B2C24"
              />
              <line x1="145" y1="145" x2="175" y2="145" stroke="#1B2C24" strokeWidth="5" strokeLinecap="round" />
              <line x1="325" y1="145" x2="355" y2="145" stroke="#1B2C24" strokeWidth="5" strokeLinecap="round" />
            </g>
          ) : expression === 'sleepy' ? (
            /* Soft closed sleeping eyes _ _ curving downwards */
            <g id="bmo-sleepy-eyes">
              <path
                d="M 136,146 Q 160,163 184,146"
                stroke="#2C4036"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 316,146 Q 340,163 364,146"
                stroke="#2C4036"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : expression === 'wink' ? (
            /* Left round, right happy wink arch with laugh stress lines - Row 1 Col 2 */
            <g id="bmo-wink-eyes">
              <circle cx="160" cy="145" r="14" fill="#1B2C24" />
              <path
                d="M 318,154 Q 340,127 362,154"
                stroke="#1B2C24"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              {/* Laugh lines */}
              <path d="M 324,124 L 332,130 M 354,124 L 346,130" stroke="#1B2C24" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : expression === 'love' ? (
            /* Happy arched eyes with small cute floating beating hearts matching Image 2 */
            <g id="bmo-love-eyes">
              <path
                d="M 136,156 Q 160,126 184,156"
                stroke="#1B2C24"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 316,156 Q 340,126 364,156"
                stroke="#1B2C24"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              {/* Little cute beating hearts next to the happy eyes */}
              <motion.path
                initial={{ scale: 1 }}
                animate={{ scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '110px', originY: '110px' }}
                d="M 110,110 C 98,95 85,108 110,130 C 135,108 122,95 110,110 Z"
                fill="#FF3E6C"
                stroke="#1B2C24"
                strokeWidth="2.5"
              />
              <motion.path
                initial={{ scale: 1 }}
                animate={{ scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                style={{ originX: '390px', originY: '110px' }}
                d="M 390,110 C 378,95 365,108 390,130 C 415,108 402,95 390,110 Z"
                fill="#FF3E6C"
                stroke="#1B2C24"
                strokeWidth="2.5"
              />
            </g>
          ) : expression === 'scared' ? (
            /* Trembling/vibrating shocked eyeballs with shrunken pupils */
            <g id="bmo-scared-eyes">
              <circle
                cx={160 + scaredOffset.x}
                cy={145 + scaredOffset.y}
                r="24"
                fill="#FFFFFF"
                stroke="#1B2C24"
                strokeWidth="5"
              />
              <circle
                cx={160 + scaredOffset.x * 2.2}
                cy={145 + scaredOffset.y * 2.2}
                r="7"
                fill="#1B2C24"
              />
              <circle
                cx={340 + scaredOffset.x}
                cy={145 + scaredOffset.y}
                r="24"
                fill="#FFFFFF"
                stroke="#1B2C24"
                strokeWidth="5"
              />
              <circle
                cx={340 + scaredOffset.x * 2.2}
                cy={145 + scaredOffset.y * 2.2}
                r="7"
                fill="#1B2C24"
              />
            </g>
          ) : expression === 'angry' ? (
            /* Slanted squeezing folds and slits for true frustrated screaming BMO - Row 1 Col 1 */
            <g id="bmo-angry-eyes">
              <g transform="translate(0, 5)">
                {/* Left eye: squeezed cross creases */}
                <path d="M 142,138 L 178,152" stroke="#1B2C24" strokeWidth="6" strokeLinecap="round" />
                <path d="M 142,152 L 178,138" stroke="#1B2C24" strokeWidth="6" strokeLinecap="round" />
                
                {/* Right eye: squeezed cross creases */}
                <path d="M 322,138 L 358,152" stroke="#1B2C24" strokeWidth="6" strokeLinecap="round" />
                <path d="M 322,152 L 358,138" stroke="#1B2C24" strokeWidth="6" strokeLinecap="round" />
              </g>
            </g>
          ) : expression === 'sad' ? (
            /* Simple circular wide-spaced sad eyes matching the minimalist look in Image 1 */
            <g id="bmo-sad-eyes">
              <circle cx="160" cy="145" r="12" fill="#1B2C24" />
              <circle cx="340" cy="145" r="12" fill="#1B2C24" />
            </g>
          ) : (
            /* STANDARD CANONICAL BMO CIRCLE EYES (Wide spaced, perfectly round black dots) */
            <g id="bmo-standard-circles">
              {/* Left Eye */}
              <ellipse
                cx="160"
                cy="145"
                rx="14"
                ry={blink ? 1.5 : 14}
                fill={expression === 'glitch' ? '#FF124F' : '#1B2C24'}
              />
              
              {/* Right Eye */}
              <ellipse
                cx="340"
                cy="145"
                rx="14"
                ry={blink ? 1.5 : 14}
                fill={expression === 'glitch' ? '#12E2F1' : '#1B2C24'}
              />
            </g>
          )}

          {/* Cool Sunglasses for detective mode */}
          {expression === 'cool' && (
            <g id="bmo-sunglasses">
              <motion.path
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                style={{ originY: '145px' }}
                transition={{ type: 'spring', stiffness: 135, damping: 12 }}
                d="M 115,133 L 210,133 C 210,133 200,178 162,178 C 124,178 115,133 115,133 Z"
                fill="#121D17"
                stroke="#1B2C24"
                strokeWidth="4"
              />
              <motion.path
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                style={{ originY: '145px' }}
                transition={{ type: 'spring', stiffness: 135, damping: 12, delay: 0.05 }}
                d="M 290,133 L 385,133 C 385,133 376,178 338,178 C 300,178 290,133 290,133 Z"
                fill="#121D17"
                stroke="#1B2C24"
                strokeWidth="4"
              />
              <rect x="205" y="137" width="90" height="7" rx="3.5" fill="#1B2C24" />
              <path d="M 115,133 L 95,137" stroke="#1B2C24" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 385,133 L 405,137" stroke="#1B2C24" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="130" y1="140" x2="150" y2="168" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.32" />
              <line x1="305" y1="140" x2="325" y2="168" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.32" />
            </g>
          )}

          {/* Little concentric rings expressing Supreme shock/awareness for Surprised */}
          {expression === 'surprised' && (
            <g id="bmo-shock-rings" opacity="0.6">
              <path d="M 120,120 Q 110,145 120,170" stroke="#1B2C24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 380,120 Q 390,145 380,170" stroke="#1B2C24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 160,110 Q 185,100 210,110" stroke="#1B2C24" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        {/* -------------------- MOUTH CAVITY CLIPPED INNERS -------------------- */}
        {mouth.isCavity && (
          <g clipPath="url(#bmo-mouth-clip)" id="bmo-mouth-cavity-group">
            {/* Deep moss cavity background fill */}
            <rect x="150" y="160" width="200" height="130" fill="#134F3C" />
            
            {/* White cartoon upper teeth band - hide for love & excited to match the cute toothless bean face from Image 2 */}
            {expression !== 'love' && expression !== 'excited' && (
              <rect x="204" y="202" width="92" height="15" rx="3" fill="#FFFFFF" />
            )}
            
            {/* Animated bouncing wide cartoon pink tongue */}
            <motion.ellipse
              cx="250"
              cy={isSpeaking ? 245 + Math.sin(speakCycle) * 3.5 : 245}
              rx="30"
              ry="18"
              animate={{ cy: isSpeaking ? [241, 249, 241] : 245 }}
              transition={{ duration: 0.35, repeat: isSpeaking ? Infinity : 0, ease: 'easeInOut' }}
              fill="#FF7597"
            />
          </g>
        )}

        {/* -------------------- SOLID ANGRY GRITTING TEETH RIBBON -------------------- */}
        {mouth.isAngryRibbon && (
          <g id="bmo-angry-teeth-grit">
            {/* Divider lines representing clenching individual square teeth slots - Row 1 Col 1 */}
            <line x1="222" y1="213" x2="222" y2="233" stroke="#1B2C24" strokeWidth="3" strokeLinecap="round" />
            <line x1="236" y1="213" x2="236" y2="233" stroke="#1B2C24" strokeWidth="3" strokeLinecap="round" />
            <line x1="250" y1="213" x2="250" y2="233" stroke="#1B2C24" strokeWidth="3" strokeLinecap="round" />
            <line x1="264" y1="213" x2="264" y2="233" stroke="#1B2C24" strokeWidth="3" strokeLinecap="round" />
            <line x1="278" y1="213" x2="278" y2="233" stroke="#1B2C24" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* -------------------- OUTLINE MOUTH STROKE (Sitting on top for high finish) -------------------- */}
        {mouth.d && (
          <motion.path
            id="bmo-mouth-stroke"
            animate={{
              d: mouth.d,
              stroke: mouth.color,
              strokeWidth: mouth.strokeWidth,
            }}
            transition={{ type: 'spring', stiffness: 145, damping: 13 }}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>


      {/* Loading active AI feedback bubbly indicator */}
      {isCustomResponseActive && (
        <div className="absolute bottom-5 flex space-x-1.5 justify-center z-20">
          <span className="w-2.5 h-2.5 bg-[#1B2C24] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 bg-[#1B2C24] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 bg-[#1B2C24] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
