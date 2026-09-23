import React, { useState } from 'react';
import { LANDSCAPE_REGIONS } from './data/mockScientificData';
import { LandscapeRegion } from './types';
import { Header } from './components/Header';
import { Landscape2DMap } from './components/Landscape2DMap';
import { Canopy3DProfile } from './components/Canopy3DProfile';
import { Ecophysiological3PG } from './components/Ecophysiological3PG';
import { HybridDeepLearning } from './components/HybridDeepLearning';
import { WildfireRiskEngine } from './components/WildfireRiskEngine';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { UncertaintyValidation } from './components/UncertaintyValidation';
import { ScientificDeliverables } from './components/ScientificDeliverables';
import { AIEcologistAssistant } from './components/AIEcologistAssistant';
import { FloatingChatbot } from './components/FloatingChatbot';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function AppContent() {
  const [regions] = useState<LandscapeRegion[]>(LANDSCAPE_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<LandscapeRegion>(LANDSCAPE_REGIONS[0]);
  const [activeTab, setActiveTab] = useState<string>('landscape-2d');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [timelineYear, setTimelineYear] = useState<number>(2024);

  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400 relative overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Telemetry radial background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0 telemetry-grid"
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none opacity-20 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Scientific Navigation Header */}
      <Header
        currentRegion={selectedRegion}
        allRegions={regions}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
      />

      {/* Main Scientific Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6 relative z-10">
        {activeTab === 'landscape-2d' && (
          <Landscape2DMap region={selectedRegion} />
        )}

        {activeTab === 'canopy-3d' && (
          <Canopy3DProfile region={selectedRegion} />
        )}

        {activeTab === '3pg-physio' && (
          <Ecophysiological3PG region={selectedRegion} />
        )}

        {activeTab === 'hybrid-dl' && (
          <HybridDeepLearning region={selectedRegion} />
        )}

        {activeTab === 'wildfire-risk' && (
          <WildfireRiskEngine region={selectedRegion} />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioSimulator region={selectedRegion} />
        )}

        {activeTab === 'validation' && (
          <UncertaintyValidation />
        )}

        {activeTab === 'deliverables' && (
          <ScientificDeliverables />
        )}

        {activeTab === 'ai-advisor' && (
          <AIEcologistAssistant region={selectedRegion} />
        )}
      </main>

      {/* Immersive Footer & Interactive Timeline Bar */}
      <footer className={`border-t py-3 px-4 sm:px-6 text-xs relative z-20 transition-colors duration-300 ${
        isDark ? 'border-zinc-800 bg-zinc-950/90 text-zinc-400' : 'border-slate-200 bg-white/90 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick tab jump tags */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('landscape-2d')}
              className={`font-bold transition-colors ${
                activeTab === 'landscape-2d'
                  ? 'text-emerald-500'
                  : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`font-bold transition-colors ${
                activeTab === 'scenarios'
                  ? 'text-emerald-500'
                  : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.scenarios}
            </button>
            <button
              onClick={() => setActiveTab('hybrid-dl')}
              className={`font-bold transition-colors ${
                activeTab === 'hybrid-dl'
                  ? 'text-emerald-500'
                  : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.dataLake}
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`font-bold transition-colors ${
                activeTab === 'deliverables'
                  ? 'text-emerald-500'
                  : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.export}
            </button>
          </div>

          {/* Timeline control widget */}
          <div className={`flex items-center gap-3.5 px-4 py-1.5 rounded-full border shadow-inner transition-colors ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <span className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{t.horizon}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimelineYear((prev) => Math.max(2024, prev - 5))}
                className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-800'}`}
                title={t.rewind5y}
              >
                <Rewind className="w-3.5 h-3.5" />
              </button>
              <div className={`w-32 sm:w-44 h-1.5 rounded-full relative overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-300'}`}>
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] transition-all duration-300"
                  style={{ width: `${((timelineYear - 2024) / 50) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setTimelineYear((prev) => Math.min(2074, prev + 5))}
                className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'}`}
                title={t.forward5y}
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              2024 — <span className="text-emerald-500 font-bold">{timelineYear}</span>
            </div>
          </div>

          {/* System metadata */}
          <div className={`flex items-center gap-3 font-mono text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            <span className={isDark ? 'text-zinc-400' : 'text-slate-700'}>{t.coreVersion}</span>
            <span>&bull;</span>
            <span className="text-emerald-500/90 font-medium">GEDI + Sentinel + 3-PG</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <FloatingChatbot region={selectedRegion} />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
