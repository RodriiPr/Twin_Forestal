import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

interface TreeParametricProps {
  rh98: number;
  rh75: number;
  rh50: number;
  rh25: number;
  cbh: number;
  species: string;
  agb: number;
  ciLower?: number;
  ciUpper?: number;
  ndvi?: number;
  showWaveform?: boolean;
  showStratumPlanes?: boolean;
}

/**
 * Nube de puntos volumétrica que representa la forma de onda de retorno láser de GEDI L4A (25m footprint)
 */
const GediWaveformCloud: React.FC<{
  rh98: number;
  scale: number;
}> = ({ rh98, scale }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribución vertical con pico en el dosel (z ~ 0.7*rh98) y pico en el suelo (z ~ 0)
      const u = Math.random();
      let normHeight: number;
      if (u < 0.25) {
        // Pico del suelo (ground return)
        normHeight = Math.random() * 0.08;
      } else if (u < 0.85) {
        // Pico del dosel fotosintético superior
        normHeight = 0.45 + Math.random() * 0.55;
      } else {
        // Subdosel intermedio
        normHeight = 0.08 + Math.random() * 0.37;
      }

      const h = normHeight * rh98 * scale;
      // Dispersión horizontal simula el ancho de haz gaussiano (footprint de 25m = ~2.5 unidades)
      const angle = Math.random() * Math.PI * 2;
      const energyWeight = normHeight < 0.1 ? 1.4 : normHeight > 0.5 ? 1.8 : 0.8;
      const radius = (Math.random() * 1.6 + 0.2) * (energyWeight / 2.0);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = z;

      // Color dependiente de la altura
      if (normHeight < 0.1) {
        // Suelo: ámbar / terracota
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.55;
        col[i * 3 + 2] = 0.20;
      } else if (normHeight > 0.7) {
        // Dosel alto: cian / esmeralda brillante
        col[i * 3] = 0.15;
        col[i * 3 + 1] = 0.88;
        col[i * 3 + 2] = 0.75;
      } else {
        // Estrato medio: verde oliva
        col[i * 3] = 0.25;
        col[i * 3 + 1] = 0.70;
        col[i * 3 + 2] = 0.35;
      }
    }

    return { positions: pos, colors: col };
  }, [rh98, scale]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/**
 * Modelo sintético del árbol calibrado según alometría Borsah et al. (2023)
 */
const SyntheticTreeModel: React.FC<{
  rh98: number;
  cbh: number;
  rh75: number;
  rh50: number;
  rh25: number;
  species: string;
  ndvi: number;
  scale: number;
  showStratumPlanes: boolean;
}> = ({ rh98, cbh, rh75, rh50, rh25, species, ndvi, scale, showStratumPlanes }) => {
  const heightUnits = Math.max(1.0, rh98 * scale);
  const cbhUnits = Math.max(0.4, cbh * scale);
  const crownHeight = Math.max(0.6, heightUnits - cbhUnits);
  const trunkRadius = Math.max(0.09, (rh98 / 40.0) * 0.22);

  // Vigor foliar en función del NDVI (Sentinel-2)
  const foliageColor = useMemo(() => {
    if (ndvi > 0.75) return '#10b981'; // Esmeralda saludable
    if (ndvi > 0.55) return '#059669'; // Verde bosque medio
    return '#65a30d'; // Estrés hídrico leve
  }, [ndvi]);

  const isChestnut = species.toLowerCase().includes('bertholletia') || species.toLowerCase().includes('casta');
  const isCedar = species.toLowerCase().includes('cedrela') || species.toLowerCase().includes('cedro');
  const isShihuahuaco = species.toLowerCase().includes('dipteryx') || species.toLowerCase().includes('shihua');

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Suelo circular de la huella GEDI de 25m */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[2.5, 36]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      
      {/* Borde sutil del footprint de 25 metros */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[2.45, 2.5, 48]} />
        <meshBasicMaterial color="#3f3f46" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Tronco Alométrico con ahusamiento */}
      <mesh position={[0, heightUnits / 2, 0]}>
        <cylinderGeometry args={[trunkRadius * 0.65, trunkRadius * 1.15, heightUnits, 16]} />
        <meshStandardMaterial color="#452b1f" roughness={0.85} />
      </mesh>

      {/* Raíces tablares o base ensanchada para árboles amazónicos dominantes */}
      {(isChestnut || isShihuahuaco) && (
        <group position={[0, 0.2, 0]}>
          {[0, 1.2, 2.4, 3.8, 5.1].map((ang, i) => (
            <mesh key={i} rotation={[0, ang, 0]} position={[Math.cos(ang) * 0.2, 0, Math.sin(ang) * 0.2]}>
              <boxGeometry args={[0.08, 0.45, 0.35]} />
              <meshStandardMaterial color="#3b2417" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Arquitectura de Copa Alométrica según Especie */}
      {isChestnut ? (
        // Bertholletia excelsa (Castaña): Copa en parasol elevada y amplia
        <group position={[0, cbhUnits + crownHeight * 0.65, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2.1, 0.35, crownHeight * 0.7, 16]} />
            <meshStandardMaterial color={foliageColor} roughness={0.45} />
          </mesh>
          <mesh position={[0, crownHeight * 0.35, 0]}>
            <sphereGeometry args={[1.7, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={foliageColor} roughness={0.4} />
          </mesh>
        </group>
      ) : isCedar ? (
        // Cedrela odorata (Cedro): Copa estratificada en pisos
        <group position={[0, cbhUnits + crownHeight * 0.5, 0]}>
          <mesh position={[0, -crownHeight * 0.25, 0]}>
            <coneGeometry args={[1.6, crownHeight * 0.5, 14]} />
            <meshStandardMaterial color={foliageColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, crownHeight * 0.2, 0]}>
            <coneGeometry args={[1.3, crownHeight * 0.45, 14]} />
            <meshStandardMaterial color={foliageColor} roughness={0.45} />
          </mesh>
          <mesh position={[0, crownHeight * 0.55, 0]}>
            <coneGeometry args={[0.9, crownHeight * 0.35, 14]} />
            <meshStandardMaterial color={foliageColor} roughness={0.4} />
          </mesh>
        </group>
      ) : (
        // Dipteryx micrantha (Shihuahuaco) / Bosque Mixto: Copa elipsoidal masiva dominante
        <group position={[0, cbhUnits + crownHeight * 0.55, 0]}>
          <mesh scale={[1.6, 1.2, 1.6]}>
            <sphereGeometry args={[1.15, 20, 20]} />
            <meshStandardMaterial color={foliageColor} roughness={0.45} metalness={0.05} />
          </mesh>
          {/* Subdomos foliares laterales */}
          <mesh position={[0.7, 0.2, 0.4]} scale={[0.8, 0.7, 0.8]}>
            <sphereGeometry args={[0.8, 14, 14]} />
            <meshStandardMaterial color={foliageColor} roughness={0.5} />
          </mesh>
          <mesh position={[-0.6, 0.1, -0.5]} scale={[0.85, 0.7, 0.85]}>
            <sphereGeometry args={[0.8, 14, 14]} />
            <meshStandardMaterial color={foliageColor} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* 4. Planos y Marcas Métricas GEDI 3D */}
      {showStratumPlanes && (
        <group>
          {/* RH98 — Altura Máxima del Dosel (MCH) */}
          <group position={[0, heightUnits, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 1.84, 40]} />
              <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[2.0, 0, 0]} className="pointer-events-none">
              <div className="bg-zinc-950/90 text-sky-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-sky-800/80 shadow-lg whitespace-nowrap">
                RH98: {rh98.toFixed(1)} m <span className="text-zinc-500 font-normal">| MCH</span>
              </div>
            </Html>
          </group>

          {/* RH75 — Dosel Dominante */}
          <group position={[0, rh75 * scale, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.6, 1.63, 36]} />
              <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[1.8, 0, 0]} className="pointer-events-none">
              <div className="bg-zinc-950/90 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-emerald-900/60 shadow whitespace-nowrap">
                RH75: {rh75.toFixed(1)} m
              </div>
            </Html>
          </group>

          {/* RH50 — Altura Media Cuadrática (QMH) */}
          <group position={[0, rh50 * scale, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.4, 1.43, 36]} />
              <meshBasicMaterial color="#a78bfa" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[1.6, 0, 0]} className="pointer-events-none">
              <div className="bg-zinc-950/90 text-purple-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-purple-900/60 shadow whitespace-nowrap">
                RH50: {rh50.toFixed(1)} m <span className="text-zinc-500 font-normal">| QMH</span>
              </div>
            </Html>
          </group>

          {/* CBH — Base de Copa */}
          <group position={[0, cbhUnits, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.3, 1.34, 36]} />
              <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[1.5, 0, 0]} className="pointer-events-none">
              <div className="bg-zinc-950/90 text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-900/80 shadow whitespace-nowrap">
                CBH: {cbh.toFixed(1)} m (Base Copa)
              </div>
            </Html>
          </group>

          {/* RH25 — Subdosel */}
          <group position={[0, rh25 * scale, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.1, 1.13, 32]} />
              <meshBasicMaterial color="#fb923c" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[1.3, 0, 0]} className="pointer-events-none">
              <div className="bg-zinc-950/90 text-orange-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-orange-900/60 shadow whitespace-nowrap">
                RH25: {rh25.toFixed(1)} m
              </div>
            </Html>
          </group>
        </group>
      )}
    </group>
  );
};

export const TreeParametricScene: React.FC<TreeParametricProps> = ({
  rh98,
  rh75,
  rh50,
  rh25,
  cbh,
  species,
  agb,
  ciLower = agb - 3.74,
  ciUpper = agb + 3.74,
  ndvi = 0.82,
  showWaveform = true,
  showStratumPlanes = true,
}) => {
  const scale = 0.18; // 1 unidad 3D = ~5.5 metros

  return (
    <div className="w-full h-full min-h-[460px] bg-zinc-950 rounded-xl overflow-hidden relative border border-zinc-800 shadow-2xl">
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [5.8, 3.8, 6.5], fov: 42 }}
        >
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 14, 6]} intensity={1.3} castShadow />
        <pointLight position={[-4, 6, -4]} intensity={0.4} color="#34d399" />
        <hemisphereLight groundColor="#09090b" color="#38bdf8" intensity={0.3} />

        <Grid
          infiniteGrid
          cellSize={0.8}
          sectionSize={2.4}
          cellColor="#27272a"
          sectionColor="#3f3f46"
          fadeDistance={25}
        />

        {showWaveform && <GediWaveformCloud rh98={rh98} scale={scale} />}

        <SyntheticTreeModel
          rh98={rh98}
          cbh={cbh}
          rh75={rh75}
          rh50={rh50}
          rh25={rh25}
          species={species}
          ndvi={ndvi}
          scale={scale}
          showStratumPlanes={showStratumPlanes}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3.5}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 - 0.04}
        />
      </Canvas>
      </div>

      {/* HUD Superior Izquierdo: Telemetría de Biomasa */}
      <div className="absolute top-3 left-3 bg-zinc-900/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs shadow-xl pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-bold text-zinc-100 uppercase tracking-wider text-[11px]">
            Estructura 3D del Dosel (GEDI L4A)
          </span>
        </div>
        <p className="text-zinc-400 text-[11px]">
          Especie: <span className="text-zinc-100 font-semibold italic">{species}</span>
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-emerald-400">{agb.toFixed(1)}</span>
          <span className="text-zinc-400 text-[10px]">Mg C/ha (AGB)</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
          IC 95%: [{Math.max(0, ciLower).toFixed(1)} – {ciUpper.toFixed(1)}] Mg C/ha
        </p>
      </div>

      {/* HUD Inferior Derecho: Instrucciones de Navegación 3D */}
      <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-zinc-800/80 text-[10px] text-zinc-500 font-mono pointer-events-none flex items-center gap-2">
        <span>🖱️ Arrastrar: Rotar</span>
        <span>•</span>
        <span>Rueda: Zoom</span>
        <span>•</span>
        <span>Shift + Arrastrar: Desplazar</span>
      </div>
    </div>
  );
};
