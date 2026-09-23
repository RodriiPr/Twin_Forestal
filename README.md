# SilvaTwin — Gemelo Digital Forestal

Plataforma científica de **Gemelo Digital Forestal** a escala de paisaje (10³–10⁵ ha) con asimilación multi-sensor, modelado ecofisiológico 3-PG, Deep Learning híbrido, riesgo de incendios y simulación de manejo adaptativo.

Stack: **React 19 + Vite 6 + Tailwind CSS 4 + Express + TypeScript + Leaflet + Recharts + Gemini AI**

## ¿Qué es el Twin?

SilvaTwin replica el estado y la dinámica de un bosque real para responder: ¿cuánto carbono hay/secuestra?, ¿cuál es el riesgo de incendio?, ¿qué pasa si aclaro/quemo/restauru?

Módulos:

- **Landscape 2D Map (`Landscape2DMap`)**: mapa Leaflet con capas satellite, terrain, AGB, GEDI height, S2 NDVI/NDWI, S1 humedad, riesgo incendio, SOC, flujos NEE, densidad combustible. Inspección por píxel/rodal.
- **Canopy 3D Profile (`Canopy3DProfile`)**: perfil vertical LiDAR GEDI (RH25/50/75/98, FHD, cover, PAI) + estratos de combustible.
- **Eco-fisiología 3-PG (`Ecophysiological3PG`)**: GPP/NPP/NEE/Reco, LAI, AGB, SOC con modificadores T°, VPD, agua suelo, VPD-estomas.
- **Hybrid Deep Learning (`HybridDeepLearning`)**: corrección Bi-LSTM + Spatiotemporal Earthformer de residuos 3-PG vs FLUXNET. Reduce incertidumbre ~34.8% (de ±28.4 a ±18.5 Mg C/ha).
- **Wildfire Risk Engine (`WildfireRiskEngine`)**: FWI, humedad combustible (FMC), probabilidad incendio por biomasa + sequía.
- **Scenario Simulator (`ScenarioSimulator` + API `/api/simulate-3pg`)**: clareos, quemas prescritas, restauración, fajas combustible a 30-50 años. Métricas: carbono total, NPV €/ha, Shannon-H, water yield.
- **Uncertainty & Validation (`UncertaintyValidation`)**: RMSE/MAE/R²/Bias/NSE, NFI vs SilvaTwin, índices Sobol.
- **Asistente IA ecólogo (`AIEcologistAssistant` + `FloatingChatbot` + API `/api/ai-advisor`)**: Gemini `gemini-3.7-flash` con contexto del gemelo. Modo offline si no hay `GEMINI_API_KEY`.
- **Scientific Deliverables (`ScientificDeliverables`)**: artefactos de código (pipelines, ingesta satelital, EnKF).

Tipos centrales en `src/types.ts`: `LandscapeRegion`, `RasterPixelInfo`, `GediMetrics`, `MonthlyFluxPoint`, `ManagementScenario`, `ValidationMetrics`.

Regiones demo en `src/data/mockScientificData.ts` + backend rápido 3-PG en `server.ts`.

## Estructura

```
├── server.ts              # Express + Vite middleware (dev) / static dist (prod) + APIs
├── src/
│   ├── App.tsx            # Tabs + timeline + Theme/Language providers
│   ├── components/        # 10 módulos científicos + Header + mapas
│   ├── data/mockScientificData.ts
│   ├── context/ThemeContext.tsx / LanguageContext.tsx
│   ├── types.ts
│   └── main.tsx / index.css
├── vite.config.ts
├── index.html
├── .env.example
└── dist/ (generado)
```

APIs:

- `POST /api/ai-advisor` → `{prompt, context}` → `{response}`
- `POST /api/simulate-3pg` → `{species: eucalyptus|tropical|pine, years, thinning, prescribedBurn, droughtSeverity}` → `{results: [{year, agb, soc, totalCarbon, lai, npp, gpp, nee, fireRisk, stemDensity}]}`

## Despliegue del sistema

### 1. Requisitos

- Node.js 20+ y npm
- Clave Gemini (opcional, para IA online): https://aistudio.google.com

### 2. Local

```bash
npm install
cp .env.example .env
# editar .env -> GEMINI_API_KEY=tu_clave
npm run dev
# abre http://localhost:3000
```

Scripts:

- `npm run dev` → `tsx server.ts` (Express + Vite HMR)
- `npm run build` → `vite build && esbuild server.ts --bundle ... --outfile=dist/server.cjs`
- `npm start` → `node dist/server.cjs` (prod, `NODE_ENV=production`)
- `npm run lint` → `tsc --noEmit`
- `npm run preview` → `vite preview`

Env (` .env`, no subir a Git):

```
GEMINI_API_KEY=xxxx
APP_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

### 3. Producción

```bash
npm run build
NODE_ENV=production PORT=3000 node dist/server.cjs
# o: npm start
```

### 4. Docker (recomendado VPS)

Dockerfile:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node","dist/server.cjs"]
```

```bash
docker build -t silvatwin .
docker run -p 3000:3000 -e GEMINI_API_KEY=xxxx -e NODE_ENV=production silvatwin
```

Con compose + reverse proxy (Nginx/Caddy) para HTTPS y `APP_URL=https://tu-dominio`.

### 5. Render / Railway / Fly.io

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Env Vars: `GEMINI_API_KEY`, `NODE_ENV=production`, `APP_URL=https://xxx.onrender.com`
- Node 20.

### 6. Vercel / Netlify (solo frontend)

Solo sirve el `dist/` estático. Pierdes `/api/*` salvo que lo separes a funciones serverless. Para el Twin completo usa VPS/Render.

## Notas científicas

- 3-PG fast: `APAR=1200*(1-exp(-0.5*LAI))`, `NPP=APAR*0.045*ageMod*vpdMod*tempMod*0.47`.
- Incendio: `fireRisk = AGB*0.003 + (100-FMC)*0.008 (-0.25 si quema prescrita 10-18a)`.
- Asimilación: EnKF N=50 para GEDI+Sentinel, corrección Bi-LSTM de Reco/transpiración estival.
