import React, { useState } from 'react';
import { SCIENTIFIC_CODE_ARTIFACTS } from '../data/mockScientificData';
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
} from 'lucide-react';

export const ScientificDeliverables: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'paper' | 'code'>('paper');
  const [selectedFileId, setSelectedFileId] = useState<string>(SCIENTIFIC_CODE_ARTIFACTS[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
              Entregables Científicos & Repositorio de Reproducibilidad
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manuscrito completo listo para envío a revista Q1 (Remote Sensing of Environment / Global Change Biology) y código fuente modular documentado.
          </p>
        </div>

        {/* Section switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveSection('paper')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'paper' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manuscrito Científico (IMRaD)</span>
          </button>
          <button
            onClick={() => setActiveSection('code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeSection === 'code' ? 'bg-sky-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Código Fuente & Snakemake</span>
          </button>
        </div>
      </div>

      {activeSection === 'paper' ? (
        /* Full Scientific Paper Viewport */
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 space-y-6 text-zinc-300 text-sm max-w-4xl mx-auto shadow-2xl">
          {/* Header & Metadata */}
          <div className="border-b border-zinc-800 pb-6 space-y-3">
            <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/20">
              SUBMISSION READY — Remote Sensing of Environment (Q1 / IF: 13.5)
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
              SilvaTwin: A Physics-Informed Digital Twin for Landscape-Scale Forest Carbon Accounting and Wildfire Risk
              Assimilation Under Climate Extremes
            </h1>
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">SilvaTwin Research Consortium</span> | Corresponding: Computational Ecology & Remote Sensing Lab
            </div>
          </div>

          {/* Abstract */}
          <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2">
            <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Resumen Ejecutivo (Abstract)
            </h2>
            <p className="text-xs leading-relaxed text-zinc-300">
              Quantifying forest carbon stocks and wildfire vulnerability at landscape scales (10³–10⁵ ha) is hindered by the trade-off
              between sparse plot inventories and coarse-resolution earth observation proxies. Here, we present <strong>SilvaTwin</strong>,
              an operational digital twin integrating spaceborne full-waveform LiDAR (GEDI L4A), multi-modal synthetic aperture radar (Sentinel-1 SAR),
              multispectral imagery (Sentinel-2), and eddy covariance fluxes (FLUXNET) into a 3-PG ecophysiological process model via a physics-informed
              spatiotemporal neural architecture. In Mediterranean pine and mixed temperate biomes, SilvaTwin achieved an aboveground biomass
              prediction accuracy of R² = 0.914 with RMSE = 17.58 Mg C/ha, reducing baseline uncertainty by 32.4% compared to traditional NFI surveys.
              Coupled with 3D fuel stratification from GEDI waveforms and Rothermel-Van Wagner fire propagation mechanics, the twin simulated 50-year
              adaptive forest management trajectories under SSP2-4.5 and SSP5-8.5 climate scenarios, demonstrating that selective thinning and continuous-cover
              restoration enhanced carbon sequestration by 28.5% while reducing catastrophic crown fire probability by 41.2%.
            </p>
          </div>

          {/* IMRaD Sections */}
          <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
            {/* 1. Introduction */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">1.</span> Introducción & Marco Teórico
              </h2>
              <p>
                Los bosques albergan más del 80% del carbono vegetal terrestre y proporcionan servicios ecosistémicos vitales de regulación hidrológica y biodiversidad.
                Sin embargo, el aumento en la frecuencia de sequías extremas y megaincendios de sexta generación amenaza la estabilidad de estos sumideros.
                Los inventarios forestales nacionales (NFI/IFN) proporcionan alta precisión local pero adolecen de baja resolución temporal (ciclos decenales).
                Por otro lado, los modelos de procesos ecofisiológicos clásicos (e.g., 3-PG) a menudo sufren de errores acumulativos en la parametrización de rodales heterogéneos.
              </p>
            </section>

            {/* 2. Methods */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">2.</span> Materiales y Métodos: Arquitectura del Gemelo Digital
              </h2>
              <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1 text-emerald-300">
                <div>• Pipeline Espacial: Cubos Zarr multidimensionales [Tiempo × Lat × Lon × Variables]</div>
                <div>• Sensores: GEDI L2A/L4A (RH25, RH50, RH75, RH98, PAI, FHD) + Sentinel-1 (VV, VH) + Sentinel-2 (NDVI, NDWI)</div>
                <div>• Modelo de Procesos: 3-PG calibrado ontogenéticamente (f_T, f_VPD, f_SWC, CUE=0.47)</div>
                <div>• Regularización Física: L_total = L_data + λ·L_phys (Conservación estricta de balance de masas)</div>
              </div>
            </section>

            {/* 3. Results */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">3.</span> Resultados y Validación Empírica
              </h2>
              <p>
                La asimilación continua demostró una reducción consistente del intervalo de confianza del 95% de ±26.0 Mg C/ha a ±17.58 Mg C/ha.
                El análisis global de sensibilidad de Sobol reveló que la eficiencia cuántica del dosel (alpha_cx) y el percentil LiDAR RH98 explican el
                68% de la varianza total de la biomasa acumulada, confirmando el rol crucial de los perfiles verticales GEDI para el anclaje físico de las predicciones.
              </p>
            </section>

            {/* 4. Discussion */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-emerald-400">4.</span> Discusión e Implicaciones para Políticas Forestales
              </h2>
              <p>
                Los escenarios de manejo a 50 años revelan un claro trade-off entre la no intervención (que acumula combustible continuo provocando riesgo crítico de fuego)
                y la restauración con diversificación estructural, que maximiza la resiliencia hídrica y la estabilidad del stock de carbono bajo escenarios IPCC SSP5-8.5.
              </p>
            </section>
          </div>
        </div>
      ) : (
        /* Source Code Artifacts Browser */
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
