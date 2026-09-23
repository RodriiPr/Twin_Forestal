import React, { useState } from 'react';
import { LandscapeRegion, EcophysiologicalParams } from '../types';
import {
  Trees,
  Sliders,
  Sparkles,
  Info,
  Droplets,
  Thermometer,
  Wind,
  Activity,
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
  AreaChart,
  Area,
} from 'recharts';

interface Ecophysiological3PGProps {
  region: LandscapeRegion;
}

export const Ecophysiological3PG: React.FC<Ecophysiological3PGProps> = ({ region }) => {
  // Default parameters
  const [params, setParams] = useState<EcophysiologicalParams>({
    alphaCx: 0.045, // Canopy quantum efficiency (mol C / mol APAR)
    tOpt: 18.5,
    tMin: 2.0,
    tMax: 38.0,
    kGPP: 0.055,
    maxStomatalCond: 0.02,
    sla: 8.5,
    soilWaterCapacityMm: 200,
    litterfallRate: 0.08,
    rootAllocationBase: 0.25,
    stemMortalityRate: 0.012,
  });

  const [currentTemp, setCurrentTemp] = useState<number>(22.0);
  const [currentVPD, setCurrentVPD] = useState<number>(1.8);
  const [currentSWC, setCurrentSWC] = useState<number>(120);

  // Generate Temperature Modifier curve f_T(T)
  const tempCurveData = Array.from({ length: 45 }, (_, i) => {
    const t = i;
    let f_t = 0;
    if (t > params.tMin && t < params.tMax) {
      const num = (t - params.tMin) / (params.tOpt - params.tMin);
      const den = (params.tMax - t) / (params.tMax - params.tOpt);
      const exp = (params.tMax - params.tOpt) / (params.tOpt - params.tMin);
      f_t = Math.max(0, Math.min(1, num * Math.pow(den, exp)));
    }
    return {
      temp: t,
      f_t: parseFloat(f_t.toFixed(3)),
    };
  });

  // Generate VPD Stomatal Modifier curve f_VPD
  const vpdCurveData = Array.from({ length: 40 }, (_, i) => {
    const vpd = i * 0.1;
    const f_vpd = Math.exp(-params.kGPP * vpd);
    return {
      vpd: parseFloat(vpd.toFixed(1)),
      f_vpd: parseFloat(f_vpd.toFixed(3)),
    };
  });

  // Dynamic Carbon Partitioning over Stand Age
  const allocationData = Array.from({ length: 50 }, (_, i) => {
    const age = i + 1;
    const eta_root = Math.max(0.18, params.rootAllocationBase + 0.15 * Math.exp(-age / 15));
    const eta_fol = Math.max(0.15, 0.35 * Math.exp(-age / 20));
    const eta_stem = Math.max(0.2, 1.0 - eta_root - eta_fol);
    return {
      age,
      eta_stem: parseFloat((eta_stem * 100).toFixed(1)),
      eta_fol: parseFloat((eta_fol * 100).toFixed(1)),
      eta_root: parseFloat((eta_root * 100).toFixed(1)),
    };
  });

  // Calculate live instant modifiers
  const calculateCurrentModifiers = () => {
    let f_t = 0;
    if (currentTemp > params.tMin && currentTemp < params.tMax) {
      const num = (currentTemp - params.tMin) / (params.tOpt - params.tMin);
      const den = (params.tMax - currentTemp) / (params.tMax - params.tOpt);
      const exp = (params.tMax - params.tOpt) / (params.tOpt - params.tMin);
      f_t = Math.max(0, Math.min(1, num * Math.pow(den, exp)));
    }
    const f_vpd = Math.exp(-params.kGPP * currentVPD);
    const f_swc = Math.max(0.05, Math.min(1.0, currentSWC / params.soilWaterCapacityMm));
    const f_phys = f_t * f_vpd * f_swc;

    // Instantaneous GPP calculation (g C m-2 day-1)
    const apar = 12.5; // Absorbed Photosynthetically Active Radiation (MJ m-2 d-1)
    const gpp = params.alphaCx * apar * f_phys * 12.01; // g C/m2/d
    const npp = gpp * 0.47; // Carbon Use Efficiency approx 0.47
    const trans = currentVPD * params.maxStomatalCond * f_phys * 1000; // mm/day

    return {
      f_t: parseFloat(f_t.toFixed(2)),
      f_vpd: parseFloat(f_vpd.toFixed(2)),
      f_swc: parseFloat(f_swc.toFixed(2)),
      f_phys: parseFloat(f_phys.toFixed(2)),
      gpp: parseFloat(gpp.toFixed(2)),
      npp: parseFloat(npp.toFixed(2)),
      trans: parseFloat(trans.toFixed(2)),
    };
  };

  const currentMod = calculateCurrentModifiers();

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Motor Ecofisiológico de Procesos 3-PG (Landsberg & Waring)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Simulación de fotosíntesis cuántica, balance hídrico foliar, y asignación dinámica de carbono entre fuste,
            hojarasca y raíces en <span className="text-emerald-400 font-semibold">{region.name}</span>.
          </p>
        </div>

        {/* Live CUE Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-medium font-mono">Eficiencia de Uso de Carbono (CUE): 0.47 ± 0.04</span>
        </div>
      </div>

      {/* Grid of Interactive Environmental Drivers & Modifier Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Environmental Driver Sliders */}
        <div className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-200">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Forzamiento Meteorológico
              </h3>
            </div>
            <button
              onClick={() => {
                setCurrentTemp(22.0);
                setCurrentVPD(1.8);
                setCurrentSWC(120);
              }}
              className="text-[10px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperatura Aire (T)
              </span>
              <span className="font-mono text-zinc-200 font-bold">{currentTemp}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Tmin: {params.tMin}°C</span>
              <span className="text-emerald-400 font-semibold">Topt: {params.tOpt}°C</span>
              <span>Tmax: {params.tMax}°C</span>
            </div>
          </div>

          {/* VPD Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Wind className="w-3.5 h-3.5 text-sky-400" /> Déficit Presión Vapor (VPD)
              </span>
              <span className="font-mono text-zinc-200 font-bold">{currentVPD} kPa</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4.5"
              step="0.1"
              value={currentVPD}
              onChange={(e) => setCurrentVPD(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.1 (Húmedo)</span>
              <span className="text-rose-400">Cierre estomático &gt; 2.5 kPa</span>
              <span>4.5 (Extremo)</span>
            </div>
          </div>

          {/* Soil Water Content Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Agua Disponible Suelo (ASW)
              </span>
              <span className="font-mono text-zinc-200 font-bold">{currentSWC} mm</span>
            </div>
            <input
              type="range"
              min="10"
              max={params.soilWaterCapacityMm}
              step="5"
              value={currentSWC}
              onChange={(e) => setCurrentSWC(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Punto Marchitez (10 mm)</span>
              <span>Capacidad Campo ({params.soilWaterCapacityMm} mm)</span>
            </div>
          </div>

          {/* Computed Multipliers HUD */}
          <div className="bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-800 space-y-2.5 text-xs shadow-inner">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Modificadores Ecofisiológicos (0.0 a 1.0)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">f_T(T)</div>
                <div className="font-mono font-bold text-amber-400 text-sm">{currentMod.f_t}</div>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">f_VPD</div>
                <div className="font-mono font-bold text-sky-400 text-sm">{currentMod.f_vpd}</div>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">f_SWC</div>
                <div className="font-mono font-bold text-cyan-400 text-sm">{currentMod.f_swc}</div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Modificador Global (f_Phys):</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{currentMod.f_phys}</span>
            </div>
          </div>

          {/* Instant Flux Outputs */}
          <div className="bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-800 space-y-2 text-xs">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Flujos Instantáneos Estimados
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Productividad Primaria Bruta (GPP):</span>
              <span className="font-mono text-emerald-400 font-bold">{currentMod.gpp} g C m⁻² d⁻¹</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Productividad Neta (NPP):</span>
              <span className="font-mono text-sky-400 font-bold">{currentMod.npp} g C m⁻² d⁻¹</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Transpiración del Dosel:</span>
              <span className="font-mono text-cyan-400 font-bold">{currentMod.trans} mm d⁻¹</span>
            </div>
          </div>
        </div>

        {/* Right Column: Physiological Response Curves & Dynamic Allocation */}
        <div className="lg:col-span-8 space-y-4">
          {/* Temperature & VPD Response Curves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temp Response */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2 text-xs">
                <span className="font-semibold text-zinc-200">Respuesta Térmica f_T(T)</span>
                <span className="font-mono text-[11px] text-amber-400">Topt = {params.tOpt}°C</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempCurveData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="temp" stroke="#71717a" tick={{ fontSize: 10 }} unit="°C" />
                    <YAxis domain={[0, 1]} stroke="#71717a" tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-950 border border-zinc-700 p-2 rounded text-[11px] shadow-xl">
                              <div>Temp: <span className="font-mono text-amber-400">{payload[0].payload.temp}°C</span></div>
                              <div>f_T: <span className="font-mono text-emerald-400 font-bold">{payload[0].value}</span></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="f_t" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* VPD Response */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2 text-xs">
                <span className="font-semibold text-zinc-200">Sensibilidad Estomática a VPD</span>
                <span className="font-mono text-[11px] text-sky-400">k_GPP = {params.kGPP}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vpdCurveData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="vpd" stroke="#71717a" tick={{ fontSize: 10 }} unit=" kPa" />
                    <YAxis domain={[0, 1]} stroke="#71717a" tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-950 border border-zinc-700 p-2 rounded text-[11px] shadow-xl">
                              <div>VPD: <span className="font-mono text-sky-400">{payload[0].payload.vpd} kPa</span></div>
                              <div>f_VPD: <span className="font-mono text-emerald-400 font-bold">{payload[0].value}</span></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="f_vpd" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dynamic Carbon Allocation over Stand Age */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3 text-xs">
              <div>
                <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                  Partición Alométrica del Carbono (η_stem, η_fol, η_root) vs Edad
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Cambio ontogenético: la fracción asignada al fuste aumenta con la edad mientras que la de hojas y raíces finas decae.
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={allocationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="age" stroke="#71717a" tick={{ fontSize: 10 }} label={{ value: 'Edad del Rodal (Años)', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg text-xs shadow-2xl space-y-1">
                            <div className="font-bold text-zinc-200">Edad: {payload[0].payload.age} años</div>
                            <div className="text-emerald-400">Fuste (η_stem): {payload[0].payload.eta_stem}%</div>
                            <div className="text-sky-400">Follaje (η_fol): {payload[0].payload.eta_fol}%</div>
                            <div className="text-amber-400">Raíces (η_root): {payload[0].payload.eta_root}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="eta_stem" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.7} name="Fuste / Madera" />
                  <Area type="monotone" dataKey="eta_fol" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.7} name="Follaje / Copas" />
                  <Area type="monotone" dataKey="eta_root" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} name="Raíces Finas" />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
