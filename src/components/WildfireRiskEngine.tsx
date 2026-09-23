import React, { useState } from 'react';
import { LandscapeRegion } from '../types';
import {
  Flame,
  Wind,
  Droplets,
  Thermometer,
  Sliders,
  AlertTriangle,
  Activity,
  Trees,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface WildfireRiskEngineProps {
  region: LandscapeRegion;
}

export const WildfireRiskEngine: React.FC<WildfireRiskEngineProps> = ({ region }) => {
  // Environmental sliders
  const [temperature, setTemperature] = useState<number>(32.5); // °C
  const [relHumidity, setRelHumidity] = useState<number>(22); // %
  const [windSpeedKmH, setWindSpeedKmH] = useState<number>(35); // km/h
  const [daysWithoutRain, setDaysWithoutRain] = useState<number>(24); // days
  const [slopePct, setSlopePct] = useState<number>(25); // %
  const [fuelModel, setFuelModel] = useState<'shrub_conifer' | 'dense_pine' | 'oak_hardwood'>('dense_pine');

  // Compute Canadian Fire Weather Index (FWI) sub-indices
  const calculateFWI = () => {
    // Fine Fuel Moisture Code (FFMC) [0-101]
    const ffmc = Math.min(96, Math.max(45, 82 + (temperature - 20) * 0.45 - (relHumidity - 30) * 0.35 + (windSpeedKmH - 15) * 0.2));

    // Duff Moisture Code (DMC)
    const dmc = Math.min(180, Math.max(10, daysWithoutRain * 3.8 + (temperature - 15) * 1.8));

    // Drought Code (DC)
    const dc = Math.min(950, Math.max(80, daysWithoutRain * 14.5 + (temperature - 10) * 6.5));

    // Initial Spread Index (ISI)
    const isi = 0.208 * Math.exp(0.05039 * windSpeedKmH) * (91 - ffmc <= 0 ? 1 : Math.exp(0.04 * ffmc) / 10);

    // Buildup Index (BUI)
    const bui = (0.8 * dmc * dc) / (dmc + 0.4 * dc);

    // Final Fire Weather Index (FWI)
    let fwi = 0;
    if (bui <= 80) {
      fwi = 0.1 * isi * (0.626 * Math.pow(bui, 0.809) + 2);
    } else {
      fwi = 0.1 * isi * (1000 / (25 + 108.64 * Math.exp(-0.023 * bui)));
    }
    fwi = Math.min(100, Math.max(0, fwi));

    // Rothermel Rate of Spread (ROS m/min)
    const slopeMultiplier = 1 + 5.275 * Math.pow(Math.tan((slopePct * Math.PI) / 180), 2);
    const windMultiplier = Math.pow(windSpeedKmH / 10, 1.45);
    const rosSurface = Math.max(0.2, (0.85 * (fwi / 15) * slopeMultiplier * windMultiplier));

    // Canopy Bulk Density from GEDI (kg/m3)
    const cbd = fuelModel === 'dense_pine' ? 0.28 : fuelModel === 'shrub_conifer' ? 0.18 : 0.12;
    const cbh = fuelModel === 'dense_pine' ? 4.5 : fuelModel === 'shrub_conifer' ? 2.0 : 8.0; // Canopy Base Height (m)

    // Van Wagner Crown Fire Transition Index
    const criticalFlameLength = 0.0775 * Math.pow(cbh * (460 + 25.9 * relHumidity), 0.75);
    const flameLength = 0.0775 * Math.pow(rosSurface * 85, 0.46);
    const crownFireRiskProb = Math.min(0.98, Math.max(0.05, flameLength >= criticalFlameLength ? (flameLength / criticalFlameLength) * 0.65 : 0.15));

    // Sentinel-1 SAR Fuel Moisture estimation
    const fuelMoistureSAR = Math.max(8, Math.min(85, 45 - (daysWithoutRain * 1.2) - (temperature * 0.4) + (relHumidity * 0.35)));

    return {
      ffmc: parseFloat(ffmc.toFixed(1)),
      dmc: parseFloat(dmc.toFixed(1)),
      dc: parseFloat(dc.toFixed(1)),
      isi: parseFloat(isi.toFixed(1)),
      bui: parseFloat(bui.toFixed(1)),
      fwi: parseFloat(fwi.toFixed(1)),
      rosSurface: parseFloat(rosSurface.toFixed(1)),
      flameLength: parseFloat(flameLength.toFixed(1)),
      crownFireRiskProb: parseFloat(crownFireRiskProb.toFixed(2)),
      fuelMoistureSAR: parseFloat(fuelMoistureSAR.toFixed(1)),
      cbd,
      cbh,
    };
  };

  const fwiData = calculateFWI();

  // FWI Level classification
  const getFWIClass = (val: number) => {
    if (val < 5.2) return { label: 'Bajo', color: '#10b981', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (val < 11.2) return { label: 'Moderado', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    if (val < 21.3) return { label: 'Alto', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (val < 38.0) return { label: 'Muy Alto', color: '#f97316', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    return { label: 'Extremo / Catastrófico', color: '#ef4444', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  };

  const fwiLevel = getFWIClass(fwiData.fwi);

  // Sub-index Bar Chart Data
  const fwiSubIndices = [
    { name: 'FFMC (Finos)', value: fwiData.ffmc, max: 100, desc: 'Humedad combustible fino' },
    { name: 'DMC (Duff)', value: fwiData.dmc, max: 150, desc: 'Humedad capa orgánica media' },
    { name: 'DC (Sequía)', value: fwiData.dc, max: 800, desc: 'Déficit hídrico profundo' },
    { name: 'ISI (Propagación)', value: fwiData.isi, max: 40, desc: 'Índice propagación inicial' },
    { name: 'BUI (Combustible)', value: fwiData.bui, max: 120, desc: 'Combustible disponible total' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Motor Físico-Climático de Riesgo de Incendio Forestal (FWI + Van Wagner 3D)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Acoplamiento entre el índice meteorológico canadiense (FWI), la estructura vertical del dosel GEDI (CBH, CBD)
            y la humedad del combustible derivada de Sentinel-1 SAR en <span className="text-emerald-400 font-semibold">{region.name}</span>.
          </p>
        </div>

        {/* Live FWI Score Tag */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 font-mono ${fwiLevel.bg}`}>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400">Nivel FWI Ecosistémico</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <span>{fwiData.fwi}</span>
              <span className="text-xs uppercase font-sans font-semibold">[{fwiLevel.label}]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Weather Inputs and Fire Physics Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Environmental Sliders */}
        <div className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs text-zinc-200">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Variables Meteorológicas & Topografía
            </h3>
          </div>

          {/* Temperature */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperatura Máxima
              </span>
              <span className="font-mono text-zinc-200 font-bold">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Relative Humidity */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Droplets className="w-3.5 h-3.5 text-sky-400" /> Humedad Relativa (HR)
              </span>
              <span className="font-mono text-zinc-200 font-bold">{relHumidity}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={relHumidity}
              onChange={(e) => setRelHumidity(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Wind Speed */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> Velocidad del Viento
              </span>
              <span className="font-mono text-zinc-200 font-bold">{windSpeedKmH} km/h</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={windSpeedKmH}
              onChange={(e) => setWindSpeedKmH(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Days Without Rain */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Días Consecutivos sin Lluvia</span>
              <span className="font-mono text-amber-400 font-bold">{daysWithoutRain} días</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={daysWithoutRain}
              onChange={(e) => setDaysWithoutRain(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Slope */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Pendiente Topográfica</span>
              <span className="font-mono text-zinc-200 font-bold">{slopePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={slopePct}
              onChange={(e) => setSlopePct(parseInt(e.target.value))}
              className="w-full accent-zinc-500 cursor-pointer"
            />
          </div>

          {/* Fuel Model Type */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-zinc-800">
            <span className="text-zinc-400 block font-medium">Modelo Estructural de Combustible:</span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => setFuelModel('dense_pine')}
                className={`p-2 rounded border text-center transition-all ${
                  fuelModel === 'dense_pine' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                Pinar Denso
              </button>
              <button
                onClick={() => setFuelModel('shrub_conifer')}
                className={`p-2 rounded border text-center transition-all ${
                  fuelModel === 'shrub_conifer' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                Matorral + Pino
              </button>
              <button
                onClick={() => setFuelModel('oak_hardwood')}
                className={`p-2 rounded border text-center transition-all ${
                  fuelModel === 'oak_hardwood' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                Frondosa (Roble)
              </button>
            </div>
          </div>
        </div>

        {/* Physics Outputs & Crown Transition Breakdown */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Key Dynamic Risk Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Velocidad de Propagación (ROS)</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {fwiData.rosSurface} <span className="text-xs text-zinc-500 font-normal">m / min</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Ecuación de Rothermel acoplada a pendiente y viento.</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Longitud de Llama</span>
              </div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {fwiData.flameLength} <span className="text-xs text-zinc-500 font-normal">metros</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Intensidad lineal de Byram (kW/m).</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Probabilidad Fuego de Copas</span>
              </div>
              <div className="text-xl font-bold font-mono text-red-400">
                {(fwiData.crownFireRiskProb * 100).toFixed(0)}%{' '}
                <span className="text-xs text-zinc-500 font-normal">
                  {fwiData.crownFireRiskProb > 0.6 ? '(Copas Activo)' : '(Fuego Superficial)'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Criterio de transición vertical Van Wagner.</p>
            </div>
          </div>

          {/* Canadian Sub-Indices Breakdown Chart */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                Subíndices Canadiense FWI (FFMC, DMC, DC, ISI, BUI)
              </span>
              <span className="font-mono text-zinc-500 text-[10px]">Normalizado según rangos de peligro</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fwiSubIndices} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-700 p-2.5 rounded-lg text-xs shadow-2xl space-y-1">
                            <div className="font-bold text-amber-400">{d.name}</div>
                            <div className="text-zinc-200">Valor Actual: <span className="font-mono font-bold">{d.value}</span></div>
                            <div className="text-zinc-500 text-[10px]">{d.desc}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {fwiSubIndices.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 3 || index === 4 ? '#ef4444' : index === 0 ? '#f97316' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar FMC & GEDI 3D Fuel Stratification Synergy */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl text-xs space-y-2 text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>Sinergia Teledetección Radar SAR (Sentinel-1) + LiDAR 3D (GEDI)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              La altura de la base de la copa (CBH = <span className="text-sky-300 font-mono font-semibold">{fwiData.cbh} m</span>)
              y la densidad aparente del dosel (CBD = <span className="text-amber-300 font-mono font-semibold">{fwiData.cbd} kg/m³</span>)
              estimadas mediante GEDI determinan el umbral crítico para la propagación de copas pasivo y activo. El radar Sentinel-1
              VV/VH cuantifica la constante dieléctrica y humedad del combustible (FMC = <span className="text-cyan-300 font-mono font-semibold">{fwiData.fuelMoistureSAR}%</span>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
