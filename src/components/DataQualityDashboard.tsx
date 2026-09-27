import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, BarChart2, Satellite, Radio, Layers, Activity, Wifi } from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────
const SENSOR_LAYERS = [
  {
    id: 'gedi',
    name: 'GEDI L4A',
    subtitle: 'LiDAR Espacial',
    coverage: 95,
    noise: 2.1,
    cloudFree: 97,
    temporalCoverage: [88, 91, 93, 95, 92, 94, 95, 96, 95, 93, 95, 95],
    status: 'good' as const,
    color: '#10b981',
    colorDark: '#064e3b',
    colorMid: '#065f46',
    icon: Radio,
    metrics: [
      { label: 'Shots válidos', value: '2.4M' },
      { label: 'RH98 error', value: '±0.8m' },
      { label: 'Sensibilidad', value: '96%' },
    ],
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1',
    subtitle: 'SAR C-Band',
    coverage: 88,
    noise: 4.3,
    cloudFree: 100,
    temporalCoverage: [80, 84, 86, 88, 85, 87, 88, 89, 88, 87, 88, 88],
    status: 'good' as const,
    color: '#38bdf8',
    colorDark: '#0c4a6e',
    colorMid: '#075985',
    icon: Satellite,
    metrics: [
      { label: 'Polarización', value: 'HH/HV' },
      { label: 'Resolución', value: '10m' },
      { label: 'Revisita', value: '6 días' },
    ],
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2',
    subtitle: 'MSI Multispectral',
    coverage: 92,
    noise: 1.8,
    cloudFree: 85,
    temporalCoverage: [76, 82, 88, 90, 89, 92, 91, 90, 92, 91, 90, 92],
    status: 'good' as const,
    color: '#a78bfa',
    colorDark: '#3b0764',
    colorMid: '#4c1d95',
    icon: Layers,
    metrics: [
      { label: 'Bandas', value: '13' },
      { label: 'Nubes < 15%', value: '85%' },
      { label: 'NDVI σ', value: '0.03' },
    ],
  },
  {
    id: 'fluxnet',
    name: 'FLUXNET',
    subtitle: 'Eddy Covariance',
    coverage: 78,
    noise: 5.2,
    cloudFree: 100,
    temporalCoverage: [65, 70, 74, 78, 75, 78, 79, 78, 77, 78, 78, 78],
    status: 'warn' as const,
    color: '#f59e0b',
    colorDark: '#451a03',
    colorMid: '#78350f',
    icon: Activity,
    metrics: [
      { label: 'Torres activas', value: '3' },
      { label: 'GPP RMSE', value: '±3.2%' },
      { label: 'Gap-fill', value: '22%' },
    ],
  },
];

// ─── Isometric 3D block helpers ────────────────────────────────────────────
const ISO_A = Math.cos(Math.PI / 6); // cos30°
const ISO_B = Math.sin(Math.PI / 6); // sin30°

function isoProject(x: number, y: number, z: number, cx: number, cy: number) {
  return {
    px: cx + (x - y) * ISO_A,
    py: cy + (x + y) * ISO_B - z,
  };
}

interface IsoCubeProps {
  x: number; y: number; z: number;
  w: number; d: number; h: number;
  color: string; colorMid: string; colorDark: string;
  cx: number; cy: number;
  opacity?: number;
  onClick?: () => void;
  glowing?: boolean;
}

const IsoCube: React.FC<IsoCubeProps> = ({
  x, y, z, w, d, h,
  color, colorMid, colorDark,
  cx, cy, opacity = 1, onClick, glowing = false,
}) => {
  // 8 corners of the box
  const v = (dx: number, dy: number, dz: number) =>
    isoProject(x + dx * w, y + dy * d, z + dz * h, cx, cy);

  const p000 = v(0, 0, 0); const p100 = v(1, 0, 0);
  const p010 = v(0, 1, 0); const p110 = v(1, 1, 0);
  const p001 = v(0, 0, 1); const p101 = v(1, 0, 1);
  const p011 = v(0, 1, 1); const p111 = v(1, 1, 1);

  const pts = (corners: { px: number; py: number }[]) =>
    corners.map(c => `${c.px.toFixed(1)},${c.py.toFixed(1)}`).join(' ');

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', opacity }}>
      {/* Left face */}
      <polygon points={pts([p010, p110, p111, p011])} fill={colorDark} stroke="#18181b" strokeWidth={0.5} />
      {/* Right face */}
      <polygon points={pts([p100, p110, p111, p101])} fill={colorMid} stroke="#18181b" strokeWidth={0.5} />
      {/* Top face */}
      <polygon points={pts([p001, p101, p111, p011])} fill={color} stroke="#18181b" strokeWidth={0.5} />
      {glowing && (
        <polygon
          points={pts([p001, p101, p111, p011])}
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          opacity={0.5}
        />
      )}
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const DataQualityDashboard: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const DURATION = 1200;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / DURATION, 1);
      setAnimProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const selectedLayer = SENSOR_LAYERS.find(l => l.id === selected);

  // ── Isometric scene parameters ──────────────────────────────────────────
  const SVG_W = 520;
  const SVG_H = 320;
  const CX = SVG_W * 0.5;
  const CY = SVG_H * 0.72;
  const CUBE_W = 38;
  const CUBE_D = 38;
  const GAP = 6;
  const BASE_HEIGHT = 16;

  return (
    <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">
            Calidad de Datos — Vista 3D Multi-Sensor
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">4 / 4 sensores operativos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* ── Left: 3D Isometric Scene ─────────────────────────────── */}
        <div className="lg:col-span-7 p-4 flex flex-col items-center justify-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 text-center font-mono">
            Pirámide de Cobertura Multi-Sensor — Haz clic en un bloque para inspeccionar
          </p>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full max-w-lg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="glow-filter">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {SENSOR_LAYERS.map((layer, i) => {
              const totalW = SENSOR_LAYERS.length * (CUBE_W + GAP) - GAP;
              const startX = -totalW / 2;
              const bx = startX + i * (CUBE_W + GAP);
              const by = 0;
              const rawH = (layer.coverage / 100) * 120;
              const cubeH = rawH * animProgress;
              const isSelected = selected === layer.id;

              // base platform
              const baseOpacity = 0.4 + 0.6 * animProgress;
              return (
                <g key={layer.id}>
                  {/* Base pad */}
                  <IsoCube
                    x={bx} y={by} z={-BASE_HEIGHT}
                    w={CUBE_W} d={CUBE_D} h={BASE_HEIGHT}
                    color="#27272a" colorMid="#1c1c1e" colorDark="#111113"
                    cx={CX} cy={CY}
                    opacity={baseOpacity}
                  />
                  {/* Data quality bar */}
                  <IsoCube
                    x={bx} y={by} z={0}
                    w={CUBE_W} d={CUBE_D} h={cubeH}
                    color={layer.color}
                    colorMid={layer.colorMid}
                    colorDark={layer.colorDark}
                    cx={CX} cy={CY}
                    opacity={isSelected ? 1 : 0.78}
                    glowing={isSelected}
                    onClick={() => setSelected(isSelected ? null : layer.id)}
                  />
                  {/* Label above */}
                  {animProgress > 0.85 && (() => {
                    const topPt = isoProject(bx + CUBE_W / 2, by + CUBE_D / 2, cubeH + 6, CX, CY);
                    return (
                      <g>
                        <text
                          x={topPt.px} y={topPt.py - 10}
                          textAnchor="middle"
                          fill={layer.color}
                          fontSize={10}
                          fontFamily="monospace"
                          fontWeight="bold"
                          style={{ filter: isSelected ? `drop-shadow(0 0 4px ${layer.color})` : undefined }}
                        >
                          {layer.coverage}%
                        </text>
                        <text
                          x={topPt.px} y={topPt.py + 4}
                          textAnchor="middle"
                          fill="#71717a"
                          fontSize={9}
                          fontFamily="monospace"
                        >
                          {layer.name}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Ground plane grid lines */}
            {[0, 1, 2, 3, 4].map(gi => {
              const totalW2 = SENSOR_LAYERS.length * (CUBE_W + GAP) - GAP + CUBE_W;
              const startX2 = -totalW2 / 2 - CUBE_W * 0.5;
              const gx = startX2 + gi * (totalW2 / 4);
              const p1 = isoProject(gx, -CUBE_D * 0.4, -BASE_HEIGHT, CX, CY);
              const p2 = isoProject(gx, CUBE_D * 1.4, -BASE_HEIGHT, CX, CY);
              return (
                <line key={gi} x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
                  stroke="#27272a" strokeWidth={0.5} strokeDasharray="3 3" />
              );
            })}
          </svg>

          {/* Legend row */}
          <div className="flex items-center justify-center gap-6 mt-1">
            {SENSOR_LAYERS.map(l => (
              <button
                key={l.id}
                onClick={() => setSelected(selected === l.id ? null : l.id)}
                className={`flex items-center gap-1.5 text-[10px] font-mono transition-all px-2 py-1 rounded-md ${
                  selected === l.id
                    ? 'bg-zinc-800 border border-zinc-600 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Detail Panel ───────────────────────────────────── */}
        <div className="lg:col-span-5 border-l border-zinc-800 p-4 space-y-3 flex flex-col justify-between">
          {selectedLayer ? (
            /* ── Selected sensor detail ── */
            <div className="space-y-3 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: selectedLayer.colorDark, border: `1px solid ${selectedLayer.color}40` }}>
                  <selectedLayer.icon className="w-4 h-4" style={{ color: selectedLayer.color }} />
                </div>
                <div>
                  <div className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                    {selectedLayer.name}
                    {selectedLayer.status === 'good'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">{selectedLayer.subtitle}</div>
                </div>
              </div>

              {/* Coverage gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Cobertura Global</span>
                  <span style={{ color: selectedLayer.color }} className="font-bold">{selectedLayer.coverage}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${selectedLayer.coverage * animProgress}%`,
                      background: `linear-gradient(90deg, ${selectedLayer.colorMid}, ${selectedLayer.color})`,
                      boxShadow: `0 0 8px ${selectedLayer.color}60`,
                    }}
                  />
                </div>
              </div>

              {/* Temporal sparkline */}
              <div>
                <div className="text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Cobertura Temporal (12 meses)
                </div>
                <div className="flex items-end gap-0.5 h-14 bg-zinc-900/60 rounded-lg px-2 py-1.5 border border-zinc-800">
                  {selectedLayer.temporalCoverage.map((val, mi) => {
                    const pct = (val / 100) * animProgress;
                    const isHov = hoveredMonth === mi;
                    return (
                      <div
                        key={mi}
                        className="flex-1 rounded-t-sm relative group cursor-crosshair transition-all"
                        style={{
                          height: `${pct * 100}%`,
                          background: isHov ? selectedLayer.color : `${selectedLayer.color}70`,
                          boxShadow: isHov ? `0 0 6px ${selectedLayer.color}` : undefined,
                        }}
                        onMouseEnter={() => setHoveredMonth(mi)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {isHov && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-zinc-200 px-1 py-0.5 rounded whitespace-nowrap z-10">
                            {val}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-zinc-600 font-mono px-2 mt-0.5">
                  {['E','F','M','A','M','J','J','A','S','O','N','D'].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-2">
                {selectedLayer.metrics.map(m => (
                  <div key={m.label} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2 text-center">
                    <div className="font-bold font-mono text-sm" style={{ color: selectedLayer.color }}>{m.value}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Noise indicator */}
              <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs">
                <span className="text-zinc-400 font-mono">SNR / Ruido señal</span>
                <span className="font-mono text-amber-400 font-bold">σ = {selectedLayer.noise} dB</span>
              </div>
            </div>
          ) : (
            /* ── Summary grid (no selection) ── */
            <div className="space-y-2.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono pb-1 border-b border-zinc-800">
                Resumen de Integridad — Todos los Sensores
              </div>
              {SENSOR_LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setSelected(layer.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: layer.colorDark, border: `1px solid ${layer.color}30` }}>
                    <layer.icon className="w-3.5 h-3.5" style={{ color: layer.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{layer.name}</span>
                      <span className="text-[10px] font-mono font-bold" style={{ color: layer.color }}>
                        {layer.coverage}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${layer.coverage * animProgress}%`,
                          background: `linear-gradient(90deg, ${layer.colorMid}, ${layer.color})`,
                        }}
                      />
                    </div>
                  </div>
                  {layer.status === 'good'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}

              {/* Global QA score */}
              <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <div className="text-[10px] text-zinc-400 font-mono uppercase mb-1">Score Global QA/QC</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {Math.round((SENSOR_LAYERS.reduce((s, l) => s + l.coverage, 0) / SENSOR_LAYERS.length) * animProgress)}
                  <span className="text-sm text-zinc-400 font-normal">%</span>
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">
                  Promedio ponderado cobertura útil multi-sensor
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
