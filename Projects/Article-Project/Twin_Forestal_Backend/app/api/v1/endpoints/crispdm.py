from typing import Any, Dict, List
from fastapi import APIRouter

router = APIRouter(prefix="/crisp-dm", tags=["CRISP-DM Methodology"])

CRISPDM_DATA = {
    "framework": "CRISP-DM adaptado a Gemelos Digitales Científicos (ISO 23247 / Kritzinger)",
    "project": "SilvaTwin — Gemelo Digital Forestal",
    "targetPublication": "Revista Scopus Q1 (Remote Sensing / Ecological Modelling)",
    "phases": [
        {
            "id": "fase-1",
            "phaseNumber": 1,
            "name": "Comprensión del Dominio Biofísico",
            "crispEquivalent": "Business Understanding",
            "status": "Completada (100%)",
            "color": "emerald",
            "description": "Definición del problema de cuantificación de carbono, riesgo de incendios y resiliencia climática bajo directivas REDD+ y el Acuerdo de París (Art. 5).",
            "kpis": [
                {"name": "Reducción de Varianza Epistémica", "target": "< 20 Mg C/ha", "achieved": "18.5 Mg C/ha (-34.8%)", "status": "optimal"},
                {"name": "Eficiencia Nash-Sutcliffe (NSE)", "target": "> 0.80", "achieved": "0.87 (FLUXNET)", "status": "optimal"},
                {"name": "Anticipación de Estrés Hídrico", "target": "15-30 días", "achieved": "30 días", "status": "optimal"}
            ],
            "stakeholders": [
                "Gestores de Reservas Naturales y Parques Nacionales",
                "SERFOR / Ministerios del Ambiente",
                "Desarrolladores de Proyectos de Créditos de Carbono de Alta Integridad",
                "Equipos de Prevención y Extinción de Incendios Forestales"
            ]
        },
        {
            "id": "fase-2",
            "phaseNumber": 2,
            "name": "Comprensión y Adquisición Multi-Sensor",
            "crispEquivalent": "Data Understanding",
            "status": "Completada (100%)",
            "color": "cyan",
            "description": "Exploración e ingesta multi-escala de datos satelitales ópticos, de radar y LiDAR orbital, acoplados a torres eddy covariance.",
            "dataSources": [
                {"name": "Copernicus Sentinel-2", "type": "Óptico Multiespectral (MSI)", "resolution": "10 - 20 m", "bands": "B02, B03, B04, B08, B11, B12"},
                {"name": "Copernicus Sentinel-1", "type": "Radar de Apertura Sintética (C-SAR)", "resolution": "10 m", "bands": "Polarizaciones VV / VH (humedad suelo)"},
                {"name": "NASA GEDI", "type": "LiDAR Orbital de Retorno Completo", "resolution": "25 m footprint", "metrics": "RH25, RH50, RH75, RH98, PAI, FHD"},
                {"name": "Torres FLUXNET", "type": "Eddy Covariance In-Situ", "frequency": "Semi-horario / Mensual", "metrics": "GPP, Reco, NEE, Radiación"}
            ],
            "qualityChecks": "Control de nubosidad S2 (<15%), calibración radiométrica topográfica, filtrado de calidad GEDI (quality_flag=1)."
        },
        {
            "id": "fase-3",
            "phaseNumber": 3,
            "name": "Preparación y Pipeline Espacio-Temporal",
            "crispEquivalent": "Data Preparation",
            "status": "Completada (100%)",
            "color": "blue",
            "description": "Ingeniería de variables espectrales, normalización topográfica (DEM SRTM) y vectorización de rodales en PostgreSQL + PostGIS.",
            "featuresEngineered": [
                {"code": "NDVI", "formula": "(NIR - RED) / (NIR + RED)", "utility": "Vigor fotosintético y densidad de biomasa"},
                {"code": "NDWI", "formula": "(NIR - SWIR) / (NIR + SWIR)", "utility": "Contenido hídrico foliar de la masa boscosa"},
                {"code": "FMC", "formula": "Función de reflectancia SWIR", "utility": "Humedad de combustible vivo (% peso seco)"},
                {"code": "Topografía", "formula": "Pendiente y Orientación (Aspect)", "utility": "Exposición a insolación (solana vs umbría)"}
            ],
            "databaseStorage": "PostgreSQL 16 + PostGIS con indexación espacial GiST sobre 1,536 rodales iniciales."
        },
        {
            "id": "fase-4",
            "phaseNumber": 4,
            "name": "Modelado Híbrido y Asimilación",
            "crispEquivalent": "Modeling",
            "status": "Completada (100%)",
            "color": "indigo",
            "description": "Acoplamiento de modelos de base física (3-PG) con redes neuronales recurrentes (Bi-LSTM) para corrección de sesgo y asimilación de datos (EnKF).",
            "models": [
                {
                    "name": "Modelo Ecofisiológico 3-PG",
                    "type": "Modelo de Procesos Biofísicos",
                    "role": "Cálculo primario de balance hídrico, asimilación de carbono (GPP/NPP) y partición a madera/raíces.",
                    "formula": "GPP = APAR * alphaCx * f_T * f_VPD * f_SWC"
                },
                {
                    "name": "Red Bi-LSTM Espacio-Temporal",
                    "type": "Deep Learning Residual",
                    "role": "Aprende residuos de respiración heterotrófica (Reco) y estrés por embolismo no lineales en sequías.",
                    "improvement": "Reduce RMSE de flujo NEE en un 41.2% frente a 3-PG aislado."
                },
                {
                    "name": "Ensemble Kalman Filter (EnKF)",
                    "type": "Asimilación de Datos (N=50 miembros)",
                    "role": "Funde las trayectorias de simulación con observaciones satelitales periódicas GEDI y S2.",
                    "convergence": "Covarianza adaptativa con inflación para evitar colapso de filtro."
                }
            ]
        },
        {
            "id": "fase-5",
            "phaseNumber": 5,
            "name": "Validación Científica e Incertidumbre",
            "crispEquivalent": "Evaluation",
            "status": "Completada (95%)",
            "color": "violet",
            "description": "Evaluación estadística rigurosa mediante validación cruzada espacial, métricas biofísicas y descomposición global de varianza de Sobol.",
            "metrics": [
                {"metric": "R² (Coeficiente de Determinación)", "value": 0.894, "standard": "> 0.80"},
                {"metric": "RMSE Biomasa (AGB)", "value": "18.5 Mg C/ha", "standard": "Mejora vs 28.4 tradicional"},
                {"metric": "Nash-Sutcliffe Efficiency (NSE)", "value": 0.871, "standard": "> 0.75 (Excelente)"},
                {"metric": "Kling-Gupta Efficiency (KGE)", "value": 0.852, "standard": "> 0.70 (Robusto)"},
                {"metric": "Mean Bias Error (MBE)", "value": "-1.8 Mg C/ha", "standard": "Bajo sesgo"}
            ],
            "sensitivitySobol": [
                {"parameter": "k_GPP (Sensibilidad estomática a VPD)", "s1": 0.385, "st": 0.442},
                {"parameter": "alpha_Cx (Eficiencia cuántica de dosel)", "s1": 0.274, "st": 0.318},
                {"parameter": "sla (Área foliar específica)", "s1": 0.142, "st": 0.186},
                {"parameter": "maxStomatalCond (Conductancia máx)", "s1": 0.105, "st": 0.134}
            ]
        },
        {
            "id": "fase-6",
            "phaseNumber": 6,
            "name": "Despliegue Operativo del Gemelo Digital",
            "crispEquivalent": "Deployment",
            "status": "En Operación (100%)",
            "color": "emerald",
            "description": "Plataforma interactiva de monitoreo continuo, API REST de servicios, simulador de manejo adaptativo a 50 años y asistente ecólogo IA.",
            "deployments": [
                {"component": "Frontend SPA React 19", "url": "http://localhost:3000", "role": "Visualización 2D/3D con Leaflet y perfiles LiDAR"},
                {"component": "Backend REST FastAPI", "url": "http://localhost:8000", "role": "Endpoints analíticos y motor numérico en Python"},
                {"component": "Base de Datos PostGIS", "port": 5432, "role": "Almacén espacial de rodales, geometrías y series temporales"},
                {"component": "Simulador de Escenarios 50a", "role": "Evaluación de clareos, quemas prescritas y restauración"},
                {"component": "Asistente IA (Google Gemini)", "role": "Razonamiento ecofisiológico contextual en tiempo real"}
            ]
        }
    ]
}

@router.get("/overview")
def get_crispdm_overview() -> Dict[str, Any]:
    return CRISPDM_DATA
