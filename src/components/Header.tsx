import React from 'react';
import {
  Trees,
  Radio,
  Cpu,
  Layers,
  Flame,
  GitBranch,
  ShieldCheck,
  FileCode2,
  Sparkles,
  RefreshCw,
  Globe2,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { LandscapeRegion } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentRegion: LandscapeRegion;
  allRegions: LandscapeRegion[];
  onSelectRegion: (region: LandscapeRegion) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  allRegions,
  onSelectRegion,
  activeTab,
  onSelectTab,
  isSimulating,
  onToggleSimulation,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navTabs = [
    { id: 'landscape-2d', label: t.tabLandscape2D, icon: Layers },
    { id: 'canopy-3d', label: t.tabCanopy3D, icon: Radio },
    { id: '3pg-physio', label: t.tab3PGPhysio, icon: Trees },
    { id: 'hybrid-dl', label: t.tabHybridDL, icon: Cpu },
    { id: 'wildfire-risk', label: t.tabWildfireRisk, icon: Flame },
    { id: 'scenarios', label: t.tabScenarios, icon: GitBranch },
    { id: 'validation', label: t.tabValidation, icon: ShieldCheck },
    { id: 'deliverables', label: t.tabDeliverables, icon: FileCode2 },
    { id: 'ai-advisor', label: t.tabAIAdvisor, icon: Sparkles },
  ];

  const isDark = theme === 'dark';

  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
      isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-white/80'
    }`}>
      {/* Top telemetry HUD header */}
      <div className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b gap-4 transition-colors duration-300 ${
        isDark ? 'border-zinc-800/80' : 'border-slate-200'
      }`}>
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.45)] flex items-center justify-center shrink-0">
            <Trees className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
          </div>
          <div>
            <h1 className={`text-base sm:text-lg font-bold tracking-tight uppercase flex items-center gap-1.5 ${
              isDark ? 'text-zinc-100' : 'text-slate-900'
            }`}>
              <span>SylvaTwin</span>
              <span className="text-emerald-500">Digitalis</span>
            </h1>
            <p className={`text-[10px] uppercase tracking-widest font-mono ${
              isDark ? 'text-zinc-500' : 'text-slate-500'
            }`}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Region selector & coordinates */}
        <div className="hidden lg:flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <select
              value={currentRegion.id}
              onChange={(e) => {
                const found = allRegions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 ${
                isDark ? 'text-zinc-200' : 'text-slate-800'
              }`}
            >
              {allRegions.map((r) => (
                <option key={r.id} value={r.id} className={isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-slate-800'}>
                  {r.name} ({r.country}) — {(r.areaHa / 1000).toFixed(0)}k ha
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 text-xs font-mono">
            <div className="flex flex-col items-end leading-tight">
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{t.lat}</span>
              <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>{currentRegion.center[0].toFixed(4)}° N</span>
            </div>
            <div className="flex flex-col items-end leading-tight">
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{t.lon}</span>
              <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>{Math.abs(currentRegion.center[1]).toFixed(4)}° W</span>
            </div>
          </div>
        </div>

        {/* Controls: Live Status, Language Switcher, Dark/Light Mode */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-xs text-emerald-500 font-medium font-mono tracking-wide">{t.gediSync}</span>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-emerald-500' : isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isSimulating ? t.assimilationActive : t.pauseStream}</span>
          </button>

          {/* Language Switcher (ES / EN) */}
          <div className={`flex items-center rounded-lg border p-0.5 text-xs font-medium font-mono ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <div className="px-1.5 text-slate-400 hidden xs:block">
              <Languages className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <button
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 rounded transition-all ${
                language === 'es'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Español"
            >
              ES
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all ${
                language === 'en'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button (Dark / Light Mode) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-300 shadow-sm'
            }`}
            title={isDark ? t.themeToggleDark : t.themeToggleLight}
            aria-label={isDark ? t.themeToggleDark : t.themeToggleLight}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-bar: Navigation Tabs */}
      <div className={`px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar transition-colors ${
        isDark ? 'bg-zinc-950/40' : 'bg-slate-50/80'
      }`}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 font-semibold shadow-[inset_0_-8px_12px_rgba(16,185,129,0.08)]'
                  : isDark
                  ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
