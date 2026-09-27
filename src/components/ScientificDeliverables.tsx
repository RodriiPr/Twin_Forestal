import React, { useState, useEffect } from 'react';
import { SCIENTIFIC_CODE_ARTIFACTS } from '../data/mockScientificData';
import { ForestTwinAPI } from '../services/api';
import { CrispDmOverview, LangflowFlowSchema } from '../types';
import {
  FileCode2,
  BookOpen,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Cpu,
  Trees,
  GitBranch,
  Network,
  Share2,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const ScientificDeliverables: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'paper' | 'code' | 'crisp-langflow'>('crisp-langflow');
  const [selectedFileId, setSelectedFileId] = useState<string>(SCIENTIFIC_CODE_ARTIFACTS[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live CRISP-DM & Langflow data
  const [crispData, setCrispData] = useState<CrispDmOverview | null>(null);
  const [langflowFlow, setLangflowFlow] = useState<LangflowFlowSchema | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_langchain_agent');

  useEffect(() => {
    ForestTwinAPI.getCrispDmOverview('madre-de-dios-peru').then((data) => {
      if (data) setCrispData(data);
    });
    ForestTwinAPI.getLangflowSchema().then((flow) => {
      if (flow) setLangflowFlow(flow);
    });
  }, []);

  const artifacts = SCIENTIFIC_CODE_ARTIFACTS;
  const currentArtifact = artifacts.find((a) => a.id === selectedFileId) || artifacts[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Metodología CRISP-DM, Langflow & Entregables Científicos
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gobernanza metodológica (Chapman et al., 2000; Ometto et al., 2023), Orquestador Semántico Langflow (Dao et al., 2025) y manuscrito para publicación Q1.
          </p>
        </div>

        {/* Section switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveSection('crisp-langflow')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'crisp-langflow'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>CRISP-DM & Langflow</span>
          </button>
          <button
            onClick={() => setActiveSection('paper')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'paper'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manuscrito (IMRaD)</span>
          </button>
          <button
            onClick={() => setActiveSection('code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'code'
                ? 'bg-sky-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Pipeline & Snakemake</span>
          </button>
        </div>
      </div>

      {/* Section 1: CRISP-DM Methodology & Interactive Langflow Canvas */}
      {activeSection === 'crisp-langflow' && (
        <div className="space-y-6">
          {/* CRISP-DM Phases Table (Word Tabla 1) */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  <span>Fases de CRISP-DM Aplicadas al Gemelo Digital Forestal (Sección 2.3 - Tabla 1)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ciclo metodológico adaptado de Chapman et al. (2000), Ometto et al. (2023) y Borsah et al. (2023).
                </p>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                Estado Global: 6 / 6 Fases Calibradas
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Phase 1 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">Fase 1: Negocio / Problema</span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded font-mono">100%</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Objetivos silvícolas, reducción ≥30% de incertidumbre y definición de actores (SERFOR, SERNANP, REDD+).
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Mõttus et al. (2021)</div>
              </div>

              {/* Phase 2 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sky-400 font-bold">Fase 2: Comprensión Datos</span>
                  <span className="text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded font-mono">100%</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Diagnóstico y control de calidad de GEDI L4A, Sentinel-1/2, Landsat y FLUXNET (filtro de nubes &lt;15%).
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Ometto et al. (2023)</div>
              </div>

              {/* Phase 3 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 font-bold">Fase 3: Preparación Datos</span>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded font-mono">100%</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Fusión multiescala, extracción de métricas estructurales (MCH, QMH) y armonización de variables (Tabla 2).
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Borsah et al. (2023)</div>
              </div>

              {/* Phase 4 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold">Fase 4: Modelado Híbrido</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono">100%</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Acoplamiento 3-PG + Stacking ML/Bi-LSTM. Corrección de residuos de transpiración y déficit hídrico.
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Musthafa & Singh (2022); Oehmcke (2024)</div>
              </div>

              {/* Phase 5 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-teal-400 font-bold">Fase 5: Evaluación Científica</span>
                  <span className="text-[10px] bg-teal-500/15 text-teal-300 px-1.5 py-0.5 rounded font-mono">100%</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Validación cruzada espacial (10-fold Block CV) y verificación formal de hipótesis H1, H2 y H3.
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Li et al. (2025); Chen et al. (2022)</div>
              </div>

              {/* Phase 6 */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">Fase 6: Despliegue & Semántica</span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Activo</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Simulación de escenarios silvícolas y orquestación con LangChain y Langflow (Dao et al., 2025).
                </p>
                <div className="text-[10px] font-mono text-zinc-500">Cita: Dao et al. (2025); Zhong et al. (2023)</div>
              </div>
            </div>
          </div>

          {/* Interactive Langflow Visual Canvas */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Orquestador Visual de Nodos Langflow (Gemelo Digital Semántico)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualización interactiva del grafo exportado compatible con Langflow 1.0+ (Dao et al., 2025). Haz clic en cualquier nodo para inspeccionar sus metadatos.
                </p>
              </div>

              <button
                onClick={() => {
                  if (langflowFlow) {
                    handleDownload('silvatwin_langflow_flow.json', JSON.stringify(langflowFlow, null, 2));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON Langflow</span>
              </button>
            </div>

            {/* Visual Canvas of Langflow Nodes */}
            <div className="relative bg-zinc-950 p-6 rounded-xl border border-zinc-800 min-h-[320px] overflow-x-auto flex flex-col md:flex-row items-center justify-around gap-6">
              {/* Node 1: Satellite Telemetry */}
              <div
                onClick={() => setSelectedNodeId('node_satellite_telemetry')}
                className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedNodeId === 'node_satellite_telemetry'
                    ? 'border-sky-500 bg-sky-950/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-sky-400 mb-1">
                  <span>CustomComponent</span>
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                </div>
                <div className="font-bold text-xs text-zinc-100">Telemetría Multi-Sensor</div>
                <div className="text-[10px] text-zinc-400 mt-1">GEDI L4A + Sentinel-1/2 SAR</div>
              </div>

              <ArrowRight className="w-5 h-5 text-zinc-600 hidden md:block shrink-0" />

              {/* Node 2 & 3: Process & Risk Models */}
              <div className="flex flex-col gap-4">
                <div
                  onClick={() => setSelectedNodeId('node_3pg_ecophysiology')}
                  className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedNodeId === 'node_3pg_ecophysiology'
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
                    <span>ProcessModel</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="font-bold text-xs text-zinc-100">Motor Biofísico 3-PG</div>
                  <div className="text-[10px] text-zinc-400 mt-1">GPP, NPP, Asignación de Carbono</div>
                </div>

                <div
                  onClick={() => setSelectedNodeId('node_wildfire_engine')}
                  className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedNodeId === 'node_wildfire_engine'
                      ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-1">
                    <span>RiskModel</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="font-bold text-xs text-zinc-100">Modelo de Combustibles</div>
                  <div className="text-[10px] text-zinc-400 mt-1">Canadian FWI + Rothermel + FMC</div>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-zinc-600 hidden md:block shrink-0" />

              {/* Node 4: LangChain Semantic Agent */}
              <div
                onClick={() => setSelectedNodeId('node_langchain_agent')}
                className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedNodeId === 'node_langchain_agent'
                    ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300 mb-1">
                  <span>LangChainAgent</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-xs text-zinc-100">Agente Semántico Dao et al.</div>
                <div className="text-[10px] text-zinc-400 mt-1">Evaluación de Trade-offs Carbono vs Fuego</div>
              </div>

              <ArrowRight className="w-5 h-5 text-zinc-600 hidden md:block shrink-0" />

              {/* Node 5: Output Decision */}
              <div
                onClick={() => setSelectedNodeId('node_action_output')}
                className={`w-64 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedNodeId === 'node_action_output'
                    ? 'border-teal-400 bg-teal-950/40 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-teal-300 mb-1">
                  <span>OutputDecision</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="font-bold text-xs text-zinc-100">Directiva Silvícola</div>
                <div className="text-[10px] text-zinc-400 mt-1">Clareo / Quema Prescrita / Conservación</div>
              </div>
            </div>

            {/* Selected Node Metadata Inspector */}
            {selectedNodeId && (
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-2">
                  <span className="font-bold text-emerald-400">Inspector del Nodo: {selectedNodeId}</span>
                  <span className="text-[11px] text-zinc-500">Framework: LangChain LCEL & Langflow</span>
                </div>
                {selectedNodeId === 'node_langchain_agent' && (
                  <div className="text-zinc-300 space-y-1 text-[11px]">
                    <div>• <strong>Rol:</strong> Razonador semántico en tiempo de ejecución (Dao et al., 2025).</div>
                    <div>• <strong>Heurística:</strong> Evalúa si FWI ≥ 38 o FMC &lt; 70% con dosel GEDI &gt; 25m para ordenar fajas cortafuegos inmediatas.</div>
                    <div>• <strong>Trade-off:</strong> Preserva el 85% de la biomasa total sacrificando &lt;4% del carbono superficial.</div>
                  </div>
                )}
                {selectedNodeId === 'node_satellite_telemetry' && (
                  <div className="text-zinc-300 space-y-1 text-[11px]">
                    <div>• <strong>Fuentes de Ingesta:</strong> NASA GEDI L4A, Sentinel-1 SAR GRD, Sentinel-2 MSI L2A.</div>
                    <div>• <strong>Frecuencia:</strong> Mensual a quincenal con filtro de nubes (&lt;15%).</div>
                  </div>
                )}
                {selectedNodeId === 'node_3pg_ecophysiology' && (
                  <div className="text-zinc-300 space-y-1 text-[11px]">
                    <div>• <strong>Motor:</strong> Landsberg & Waring (1997) con modificación de estrés estomático por déficit de vapor VPD.</div>
                    <div>• <strong>CUE:</strong> Eficiencia de uso de carbono fijada en 0.47 ± 0.04.</div>
                  </div>
                )}
                {selectedNodeId === 'node_wildfire_engine' && (
                  <div className="text-zinc-300 space-y-1 text-[11px]">
                    <div>• <strong>Formulación:</strong> Parámetros de combustible de dosel según Aragoneses et al. (2024).</div>
                    <div>• <strong>Propagación:</strong> Fórmulas físicas de Rothermel y Van Wagner para probabilidad de copa.</div>
                  </div>
                )}
                {selectedNodeId === 'node_action_output' && (
                  <div className="text-zinc-300 space-y-1 text-[11px]">
                    <div>• <strong>Acciones Emitidas:</strong> Quema prescrita perimetral, clareo selectivo 25%, conservación estricta.</div>
                    <div>• <strong>KPI:</strong> Reducción de incertidumbre bayesiana ≥ 30% (Sección 1.7).</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Full Scientific Paper Viewport */}
      {activeSection === 'paper' && (
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 space-y-6 text-zinc-300 text-sm max-w-4xl mx-auto shadow-2xl">
          {/* Header & Metadata */}
          <div className="border-b border-zinc-800 pb-6 space-y-3">
            <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/20">
              SUBMISSION READY — Remote Sensing of Environment (Q1 / IF: 13.5)
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
              SilvaTwin: Gemelo Digital Forestal para la Predicción de Dinámica de Carbono y Riesgo de Incendios mediante Fusión de LiDAR, Satélites y Flujos de Carbono
            </h1>
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">Rodríguez Preciado, Andre Jhonel & Montenegro Baca, Zee Ricardo</span> | Universidad Nacional de Trujillo (UNT, 2026)
            </div>
          </div>

          {/* Abstract */}
          <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2">
            <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Resumen Ejecutivo (Abstract)
            </h2>
            <p className="text-xs leading-relaxed text-zinc-300">
              Los ecosistemas forestales cumplen un papel determinante en la regulación del ciclo global del carbono.
              Aquí presentamos <strong>SilvaTwin Digitalis</strong>, una arquitectura de gemelo digital que integra la estructura tridimensional
              del dosel por LiDAR espacial (GEDI), series temporales de radar (Sentinel-1 SAR) y multiespectrales (Sentinel-2, Landsat), junto con
              flujos de torres eddy covariance (FLUXNET) y el modelo ecofisiológico 3-PG acoplado a Deep Learning. Los resultados demuestran una
              reducción del 34.8% en la incertidumbre de las estimaciones de stock de carbono frente a inventarios forestales tradicionales (validando
              la hipótesis principal ≥ 30%), una precisión superior del modelo híbrido (R² = 0.884, RMSE = 17.58 Mg C/ha, validando H1), y que el manejo
              de combustibles reduce el riesgo de incendio en 65% preservando el 96% del stock acumulado a 50 años (validando H3).
            </p>
          </div>

          {/* IMRaD Sections */}
          <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">1.</span> Introducción & Realidad Problemática
              </h2>
              <p>
                La ausencia de una plataforma integrada que combine estructura 3D, series satelitales y flujos in situ limita la gestión forestal adaptativa.
                La presente investigación formula y valida el acoplamiento 3-PG + LSTM + Transformers y el marco de decisiones semánticas de Dao et al. (2025).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">2.</span> Materiales y Métodos: Fusión & CRISP-DM
              </h2>
              <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1 text-emerald-300">
                <div>• Sensores: GEDI L2A/L4A (MCH, QMH, RH98) + Sentinel-1 SAR (HH/HV) + Sentinel-2 (NDVI, NDWI)</div>
                <div>• Torres FLUXNET: Validación de GPP, Reco y NEE (gC/m²/día)</div>
                <div>• Validación: 10-fold Spatial Block Cross-Validation y Métricas Bayesianas</div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Section 3: Source Code Artifacts Browser */}
      {activeSection === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* File Selector Sidebar */}
          <div className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-3 space-y-2 shadow-xl">
            <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block px-2 pb-1 border-b border-zinc-800">
              Módulos del Pipeline
            </span>
            <div className="space-y-1">
              {artifacts.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedFileId(art.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    selectedFileId === art.id
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate font-mono">{art.filename}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">{art.language}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Viewport */}
          <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-zinc-200">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{currentArtifact.filename}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(currentArtifact.code, currentArtifact.id)}
                  className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded text-xs transition-colors"
                >
                  {copiedKey === currentArtifact.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === currentArtifact.id ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleDownload(currentArtifact.filename, currentArtifact.code)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold px-2.5 py-1 rounded text-xs transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/90 overflow-x-auto font-mono text-[11px] leading-relaxed text-emerald-300 max-h-[500px]">
              <pre>{currentArtifact.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
