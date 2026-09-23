import React, { useState, useRef, useEffect } from 'react';
import { LandscapeRegion } from '../types';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Minimize2,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface FloatingChatbotProps {
  region: LandscapeRegion;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ region }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'es'
        ? `¡Hola! Soy el **Asistente Experto en Gemelo Digital Forestal** de SilvaTwin. Estoy listo para ayudarte con preguntas sobre biomasa, modelos 3-PG, LiDAR GEDI, riesgo de incendio o predicciones en **${region.name}**.`
        : `Hello! I am the **Forest Digital Twin Expert Assistant** at SilvaTwin. I am ready to help you with questions regarding biomass, 3-PG models, GEDI LiDAR, wildfire risk, or forecasts in **${region.name}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = language === 'es' ? [
    '¿Qué es el modelo 3-PG?',
    '¿Cómo se calcula el riesgo de incendio FWI?',
    'Explica el uso de GEDI LiDAR',
    '¿Cuál es el stock de carbono en esta región?',
  ] : [
    'What is the 3-PG model?',
    'How is FWI wildfire risk calculated?',
    'Explain GEDI LiDAR integration',
    'What is the carbon stock in this region?',
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
          language,
          context: `Región: ${region.name}, Bioma: ${region.biome}, Especies: ${region.dominantSpecies.join(', ')}, AGB Base: ${region.baselineAGB} Mg C/ha.`,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response || (language === 'es' ? 'No se pudo obtener respuesta.' : 'Could not get response.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'es'
          ? 'Error de conexión con el servidor científico de IA. Por favor intenta de nuevo.'
          : 'Connection error with the AI scientific server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Pop-up Window */}
      {isOpen && (
        <div className={`mb-3 w-[360px] sm:w-[420px] h-[520px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 ${
                  isDark ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  <span>{language === 'es' ? 'Chatbot Ecológico IA' : 'AI Ecological Chatbot'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                </h3>
                <p className="text-[10px] text-emerald-500 font-mono">
                  {region.name} &bull; Gemini 3.7
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
              title={language === 'es' ? 'Cerrar chat' : 'Close chat'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className={`px-3 py-2 border-b overflow-x-auto no-scrollbar flex items-center gap-1.5 ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1 shrink-0 ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-emerald-500" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-xl text-xs leading-relaxed border ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium border-emerald-400'
                      : isDark
                      ? 'bg-zinc-900/90 text-zinc-200 border-zinc-800'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1 font-mono ${
                      m.sender === 'user' ? 'text-slate-900 text-right opacity-80' : 'text-zinc-500 text-right'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                  }`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 text-xs items-center text-zinc-400">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />
                  <span className="text-[11px]">
                    {language === 'es' ? 'Consultando Gemini Engine...' : 'Querying Gemini Engine...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t flex gap-2 transition-colors ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={language === 'es' ? 'Pregunta sobre el gemelo digital...' : 'Ask about the digital twin...'}
              className={`flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-emerald-500 transition-colors border ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative ${
          isOpen ? 'rotate-90' : ''
        }`}
        title={language === 'es' ? 'Abrir Asistente IA' : 'Open AI Assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-zinc-950 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-zinc-950" />
            </span>
          </>
        )}
      </button>
    </div>
  );
};
