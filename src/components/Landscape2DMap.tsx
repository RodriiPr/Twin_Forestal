import React, { useState, useEffect, useRef } from 'react';
import {
  MapLayerType,
  RasterPixelInfo,
  LandscapeRegion,
} from '../types';
import {
  Layers,
  Info,
  Crosshair,
  Sliders,
  Download,
  Eye,
  Maximize2,
  TreePine,
  Flame,
  Activity,
  Droplet,
  Compass,
  Globe,
  MapPin,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Helper component to smoothly re-center Leaflet map when selected region changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
};

// Fix default Leaflet icon paths
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Landscape2DMapProps {
  region: LandscapeRegion;
  onInspectPixel?: (pixel: RasterPixelInfo) => void;
}

export const Landscape2DMap: React.FC<Landscape2DMapProps> = ({ region, onInspectPixel }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [opacity, setOpacity] = useState<number>(0.9);
  const [resolution, setResolution] = useState<'10m' | '30m' | '100m'>('30m');
  const [selectedPixel, setSelectedPixel] = useState<RasterPixelInfo | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<RasterPixelInfo | null>(null);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [gridSize] = useState<number>(36); // 36x36 grid = 1296 stands/cells

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate synthetic deterministic spatial raster grid matching landscape topography
  const generatePixelData = (x: number, y: number): RasterPixelInfo => {
    const nx = x / gridSize;
    const ny = y / gridSize;

    const elev = region.elevationM + Math.sin(nx * Math.PI) * 450 + Math.cos(ny * Math.PI * 1.5) * 280;
    const slope = Math.max(2, Math.abs(Math.sin(nx * 4) * 35 + Math.cos(ny * 3) * 18));
    const aspect = nx > 0.5 ? 'Solana (Sur)' : 'Umbría (Norte)';

    const aspectFactor = nx > 0.5 ? 0.85 : 1.2;
    const elevFactor = 1.0 - Math.max(0, (elev - region.elevationM) / 1200);
    const noise = Math.sin(x * 12.3 + y * 7.7) * 0.15;

    const baseAGB = region.baselineAGB * aspectFactor * elevFactor * (1 + noise);
    const agb = Math.max(12, Math.min(380, baseAGB));
    const height = Math.max(4, Math.min(46, Math.sqrt(agb) * 2.8 + noise * 3));
    const ndvi = Math.max(0.25, Math.min(0.92, 0.55 + (agb / 300) * 0.35 + noise * 0.05));
    const ndwi = Math.max(-0.1, Math.min(0.65, (ndvi - 0.45) * 0.7));
    const fuelMoisture = Math.max(15, Math.min(95, 75 * (1 - (nx > 0.5 ? 0.25 : 0)) - (slope > 25 ? 12 : 0)));
    const fwiRisk = Math.max(0.04, Math.min(0.96, (100 - fuelMoisture) * 0.009 + (slope / 45) * 0.2 + (agb > 80 ? 0.15 : 0)));
    const soc = Math.max(35, region.baselineSOC * elevFactor * (1 + noise * 0.5));
    const gpp = Math.max(1.2, (ndvi * 16.5) * (1 - fwiRisk * 0.3));
    const reco = Math.max(0.8, gpp * 0.58 + (elev > 1400 ? -0.5 : 0.4));
    const nee = reco - gpp;

    const species = region.dominantSpecies[Math.floor((nx * 2.5 + ny * 1.5) % region.dominantSpecies.length)];
    const standAge = Math.round(25 + (agb / region.baselineAGB) * 35);

    const lat = region.center[0] + (ny - 0.5) * 0.15;
    const lng = region.center[1] + (nx - 0.5) * 0.18;

    return {
      x,
      y,
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5)),
      standId: `STAND-${region.id.slice(0, 3).toUpperCase()}-${String(y).padStart(2, '0')}${String(x).padStart(2, '0')}`,
      species,
      standAge,
      agbMgC_ha: parseFloat(agb.toFixed(1)),
      gediHeightM: parseFloat(height.toFixed(1)),
      ndvi: parseFloat(ndvi.toFixed(3)),
      ndwi: parseFloat(ndwi.toFixed(3)),
      fuelMoisturePct: parseFloat(fuelMoisture.toFixed(1)),
      fwiRisk: parseFloat(fwiRisk.toFixed(3)),
      socMgC_ha: parseFloat(soc.toFixed(1)),
      gppFlux: parseFloat(gpp.toFixed(2)),
      neeFlux: parseFloat(nee.toFixed(2)),
      recoFlux: parseFloat(reco.toFixed(2)),
      slopePct: parseFloat(slope.toFixed(1)),
      aspect,
      elevationM: Math.round(elev),
    };
  };

  const getColorForLayer = (p: RasterPixelInfo, layer: MapLayerType): string => {
    switch (layer) {
      case 'agb': {
        const t = Math.min(1, Math.max(0, (p.agbMgC_ha - 10) / 250));
        const r = Math.round(16 + t * 180);
        const g = Math.round(185 * t + (1 - t) * 90);
        const b = Math.round(129 * (1 - t) + 40);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'gedi_height': {
        const t = Math.min(1, Math.max(0, p.gediHeightM / 40));
        const r = Math.round(15 + t * 110);
        const g = Math.round(60 + t * 190);
        const b = Math.round(140 + (1 - t) * 110);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 's2_ndvi': {
        const t = Math.min(1, Math.max(0, (p.ndvi - 0.2) / 0.7));
        const r = Math.round(140 * (1 - t) + 20 * t);
        const g = Math.round(80 * (1 - t) + 220 * t);
        const b = Math.round(40 * (1 - t) + 40 * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 's2_ndwi': {
        const t = Math.min(1, Math.max(0, (p.ndwi + 0.1) / 0.7));
        const r = Math.round(180 * (1 - t) + 10 * t);
        const g = Math.round(140 * (1 - t) + 160 * t);
        const b = Math.round(50 * (1 - t) + 240 * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 's1_moisture': {
        const t = Math.min(1, Math.max(0, (p.fuelMoisturePct - 20) / 75));
        const r = Math.round(230 * (1 - t) + 20 * t);
        const g = Math.round(120 * (1 - t) + 210 * t);
        const b = Math.round(40 * (1 - t) + 220 * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'wildfire_risk': {
        const t = p.fwiRisk;
        if (t < 0.4) {
          const subT = t / 0.4;
          return `rgb(${Math.round(40 + subT * 180)}, ${Math.round(180 + subT * 40)}, 40)`;
        } else {
          const subT = (t - 0.4) / 0.6;
          return `rgb(${Math.round(220 + subT * 35)}, ${Math.round(220 * (1 - subT))}, 30)`;
        }
      }
      case 'soc': {
        const t = Math.min(1, Math.max(0, (p.socMgC_ha - 30) / 120));
        const r = Math.round(180 * (1 - t) + 70 * t);
        const g = Math.round(140 * (1 - t) + 45 * t);
        const b = Math.round(100 * (1 - t) + 25 * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'nee_flux': {
        const t = Math.min(1, Math.max(0, (p.neeFlux + 8) / 12));
        const r = Math.round(30 + t * 210);
        const g = Math.round(210 * (1 - t) + 40);
        const b = Math.round(60);
        return `rgb(${r}, ${g}, ${b})`;
      }
      default:
        return '#10b981';
    }
  };

  // Render raster canvas when a raster layer is active
  useEffect(() => {
    if (activeLayer === 'satellite' || activeLayer === 'terrain') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / gridSize;
    const cellH = height / gridSize;

    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const p = generatePixelData(x, y);
        ctx.fillStyle = getColorForLayer(p, activeLayer);
        ctx.globalAlpha = opacity;
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);

        if (showContours && (p.elevationM % 150 < 12)) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
    }

    if (hoveredPixel) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoveredPixel.x * cellW, hoveredPixel.y * cellH, cellW, cellH);
    }

    if (selectedPixel) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(selectedPixel.x * cellW, selectedPixel.y * cellH, cellW, cellH);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc((selectedPixel.x + 0.5) * cellW, (selectedPixel.y + 0.5) * cellH, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [activeLayer, opacity, gridSize, region, selectedPixel, hoveredPixel, showContours]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const p = generatePixelData(x, y);
      setHoveredPixel(p);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const p = generatePixelData(x, y);
      setSelectedPixel(p);
      if (onInspectPixel) onInspectPixel(p);
    }
  };

  useEffect(() => {
    const defaultP = generatePixelData(18, 18);
    setSelectedPixel(defaultP);
    if (onInspectPixel) onInspectPixel(defaultP);
  }, [region]);

  const layerOptions: { id: MapLayerType; name: string; unit: string; sensor: string; desc: string }[] = [
    { id: 'satellite', name: 'Satélite Alta Res (Esri World)', unit: 'RGB Óptico', sensor: 'Esri World Imagery', desc: 'Imagen satelital óptica multiespectral de alta resolución geográfica.' },
    { id: 'terrain', name: 'Relieve & Topografía', unit: 'Cotas (m)', sensor: 'OpenTopoMap / DEM', desc: 'Modelo digital de elevación con sombreado del relieve y curvas de nivel.' },
    { id: 'agb', name: 'Biomasa Aérea (AGB)', unit: 'Mg C / ha', sensor: 'GEDI L4A + 3-PG', desc: 'Densidad de carbono aéreo calibrado con LiDAR GEDI y modelo ecofisiológico.' },
    { id: 'gedi_height', name: 'Altura del Dosel (RH98)', unit: 'Metros (m)', sensor: 'GEDI L2A/L4A', desc: 'Percentil 98 del perfil vertical de retorno de energía del láser espacial.' },
    { id: 's2_ndvi', name: 'Vigor Vegetal (NDVI)', unit: 'Índice (0-1)', sensor: 'Sentinel-2 L2A', desc: 'Índice de Vegetación de Diferencia Normalizada (B8 - B4)/(B8 + B4).' },
    { id: 's2_ndwi', name: 'Humedad Canopea (NDWI)', unit: 'Índice (-1 a 1)', sensor: 'Sentinel-2 L2A', desc: 'Índice de Agua de Diferencia Normalizada sensible a contenido hídrico foliar.' },
    { id: 's1_moisture', name: 'Humedad Combustible SAR', unit: '% FMC', sensor: 'Sentinel-1 GRD SAR', desc: 'Constante dieléctrica y retrodispersión radar polarimétrico VV/VH.' },
    { id: 'wildfire_risk', name: 'Probabilidad de Incendio (FWI)', unit: '0.0 - 1.0', sensor: 'Motor Híbrido + ERA5', desc: 'Índice canadiense acoplado con carga de combustible 3D y sequía.' },
    { id: 'soc', name: 'Carbono Orgánico Suelo (SOC)', unit: 'Mg C / ha', sensor: 'Inventarios + 3-PG', desc: 'Stock de carbono en los primeros 100 cm de perfil edáfico.' },
    { id: 'nee_flux', name: 'Flujo Neto Ecosistema (NEE)', unit: 'µmol m⁻² s⁻¹', sensor: 'FLUXNET + Bi-LSTM', desc: 'Balance neto de CO2 (valores negativos indican sumidero de carbono).' },
  ];

  const currentActiveLayerMeta = layerOptions.find((l) => l.id === activeLayer)!;
  const inspected = hoveredPixel || selectedPixel;

  const sampleStands = [
    generatePixelData(8, 8),
    generatePixelData(18, 18),
    generatePixelData(28, 24),
    generatePixelData(12, 30),
    generatePixelData(30, 10),
  ];

  return (
    <div className="space-y-4">
      {/* Top control bar */}
      <div className={`backdrop-blur-md border p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors ${
        isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/80 border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs mr-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
              {language === 'es' ? 'Capa Espacial / Satelital:' : 'Spatial / Satellite Layer:'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {layerOptions.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeLayer === layer.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : isDark
                    ? 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                {layer.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* View tweaks */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className={`uppercase tracking-wider text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              {language === 'es' ? 'Opacidad:' : 'Opacity:'}
            </span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className={`font-mono w-8 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{Math.round(opacity * 100)}%</span>
          </div>

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <span className={`text-[10px] uppercase font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>RES:</span>
            {(['10m', '30m', '100m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  resolution === r ? 'bg-emerald-500 text-slate-950 font-bold' : isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
              showContours
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500'
                : isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-500'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            {language === 'es' ? 'Curvas Nivel' : 'Contours'}
          </button>
        </div>
      </div>

      {/* Main Map Viewport & Stand Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container */}
        <div className={`lg:col-span-8 backdrop-blur-md border rounded-xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl transition-colors ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {region.name}
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">
                [{region.center[0].toFixed(3)}°N, {region.center[1].toFixed(3)}°E]
              </span>
              <span className="bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono">
                {(region.areaHa).toLocaleString()} ha
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono">
                <Crosshair className="w-3.5 h-3.5 animate-pulse" /> SENSOR EN TIEMPO REAL ACTIVO
              </span>
            </div>
          </div>

          {/* Map Area */}
          <div className="w-full relative border border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-zinc-950 aspect-square max-w-[576px]">
            {activeLayer === 'satellite' || activeLayer === 'terrain' ? (
              <MapContainer
                center={region.center}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full z-10"
                style={{ height: '100%', width: '100%' }}
              >
                <MapRecenter center={region.center} />
                {activeLayer === 'satellite' ? (
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={18}
                  />
                ) : (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    maxZoom={17}
                  />
                )}

                <Marker position={region.center} icon={customIcon}>
                  <Popup className="font-sans text-xs">
                    <div className="p-1 space-y-1">
                      <h3 className="font-bold text-slate-900">{region.name}</h3>
                      <p className="text-slate-600 text-[11px]">{region.biome}</p>
                      <p className="text-emerald-700 font-semibold text-[11px]">Biomasa Base: {region.baselineAGB} Mg C/ha</p>
                    </div>
                  </Popup>
                </Marker>

                {sampleStands.map((stand) => (
                  <CircleMarker
                    key={stand.standId}
                    center={[stand.lat, stand.lng]}
                    radius={9}
                    pathOptions={{
                      color: selectedPixel?.standId === stand.standId ? '#10b981' : '#38bdf8',
                      fillColor: selectedPixel?.standId === stand.standId ? '#10b981' : '#0284c7',
                      fillOpacity: opacity,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedPixel(stand);
                        if (onInspectPixel) onInspectPixel(stand);
                      },
                      mouseover: () => setHoveredPixel(stand),
                      mouseout: () => setHoveredPixel(null),
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <strong className="text-emerald-700 block">{stand.standId}</strong>
                        <div>Especie: {stand.species}</div>
                        <div>AGB: {stand.agbMgC_ha} Mg C/ha</div>
                        <div>Altura: {stand.gediHeightM} m</div>
                        <div>Riesgo FWI: {(stand.fwiRisk * 100).toFixed(0)}%</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : (
              <>
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(#10b981 0.8px, transparent 0.8px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <canvas
                  ref={canvasRef}
                  width={576}
                  height={576}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoveredPixel(null)}
                  onClick={handleCanvasClick}
                  className="cursor-crosshair block w-full aspect-square object-contain relative z-10"
                />
              </>
            )}

            {/* In-canvas Overlay */}
            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-300 z-20 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>{currentActiveLayerMeta.name}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400">{currentActiveLayerMeta.sensor}</span>
            </div>

            {/* Scale Bar HUD */}
            <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-300 flex items-center gap-2.5 z-20 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase text-zinc-400">N</span>
              <div className="w-12 h-1 bg-zinc-600 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-emerald-500"></div>
              </div>
              <span className="text-zinc-300">2.5 km</span>
            </div>

            {/* Resolution Telemetry badge */}
            <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400 z-20 shadow-lg">
              RES: <span className="text-emerald-400 font-bold">{resolution}/px</span>
            </div>
          </div>

          {/* Colorbar Legend */}
          <div className="w-full mt-3.5 bg-zinc-950/70 border border-zinc-800 p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-200">
              <span className="font-semibold">{currentActiveLayerMeta.name}:</span>
              <span className="text-zinc-500 font-mono text-[11px]">[{currentActiveLayerMeta.unit}]</span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-80">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Mín</span>
              <div className="flex-1 h-2.5 rounded-full border border-zinc-700 bg-gradient-to-r from-emerald-950 via-emerald-500 to-amber-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Máx</span>
            </div>
          </div>
        </div>

        {/* Real-Time Stand Probe & Ecophysiological Inspector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2 text-zinc-100">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Sonda de Rodal / Píxel
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                {inspected ? inspected.standId : 'SELECCIONA PÍXEL'}
              </span>
            </div>

            {inspected ? (
              <div className="space-y-3 text-xs">
                {/* Location & Species */}
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Especie Dominante</span>
                    <span className="text-emerald-400 font-semibold">{inspected.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Edad Estimada</span>
                    <span className="font-mono text-zinc-200">{inspected.standAge} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Coordenadas Real Geo</span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {inspected.lat}°N, {inspected.lng}°E
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Topografía</span>
                    <span className="font-mono text-zinc-300 text-[11px]">
                      {inspected.elevationM}m &bull; Pend. {inspected.slopePct}% ({inspected.aspect})
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                      <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Biomasa (AGB)</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      {inspected.agbMgC_ha} <span className="text-[10px] text-zinc-500 font-normal">Mg C/ha</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (inspected.agbMgC_ha / 300) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Altura Dosel</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-sky-400">
                      {inspected.gediHeightM} <span className="text-[10px] text-zinc-500 font-normal">m</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" style={{ width: `${Math.min(100, (inspected.gediHeightM / 45) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Riesgo FWI</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-400">
                      {(inspected.fwiRisk * 100).toFixed(0)}%{' '}
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {inspected.fwiRisk > 0.6 ? 'Alto' : 'Bajo'}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${inspected.fwiRisk * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-[11px]">
                      <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Humedad FMC</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-cyan-400">
                      {inspected.fuelMoisturePct}%
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: `${inspected.fuelMoisturePct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Satellite & Flux Sensors */}
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block pb-1 border-b border-zinc-800">
                    Series Espectrales & Flujos In Situ
                  </span>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    <div className="flex justify-between pr-2">
                      <span className="text-zinc-500">NDVI (S2):</span>
                      <span className="font-mono text-emerald-400 font-bold">{inspected.ndvi}</span>
                    </div>
                    <div className="flex justify-between pl-2 border-l border-zinc-800">
                      <span className="text-zinc-500">NDWI (S2):</span>
                      <span className="font-mono text-sky-400">{inspected.ndwi}</span>
                    </div>
                    <div className="flex justify-between pr-2">
                      <span className="text-zinc-500">SOC Suelo:</span>
                      <span className="font-mono text-amber-300">{inspected.socMgC_ha} Mg/ha</span>
                    </div>
                    <div className="flex justify-between pl-2 border-l border-zinc-800">
                      <span className="text-zinc-500">NEE Flujo:</span>
                      <span className={`font-mono font-bold ${inspected.neeFlux < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {inspected.neeFlux} µmol/m²s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Mueve el cursor sobre el mapa o haz clic en un rodal para ver la telemetría ecofisiológica.
              </div>
            )}
          </div>

          {/* Quick dataset metadata */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl text-xs space-y-1.5 text-zinc-400 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-xs">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proveniencia del Cubo Espaciotemporal</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Integración de cubos Zarr multidimensionales [Tiempo × Lat × Lon × Variables] con remuestreo bilineal a
              malla regular UTM/WGS84 y corrección radiométrica BOA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
