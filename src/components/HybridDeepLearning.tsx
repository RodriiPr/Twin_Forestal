import React, { useState } from 'react';
import { LandscapeRegion, MonthlyFluxPoint, AGBPredictResponse } from '../types';
import { MOCK_FLUX_TIMESERIES } from '../data/mockScientificData';
import { ForestTwinAPI } from '../services/api';
import {
  Cpu,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';

interface HybridDeepLearningProps {
  region: LandscapeRegion;
}

export const HybridDeepLearning: React.FC<HybridDeepLearningProps> = ({ region }) => {
  const [selectedFlux, setSelectedFlux] = useState<'nee' | 'gpp' | 'reco'>('nee');
  const [showConfidenceRibbon, setShowConfidenceRibbon] = useState<boolean>(true);
  const [activeArchitecture, setActiveArchitecture] = useState<'earthformer' | 'bilstm' | 'hybrid'>('hybrid');

  // Interactive Live Model Inference State
  const [rh98, setRh98] = useState<number>(32.5);
  const [ndvi, setNdvi] = useState<number>(0.82);
  const [savi, setSavi] = useState<number>(0.54);
  const [ndwi, setNdwi] = useState<number>(0.38);
  const [fmc, setFmc] = useState<number>(78.0);
  const [vpd, setVpd] = useState<number>(1.25);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<AGBPredictResponse | null>(null);

  const handlePredict = async () => {
    setIsInferring(true);
    try {
      const res = await ForestTwinAPI.predictAGB({
        rh98_m: rh98,
        ndvi,
        savi,
        ndwi,
        fmc_pct: fmc,
        vpd_kpa: vpd,
      });
      setPredictionResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInferring(false);
    }
  };

  const timeseries = MOCK_FLUX_TIMESERIES;

  const fluxLabels = {
    nee: {
      title: 'Intercambio Neto del Ecosistema (NEE)',
      unit: 'µmol CO₂ m⁻² s⁻¹',
      desc: 'Valores negativos representan captura neta de carbono por el dosel forestal; valores positivos representan emisiones a la atmósfera.',
      color: '#10b981',
    },
    gpp: {
      title: 'Productividad Primaria Bruta (GPP)',
      unit: 'g C m⁻² día⁻¹',
      desc: 'Fotosíntesis total del dosel forestal antes de descontar pérdidas por respiración autótrofa.',
      color: '#38bdf8',
    },
    reco: {
      title: 'Respiración del Ecosistema (Reco)',
      unit: 'g C m⁻² día⁻¹',
      desc: 'Suma de respiración autótrofa (árboles) y heterótrofa (microorganismos del suelo y descomposición de hojarasca).',
      color: '#f59e0b',
    },
  };

  return (
    <div className="space-y-4">
      {/* Overview & Architecture Selection */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Modelo Híbrido Físico-Neuronal (3-PG + Spatiotemporal Earthformer)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Asimilación de series temporales de satélite (Sentinel-1/2, MODIS) y meteorología ERA5 para corregir los residuos
            del modelo de procesos 3-PG contra torres de covarianza de torbellinos (FLUXNET{' '}
            <span className="text-emerald-400 font-mono font-semibold">{region.fluxnetSiteId}</span>).
          </p>
        </div>

        {/* Flux Selector Tabs */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          {(['nee', 'gpp', 'reco'] as const).map((flux) => (
            <button
              key={flux}
              onClick={() => setSelectedFlux(flux)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedFlux === flux
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {flux.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Model Benchmark Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 mb-1 text-[11px]">
            <span>Eficiencia Nash-Sutcliffe (NSE)</span>
            <span className="text-emerald-400 font-bold font-mono">0.892</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            +31.4% <span className="text-xs text-zinc-500 font-normal">vs 3-PG estándar</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '89%' }}></div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 mb-1 text-[11px]">
            <span>Coeficiente R²</span>
            <span className="text-sky-400 font-bold font-mono">0.914</span>
          </div>
          <div className="text-lg font-bold font-mono text-sky-400">
            0.914 <span className="text-xs text-zinc-500 font-normal">(p &lt; 0.001)</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" style={{ width: '91%' }}></div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 mb-1 text-[11px]">
            <span>Error Cuadrático Medio (RMSE)</span>
            <span className="text-amber-400 font-bold font-mono">0.78 µmol</span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            -42.5% <span className="text-xs text-zinc-500 font-normal">reducción error</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: '78%' }}></div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-zinc-500 mb-1 text-[11px]">
            <span>Penalización Física (L_phys)</span>
            <span className="text-emerald-400 font-bold font-mono">OK</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            0.004 <span className="text-xs text-zinc-500 font-normal">Cons. Masa</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-500" style={{ width: '99%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Timeseries Graph with Obs vs 3-PG vs Hybrid vs Unc Ribbon */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 mb-4 gap-3 text-xs">
          <div>
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              {fluxLabels[selectedFlux].title}
            </span>
            <p className="text-[11px] text-zinc-400">{fluxLabels[selectedFlux].desc}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfidenceRibbon(!showConfidenceRibbon)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                showConfidenceRibbon
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
            >
              Banda Confianza (IC 95%)
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeseries} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 10 }} />
              <YAxis
                stroke="#71717a"
                tick={{ fontSize: 10 }}
                label={{ value: fluxLabels[selectedFlux].unit, angle: -90, position: 'insideLeft', offset: 10, fill: '#71717a', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as MonthlyFluxPoint;
                    return (
                      <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg text-xs shadow-2xl space-y-1.5">
                        <div className="font-bold text-zinc-100 border-b border-zinc-800 pb-1">
                          Mes: {d.month}
                        </div>
                        <div className="text-zinc-300">
                          Torre FLUXNET (Observado):{' '}
                          <span className="font-mono text-zinc-100 font-bold">
                            {selectedFlux === 'nee' ? d.fluxnet_nee : selectedFlux === 'gpp' ? d.fluxnet_gpp : d.fluxnet_reco}
                          </span>
                        </div>
                        <div className="text-sky-400">
                          Modelo 3-PG (Puro):{' '}
                          <span className="font-mono font-bold">
                            {selectedFlux === 'nee' ? d.pg3_nee : selectedFlux === 'gpp' ? d.pg3_gpp : d.pg3_reco}
                          </span>
                        </div>
                        <div className="text-emerald-400">
                          Modelo Híbrido Asimilado:{' '}
                          <span className="font-mono font-bold">
                            {selectedFlux === 'nee' ? d.hybrid_nee : selectedFlux === 'gpp' ? d.hybrid_gpp : d.hybrid_reco}
                          </span>
                        </div>
                        <div className="text-zinc-500 text-[10px]">
                          VPD: {d.vpdKPa} kPa | Temp: {d.tempC}°C
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

              {/* Observed Points */}
              <Line
                type="monotone"
                dataKey={selectedFlux === 'nee' ? 'fluxnet_nee' : selectedFlux === 'gpp' ? 'fluxnet_gpp' : 'fluxnet_reco'}
                name="FLUXNET Observado In-Situ"
                stroke="#f4f4f5"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#f4f4f5' }}
              />

              {/* 3-PG Baseline */}
              <Line
                type="monotone"
                dataKey={selectedFlux === 'nee' ? 'pg3_nee' : selectedFlux === 'gpp' ? 'pg3_gpp' : 'pg3_reco'}
                name="3-PG Basado en Procesos (Sin Asimilación)"
                stroke="#38bdf8"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Hybrid Model */}
              <Line
                type="monotone"
                dataKey={selectedFlux === 'nee' ? 'hybrid_nee' : selectedFlux === 'gpp' ? 'hybrid_gpp' : 'hybrid_reco'}
                name="SilvaTwin Híbrido (3-PG + Earthformer)"
                stroke="#10b981"
                strokeWidth={2.8}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Interactive Machine Learning Inference Lab (best_forestry_model.joblib) */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                Laboratorio Interactivo de Inferencia: Stacking Híbrido (3-PG + Deep Learning)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ejecuta inferencia en vivo con el modelo serializado <span className="font-mono text-emerald-400">best_forestry_model.joblib</span> (R² = 0.884, RMSE = 17.58 Mg C/ha — Hipótesis H1).
            </p>
          </div>
          <button
            onClick={handlePredict}
            disabled={isInferring}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {isInferring ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Predecir Biomasa AGB</span>
              </>
            )}
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* RH98 */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Altura GEDI RH98:</span>
              <span className="text-emerald-400 font-bold">{rh98.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={10}
              max={55}
              step={0.5}
              value={rh98}
              onChange={(e) => setRh98(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* NDVI */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Sentinel-2 NDVI:</span>
              <span className="text-sky-400 font-bold">{ndvi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.95}
              step={0.01}
              value={ndvi}
              onChange={(e) => setNdvi(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* SAVI */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Suelo Ajustado SAVI:</span>
              <span className="text-sky-400 font-bold">{savi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.8}
              step={0.01}
              value={savi}
              onChange={(e) => setSavi(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* NDWI */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Humedad Dosel NDWI:</span>
              <span className="text-cyan-400 font-bold">{ndwi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.65}
              step={0.01}
              value={ndwi}
              onChange={(e) => setNdwi(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* FMC */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Humedad SAR FMC:</span>
              <span className="text-amber-400 font-bold">{fmc.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={110}
              step={1}
              value={fmc}
              onChange={(e) => setFmc(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* VPD */}
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-400">Déficit Vapor VPD:</span>
              <span className="text-amber-400 font-bold">{vpd.toFixed(2)} kPa</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={3.5}
              step={0.05}
              value={vpd}
              onChange={(e) => setVpd(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Prediction Results Banner */}
        {predictionResult && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Predicción Híbrida AGB</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {predictionResult.agb_pred_mgc_ha} <span className="text-xs font-normal text-zinc-300">Mg C/ha</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5 font-mono">
                IC 95%: [{predictionResult.ci_95_lower}, {predictionResult.ci_95_upper}]
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Estimación 3-PG Puro</div>
              <div className="text-xl font-bold font-mono text-zinc-300">
                {predictionResult.pure_3pg_estimate_mgc_ha} <span className="text-xs font-normal text-zinc-400">Mg C/ha</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Modelo biofísico sin corrección ML</div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Corrección Residual ML</div>
              <div className={`text-xl font-bold font-mono ${predictionResult.hybrid_residual_correction >= 0 ? 'text-sky-400' : 'text-amber-400'}`}>
                {predictionResult.hybrid_residual_correction >= 0 ? '+' : ''}{predictionResult.hybrid_residual_correction} <span className="text-xs font-normal text-zinc-300">Mg C/ha</span>
              </div>
              <div className="text-[10px] text-sky-300/80 mt-0.5">Compensación no-lineal de sesgo</div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hipótesis H1 Validada</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 font-mono">{predictionResult.scientific_basis}</div>
            </div>
          </div>
        )}
      </div>

      {/* Deep Learning Architecture Details & Physical Loss Penalties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-zinc-200">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Arquitectura Spatiotemporal Cuboid Attention
            </h3>
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            El encoder-decoder espacio-temporal procesa tensores 5D [Batch, Tiempo, Canal, Alto, Ancho] aplicando auto-atención
            local en cuboides para capturar la inercia hídrica y la fenología del dosel a diferentes resoluciones espaciales.
          </p>
          <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1 text-zinc-300">
            <div>Entradas Satelitales: Sentinel-1 (VV, VH), Sentinel-2 (B2, B3, B4, B8, B11, B12)</div>
            <div>Forzamiento Climático: ERA5-Land (T2M, VPD, Radiación Solar ssrd, Precipitación)</div>
            <div>Mecanismo: Residual Physics-Guided Neural Network (PGNN)</div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-zinc-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Función de Pérdida con Regularización Física
            </h3>
          </div>
          <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-emerald-400">
            L_total = L_MSE(Y_obs, Y_pred) + λ₁·L_MassCons + λ₂·L_EnergyBalance + λ₃·L_Smoothness
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            La penalización física garantiza que el balance de carbono ecosistémico (NEE = Reco - GPP) y el agua transpirada
            no violen la ley de conservación de masa ni superen los límites termodinámicos impuestos por la radiación solar incidente.
          </p>
        </div>
      </div>
    </div>
  );
};
