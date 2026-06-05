import React from 'react';
import { motion } from 'motion/react';
import BmoScreen from './BmoScreen';
import { Expression } from '../types';

interface BmoConsoleProps {
  expression: Expression;
  captionText: string;
  isCustomResponseActive: boolean;
  onDpadPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onButtonPress: (btnName: 'triangle' | 'circle_red' | 'circle_green' | 'small_blue' | 'dpad_center') => void;
  onPowerToggle: () => void;
  onScreenClick?: () => void;
}

export default function BmoConsole({
  expression,
  captionText,
  isCustomResponseActive,
  onDpadPress,
  onButtonPress,
  onPowerToggle,
  onScreenClick,
}: BmoConsoleProps) {

  // Play a retro synthesizer beep-boop chime using the Web Audio API
  const playRetroTone = (type: 'blip' | 'coin' | 'power' | 'tick' | 'glitch') => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      
      const playFreq = (freq: number, start: number, duration: number, wave: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.1, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      if (type === 'blip') {
        playFreq(600, now, 0.08, 'triangle');
      } else if (type === 'coin') {
        // Double tone coin sound
        playFreq(523.25, now, 0.08, 'sine'); // C5
        playFreq(659.25, now + 0.08, 0.2, 'sine'); // E5
      } else if (type === 'power') {
        // Descending/ascending sweep
        playFreq(200, now, 0.05, 'sawtooth');
        playFreq(350, now + 0.05, 0.05, 'sawtooth');
        playFreq(700, now + 0.1, 0.25, 'sine');
      } else if (type === 'tick') {
        playFreq(1200, now, 0.03, 'sine');
      } else if (type === 'glitch') {
        // High frequency static glitch crackle
        for (let i = 0; i < 4; i++) {
          playFreq(Math.random() * 2000 + 100, now + i * 0.04, 0.03, 'square');
        }
      }
    } catch (e) {
      console.warn('AudioContext not allowed or initialized yet', e);
    }
  };

  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    playRetroTone('blip');
    onDpadPress(direction);
  };

  const handleBtn = (btnName: 'triangle' | 'circle_red' | 'circle_green' | 'small_blue' | 'dpad_center') => {
    if (btnName === 'triangle') playRetroTone('coin');
    else if (btnName === 'circle_red') playRetroTone('power');
    else if (btnName === 'circle_green') playRetroTone('power');
    else playRetroTone('tick');
    onButtonPress(btnName);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4.2] bg-[#4CA392] rounded-[40px] px-6 pt-6 pb-8 shadow-2xl flex flex-col justify-between border-t-[8px] border-t-teal-300/30 border-b-[14px] border-b-teal-900/60 border-x-[10px] border-x-teal-700/40">
      
      {/* Absolute Side Logo Graphics (The printed "B O M" or "BMO" sides characteristic of BMO casing) */}
      <div className="absolute left-[-26px] top-1/4 h-32 w-4 bg-[#3E8B7C] rounded-l-md border-r-4 border-teal-800 flex flex-col items-center justify-around py-4 text-[10px] font-black text-teal-900 select-none shadow">
        <span>B</span>
        <span>M</span>
        <span>O</span>
      </div>
      <div className="absolute right-[-26px] top-1/4 h-32 w-4 bg-[#3E8B7C] rounded-r-md border-l-4 border-teal-800 flex flex-col items-center justify-around py-4 text-[10px] font-black text-teal-900 select-none shadow">
        <span>B</span>
        <span>M</span>
        <span>O</span>
      </div>

      {/* Dynamic Screen Housing Unit */}
      <div 
        onClick={onScreenClick}
        className="w-full relative shadow-[0_8px_16px_rgba(0,0,0,0.15)] rounded-[32px] overflow-hidden bg-teal-950 p-1 border-[3px] border-teal-800 cursor-pointer hover:scale-[1.01] transition-transform duration-300 group"
      >
        {/* Fullscreen hover badge overlay */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-[#ffffff09] transition-all duration-300 z-20 flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 bg-[#1e2a22cc]/95 text-[#afffd0] font-mono text-[9px] font-bold py-1.5 px-3 rounded-full border border-teal-800 transition-all duration-300 shadow">
            ⛶ PANTALLA COMPLETA
          </span>
        </div>

        <BmoScreen 
          expression={expression}
          captionText={captionText}
          isCustomResponseActive={isCustomResponseActive}
        />
      </div>

      {/* Bottom Physical Controls Area */}
      <div className="w-full flex-grow flex flex-col justify-between pt-6 mt-1">
        
        {/* Brand Banner with iconic rounded BMO font style */}
        <div className="w-full flex justify-between items-center px-4 mb-3">
          {/* Subtle speaker grille cuts on the left aspect */}
          <div className="flex space-x-1.5 h-3 items-center">
            <span className="w-[3px] h-6 bg-teal-900/45 rounded-full" />
            <span className="w-[3px] h-6 bg-teal-900/45 rounded-full" />
            <span className="w-[3px] h-6 bg-teal-900/45 rounded-full" />
            <span className="w-[3px] h-6 bg-teal-900/45 rounded-full" />
          </div>

          <div className="flex flex-col items-end">
            <h1 className="text-2xl font-black tracking-widest text-[#15342a] font-mono leading-none select-none">
              BMO
            </h1>
            <span className="text-[7.5px] font-bold text-teal-950/70 tracking-wider">BE MORE AGENT</span>
          </div>
        </div>

        {/* Buttons Grid Section */}
        <div className="grid grid-cols-12 gap-2 items-center flex-grow py-2">
          
          {/* Column A: Green Cross D-Pad System (D-Pad takes 5 cols) */}
          <div className="col-span-5 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
              {/* Main Cross shadow casing */}
              <div className="absolute w-28 h-8 bg-teal-950/20 rounded-lg pointer-events-none" />
              <div className="absolute h-28 w-8 bg-teal-950/20 rounded-lg pointer-events-none" />

              {/* Pad Element container */}
              <div className="relative w-24 h-24 bg-[#1E2522] rounded-[14px] flex items-center justify-center shadow-lg border border-neutral-900 p-0.5">
                {/* Horizontal Bar */}
                <div className="absolute w-[88px] h-6 bg-[#343e39] rounded-lg border-x-2 border-neutral-950" />
                {/* Vertical Bar */}
                <div className="absolute h-[88px] w-6 bg-[#343e39] rounded-lg border-y-2 border-neutral-950" />

                {/* Individual Directional clickable components */}
                {/* UP Direction */}
                <button
                  id="btn-dpad-up"
                  onClick={() => handleDpad('up')}
                  className="absolute top-1 left-9 w-6 h-7 cursor-pointer hover:bg-neutral-600/40 active:bg-neutral-950 bg-[#3A4540] rounded-t-md flex items-center justify-center transition-colors shadow z-10"
                  aria-label="Dpad Up"
                >
                  <span className="border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-neutral-300" />
                </button>

                {/* LEFT Direction */}
                <button
                  id="btn-dpad-left"
                  onClick={() => handleDpad('left')}
                  className="absolute left-1 top-9 w-7 h-6 cursor-pointer hover:bg-neutral-600/40 active:bg-neutral-950 bg-[#3A4540] rounded-l-md flex items-center justify-center transition-colors shadow z-10"
                  aria-label="Dpad Left"
                >
                  <span className="border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-neutral-300" />
                </button>

                {/* CENTER interactive core button */}
                <div 
                  onClick={() => handleBtn('dpad_center')}
                  className="absolute w-6 h-6 rounded-full bg-[#1F2422] border border-neutral-800 hover:bg-neutral-800 active:scale-95 cursor-pointer flex items-center justify-center z-12"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
                </div>

                {/* RIGHT Direction */}
                <button
                  id="btn-dpad-right"
                  onClick={() => handleDpad('right')}
                  className="absolute right-1 top-9 w-7 h-6 cursor-pointer hover:bg-neutral-600/40 active:bg-neutral-950 bg-[#3A4540] rounded-r-md flex items-center justify-center transition-colors shadow z-10"
                  aria-label="Dpad Right"
                >
                  <span className="border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-neutral-300" />
                </button>

                {/* DOWN Direction */}
                <button
                  id="btn-dpad-down"
                  onClick={() => handleDpad('down')}
                  className="absolute bottom-1 left-9 w-6 h-7 cursor-pointer hover:bg-neutral-600/40 active:bg-neutral-950 bg-[#3A4540] rounded-b-md flex items-center justify-center transition-colors shadow z-10"
                  aria-label="Dpad Down"
                >
                  <span className="border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-neutral-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Column B: Interactive Action Buttons Assembly (Cols 12 minus 5 = 7 cols) */}
          <div className="col-span-7 flex flex-col justify-around h-full pl-3">
            
            {/* Top row: Triangular blue button and Yellow Toggle */}
            <div className="flex justify-between items-center pr-3">
              {/* Triangle Blue button */}
              <div className="flex flex-col items-center">
                <button
                  id="btn-action-triangle"
                  onClick={() => handleBtn('triangle')}
                  className="w-14 h-14 cursor-pointer hover:brightness-110 active:brightness-90 flex items-center justify-center relative p-0 overflow-visible transition-transform active:scale-95"
                  aria-label="Blue Triangle Button"
                >
                  {/* Real 3D triangle element */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                    <polygon
                      points="50,15 90,85 10,85"
                      fill="#0C65C6"
                      stroke="#064284"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="50,22 83,80 17,80"
                      fill="#3B92FF"
                    />
                  </svg>
                </button>
                <span className="text-[7px] font-black text-[#15342a] tracking-widest mt-1">SOUND</span>
              </div>

              {/* Smaller dark blue accessory button */}
              <div className="flex flex-col items-center pr-2">
                <button
                  id="btn-action-small-blue"
                  onClick={() => handleBtn('small_blue')}
                  className="w-7 h-7 rounded-sm bg-[#1CDCFB] border-2 border-[#128FAD] shadow-md hover:brightness-110 active:scale-95 transition-transform"
                  aria-label="Small blue action button"
                />
                <span className="text-[6.5px] font-black text-[#15342a] tracking-wider mt-1">SYNC</span>
              </div>
            </div>

            {/* Bottom row: The two round buttons */}
            <div className="flex items-end justify-start space-x-5 pl-1">
              {/* Circular Red Button (Bigger) */}
              <div className="flex flex-col items-center">
                <button
                  id="btn-action-circle-red"
                  onClick={() => handleBtn('circle_red')}
                  className="w-12 h-12 rounded-full cursor-pointer bg-[#FF4C5B] border-4 border-[#C11F2E] shadow-[0_5px_0_#9D1320,_0_10px_10px_rgba(0,0,0,0.25)] hover:bg-[#FF6471] active:translate-y-[4px] active:shadow-[0_1px_0_#9D1320,_0_4px_4px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center font-bold text-white text-[10px]"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  aria-label="Red Action Button"
                >
                  A
                </button>
                <span className="text-[7.5px] font-black text-[#15342a] tracking-widest mt-1.5">TALK</span>
              </div>

              {/* Circular Greenish-Yellow Button (Smaller) */}
              <div className="flex flex-col items-center">
                <button
                  id="btn-action-circle-green"
                  onClick={() => handleBtn('circle_green')}
                  className="w-9 h-9 rounded-full cursor-pointer bg-[#FFBD4A] border-[3px] border-[#C18210] shadow-[0_4px_0_#966004,_0_8px_8px_rgba(0,0,0,0.25)] hover:bg-[#FFCC6D] active:translate-y-[3px] active:shadow-[0_1px_0_#966004,_0_3px_3px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center font-bold text-teal-950 text-[8px]"
                  aria-label="Yellow Action Button"
                >
                  B
                </button>
                <span className="text-[7.5px] font-black text-[#15342a] tracking-widest mt-1.5">JOKE</span>
              </div>
            </div>

          </div>

        </div>

        {/* Console slot detailing (Controller connector or tape slot) */}
        <div className="w-full flex items-center justify-center mt-3 pt-3 border-t border-teal-800/20">
          <div className="w-40 h-3.5 bg-teal-950/30 rounded-inner relative overflow-hidden border border-teal-900/40 shadow-inner flex items-center justify-between px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-60" />
            <div className="w-20 h-1 bg-teal-950 rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#1CDCFB] opacity-60" />
          </div>
        </div>

      </div>
    </div>
  );
}
