# Documentación de APIs — Módulo Adaptive Management (ScenarioSimulator)

## 1. Endpoint del Backend

### `GET /api/v1/scenarios`

**Descripción:** Obtiene el catálogo de escenarios de manejo forestal con trayectorias de 50 años.

**Método:** `GET`

**URL completa:** `http://localhost:3000/api/v1/scenarios`

**Parámetros:** Ninguno

**Respuesta exitosa (200 OK):**

```json
[
  {
    "id": "thinning",
    "name": "Clareos Selectivos",
    "tag": "Manejo activo",
    "type": "thinning",
    "description": "Raleos selectivos para reducir competencia y mejorar vigor del rodal.",
    "thinningIntensityPct": 25,
    "thinningScheduleYears": [10, 25, 40],
    "prescribedBurnIntervalYears": 0,
    "reforestationSpecies": "",
    "fuelBreakWidthM": 0,
    "trajectory": [
      {
        "year": 0,
        "agb": 180,
        "soc": 95,
        "deadwoodC": 5,
        "totalCarbon": 280,
        "lai": 4.2,
        "fireRiskProbability": 0.45,
        "canopyHeightM": 22,
        "stemDensityHa": 800,
        "waterYieldMm": 320,
        "biodiversityIndex": 2.8
      }
    ],
    "metricsSummary": {
      "totalCarbon50Yr": 420,
      "carbonSequestrationRate": 4.2,
      "cumulativeHarvestedCarbon": 85,
      "meanFireRiskProb": 0.18,
      "fireResilienceScore": 78,
      "biodiversityShannonH": 3.1,
      "waterYieldM3Ha": 2800,
      "economicNPV_EUR_ha": 4200,
      "uncertaintyReductionPct": 28
    }
  }
]
```

**Respuesta de error (500 Internal Server Error):**

```json
{
  "error": "mensaje de error"
}
```

---

## 2. Método del Frontend (API Client)

### `ForestTwinAPI.getScenarios()`

**Archivo:** `src/services/api.ts`

**Firma del método:**

```typescript
async getScenarios(): Promise<ManagementScenario[]>
```

**Descripción:** Consulta el catálogo de escenarios de manejo forestal al backend. Si el backend no responde, devuelve datos mock como fallback.

**Comportamiento:**

1. Intenta `GET /api/v1/scenarios`
2. Si la respuesta es exitosa y contiene datos, los retorna directamente
3. Si el backend no responde, usa `MOCK_SCENARIOS` como fallback

**Ejemplo de uso:**

```typescript
import { ForestTwinAPI } from '../services/api';

const scenarios = await ForestTwinAPI.getScenarios();
```

---

## 3. Tipos de Datos

### `ManagementScenario`

**Archivo:** `src/types.ts`

```typescript
export interface ManagementScenario {
  id: string;
  name: string;
  tag: string;
  type: 'thinning' | 'prescribed_burn' | 'restoration' | 'fuel_break' | 'laissez_faire';
  description: string;
  thinningIntensityPct: number;
  thinningScheduleYears: number[];
  prescribedBurnIntervalYears: number;
  reforestationSpecies: string;
  fuelBreakWidthM: number;
  trajectory: ScenarioTrajectoryPoint[];
  metricsSummary: {
    totalCarbon50Yr: number;
    carbonSequestrationRate: number;
    cumulativeHarvestedCarbon: number;
    meanFireRiskProb: number;
    fireResilienceScore: number;
    biodiversityShannonH: number;
    waterYieldM3Ha: number;
    economicNPV_EUR_ha: number;
    uncertaintyReductionPct: number;
  };
}
```

### `ScenarioTrajectoryPoint`

```typescript
export interface ScenarioTrajectoryPoint {
  year: number;
  agb: number;
  soc: number;
  deadwoodC: number;
  totalCarbon: number;
  lai: number;
  fireRiskProbability: number;
  canopyHeightM: number;
  stemDensityHa: number;
  waterYieldMm: number;
  biodiversityIndex: number;
}
```

---

## 4. Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ScenarioSimulator.tsx                                              │
│       │                                                             │
│       │ 1. useEffect([region.id])                                   │
│       ▼                                                             │
│  ForestTwinAPI.getScenarios()                                       │
│       │                                                             │
│       │ 2. GET /api/v1/scenarios                                    │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Validación y Normalización                                  │   │
│  │  - normalizeScenario() valida estructura                     │   │
│  │  - Filtra escenarios inválidos                                │   │
│  │  - Rellena campos faltantes con defaults                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       │ 3. Estado: scenarios[]                                     │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Renderizado                                                 │   │
│  │  - Tarjetas de escenarios (grid)                             │   │
│  │  - Gráfico de trayectorias (LineChart)                       │   │
│  │  - Radar de trade-offs (RadarChart)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP GET
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express + FastAPI)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GET /api/v1/scenarios                                              │
│       │                                                             │
│       ▼                                                             │
│  Retorna array de ManagementScenario[]                              │
│  (Datos generados localmente o desde PostgreSQL)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Endpoints Relacionados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/scenarios` | Catálogo de escenarios de manejo |
| `POST` | `/api/v1/scenarios/simulate-custom` | Simulador biofísico personalizado (What-If) |
| `GET` | `/api/v1/stands/region/{region_id}` | Rodales con telemetría real |
| `GET` | `/api/v1/simulations/flux-timeseries/{region_id}` | Series temporales de flujos |
| `POST` | `/api/v1/simulations/3pg` | Simulación 3-PG |
| `POST` | `/api/v1/crisp-dm/semantic-evaluation` | Evaluación semántica de riesgo |

---

## 6. Manejo de Errores

| Escenario | Comportamiento |
|-----------|----------------|
| Backend no disponible | Fallback a `MOCK_SCENARIOS` (en `api.ts`) |
| Respuesta vacía | Muestra mensaje "No se encontraron escenarios válidos" |
| Estructura inválida | `normalizeScenario()` retorna `null`, se filtra |
| Timeout de red | Catch con mensaje de error en UI |

---

## 7. Notas de Implementación

- **Sin commits:** Los cambios no se han subido a Git
- **Fallback:** Si el backend no responde, el frontend usa datos mock
- **Validación:** `normalizeScenario()` garantiza que todos los campos existan
- **Radar dinámico:** Los criterios del radar se construyen desde los escenarios reales
- **Colores:** Los colores de líneas/radar se asignan por índice de escenario
