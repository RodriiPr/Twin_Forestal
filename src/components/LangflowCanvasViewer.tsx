import React, { useState, useEffect } from 'react';
import {
  Network,
  Share2,
  Download,
  Play,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  Flame,
  Trees,
  Bot,
  Sliders,
  Layers,
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ForestTwinAPI } from '../services/api';
import { LangflowFlowSchema, LandscapeRegion, RasterPixelInfo } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LangflowCanvasViewerProps {
  region: LandscapeRegion;
  activeStand?: RasterPixelInfo | null;
}

export const LangflowCanvasViewer: React.FC<LangflowCanvasViewerProps> = ({ region, activeStand }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const [flowSchema, setFlowSchema] = useState<LangflowFlowSchema | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_langchain_agent');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'live' | 'schema'>('live');

  useEffect(() => {
    ForestTwinAPI.getLangflowSchema().then((schema) => {
      if (schema) {
        setFlowSchema(schema);
      }
    });
  }, []);

  const handleDownload = () => {
    if (!flowSchema) return;
    const blob = new Blob([JSON.stringify(flowSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `silvatwin_langflow_${region.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    if (!flowSchema) return;
    navigator.clipboard.writeText(JSON.stringify(flowSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setSelectedNodeId('node_satellite_telemetry');

    const stepIntervals = [
      setTimeout(() => {
        setSimStep(2);
        setSelectedNodeId('node_3pg_ecophysiology');
      }, 1200),
      setTimeout(() => {
        setSimStep(3);
        setSelectedNodeId('node_wildfire_engine');
      }, 2400),
      setTimeout(() => {
        setSimStep(4);
        setSelectedNodeId('node_langchain_agent');
      }, 3600),
      setTimeout(() => {
        setSimStep(5);
        setSelectedNodeId('node_action_output');
        setIsSimulating(false);
      }, 4800),
    ];

    return () => stepIntervals.forEach(clearTimeout);
  };

  // Node scientific details definitions
  const nodeDetails: Record<string, {
    title: string;
    type: string;
    badgeColor: string;
    icon: any;
    summary: string;
    inputs: string[];
    outputs: string[];
    equations: string[];
    citation: string;
    payloadSnippet: Record<string, any>;
  }> = {
    node_satellite_telemetry: {
      title: 'Nodo Telemetría Multi-Sensor Satelital',
      type: 'CustomComponent / Ingestion',
      badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
      icon: Layers,
      summary: 'Ingesta y armonización continua de datos satelitales ópticos (Sentinel-2 NDVI/SAVI), microondas activas SAR (Sentinel-1 FMC) y forma de onda LiDAR satelital (NASA GEDI L4A RH98).',
      inputs: ['Órbitas Sentinel-1 GRD (VV/VH)', 'Reflectancias Sentinel-2 MSI (B4, B8, B11)', 'GEDI L4A Footprints (25m diam.)'],
      outputs: ['RH98 (m)', 'NDVI normalizado [0-1]', 'Índice FMC (%)', 'Riesgo FWI normalizado'],
      equations: [
        'NDVI = (B8 - B4) / (B8 + B4)',
        'FMC_{SAR} = a_0 + a_1 \\cdot \\sigma_{VV}^0 + a_2 \\cdot \\frac{\\sigma_{VH}^0}{\\sigma_{VV}^0}',
      ],
      citation: 'Ometto et al. (2023); Borsah et al. (2023)',
      payloadSnippet: {
        sensor_fusion: 'GEDI_L4A + S1_SAR + S2_MSI',
        sampling_rate: 'Quincenal (12 días revisit)',
        cloud_cover_filter: '< 15%',
        active_stand_id: activeStand?.standId || 'STAND-MAD-0001',
        measured_rh98_m: activeStand?.gediHeightM || 38.5,
        measured_fmc_pct: activeStand?.fuelMoisturePct || 63.0,
      },
    },
    node_3pg_ecophysiology: {
      title: 'Nodo Motor Ecofisiológico de Procesos 3-PG',
      type: 'ProcessModel / Biophysical',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      icon: Trees,
      summary: 'Simula el ciclo mensual de fijación de carbono, respiración autótrofa/heterótrofa y balance hídrico del dosel utilizando la formulación canónica 3-PG calibrada para la especie dominante.',
      inputs: ['Radiación solar PAR incidente (MJ/m2/día)', 'Déficit de presión de vapor VPD (kPa)', 'Temperatura media (°C)', 'Fracción de agua en suelo ASW'],
      outputs: ['GPP & NPP (g C/m2/día)', 'Respiración del ecosistema Reco', 'Flujo Neto NEE', 'Asignación a tallos (W_s) y raíces (W_r)'],
      equations: [
        '\\text{GPP} = \\alpha_{cx} \\cdot \\text{APAR} \\cdot f_T(T) \\cdot f_D(\\text{VPD}) \\cdot f_W(\\text{ASW})',
        '\\text{NPP} = y \\cdot \\text{GPP} \\quad (y \\approx 0.47)',
        '\\text{NEE} = R_{eco} - \\text{GPP}',
      ],
      citation: 'Landsberg & Waring (1997); Rodríguez Preciado & Montenegro Baca (2026)',
      payloadSnippet: {
        model: 'Physiological Principles Predicting Growth (3-PG)',
        quantum_efficiency_alpha_cx: 0.055,
        target_species: activeStand?.species || region.dominantSpecies[0],
        simulated_gpp_gc_m2_day: activeStand?.gppFlux || 10.8,
        simulated_nee_gc_m2_day: activeStand?.neeFlux || -4.13,
      },
    },
    node_wildfire_engine: {
      title: 'Nodo Motor de Riesgo de Incendios & Combustibles',
      type: 'RiskModel / FireDynamics',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      icon: Flame,
      summary: 'Calcula la probabilidad de ignición, velocidad de propagación (Rothermel) y riesgo de transición vertical a fuego de copa activo mediante las ecuaciones de dosel de Aragoneses et al. (2024).',
      inputs: ['Humedad foliar FMC (%)', 'Canopy Bulk Density (CBD en kg/m3)', 'Canopy Base Height (CBH en m)', 'Pendiente topográfica (%)'],
      outputs: ['Índice FWI', 'Tasa de propagación ROS (m/min)', 'Longitud de llama (m)', 'Probabilidad de Torching y Crowning'],
      equations: [
        'I_{init} = (0.010 \\cdot \\text{CBH} \\cdot (460 + 25.9 \\cdot \\text{FMC}))^{1.5}',
        '\\text{CFL} = \\text{CBD} \\cdot (\\text{RH}_{98} - \\text{CBH})',
      ],
      citation: 'Aragoneses et al. (2024); Rothermel (1972); Van Wagner (1977)',
      payloadSnippet: {
        fuel_model: 'Canopy Fuel Formulation (Aragoneses et al., 2024)',
        fwi_score: activeStand?.fwiRisk || 0.601,
        canopy_bulk_density_kg_m3: 0.14,
        canopy_base_height_m: 6.2,
        transition_to_crown_fire: (activeStand?.fwiRisk || 0.6) > 0.65 ? 'Probable' : 'Superficial',
      },
    },
    node_langchain_agent: {
      title: 'Nodo Agente Semántico LangChain LCEL',
      type: 'LangChainAgent / SemanticReasoner',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      icon: Bot,
      summary: 'Orquesta el razonamiento semántico mediante LangChain Expression Language (LCEL). Evalúa las disyuntivas multiobjetivo entre secuestro de carbono acumulado y riesgo de incendio catastrófico (Dao et al., 2025).',
      inputs: ['Diagnóstico Biofísico 3-PG', 'Evaluación de Riesgo de Incendio', 'Metadatos de Tenencia y Estatus de Conservación'],
      outputs: ['Clasificación Semántica de Alerta', 'Trade-off de Carbono a 50 años', 'Prompt Estructurado de Decisión'],
      equations: [
        '\\text{Directiva} = \\operatorname{LCEL}\\big(\\text{Telemetría} \\oplus \\text{3-PG} \\oplus \\text{FWI} \\oplus \\mathcal{R}_{\\text{silv}}\\big)',
        '\\Delta C_{50} = \\mathbb{E}[C_{\\text{intervención}}] - \\mathbb{E}[C_{\\text{no\\_intervención}} \\cdot (1 - P_{\\text{incendio}})]',
      ],
      citation: 'Dao et al. (2025); Zhong et al. (2023)',
      payloadSnippet: {
        framework: 'LangChain 0.2+ LCEL RunnableSequence',
        prompt_template: 'SilvaTwinAdaptiveDirectivePromptTemplate',
        reasoning_type: 'Ecological Multi-Objective Trade-off (H3)',
        chain_status: 'Compilado y Verificado',
      },
    },
    node_action_output: {
      title: 'Nodo Directiva Silvícola Adaptativa (Output)',
      type: 'OutputDecision / Silviculture',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/15',
      icon: CheckCircle2,
      summary: 'Genera la directiva silvícola adaptativa cuantificada para los gestores forestales (SERFOR, SERNANP, REDD+), con su prescripción espacial, costo y reducción de incertidumbre.',
      inputs: ['Decisión del Agente LangChain'],
      outputs: ['Prescripción Silvícola', 'Área de Intervención (ha)', 'Reducción de Incertidumbre (%)', 'Acreditación REDD+'],
      equations: [
        '\\text{IncCert} = \\pm 18.5 \\text{ Mg C/ha (Reducción 34.8% frente a IFN)}',
      ],
      citation: 'Rodriguez Preciado & Montenegro Baca (UNT, 2026)',
      payloadSnippet: {
        recommended_action: (activeStand?.fwiRisk || 0.6) > 0.65
          ? 'Quema prescrita perimetral en faja de 30m y cortafuegos de amortiguamiento'
          : 'Clareo selectivo preventivo de estrato intermedio (20% área basal)',
        carbon_permanence_rating: 'IPCC Tier 3 Verified',
        uncertainty_reduction_achieved: '34.8% (Supera umbral del 30%)',
      },
    },
  };

  const currentNode = nodeDetails[selectedNodeId] || nodeDetails['node_langchain_agent'];
  const CurrentIcon = currentNode.icon;

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner and Langflow Controls */}
      <div className={`p-4 rounded-xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                Orquestador Semántico Langflow (Fase 6 CRISP-DM)
              </h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Langflow 1.0+ &bull; LCEL
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Grafo computacional interactivo según Dao et al. (2025). Conecta sensores, modelos de procesos y agentes semánticos.
            </p>
          </div>
        </div>

        {/* View Mode Toggle and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-950/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
            <button
              onClick={() => setViewMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'live'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>⚡ Langflow Studio en Vivo</span>
            </button>
            <button
              onClick={() => setViewMode('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'schema'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>📊 Esquema del Grafo</span>
            </button>
          </div>

          {viewMode === 'schema' && (
            <>
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isSimulating
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? `Ejecutando Paso ${simStep}/5...` : 'Simular Flujo LCEL'}</span>
              </button>

              <button
                onClick={handleCopyJson}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
                title="Copiar especificación JSON del grafo"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleDownload}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300'
                }`}
                title="Descargar archivo JSON importable en Langflow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </>
          )}

          {viewMode === 'live' && (
            <a
              href="http://localhost:7860"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <span>Abrir en Pestaña Nueva</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {viewMode === 'live' ? (
        <div className="rounded-2xl border border-purple-500/30 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
          {/* Top Frame Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-900/95 border-b border-zinc-800 text-xs gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono font-bold text-emerald-400">Langflow 1.0+ Engine Conectado</span>
              </div>
              <span className="hidden md:inline text-zinc-600 font-mono">|</span>
              <span className="hidden md:inline text-zinc-400 font-mono text-[11px]">
                Puerto <code className="text-purple-300 font-bold">7860</code> &bull; Contenedor Docker: <code className="text-emerald-300">silvatwin_langflow</code>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400 hidden lg:inline">
                Interactúa con los nodos o prueba el Playground en vivo:
              </span>
              <a
                href="http://localhost:7860"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              >
                <span>Pantalla Completa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="relative w-full h-[780px] bg-zinc-950">
            <iframe
              src="http://localhost:7860"
              title="Langflow Studio Live"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          </div>

          {/* Frame Footer */}
          <div className="px-4 py-2.5 bg-zinc-900/80 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 gap-2">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Orquestador Semántico (Dao et al., 2025) acoplado a FastAPI (<code className="text-emerald-400">host.docker.internal:8000</code>)</span>
            </div>
            <div className="text-zinc-500 text-[10px]">
              CRISP-DM Fase 6: Despliegue de Modelos & Orquestación de Decisión Silvícola
            </div>
          </div>
        </div>
      ) : (
        /* Main Interactive Canvas and Lateral Inspector Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Interactive Visual Graph (8 Cols) */}
          <div className={`lg:col-span-8 p-5 rounded-xl border backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[440px] transition-colors ${
            isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-900 text-zinc-100 border-slate-700'
          }`}>
            {/* Canvas Sub-Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 z-10 text-xs">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                Lienzo de Ejecución &bull; Pipeline de Decisión
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 5 Nodos Conectados
              </span>
              <span>&bull;</span>
              <span>5 Aristas Semánticas</span>
            </div>
          </div>

          {/* Visual Graph Layout */}
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            {/* Step 1: Telemetry */}
            <div
              onClick={() => setSelectedNodeId('node_satellite_telemetry')}
              className={`w-full md:w-48 p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-1 ${
                selectedNodeId === 'node_satellite_telemetry'
                  ? 'border-sky-400 bg-sky-950/60 shadow-[0_0_20px_rgba(56,189,248,0.35)] ring-1 ring-sky-400'
                  : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 mb-1">
                <span>01. Ingestion</span>
                <span className={`w-2 h-2 rounded-full ${isSimulating && simStep === 1 ? 'bg-sky-400 animate-ping' : 'bg-sky-400'}`} />
              </div>
              <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Telemetría Multi-Sensor</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                GEDI L4A + S1/S2 SAR
              </div>
              <div className="mt-2 text-[9px] text-sky-300/80 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60 font-mono">
                RH98: {activeStand?.gediHeightM || 38.5}m &bull; FMC: {activeStand?.fuelMoisturePct || 63}%
              </div>
            </div>

            <ArrowRight className={`w-4 h-4 shrink-0 transition-colors hidden md:block ${simStep >= 1 ? 'text-sky-400' : 'text-zinc-600'}`} />

            {/* Step 2 & 3: Parallel Biophysical & Risk */}
            <div className="flex flex-col gap-3 w-full md:w-52">
              {/* Node 2: 3-PG */}
              <div
                onClick={() => setSelectedNodeId('node_3pg_ecophysiology')}
                className={`p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-1 ${
                  selectedNodeId === 'node_3pg_ecophysiology'
                    ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
                  <span>02. Process Model</span>
                  <span className={`w-2 h-2 rounded-full ${isSimulating && simStep === 2 ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                </div>
                <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Motor 3-PG Dinámica</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                  GPP, NPP, NEE & Carbono
                </div>
              </div>

              {/* Node 3: Wildfire */}
              <div
                onClick={() => setSelectedNodeId('node_wildfire_engine')}
                className={`p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-1 ${
                  selectedNodeId === 'node_wildfire_engine'
                    ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400'
                    : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mb-1">
                  <span>03. Risk Engine</span>
                  <span className={`w-2 h-2 rounded-full ${isSimulating && simStep === 3 ? 'bg-amber-400 animate-ping' : 'bg-amber-400'}`} />
                </div>
                <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Riesgo FWI & Combustibles</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                  Aragoneses et al. (2024)
                </div>
              </div>
            </div>

            <ArrowRight className={`w-4 h-4 shrink-0 transition-colors hidden md:block ${simStep >= 3 ? 'text-amber-400' : 'text-zinc-600'}`} />

            {/* Step 4: LangChain Agent */}
            <div
              onClick={() => setSelectedNodeId('node_langchain_agent')}
              className={`w-full md:w-50 p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-1 ${
                selectedNodeId === 'node_langchain_agent'
                  ? 'border-purple-400 bg-purple-950/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-400'
                  : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mb-1">
                <span>04. Semantic Agent</span>
                <span className={`w-2 h-2 rounded-full ${isSimulating && simStep === 4 ? 'bg-purple-400 animate-ping' : 'bg-purple-400'}`} />
              </div>
              <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Agente LangChain</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                Dao et al. (2025) LCEL
              </div>
              <div className="mt-2 text-[9px] text-purple-300/80 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60 font-mono">
                Trade-off H3: C vs Fuego
              </div>
            </div>

            <ArrowRight className={`w-4 h-4 shrink-0 transition-colors hidden md:block ${simStep >= 4 ? 'text-emerald-400' : 'text-zinc-600'}`} />

            {/* Step 5: Output Action */}
            <div
              onClick={() => setSelectedNodeId('node_action_output')}
              className={`w-full md:w-48 p-3 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-1 ${
                selectedNodeId === 'node_action_output'
                  ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
                <span>05. Decision Directive</span>
                <span className={`w-2 h-2 rounded-full ${isSimulating && simStep === 5 ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
              </div>
              <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Directiva Silvícola</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                Manejo Adaptativo
              </div>
              <div className="mt-2 text-[9px] text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                Reducción Varianza: 34.8%
              </div>
            </div>
          </div>

          {/* Bottom Live Telemetry Context Strip */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400 z-10">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rodal Conectado:</span>
              <span className="text-zinc-200 font-bold">{activeStand?.standId || `STAND-${region.id.slice(0, 3).toUpperCase()}-0001`}</span>
              <span>({activeStand?.species || region.dominantSpecies[0]})</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-300">AGB: <b className="text-emerald-400">{activeStand?.agbMgC_ha || region.baselineAGB}</b> Mg C/ha</span>
              <span>&bull;</span>
              <span className="text-zinc-300">FWI: <b className="text-amber-400">{activeStand?.fwiRisk || 0.45}</b></span>
              <span>&bull;</span>
              <span className="text-zinc-300">FMC: <b className="text-sky-400">{activeStand?.fuelMoisturePct || 63}%</b></span>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Metadata Inspector (4 Cols) */}
        <div className={`lg:col-span-4 p-5 rounded-xl border backdrop-blur-xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-4">
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {currentNode.title}
                  </h4>
                  <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1 ${currentNode.badgeColor}`}>
                    {currentNode.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              {currentNode.summary}
            </p>

            {/* Input & Output Interfaces */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Entradas (Inputs)</div>
                <ul className="space-y-1 text-zinc-300 text-[10px]">
                  {currentNode.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-1 truncate">
                      <span className="text-emerald-500">&bull;</span> {inp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Salidas (Outputs)</div>
                <ul className="space-y-1 text-zinc-300 text-[10px]">
                  {currentNode.outputs.map((out, idx) => (
                    <li key={idx} className="flex items-center gap-1 truncate">
                      <span className="text-purple-400">&bull;</span> {out}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mathematical Formulations */}
            <div className={`p-3 rounded-lg border text-xs ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Formulación Matemática & Reglas</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-zinc-300 bg-zinc-900/80 p-2 rounded border border-zinc-800 overflow-x-auto">
                {currentNode.equations.map((eq, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{eq}</div>
                ))}
              </div>
            </div>

            {/* Live JSON Payload from Stand */}
            <div className={`p-3 rounded-lg border text-xs ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
                Payload Vivo del Nodo (Telemetría de la BD)
              </div>
              <pre className="text-[10px] font-mono text-emerald-300/90 overflow-x-auto p-2 bg-zinc-900 rounded max-h-36">
                {JSON.stringify(currentNode.payloadSnippet, null, 2)}
              </pre>
            </div>
          </div>

          {/* Citation footer */}
          <div className="pt-3 border-t border-zinc-800 mt-4 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>Cita: {currentNode.citation}</span>
            <span className="text-emerald-400 font-bold">Estado: Calibrado</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
