export interface LandscapeRegion {
  id: string;
  name: string;
  country: string;
  biome: string;
  areaHa: number;
  center: [number, number]; // [lat, lng]
  dominantSpecies: string[];
  climateType: string;
  fluxnetSiteId: string;
  fluxnetSiteName: string;
  meanAnnualPrecipMm: number;
  meanTempC: number;
  elevationM: number;
  baselineAGB: number; // Mg C / ha
  baselineSOC: number; // Mg C / ha
  description: string;
}

export type MapLayerType =
  | 'satellite'
  | 'terrain'
  | 'agb'
  | 'gedi_height'
  | 's2_ndvi'
  | 's2_ndwi'
  | 's1_moisture'
  | 'wildfire_risk'
  | 'soc'
  | 'nee_flux'
  | 'canopy_bulk_density';

export interface RasterPixelInfo {
  x: number;
  y: number;
  lat: number;
  lng: number;
  standId: string;
  species: string;
  standAge: number;
  agbMgC_ha: number;
  gediHeightM: number;
  ndvi: number;
  ndwi: number;
  fuelMoisturePct: number;
  fwiRisk: number;
  socMgC_ha: number;
  gppFlux: number;
  neeFlux: number;
  recoFlux: number;
  slopePct: number;
  aspect: string;
  elevationM: number;
}

export interface CanopyStratumPoint {
  heightM: number;
  relativeEnergyPct: number;
  plantAreaVolumeDensity: number; // m2 / m3
  fuelDensityKgM3: number;
  stratumLabel: 'Suelo' | 'Subdosel (0-5m)' | 'Dosel Medio (5-18m)' | 'Dosel Dominante (18-32m)' | 'Emergentes (>32m)';
}

export interface GediMetrics {
  shotNumber: string;
  rh25: number;
  rh50: number;
  rh75: number;
  rh98: number; // Canopy top height
  fhd: number; // Foliage Height Diversity
  cover: number;
  agbDensity: number; // Mg C / ha
  pai: number; // Plant Area Index
  qualityFlag: number;
  solarElevation: number;
}

export interface EcophysiologicalParams {
  alphaCx: number; // Quantum canopy quantum efficiency (mol C / mol APAR)
  tOpt: number; // Optimum growth temperature (°C)
  tMin: number; // Minimum temperature for growth (°C)
  tMax: number; // Maximum temperature for growth (°C)
  kGPP: number; // VPD stomatal sensitivity coefficient
  maxStomatalCond: number; // Maximum stomatal conductance (m/s)
  sla: number; // Specific leaf area (m2 / kg)
  soilWaterCapacityMm: number; // Available water storage in root zone (mm)
  litterfallRate: number; // Monthly foliage turnover rate
  rootAllocationBase: number; // Base allocation fraction to roots
  stemMortalityRate: number; // Annual tree self-thinning mortality rate
}

export interface MonthlyFluxPoint {
  month: string;
  dayOfYear?: number;
  timestamp: string;
  tempC: number;
  precipMm: number;
  vpdKPa: number;
  radMJm2: number;
  // 3-PG simulated
  pg3_gpp: number;
  pg3_nee: number;
  pg3_reco: number;
  pg3_agb: number;
  // Deep Learning Hybrid corrected
  hybrid_gpp: number;
  hybrid_nee: number;
  hybrid_reco: number;
  hybrid_ci_upper: number;
  hybrid_ci_lower: number;
  // FLUXNET in situ observation
  fluxnet_gpp: number;
  fluxnet_nee: number;
  fluxnet_reco: number;
}

export interface ManagementScenario {
  id: string;
  name: string;
  tag: string;
  type: 'thinning' | 'prescribed_burn' | 'restoration' | 'fuel_break' | 'laissez_faire';
  description: string;
  thinningIntensityPct: number; // % basal area removed
  thinningScheduleYears: number[];
  prescribedBurnIntervalYears: number;
  reforestationSpecies: string;
  fuelBreakWidthM: number;
  trajectory: ScenarioTrajectoryPoint[];
  metricsSummary: {
    totalCarbon50Yr: number; // Mg C / ha
    carbonSequestrationRate: number; // Mg C / ha / yr
    cumulativeHarvestedCarbon: number; // Mg C / ha
    meanFireRiskProb: number; // 0 - 1
    fireResilienceScore: number; // 0 - 100
    biodiversityShannonH: number; // 0 - 4
    waterYieldM3Ha: number;
    economicNPV_EUR_ha: number;
    uncertaintyReductionPct: number;
  };
}

export interface ScenarioTrajectoryPoint {
  year: number;
  agb: number; // Mg C / ha
  soc: number; // Mg C / ha
  deadwoodC: number; // Mg C / ha
  totalCarbon: number; // Mg C / ha
  lai: number; // m2 / m2
  fireRiskProbability: number; // 0 - 1
  canopyHeightM: number;
  stemDensityHa: number;
  waterYieldMm: number;
  biodiversityIndex: number;
}

export interface ValidationMetrics {
  datasetName: string;
  sampleSize: number;
  traditionalNFI: {
    rmse: number;
    mae: number;
    r2: number;
    bias: number;
    ci95Width: number;
  };
  silvaTwinAssimilation: {
    rmse: number;
    mae: number;
    r2: number;
    bias: number;
    nse: number; // Nash-Sutcliffe Efficiency
    ci95Width: number;
  };
  uncertaintyReductionPct: number;
}

export interface SobolSensitivityIndex {
  parameter: string;
  label: string;
  firstOrderS1: number;
  totalOrderST: number;
  category: 'Clima' | 'Fisiología' | 'Estructura LiDAR' | 'Suelo';
}

export interface ScientificCodeArtifact {
  id: string;
  title: string;
  filename: string;
  language: string;
  category: 'Pipeline' | 'Modelo 3-PG' | 'Deep Learning' | 'Ingesta Satelital' | 'Orquestación';
  description: string;
  code: string;
}
