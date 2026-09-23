import React, { useState } from 'react';
import { LandscapeRegion } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  Trees,
  Flame,
  Radio,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface AIEcologistAssistantProps {
  region: LandscapeRegion;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIEcologistAssistant: React.FC<AIEcologistAssistantProps> = ({ region }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: language === 'es'
        ? `Hola. Soy el Asistente Científico de **SilvaTwin**, especializado en ecología computacional, teledetección (LiDAR GEDI, Sentinel-1/2 SAR/MSI), modelos ecofisiológicos de procesos (3-PG) y asimilación de datos con deep learning. Actualmente estamos analizando la región de **${region.name}** (${region.dominantSpecies.join(', ')}). ¿En qué aspecto metodológico, calibración de parámetros o proyección de escenarios deseas profundizar?`
        : `Hello. I am the **SilvaTwin** Scientific Assistant, specialized in computational ecology, remote sensing (GEDI LiDAR, Sentinel-1/2 SAR/MSI), process-based ecophysiological models (3-PG), and deep learning data assimilation. We are currently analyzing the **${region.name}** region (${region.dominantSpecies.join(', ')}). What methodological aspect, parameter calibration, or scenario projection would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickPrompts = language === 'es' ? [
    '¿Cómo calibrar la eficiencia cuántica (alpha_cx) en Pinus sylvestris bajo sequía extrema?',
    'Explica cómo se desacoplan la constante dieléctrica de Sentinel-1 SAR y el NDWI de Sentinel-2 para estimar combustible vivo.',
    '¿Cuál es la estrategia óptima de clareo para maximizar el stock de carbono a 50 años minimizando fuego de copas?',
    'Detalla la formulación matemática de la función de pérdida con penalización física en el modelo híbrido.',
  ] : [
    'How to calibrate quantum efficiency (alpha_cx) under extreme drought?',
    'Explain how Sentinel-1 SAR dielectric constant and Sentinel-2 NDWI decouple to estimate live fuel moisture.',
    'What is the optimal thinning strategy to maximize 50-year carbon stock while minimizing crown fire risk?',
    'Detail the mathematical formulation of the physics-informed loss function in the hybrid model.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          regionName: region.name,
          species: region.dominantSpecies.join(', '),
          agbBaseline: region.baselineAGB,
          context: `Región: ${region.name}, Bioma: ${region.biome}, Especies: ${region.dominantSpecies.join(', ')}, AGB Base: ${region.baselineAGB} Mg C/ha, SOC Base: ${region.baselineSOC} Mg C/ha, Sitio FLUXNET: ${region.fluxnetSiteId}.`,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response || 'No se pudo obtener una respuesta del servidor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Error de conexión con el servidor científico de IA. Por favor, verifica tu conexión.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`backdrop-blur-md border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors ${
        isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/80 border-slate-200 shadow-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-base font-bold uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              {language === 'es' ? 'Asistente Científico IA (Gemini Ecologist Engine)' : 'AI Scientific Assistant (Gemini Ecologist Engine)'}
            </h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            {language === 'es'
              ? 'Consultoría interactiva sobre asimilación de datos espaciotemporales, biofísica de copas y manejo de recursos forestales en '
              : 'Interactive consultation on spatiotemporal data assimilation, canopy biophysics, and forest management in '}
            <span className="text-emerald-500 font-semibold">{region.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-mono">
          <Bot className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-500 font-medium">Gemini 3.7 &bull; Q1 Peer Review Mode</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Quick Prompts Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className={`backdrop-blur-md border rounded-xl p-4 shadow-xl space-y-3 transition-colors ${
            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white/80 border-slate-200'
          }`}>
            <span className={`text-[11px] uppercase font-bold tracking-wider block pb-1 border-b ${
              isDark ? 'text-zinc-400 border-zinc-800' : 'text-slate-500 border-slate-200'
            }`}>
              {language === 'es' ? 'Consultas Científicas Rápidas' : 'Quick Scientific Queries'}
            </span>
            <div className="space-y-2">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${
                    isDark
                      ? 'bg-zinc-950/70 border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-900/80 text-zinc-300'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat History & Input */}
        <div className={`lg:col-span-8 backdrop-blur-md border rounded-xl p-4 flex flex-col h-[520px] shadow-2xl transition-colors ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white/80 border-slate-200'
        }`}>
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-xl border leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-zinc-950 font-medium border-emerald-400/50'
                      : 'bg-zinc-950/90 text-zinc-200 border-zinc-800/90'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 font-mono ${
                      m.sender === 'user' ? 'text-emerald-950' : 'text-zinc-500 text-right'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 text-xs items-center text-zinc-400">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Razonando con el modelo ecofisiológico...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 pt-2 border-t border-zinc-800"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Formula una pregunta ecológica o técnica sobre el gemelo digital..."
              className="flex-1 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
