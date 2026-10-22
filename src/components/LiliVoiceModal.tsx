import React, { useState, useEffect } from 'react';
import { 
  X, Mic, Sparkles, Volume2, VolumeX, CheckCircle2, 
  Palmtree, ShieldCheck, Sun, Lightbulb, Lock, Blinds
} from 'lucide-react';
import { DeviceStatus } from '../types';

interface LiliVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunVoiceRoutine: (command: string) => void;
  deviceStatus?: DeviceStatus;
}

export const LiliVoiceModal: React.FC<LiliVoiceModalProps> = ({
  isOpen,
  onClose,
  onRunVoiceRoutine,
  deviceStatus,
}) => {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string>(
    'Hola, soy LILI. Tu asistente inteligente de Aegis. Haz clic en un comando o activa el «Modo Vacaciones» para ver cómo controlo tu hogar.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const isVacationModeActive = Boolean(deviceStatus?.vacationMode);
  const currentSimulationRoom = deviceStatus?.activeSimulationRoom || 'Salón Principal';

  // Available demo commands
  const demoCommands = [
    {
      label: isVacationModeActive ? '☀️ "LILI, desactiva el «Modo Vacaciones»"' : '🌴 "LILI, activa el «Modo Vacaciones»"',
      response: isVacationModeActive
        ? '«Modo Vacaciones» desactivado. ¡Bienvenido de vuelta! Restableciendo luces habituales y abriendo persianas.'
        : '«Modo Vacaciones» activado. Todas las persianas y puertas inteligentes han sido blindadas y cerradas. Iniciando simulación de presencia aleatoria de luces para disuadir intrusos mientras viajas.',
      actionKey: 'vacation_mode',
      highlight: true,
    },
    {
      label: '🔒 "LILI, bloquea todas las cerraduras"',
      response: 'Cerraduras principales y secundarias bloqueadas con éxito. Modo seguro activo.',
      actionKey: 'lock',
    },
    {
      label: '💡 "LILI, apaga las luces del salón"',
      response: 'Luces del salón apagadas. Modo noche listo.',
      actionKey: 'lights_off',
    },
    {
      label: '🌡️ "LILI, ¿cuál es la temperatura actual?"',
      response: 'La temperatura en el salón es de 21.5 ºC con optimización de ahorro energético.',
      actionKey: 'temp',
    },
    {
      label: '✨ "LILI, activa la rutina «Salir de casa»"',
      response: 'Rutina «Salir de casa» ejecutada: luces apagadas, cerraduras cerradas y cámaras armadas.',
      actionKey: 'routine',
    },
  ];

  // Voice Speech Synthesis (TTS)
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored if browser restricts TTS
    }
  };

  const handleTriggerCommand = (cmd: typeof demoCommands[0]) => {
    setActiveCommand(cmd.label);
    setIsSpeaking(true);
    setAssistantResponse(cmd.response);
    onRunVoiceRoutine(cmd.actionKey);

    speakText(cmd.response);

    setTimeout(() => {
      setIsSpeaking(false);
    }, 2500);
  };

  const handleToggleVacationQuick = () => {
    const cmd = demoCommands[0];
    handleTriggerCommand(cmd);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#051c3d] text-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-700/80 relative overflow-hidden animate-fadeIn my-auto">
        {/* Top Sound Toggle and Close Button */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={ttsEnabled ? 'Voz activada (clic para silenciar)' : 'Voz silenciada (clic para activar)'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-4 pt-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            LILI PRO · Asistente de Voz Aegis
          </div>
          <h3 className="text-2xl font-black text-white">
            Interfaz de Control de LILI
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Control domótico por voz con rutinas avanzadas de seguridad
          </p>
        </div>

        {/* Animated Voice Orb Visualizer */}
        <div className="my-3 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing halo */}
            <div
              className={`absolute w-24 h-24 rounded-full bg-[#009fe3]/25 transition-all duration-700 ${
                isSpeaking ? 'animate-ping scale-125 opacity-75' : 'opacity-40'
              }`}
            />
            <div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#009fe3] to-sky-300 shadow-xl shadow-cyan-500/30 flex items-center justify-center transition-transform duration-300 ${
                isSpeaking ? 'scale-110 ring-4 ring-cyan-300/40' : 'scale-100'
              }`}
            >
              <Mic className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Assistant Voice Transcription Bubble */}
          <div className="mt-4 bg-[#0a2754] border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 w-full text-center shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Respuesta de LILI:</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              "{assistantResponse}"
            </p>
          </div>
        </div>

        {/* SPECIAL ROUTINE: MODO VACACIONES SPOTLIGHT CARD */}
        <div className={`mt-3 p-4 rounded-2xl border transition-all duration-300 ${
          isVacationModeActive 
            ? 'bg-gradient-to-br from-[#0c395b] to-[#062445] border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50' 
            : 'bg-[#082249] border-cyan-800/60'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isVacationModeActive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-cyan-950 text-cyan-400 border border-cyan-700'}`}>
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    Rutina Especial: Modo Vacaciones
                  </h4>
                  {isVacationModeActive && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  Simulación de presencia inteligente y protección máxima
                </p>
              </div>
            </div>

            {/* Quick Action Trigger Button */}
            <button
              type="button"
              onClick={handleToggleVacationQuick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isVacationModeActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-500/20'
              }`}
            >
              {isVacationModeActive ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desactivar</span>
                </>
              ) : (
                <>
                  <Palmtree className="w-3.5 h-3.5" />
                  <span>Activar</span>
                </>
              )}
            </button>
          </div>

          {/* Details & Status of Vacation Mode */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-200">
            <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isVacationModeActive ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200' : 'bg-slate-900/40 text-slate-300'}`}>
              <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${isVacationModeActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <div className="truncate">
                <span className="font-semibold">Luces aleatorias:</span>{' '}
                {isVacationModeActive ? (
                  <span className="text-amber-300 font-bold">Encendidas en {currentSimulationRoom}</span>
                ) : (
                  'Simulación lista'
                )}
              </div>
            </div>

            <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isVacationModeActive ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200' : 'bg-slate-900/40 text-slate-300'}`}>
              <Blinds className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <div className="truncate">
                <span className="font-semibold">Persianas inteligentes:</span>{' '}
                <span className={isVacationModeActive ? 'text-emerald-300 font-bold' : ''}>
                  {isVacationModeActive ? '100% Cerradas' : 'Cierre al activar'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isVacationModeActive ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200' : 'bg-slate-900/40 text-slate-300'}`}>
              <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <div className="truncate">
                <span className="font-semibold">Puertas inteligentes:</span>{' '}
                <span className={isVacationModeActive ? 'text-emerald-300 font-bold' : ''}>
                  {isVacationModeActive ? 'Cerraduras blindadas' : 'Bloqueo total'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isVacationModeActive ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-200' : 'bg-slate-900/40 text-slate-300'}`}>
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <div className="truncate">
                <span className="font-semibold">Cámaras Aegis:</span>{' '}
                <span className={isVacationModeActive ? 'text-cyan-300 font-bold' : ''}>
                  {isVacationModeActive ? 'Alerta perimetral 24/7' : 'Armadas'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Presence Simulation Indicator banner */}
          {isVacationModeActive && (
            <div className="mt-2.5 bg-amber-500/10 border border-amber-400/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-amber-200">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Simulando presencia activa: alternando luces de forma aleatoria para despistar miradas externas.</span>
              </div>
            </div>
          )}
        </div>

        {/* Commands List */}
        <div className="space-y-1.5 mt-3 max-h-56 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Comandos de voz sugeridos:
          </span>
          {demoCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleTriggerCommand(cmd)}
              className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                cmd.highlight
                  ? isVacationModeActive
                    ? 'bg-amber-950/40 border-amber-500/80 text-amber-100 hover:bg-amber-900/50'
                    : 'bg-cyan-950/60 border-cyan-600/80 text-cyan-100 hover:bg-cyan-900/70'
                  : activeCommand === cmd.label
                  ? 'bg-[#009fe3] border-cyan-400 text-white'
                  : 'bg-[#092247] border-slate-700/80 text-slate-200 hover:bg-[#0d2f61] hover:border-slate-600'
              }`}
            >
              <span className="truncate pr-2">{cmd.label}</span>
              {activeCommand === cmd.label ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
              ) : cmd.highlight ? (
                <Palmtree className="w-4 h-4 shrink-0 text-amber-400" />
              ) : null}
            </button>
          ))}
        </div>

        {/* Modal Close / Action */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Cerrar demo de LILI
          </button>
        </div>
      </div>
    </div>
  );
};
