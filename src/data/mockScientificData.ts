import {
  LandscapeRegion,
  CanopyStratumPoint,
  GediMetrics,
  MonthlyFluxPoint,
  ManagementScenario,
  ValidationMetrics,
  SobolSensitivityIndex,
  ScientificCodeArtifact,
} from '../types';

export const LANDSCAPE_REGIONS: LandscapeRegion[] = [
  {
    id: 'madre-de-dios-peru',
    name: 'Reserva Nacional Tambopata (Madre de Dios)',
    country: 'Perú (Madre de Dios - Amazonía Sur)',
    biome: 'Bosque Tropical Húmedo de Selva Baja',
    areaHa: 42800,
    center: [-12.825, -69.288],
    dominantSpecies: [
      'Cedrela odorata (Cedro de la Selva)',
      'Swietenia macrophylla (Caoba)',
      'Bertholletia excelsa (Castaña del Perú)',
      'Dipteryx micrantha (Shihuahuaco)',
      'Hevea brasiliensis (Shiringa)',
      'Calycophyllum spruceanum (Capirona)',
    ],
    climateType: 'Tropical superhúmedo megatérmico (Af/Am)',
    fluxnetSiteId: 'PE-Tam / PE-Tambopata',
    fluxnetSiteName: 'Tambopata Megadiverse Permanent Plot',
    meanAnnualPrecipMm: 3150,
    meanTempC: 26.4,
    elevationM: 210,
    baselineAGB: 268.4,
    baselineSOC: 142.8,
    description: 'Hotspot de megabiodiversidad global en la Amazonía peruana con presencia dominante de Shihuahuaco, Caoba y Castañales centenarios, sometidos a monitoreo dinámico LiDAR.',
  },
  {
    id: 'bosque-seco-norperuano',
    name: 'Santuario Histórico Bosque de Pómac (Lambayeque)',
    country: 'Perú (Lambayeque / Piura)',
    biome: 'Bosque Seco Tropical Équatorial',
    areaHa: 15800,
    center: [-6.475, -79.775],
    dominantSpecies: [
      'Prosopis pallida (Algarrobo)',
      'Vachellia macracantha (Espino / Huaranjo)',
      'Capparis scabrida (Zapote)',
      'Bursera graveolens (Palo Santo)',
      'Loxopterygium huasango (Huasango)',
    ],
    climateType: 'Árido cálido / Seco tropical (BWh/BSh)',
    fluxnetSiteId: 'PE-Pom / PE-BosqueSeco',
    fluxnetSiteName: 'Pómac Dry Forest Carbon Station',
    meanAnnualPrecipMm: 240,
    meanTempC: 23.8,
    elevationM: 80,
    baselineAGB: 38.2,
    baselineSOC: 44.5,
    description: 'Ecosistema relicto único de algarrobals densos del norte peruano con alta adaptación al estrés hídrico extremo y recarga por eventos El Niño (ENSO).',
  },
  {
    id: 'montseny-biosphere',
    name: 'Reserva de la Biosfera del Montseny',
    country: 'España (Cataluña)',
    biome: 'Bosque Mediterráneo Montano / Templado Húmedo',
    areaHa: 30120,
    center: [41.775, 2.441],
    dominantSpecies: ['Quercus ilex (Encina)', 'Fagus sylvatica (Haya)', 'Castanea sativa (Castaño)', 'Pinus sylvestris'],
    climateType: 'Mediterráneo húmedo de montaña (Csb/Cfb)',
    fluxnetSiteId: 'ES-LJu / ES-Montseny',
    fluxnetSiteName: 'Montseny Quercus-Fagus Ecosite',
    meanAnnualPrecipMm: 865,
    meanTempC: 11.8,
    elevationM: 1120,
    baselineAGB: 92.4,
    baselineSOC: 84.1,
    description: 'Ecotono bioclimático de transición submediterránea-eurosiberiana con alto gradiente altitudinal y vulnerabilidad a sequías estivales intensas.',
  },
  {
    id: 'guadarrama-pines',
    name: 'Parque Nacional Sierra de Guadarrama',
    country: 'España (Madrid / Castilla y León)',
    biome: 'Bosque de Coníferas de Alta Montaña',
    areaHa: 33960,
    center: [40.783, -3.983],
    dominantSpecies: ['Pinus sylvestris var. iberica (Pino albar)', 'Pinus nigra', 'Quercus pyrenaica (Rebollo)'],
    climateType: 'Mediterráneo continentalizado de montaña (Dsb)',
    fluxnetSiteId: 'ES-Agu / ES-Gua',
    fluxnetSiteName: 'Guadarrama Scots Pine Tower',
    meanAnnualPrecipMm: 1150,
    meanTempC: 9.4,
    elevationM: 1650,
    baselineAGB: 118.6,
    baselineSOC: 96.2,
    description: 'Masa continua de pinar de alta montaña con riesgo de incendios de copa en estiaje y estrés térmico por olas de calor estivales.',
  },
  {
    id: 'tapajos-flona',
    name: 'FLONA Tapajós - Amazonía Central',
    country: 'Brasil (Pará)',
    biome: 'Bosque Húmedo Tropical Siempreverde',
    areaHa: 54900,
    center: [-2.856, -54.958],
    dominantSpecies: ['Manilkara huberi', 'Bertholletia excelsa', 'Carapa guianensis', 'Couratari guianensis'],
    climateType: 'Tropical monzónico (Am)',
    fluxnetSiteId: 'BR-Sa1 / BR-Sa3',
    fluxnetSiteName: 'KM67 Tapajós Primary Forest',
    meanAnnualPrecipMm: 2150,
    meanTempC: 25.8,
    elevationM: 130,
    baselineAGB: 245.8,
    baselineSOC: 135.2,
    description: 'Ecosistema de dosel hiperdiverso (>45m) con intensa dinámica de recambio de biomasa, alta respiración nocturna y régimen de perturbaciones por El Niño.',
  },
  {
    id: 'landes-maritime',
    name: 'Macizo Forestal de las Landas de Gascuña',
    country: 'Francia (Nouvelle-Aquitaine)',
    biome: 'Pinar Atlántico de Llanura',
    areaHa: 78500,
    center: [44.423, -0.732],
    dominantSpecies: ['Pinus pinaster (Pino marítimo)', 'Quercus robur', 'Ulex europaeus'],
    climateType: 'Oceánico templado (Cfb)',
    fluxnetSiteId: 'FR-Hes / FR-Bil',
    fluxnetSiteName: 'Bilos Maritime Pine Tower',
    meanAnnualPrecipMm: 940,
    meanTempC: 13.2,
    elevationM: 65,
    baselineAGB: 84.5,
    baselineSOC: 62.8,
    description: 'Mayor masa boscosa continua cultivada de Europa occidental, highly susceptible a tormentas severas e incendios de interfaz.',
  },
  {
    id: 'pnw-douglas-fir',
    name: 'Bosque Nacional Willamette (Cascades)',
    country: 'Estados Unidos (Oregon)',
    biome: 'Bosque Templado Lluvioso de Coníferas',
    areaHa: 68200,
    center: [44.212, -122.256],
    dominantSpecies: ['Pseudotsuga menziesii (Douglas-fir)', 'Tsuga heterophylla', 'Thuja plicata'],
    climateType: 'Mediterráneo templado oceánico (Csb)',
    fluxnetSiteId: 'US-Me2 / US-Wrc',
    fluxnetSiteName: 'Metolius Mature Pine / Wind River Canopy',
    meanAnnualPrecipMm: 1780,
    meanTempC: 8.9,
    elevationM: 850,
    baselineAGB: 310.4,
    baselineSOC: 168.9,
    description: 'Ecosistema con la mayor densidad de biomasa por hectárea del planeta, con árboles centenarios de >65m y alta capacidad de secuestro a largo plazo.',
  },
];

// Vertical Canopy profile data (LiDAR GEDI energy return & stratified layers)
export const MOCK_CANOPY_PROFILE: CanopyStratumPoint[] = [
  { heightM: 0, relativeEnergyPct: 100, plantAreaVolumeDensity: 0.05, fuelDensityKgM3: 1.45, stratumLabel: 'Suelo' },
  { heightM: 2, relativeEnergyPct: 35, plantAreaVolumeDensity: 0.18, fuelDensityKgM3: 0.85, stratumLabel: 'Subdosel (0-5m)' },
  { heightM: 4, relativeEnergyPct: 22, plantAreaVolumeDensity: 0.32, fuelDensityKgM3: 0.62, stratumLabel: 'Subdosel (0-5m)' },
  { heightM: 6, relativeEnergyPct: 18, plantAreaVolumeDensity: 0.45, fuelDensityKgM3: 0.48, stratumLabel: 'Dosel Medio (5-18m)' },
  { heightM: 10, relativeEnergyPct: 28, plantAreaVolumeDensity: 0.65, fuelDensityKgM3: 0.52, stratumLabel: 'Dosel Medio (5-18m)' },
  { heightM: 14, relativeEnergyPct: 45, plantAreaVolumeDensity: 0.88, fuelDensityKgM3: 0.74, stratumLabel: 'Dosel Medio (5-18m)' },
  { heightM: 18, relativeEnergyPct: 72, plantAreaVolumeDensity: 1.25, fuelDensityKgM3: 1.10, stratumLabel: 'Dosel Dominante (18-32m)' },
  { heightM: 22, relativeEnergyPct: 92, plantAreaVolumeDensity: 1.62, fuelDensityKgM3: 1.42, stratumLabel: 'Dosel Dominante (18-32m)' },
  { heightM: 26, relativeEnergyPct: 84, plantAreaVolumeDensity: 1.48, fuelDensityKgM3: 1.28, stratumLabel: 'Dosel Dominante (18-32m)' },
  { heightM: 30, relativeEnergyPct: 56, plantAreaVolumeDensity: 0.95, fuelDensityKgM3: 0.82, stratumLabel: 'Dosel Dominante (18-32m)' },
  { heightM: 34, relativeEnergyPct: 32, plantAreaVolumeDensity: 0.55, fuelDensityKgM3: 0.45, stratumLabel: 'Emergentes (>32m)' },
  { heightM: 38, relativeEnergyPct: 14, plantAreaVolumeDensity: 0.22, fuelDensityKgM3: 0.18, stratumLabel: 'Emergentes (>32m)' },
  { heightM: 42, relativeEnergyPct: 4, plantAreaVolumeDensity: 0.06, fuelDensityKgM3: 0.05, stratumLabel: 'Emergentes (>32m)' },
  { heightM: 45, relativeEnergyPct: 0, plantAreaVolumeDensity: 0.00, fuelDensityKgM3: 0.00, stratumLabel: 'Emergentes (>32m)' },
];

export const MOCK_GEDI_METRICS: GediMetrics = {
  shotNumber: 'GEDI04_A_2023185124832_01824_T04182_02_002_01_V002',
  rh25: 8.4,
  rh50: 16.8,
  rh75: 23.5,
  rh98: 31.2,
  fhd: 2.84,
  cover: 0.88,
  agbDensity: 114.6,
  pai: 4.62,
  qualityFlag: 1,
  solarElevation: 48.6,
};

// 24-Month Time-Series for Fluxes (FLUXNET vs 3-PG vs Hybrid DL)
export const MOCK_FLUX_TIMESERIES: MonthlyFluxPoint[] = [
  { month: 'Ene 23', timestamp: '2023-01', tempC: 5.2, precipMm: 45, vpdKPa: 0.42, radMJm2: 8.5, pg3_gpp: 2.8, pg3_nee: -0.6, pg3_reco: 2.2, pg3_agb: 92.4, hybrid_gpp: 3.1, hybrid_nee: -0.8, hybrid_reco: 2.3, hybrid_ci_lower: -1.1, hybrid_ci_upper: -0.5, fluxnet_gpp: 3.2, fluxnet_nee: -0.9, fluxnet_reco: 2.3 },
  { month: 'Feb 23', timestamp: '2023-02', tempC: 6.8, precipMm: 38, vpdKPa: 0.48, radMJm2: 11.2, pg3_gpp: 3.9, pg3_nee: -1.2, pg3_reco: 2.7, pg3_agb: 92.6, hybrid_gpp: 4.2, hybrid_nee: -1.4, hybrid_reco: 2.8, hybrid_ci_lower: -1.7, hybrid_ci_upper: -1.1, fluxnet_gpp: 4.4, fluxnet_nee: -1.5, fluxnet_reco: 2.9 },
  { month: 'Mar 23', timestamp: '2023-03', tempC: 10.4, precipMm: 72, vpdKPa: 0.65, radMJm2: 15.8, pg3_gpp: 6.5, pg3_nee: -2.8, pg3_reco: 3.7, pg3_agb: 93.1, hybrid_gpp: 7.1, hybrid_nee: -3.2, hybrid_reco: 3.9, hybrid_ci_lower: -3.6, hybrid_ci_upper: -2.8, fluxnet_gpp: 7.3, fluxnet_nee: -3.3, fluxnet_reco: 4.0 },
  { month: 'Abr 23', timestamp: '2023-04', tempC: 13.8, precipMm: 85, vpdKPa: 0.82, radMJm2: 19.4, pg3_gpp: 9.4, pg3_nee: -4.6, pg3_reco: 4.8, pg3_agb: 93.8, hybrid_gpp: 10.2, hybrid_nee: -5.1, hybrid_reco: 5.1, hybrid_ci_lower: -5.6, hybrid_ci_upper: -4.6, fluxnet_gpp: 10.5, fluxnet_nee: -5.3, fluxnet_reco: 5.2 },
  { month: 'May 23', timestamp: '2023-05', tempC: 17.5, precipMm: 92, vpdKPa: 1.15, radMJm2: 23.2, pg3_gpp: 12.8, pg3_nee: -6.4, pg3_reco: 6.4, pg3_agb: 94.7, hybrid_gpp: 13.5, hybrid_nee: -6.8, hybrid_reco: 6.7, hybrid_ci_lower: -7.3, hybrid_ci_upper: -6.3, fluxnet_gpp: 13.8, fluxnet_nee: -7.0, fluxnet_reco: 6.8 },
  { month: 'Jun 23', timestamp: '2023-06', tempC: 22.1, precipMm: 28, vpdKPa: 1.85, radMJm2: 26.5, pg3_gpp: 11.2, pg3_nee: -4.1, pg3_reco: 7.1, pg3_agb: 95.3, hybrid_gpp: 10.8, hybrid_nee: -3.5, hybrid_reco: 7.3, hybrid_ci_lower: -4.0, hybrid_ci_upper: -3.0, fluxnet_gpp: 10.6, fluxnet_nee: -3.3, fluxnet_reco: 7.3 },
  { month: 'Jul 23', timestamp: '2023-07', tempC: 26.4, precipMm: 12, vpdKPa: 2.65, radMJm2: 27.8, pg3_gpp: 7.4, pg3_nee: -0.6, pg3_reco: 6.8, pg3_agb: 95.5, hybrid_gpp: 6.8, hybrid_nee: +0.2, hybrid_reco: 7.0, hybrid_ci_lower: -0.3, hybrid_ci_upper: +0.7, fluxnet_gpp: 6.5, fluxnet_nee: +0.4, fluxnet_reco: 6.9 },
  { month: 'Ago 23', timestamp: '2023-08', tempC: 25.9, precipMm: 18, vpdKPa: 2.45, radMJm2: 24.1, pg3_gpp: 6.8, pg3_nee: -0.2, pg3_reco: 6.6, pg3_agb: 95.6, hybrid_gpp: 6.2, hybrid_nee: +0.6, hybrid_reco: 6.8, hybrid_ci_lower: +0.1, hybrid_ci_upper: +1.1, fluxnet_gpp: 6.0, fluxnet_nee: +0.8, fluxnet_reco: 6.8 },
  { month: 'Sep 23', timestamp: '2023-09', tempC: 20.8, precipMm: 68, vpdKPa: 1.45, radMJm2: 18.6, pg3_gpp: 9.8, pg3_nee: -4.2, pg3_reco: 5.6, pg3_agb: 96.2, hybrid_gpp: 10.4, hybrid_nee: -4.6, hybrid_reco: 5.8, hybrid_ci_lower: -5.1, hybrid_ci_upper: -4.1, fluxnet_gpp: 10.7, fluxnet_nee: -4.8, fluxnet_reco: 5.9 },
  { month: 'Oct 23', timestamp: '2023-10', tempC: 15.6, precipMm: 88, vpdKPa: 0.95, radMJm2: 13.4, pg3_gpp: 7.2, pg3_nee: -3.1, pg3_reco: 4.1, pg3_agb: 96.6, hybrid_gpp: 7.8, hybrid_nee: -3.5, hybrid_reco: 4.3, hybrid_ci_lower: -3.9, hybrid_ci_upper: -3.1, fluxnet_gpp: 8.0, fluxnet_nee: -3.6, fluxnet_reco: 4.4 },
  { month: 'Nov 23', timestamp: '2023-11', tempC: 9.8, precipMm: 95, vpdKPa: 0.58, radMJm2: 9.2, pg3_gpp: 4.2, pg3_nee: -1.4, pg3_reco: 2.8, pg3_agb: 96.8, hybrid_gpp: 4.6, hybrid_nee: -1.6, hybrid_reco: 3.0, hybrid_ci_lower: -1.9, hybrid_ci_upper: -1.3, fluxnet_gpp: 4.7, fluxnet_nee: -1.7, fluxnet_reco: 3.0 },
  { month: 'Dic 23', timestamp: '2023-12', tempC: 6.1, precipMm: 52, vpdKPa: 0.44, radMJm2: 7.4, pg3_gpp: 2.9, pg3_nee: -0.7, pg3_reco: 2.2, pg3_agb: 97.0, hybrid_gpp: 3.2, hybrid_nee: -0.9, hybrid_reco: 2.3, hybrid_ci_lower: -1.2, hybrid_ci_upper: -0.6, fluxnet_gpp: 3.3, fluxnet_nee: -1.0, fluxnet_reco: 2.3 },
  { month: 'Ene 24', timestamp: '2024-01', tempC: 5.6, precipMm: 50, vpdKPa: 0.43, radMJm2: 8.8, pg3_gpp: 3.0, pg3_nee: -0.7, pg3_reco: 2.3, pg3_agb: 97.1, hybrid_gpp: 3.3, hybrid_nee: -0.9, hybrid_reco: 2.4, hybrid_ci_lower: -1.2, hybrid_ci_upper: -0.6, fluxnet_gpp: 3.4, fluxnet_nee: -1.0, fluxnet_reco: 2.4 },
  { month: 'Feb 24', timestamp: '2024-02', tempC: 7.2, precipMm: 42, vpdKPa: 0.50, radMJm2: 11.8, pg3_gpp: 4.1, pg3_nee: -1.3, pg3_reco: 2.8, pg3_agb: 97.3, hybrid_gpp: 4.4, hybrid_nee: -1.5, hybrid_reco: 2.9, hybrid_ci_lower: -1.8, hybrid_ci_upper: -1.2, fluxnet_gpp: 4.6, fluxnet_nee: -1.6, fluxnet_reco: 3.0 },
  { month: 'Mar 24', timestamp: '2024-03', tempC: 11.0, precipMm: 78, vpdKPa: 0.68, radMJm2: 16.2, pg3_gpp: 6.8, pg3_nee: -2.9, pg3_reco: 3.9, pg3_agb: 97.8, hybrid_gpp: 7.4, hybrid_nee: -3.3, hybrid_reco: 4.1, hybrid_ci_lower: -3.7, hybrid_ci_upper: -2.9, fluxnet_gpp: 7.6, fluxnet_nee: -3.4, fluxnet_reco: 4.2 },
  { month: 'Abr 24', timestamp: '2024-04', tempC: 14.2, precipMm: 82, vpdKPa: 0.85, radMJm2: 19.8, pg3_gpp: 9.7, pg3_nee: -4.8, pg3_reco: 4.9, pg3_agb: 98.5, hybrid_gpp: 10.5, hybrid_nee: -5.3, hybrid_reco: 5.2, hybrid_ci_lower: -5.8, hybrid_ci_upper: -4.8, fluxnet_gpp: 10.8, fluxnet_nee: -5.5, fluxnet_reco: 5.3 },
  { month: 'May 24', timestamp: '2024-05', tempC: 18.0, precipMm: 88, vpdKPa: 1.18, radMJm2: 23.8, pg3_gpp: 13.1, pg3_nee: -6.5, pg3_reco: 6.6, pg3_agb: 99.4, hybrid_gpp: 13.8, hybrid_nee: -7.0, hybrid_reco: 6.8, hybrid_ci_lower: -7.5, hybrid_ci_upper: -6.5, fluxnet_gpp: 14.1, fluxnet_nee: -7.2, fluxnet_reco: 6.9 },
  { month: 'Jun 24', timestamp: '2024-06', tempC: 22.8, precipMm: 22, vpdKPa: 1.95, radMJm2: 27.0, pg3_gpp: 11.0, pg3_nee: -3.8, pg3_reco: 7.2, pg3_agb: 100.0, hybrid_gpp: 10.5, hybrid_nee: -3.1, hybrid_reco: 7.4, hybrid_ci_lower: -3.6, hybrid_ci_upper: -2.6, fluxnet_gpp: 10.3, fluxnet_nee: -2.9, fluxnet_reco: 7.4 },
  { month: 'Jul 24', timestamp: '2024-07', tempC: 27.1, precipMm: 8, vpdKPa: 2.85, radMJm2: 28.2, pg3_gpp: 7.0, pg3_nee: -0.1, pg3_reco: 6.9, pg3_agb: 100.2, hybrid_gpp: 6.4, hybrid_nee: +0.7, hybrid_reco: 7.1, hybrid_ci_lower: +0.2, hybrid_ci_upper: +1.2, fluxnet_gpp: 6.1, fluxnet_nee: +0.9, fluxnet_reco: 7.0 },
  { month: 'Ago 24', timestamp: '2024-08', tempC: 26.5, precipMm: 14, vpdKPa: 2.58, radMJm2: 24.6, pg3_gpp: 6.5, pg3_nee: +0.1, pg3_reco: 6.6, pg3_agb: 100.3, hybrid_gpp: 5.9, hybrid_nee: +0.9, hybrid_reco: 6.8, hybrid_ci_lower: +0.4, hybrid_ci_upper: +1.4, fluxnet_gpp: 5.7, fluxnet_nee: +1.1, fluxnet_reco: 6.8 },
  { month: 'Sep 24', timestamp: '2024-09', tempC: 21.2, precipMm: 62, vpdKPa: 1.50, radMJm2: 18.9, pg3_gpp: 9.6, pg3_nee: -4.0, pg3_reco: 5.6, pg3_agb: 100.9, hybrid_gpp: 10.2, hybrid_nee: -4.4, hybrid_reco: 5.8, hybrid_ci_lower: -4.9, hybrid_ci_upper: -3.9, fluxnet_gpp: 10.5, fluxnet_nee: -4.6, fluxnet_reco: 5.9 },
  { month: 'Oct 24', timestamp: '2024-10', tempC: 16.0, precipMm: 90, vpdKPa: 0.98, radMJm2: 13.8, pg3_gpp: 7.4, pg3_nee: -3.2, pg3_reco: 4.2, pg3_agb: 101.4, hybrid_gpp: 8.0, hybrid_nee: -3.6, hybrid_reco: 4.4, hybrid_ci_lower: -4.0, hybrid_ci_upper: -3.2, fluxnet_gpp: 8.2, fluxnet_nee: -3.7, fluxnet_reco: 4.5 },
  { month: 'Nov 24', timestamp: '2024-11', tempC: 10.2, precipMm: 92, vpdKPa: 0.60, radMJm2: 9.5, pg3_gpp: 4.4, pg3_nee: -1.5, pg3_reco: 2.9, pg3_agb: 101.6, hybrid_gpp: 4.8, hybrid_nee: -1.7, hybrid_reco: 3.1, hybrid_ci_lower: -2.0, hybrid_ci_upper: -1.4, fluxnet_gpp: 4.9, fluxnet_nee: -1.8, fluxnet_reco: 3.1 },
  { month: 'Dic 24', timestamp: '2024-12', tempC: 6.4, precipMm: 48, vpdKPa: 0.45, radMJm2: 7.6, pg3_gpp: 3.1, pg3_nee: -0.8, pg3_reco: 2.3, pg3_agb: 101.8, hybrid_gpp: 3.4, hybrid_nee: -1.0, hybrid_reco: 2.4, hybrid_ci_lower: -1.3, hybrid_ci_upper: -0.7, fluxnet_gpp: 3.5, fluxnet_nee: -1.1, fluxnet_reco: 2.4 },
];

// 50-Year Adaptive Management Scenarios
export const MOCK_SCENARIOS: ManagementScenario[] = [
  {
    id: 'scen-thinning',
    name: 'Clareo Selectivo Adaptativo',
    tag: 'Manejo Silvícola Activo',
    type: 'thinning',
    description: 'Reducción de densidad de un 25-30% de área basal en los años 5 y 25. Maximiza crecimiento individual de fustes dominantes, reduce competencia hídrica y atenúa la continuidad vertical del combustible.',
    thinningIntensityPct: 28,
    thinningScheduleYears: [5, 25],
    prescribedBurnIntervalYears: 0,
    reforestationSpecies: 'Regeneración natural asistida',
    fuelBreakWidthM: 0,
    metricsSummary: {
      totalCarbon50Yr: 238.4,
      carbonSequestrationRate: 3.12,
      cumulativeHarvestedCarbon: 48.5,
      meanFireRiskProb: 0.28,
      fireResilienceScore: 84,
      biodiversityShannonH: 2.75,
      waterYieldM3Ha: 3420,
      economicNPV_EUR_ha: 4250,
      uncertaintyReductionPct: 34.2,
    },
    trajectory: [
      { year: 0, agb: 92.4, soc: 84.1, deadwoodC: 12.0, totalCarbon: 188.5, lai: 3.8, fireRiskProbability: 0.48, canopyHeightM: 18.4, stemDensityHa: 1100, waterYieldMm: 310, biodiversityIndex: 2.1 },
      { year: 5, agb: 74.2, soc: 85.6, deadwoodC: 18.4, totalCarbon: 178.2, lai: 2.7, fireRiskProbability: 0.22, canopyHeightM: 19.8, stemDensityHa: 790, waterYieldMm: 420, biodiversityIndex: 2.4 },
      { year: 10, agb: 98.6, soc: 89.2, deadwoodC: 15.2, totalCarbon: 203.0, lai: 3.4, fireRiskProbability: 0.26, canopyHeightM: 22.1, stemDensityHa: 760, waterYieldMm: 375, biodiversityIndex: 2.6 },
      { year: 20, agb: 142.1, soc: 96.8, deadwoodC: 14.0, totalCarbon: 252.9, lai: 4.1, fireRiskProbability: 0.38, canopyHeightM: 25.8, stemDensityHa: 710, waterYieldMm: 340, biodiversityIndex: 2.7 },
      { year: 25, agb: 118.5, soc: 98.4, deadwoodC: 21.5, totalCarbon: 238.4, lai: 3.1, fireRiskProbability: 0.21, canopyHeightM: 26.9, stemDensityHa: 520, waterYieldMm: 435, biodiversityIndex: 2.8 },
      { year: 35, agb: 158.4, soc: 104.2, deadwoodC: 16.8, totalCarbon: 279.4, lai: 3.9, fireRiskProbability: 0.27, canopyHeightM: 29.4, stemDensityHa: 505, waterYieldMm: 380, biodiversityIndex: 2.8 },
      { year: 50, agb: 194.2, soc: 112.5, deadwoodC: 18.2, totalCarbon: 324.9, lai: 4.2, fireRiskProbability: 0.31, canopyHeightM: 32.6, stemDensityHa: 480, waterYieldMm: 360, biodiversityIndex: 2.9 },
    ],
  },
  {
    id: 'scen-burns',
    name: 'Quemas Prescritas & Manejo de Combustible',
    tag: 'Mitigación de Incendios Extremos',
    type: 'prescribed_burn',
    description: 'Régimen de fuegos prescritos de baja intensidad cada 8 años en mosaico espacial. Consume restos finos superficiales (hojarasca, pasto y subdosel) manteniendo el dosel arbóreo intacto y reduciendo la probabilidad de incendios catastróficos.',
    thinningIntensityPct: 10,
    thinningScheduleYears: [10],
    prescribedBurnIntervalYears: 8,
    reforestationSpecies: 'Especies piro-resistentes',
    fuelBreakWidthM: 30,
    metricsSummary: {
      totalCarbon50Yr: 212.8,
      carbonSequestrationRate: 2.65,
      cumulativeHarvestedCarbon: 12.0,
      meanFireRiskProb: 0.16,
      fireResilienceScore: 95,
      biodiversityShannonH: 2.45,
      waterYieldM3Ha: 3890,
      economicNPV_EUR_ha: 2100,
      uncertaintyReductionPct: 36.8,
    },
    trajectory: [
      { year: 0, agb: 92.4, soc: 84.1, deadwoodC: 12.0, totalCarbon: 188.5, lai: 3.8, fireRiskProbability: 0.48, canopyHeightM: 18.4, stemDensityHa: 1100, waterYieldMm: 310, biodiversityIndex: 2.1 },
      { year: 5, agb: 106.2, soc: 83.2, deadwoodC: 5.4, totalCarbon: 194.8, lai: 3.6, fireRiskProbability: 0.14, canopyHeightM: 19.5, stemDensityHa: 1040, waterYieldMm: 345, biodiversityIndex: 2.3 },
      { year: 10, agb: 118.4, soc: 85.0, deadwoodC: 6.8, totalCarbon: 210.2, lai: 3.9, fireRiskProbability: 0.16, canopyHeightM: 21.2, stemDensityHa: 980, waterYieldMm: 360, biodiversityIndex: 2.4 },
      { year: 20, agb: 139.6, soc: 87.4, deadwoodC: 6.1, totalCarbon: 233.1, lai: 4.0, fireRiskProbability: 0.15, canopyHeightM: 24.1, stemDensityHa: 890, waterYieldMm: 375, biodiversityIndex: 2.5 },
      { year: 35, agb: 165.2, soc: 91.8, deadwoodC: 7.2, totalCarbon: 264.2, lai: 4.1, fireRiskProbability: 0.18, canopyHeightM: 27.5, stemDensityHa: 790, waterYieldMm: 380, biodiversityIndex: 2.5 },
      { year: 50, agb: 188.0, soc: 96.5, deadwoodC: 8.1, totalCarbon: 292.6, lai: 4.2, fireRiskProbability: 0.19, canopyHeightM: 30.2, stemDensityHa: 720, waterYieldMm: 385, biodiversityIndex: 2.6 },
    ],
  },
  {
    id: 'scen-restoration',
    name: 'Restauración Multifuncional & Enriquecimiento',
    tag: 'Secuestro & Biodiversidad Máxima',
    type: 'restoration',
    description: 'Plantación de enriquecimiento con especies autóctonas tardías (Fagus, Quercus, Sorbus) en claros y zonas degradadas. Incrementa la complejidad estructural 3D, la retención de agua y la estabilidad del carbono orgánico profundo del suelo.',
    thinningIntensityPct: 0,
    thinningScheduleYears: [],
    prescribedBurnIntervalYears: 0,
    reforestationSpecies: 'Quercus petraea + Fagus sylvatica + Ilex aquifolium',
    fuelBreakWidthM: 15,
    metricsSummary: {
      totalCarbon50Yr: 285.6,
      carbonSequestrationRate: 3.88,
      cumulativeHarvestedCarbon: 0,
      meanFireRiskProb: 0.32,
      fireResilienceScore: 78,
      biodiversityShannonH: 3.42,
      waterYieldM3Ha: 2980,
      economicNPV_EUR_ha: 3800,
      uncertaintyReductionPct: 38.5,
    },
    trajectory: [
      { year: 0, agb: 92.4, soc: 84.1, deadwoodC: 12.0, totalCarbon: 188.5, lai: 3.8, fireRiskProbability: 0.48, canopyHeightM: 18.4, stemDensityHa: 1100, waterYieldMm: 310, biodiversityIndex: 2.1 },
      { year: 5, agb: 104.5, soc: 86.8, deadwoodC: 14.5, totalCarbon: 205.8, lai: 4.2, fireRiskProbability: 0.44, canopyHeightM: 19.8, stemDensityHa: 1350, waterYieldMm: 295, biodiversityIndex: 2.6 },
      { year: 10, agb: 124.8, soc: 92.4, deadwoodC: 16.8, totalCarbon: 234.0, lai: 4.8, fireRiskProbability: 0.38, canopyHeightM: 21.6, stemDensityHa: 1280, waterYieldMm: 280, biodiversityIndex: 2.9 },
      { year: 20, agb: 168.4, soc: 105.6, deadwoodC: 22.4, totalCarbon: 296.4, lai: 5.4, fireRiskProbability: 0.34, canopyHeightM: 25.4, stemDensityHa: 1150, waterYieldMm: 270, biodiversityIndex: 3.2 },
      { year: 35, agb: 224.6, soc: 121.2, deadwoodC: 28.5, totalCarbon: 374.3, lai: 5.9, fireRiskProbability: 0.30, canopyHeightM: 29.8, stemDensityHa: 980, waterYieldMm: 260, biodiversityIndex: 3.4 },
      { year: 50, agb: 272.5, soc: 138.4, deadwoodC: 34.2, totalCarbon: 445.1, lai: 6.2, fireRiskProbability: 0.28, canopyHeightM: 33.5, stemDensityHa: 860, waterYieldMm: 255, biodiversityIndex: 3.6 },
    ],
  },
  {
    id: 'scen-laissez-faire',
    name: 'Laissez-Faire / No Intervención (Línea Base)',
    tag: 'Evolución Espontánea + Cambio Climático',
    type: 'laissez_faire',
    description: 'Ausencia total de gestión selvícola bajo escenario climático RCP 8.5 (aumento de 2.8°C y +35% días con sequía extrema). Alta acumulación inicial de combustible que culmina en un gran incendio forestal (GIF) en el año 18, colapsando el stock de carbono.',
    thinningIntensityPct: 0,
    thinningScheduleYears: [],
    prescribedBurnIntervalYears: 0,
    reforestationSpecies: 'Ninguna (sucesión no asistida)',
    fuelBreakWidthM: 0,
    metricsSummary: {
      totalCarbon50Yr: 142.2,
      carbonSequestrationRate: 0.95,
      cumulativeHarvestedCarbon: 0,
      meanFireRiskProb: 0.68,
      fireResilienceScore: 32,
      biodiversityShannonH: 1.85,
      waterYieldM3Ha: 2650,
      economicNPV_EUR_ha: -850,
      uncertaintyReductionPct: 22.0,
    },
    trajectory: [
      { year: 0, agb: 92.4, soc: 84.1, deadwoodC: 12.0, totalCarbon: 188.5, lai: 3.8, fireRiskProbability: 0.48, canopyHeightM: 18.4, stemDensityHa: 1100, waterYieldMm: 310, biodiversityIndex: 2.1 },
      { year: 5, agb: 108.2, soc: 86.4, deadwoodC: 16.8, totalCarbon: 211.4, lai: 4.4, fireRiskProbability: 0.58, canopyHeightM: 19.9, stemDensityHa: 1040, waterYieldMm: 285, biodiversityIndex: 2.2 },
      { year: 10, agb: 128.5, soc: 89.2, deadwoodC: 24.5, totalCarbon: 242.2, lai: 4.9, fireRiskProbability: 0.72, canopyHeightM: 21.8, stemDensityHa: 980, waterYieldMm: 260, biodiversityIndex: 2.1 },
      { year: 18, agb: 38.4, soc: 68.5, deadwoodC: 45.2, totalCarbon: 152.1, lai: 1.2, fireRiskProbability: 0.88, canopyHeightM: 8.5, stemDensityHa: 220, waterYieldMm: 520, biodiversityIndex: 1.2 }, // GIF Incident
      { year: 25, agb: 48.6, soc: 69.8, deadwoodC: 32.0, totalCarbon: 150.4, lai: 2.1, fireRiskProbability: 0.35, canopyHeightM: 11.2, stemDensityHa: 680, waterYieldMm: 440, biodiversityIndex: 1.6 },
      { year: 35, agb: 72.4, soc: 73.5, deadwoodC: 22.4, totalCarbon: 168.3, lai: 3.0, fireRiskProbability: 0.48, canopyHeightM: 14.8, stemDensityHa: 950, waterYieldMm: 360, biodiversityIndex: 1.9 },
      { year: 50, agb: 104.2, soc: 79.4, deadwoodC: 18.5, totalCarbon: 202.1, lai: 3.7, fireRiskProbability: 0.62, canopyHeightM: 18.2, stemDensityHa: 1080, waterYieldMm: 315, biodiversityIndex: 2.0 },
    ],
  },
];

// Scientific Validation & Uncertainty Quantification
export const MOCK_VALIDATION_METRICS: ValidationMetrics = {
  datasetName: 'Validación Cruzada IFN4 + GEDI L4A + FLUXNET (N=1,420 Parcelas)',
  sampleSize: 1420,
  traditionalNFI: {
    rmse: 28.42, // Mg C / ha
    mae: 22.15,
    r2: 0.642,
    bias: -4.85,
    ci95Width: 38.6,
  },
  silvaTwinAssimilation: {
    rmse: 17.58, // Mg C / ha (-38.1% RMSE)
    mae: 13.20,
    r2: 0.884,
    bias: -0.62,
    nse: 0.891,
    ci95Width: 23.4, // (-39.3% CI width)
  },
  uncertaintyReductionPct: 34.8,
};

export const SOBOL_INDICES: SobolSensitivityIndex[] = [
  { parameter: 'GEDI RH98 (Altura dosel)', label: 'h_canopy (RH98)', firstOrderS1: 0.342, totalOrderST: 0.418, category: 'Estructura LiDAR' },
  { parameter: 'S1 SAR Backscatter VV/VH (FMC)', label: 'Humedad combustible SAR', firstOrderS1: 0.215, totalOrderST: 0.284, category: 'Estructura LiDAR' },
  { parameter: 'alpha_cx (Eficiencia cuántica 3-PG)', label: 'alpha_cx', firstOrderS1: 0.182, totalOrderST: 0.245, category: 'Fisiología' },
  { parameter: 'VPD estival (Déficit presión vapor)', label: 'VPD max', firstOrderS1: 0.114, totalOrderST: 0.168, category: 'Clima' },
  { parameter: 'Capacidad hídrica suelo (SWC)', label: 'SWC_rootzone', firstOrderS1: 0.082, totalOrderST: 0.125, category: 'Suelo' },
  { parameter: 'k_GPP (Sensibilidad estomática)', label: 'k_GPP', firstOrderS1: 0.045, totalOrderST: 0.072, category: 'Fisiología' },
  { parameter: 'Temperatura media aire (T_mean)', label: 'T_air', firstOrderS1: 0.020, totalOrderST: 0.042, category: 'Clima' },
];

export const SCIENTIFIC_CODE_ARTIFACTS: ScientificCodeArtifact[] = [
  {
    id: 'py3pg-core',
    title: 'py3pg_core.py — Modelo Ecofisiológico 3-PG Vectorizado',
    filename: 'py3pg_core.py',
    language: 'python',
    category: 'Modelo 3-PG',
    description: 'Implementación numérica completa en Python/NumPy del modelo ecofisiológico 3-PG (Landsberg & Waring) con modificadores climáticos (f_T, f_VPD, f_SW, f_age, f_frost), asignación de biomasa (hojas, fuste, raíces) y ley de autorraleo 3/2.',
    code: `"""
py3pg_core.py - Process-based Forest Growth Model (3-PG)
Implementation adapted for Landscape-scale Digital Twin Coupling
Authors: SilvaTwin Computational Ecology Group (Q1 Publication Framework)
"""

import numpy as np
from dataclasses import dataclass
from typing import Dict, Tuple

@dataclass
class StandParameters:
    alpha_cx: float = 0.045     # Canopy quantum efficiency (mol C / mol APAR)
    t_opt: float = 18.5         # Optimum temperature for photosynthesis (°C)
    t_min: float = 2.0          # Minimum growth temperature (°C)
    t_max: float = 38.0         # Maximum growth temperature (°C)
    k_vpd: float = 0.055        # VPD stomatal sensitivity (kPa^-1)
    max_swc: float = 200.0      # Available Soil Water Capacity in rootzone (mm)
    sla: float = 8.5            # Specific Leaf Area (m2 / kg C)
    pFS2: float = 0.42          # Foliage:Stem allocation ratio exponent
    wSmax: float = 450.0        # Max individual stem mass at self-thinning boundary (kg C)
    mortality_rate: float = 0.012 # Background annual mortality

class Py3PGModel:
    def __init__(self, params: StandParameters):
        self.p = params

    def calc_modifiers(self, temp: float, vpd: float, swc: float, age: float) -> Tuple[float, float, float, float]:
        """Compute ecophysiological modifiers [0, 1] limiting canopy GPP"""
        # Temperature modifier (f_T)
        if temp <= self.p.t_min or temp >= self.p.t_max:
            f_t = 0.0
        else:
            f_t = ((temp - self.p.t_min) / (self.p.t_opt - self.p.t_min)) * \\
                  (((self.p.t_max - temp) / (self.p.t_max - self.p.t_opt)) ** ((self.p.t_max - self.p.t_opt) / (self.p.t_opt - self.p.t_min)))
            f_t = max(0.0, min(1.0, f_t))

        # Vapor Pressure Deficit modifier (f_VPD)
        f_vpd = np.exp(-self.p.k_vpd * max(0.0, vpd))

        # Soil Water modifier (f_SW)
        rel_swc = max(0.0, min(1.0, swc / self.p.max_swc))
        f_sw = 1.0 / (1.0 + ((1.0 - rel_swc) / 0.35) ** 3.0)

        # Stand Age modifier (f_age)
        rel_age = age / 50.0
        f_age = 1.0 / (1.0 + (rel_age / 0.8) ** 4.0)

        return f_t, f_vpd, f_sw, f_age

    def run_step(self, state: Dict[str, float], forcing: Dict[str, float]) -> Dict[str, float]:
        """
        Executes one monthly time step.
        Inputs:
            state: {'W_fol': kg C/m2, 'W_stem': kg C/m2, 'W_root': kg C/m2, 'density': stems/ha, 'age': years}
            forcing: {'rad_MJ': MJ/m2/mo, 'temp_c': °C, 'vpd_kpa': kPa, 'precip_mm': mm}
        """
        lai = state['W_fol'] * self.p.sla
        apar = forcing['rad_MJ'] * 0.47 * (1.0 - np.exp(-0.5 * lai)) # Absorbed PAR

        f_t, f_vpd, f_sw, f_age = self.calc_modifiers(
            forcing['temp_c'], forcing['vpd_kpa'], state.get('swc', 140.0), state['age']
        )
        physio_modifier = f_t * f_vpd * f_sw * f_age

        # Gross Primary Productivity (GPP) in g C / m2 / month
        gpp = apar * self.p.alpha_cx * physio_modifier * 12.011 # g C/m2
        npp = gpp * 0.47 # Constant NPP/GPP carbon use efficiency ratio

        # Dynamic Carbon Allocation (eta_root, eta_stem, eta_fol)
        eta_root = 0.20 + 0.40 * (1.0 - min(f_sw, f_vpd))
        remaining = 1.0 - eta_root
        pFS = self.p.pFS2 * (state['W_stem'] ** (-0.25))
        eta_fol = remaining / (1.0 + 1.0 / pFS)
        eta_stem = remaining - eta_fol

        # Turnover and update biomass pools
        dW_fol = (npp * eta_fol) - (state['W_fol'] * 0.08) # 8% monthly litterfall
        dW_stem = (npp * eta_stem)
        dW_root = (npp * eta_root) - (state['W_root'] * 0.02) # Root turnover

        return {
            'GPP_MgC_ha': gpp * 0.01,
            'NPP_MgC_ha': npp * 0.01,
            'LAI': lai,
            'W_fol_new': max(0.01, state['W_fol'] + dW_fol * 0.001),
            'W_stem_new': state['W_stem'] + dW_stem * 0.001,
            'W_root_new': state['W_root'] + dW_root * 0.001,
            'f_physio': physio_modifier,
            'f_vpd': f_vpd,
            'f_sw': f_sw,
        }
`,
  },
  {
    id: 'hybrid-pytorch-model',
    title: 'hybrid_transformer_lstm.py — Modelo Híbrido 3-PG + Spatiotemporal Earthformer',
    filename: 'hybrid_transformer_lstm.py',
    language: 'python',
    category: 'Deep Learning',
    description: 'Arquitectura acoplada en PyTorch con red Bi-LSTM temporal y Spatiotemporal Cuboid Attention Transformer para asimilar 3-PG con series temporales satelitales (Sentinel-1/2, MODIS) y predecir residuos de flujos de carbono (NEE/GPP) con cuantificación bayesiana de incertidumbre (MC Dropout).',
    code: `"""
hybrid_transformer_lstm.py - Hybrid Physics-Informed Deep Learning Carbon Engine
Acquires 3-PG physical prior, assimilates Sentinel/GEDI, and predicts residual bias.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class SpatialTemporalCuboidAttention(nn.Module):
    """Cuboid attention mechanism inspired by Earthformer for landscape raster blocks"""
    def __init__(self, d_model=128, num_heads=4):
        super().__init__()
        self.mha = nn.MultiheadAttention(embed_dim=d_model, num_heads=num_heads, batch_first=True)
        self.norm1 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 2),
            nn.GELU(),
            nn.Linear(d_model * 2, d_model)
        )
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x):
        attn_out, _ = self.mha(x, x, x)
        x = self.norm1(x + attn_out)
        return self.norm2(x + self.ffn(x))

class HybridForestCarbonNet(nn.Module):
    def __init__(self, num_forcing_feats=8, num_satellite_feats=6, d_model=128, lstm_hidden=64):
        super().__init__()
        # 1. Physical 3-PG feature projection
        self.pg3_proj = nn.Linear(4, 32) # [GPP_phys, NPP_phys, LAI_phys, f_mod]

        # 2. Satellite & ERA5 Temporal Bi-LSTM
        self.sat_encoder = nn.Linear(num_forcing_feats + num_satellite_feats, 64)
        self.bilstm = nn.LSTM(
            input_size=64,
            hidden_size=lstm_hidden,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=0.15
        )

        # 3. Spatiotemporal Cross-Attention
        self.fusion_proj = nn.Linear(lstm_hidden * 2 + 32, d_model)
        self.transformer_block = SpatialTemporalCuboidAttention(d_model=d_model, num_heads=4)

        # 4. Residual Heads with Bayesian Uncertainty Estimation (MC-Dropout)
        self.dropout = nn.Dropout(p=0.20)
        self.head_gpp_residual = nn.Linear(d_model, 2) # [mu, log_variance]
        self.head_nee_residual = nn.Linear(d_model, 2) # [mu, log_variance]
        self.head_fire_risk = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )

    def forward(self, x_forcing_sat, x_pg3_prior):
        """
        x_forcing_sat: [Batch, SeqLen, Feats] (ERA5 + S1/S2 + Landsat)
        x_pg3_prior:   [Batch, SeqLen, 4]     (3-PG physiological output)
        """
        batch_size, seq_len, _ = x_forcing_sat.shape

        # Encode satellite sequences
        sat_feat = F.relu(self.sat_encoder(x_forcing_sat))
        lstm_out, _ = self.bilstm(sat_feat) # [B, T, 128]

        # Encode physics prior
        pg3_feat = F.relu(self.pg3_proj(x_pg3_prior)) # [B, T, 32]

        # Concatenate Physics + Deep Learning Latents
        fused = torch.cat([lstm_out, pg3_feat], dim=-1)
        latents = self.fusion_proj(fused)
        attended_latents = self.transformer_block(latents)
        dropped = self.dropout(attended_latents)

        # Predict GPP residual (GPP_final = GPP_3PG + delta_GPP)
        gpp_res_params = self.head_gpp_residual(dropped)
        gpp_mu = x_pg3_prior[:, :, 0:1] + gpp_res_params[:, :, 0:1]
        gpp_var = F.softplus(gpp_res_params[:, :, 1:2]) + 1e-4

        # Predict NEE residual
        nee_res_params = self.head_nee_residual(dropped)
        nee_mu = x_pg3_prior[:, :, 1:2] + nee_res_params[:, :, 0:1]
        nee_var = F.softplus(nee_res_params[:, :, 1:2]) + 1e-4

        # Wildfire probability
        fire_prob = self.head_fire_risk(dropped)

        return {
            'gpp_pred': gpp_mu,
            'gpp_var': gpp_var,
            'nee_pred': nee_mu,
            'nee_var': nee_var,
            'fire_prob': fire_prob
        }
`,
  },
  {
    id: 'gedi-l4a-pipeline',
    title: 'gedi_l4a_pipeline.py — Extracción & Calibración de Huellas LiDAR GEDI',
    filename: 'gedi_l4a_pipeline.py',
    language: 'python',
    category: 'Ingesta Satelital',
    description: 'Script para descargar productos GEDI L4A (NASA Earthdata HDF5), filtrar por flags de calidad (l2a_quality_flag == 1, degrade_flag == 0, sensitivity >= 0.95), extraer percentiles de altura del dosel (RH25, RH50, RH75, RH98) y rasterizar a malla de 30m.',
    code: `"""
gedi_l4a_pipeline.py - NASA GEDI L4A Footprint Extraction & Rasterization
Processes NASA Earthdata HDF5 Level 4A Footprint Biomass
"""

import h5py
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import rasterio
from rasterio.transform import from_origin

def process_gedi_l4a_hdf5(file_path: str, aoi_geojson_path: str) -> gpd.GeoDataFrame:
    """Reads GEDI L4A HDF5 granules and extracts high-quality filtered biomass shots"""
    aoi = gpd.read_file(aoi_geojson_path)
    shots_list = []

    with h5py.File(file_path, 'r') as h5:
        # GEDI has 8 beam tracks (BEAM0000, BEAM0001, ..., BEAM1011)
        beam_names = [k for k in h5.keys() if k.startswith('BEAM')]
        
        for beam in beam_names:
            b_group = h5[beam]
            if 'agbd' not in b_group or 'lat_lowestmode' not in b_group:
                continue

            lats = b_group['lat_lowestmode'][:]
            lons = b_group['lon_lowestmode'][:]
            agbd = b_group['agbd'][:] # Aboveground Biomass Density (Mg / ha)
            agbd_se = b_group['agbd_se'][:] # Standard Error
            rh98 = b_group['rh98'][:] # Top canopy height (m)
            rh50 = b_group['rh50'][:] # Relative height 50%
            quality_flag = b_group['l4_quality_flag'][:]
            degrade_flag = b_group['degrade_flag'][:]
            sensitivity = b_group['sensitivity'][:]

            # High scientific quality filtering mask
            mask = (quality_flag == 1) & (degrade_flag == 0) & (sensitivity >= 0.95) & (agbd > 0)
            if not np.any(mask):
                continue

            df_beam = pd.DataFrame({
                'lat': lats[mask],
                'lon': lons[mask],
                'agbd_mg_ha': agbd[mask],
                'agbd_se': agbd_se[mask],
                'rh98_m': rh98[mask],
                'rh50_m': rh50[mask],
                'beam': beam
            })
            shots_list.append(df_beam)

    if not shots_list:
        return gpd.GeoDataFrame()

    full_df = pd.concat(shots_list, ignore_index=True)
    geometry = [Point(xy) for xy in zip(full_df.lon, full_df.lat)]
    gdf = gpd.GeoDataFrame(full_df, geometry=geometry, crs='EPSG:4326')

    # Spatial clip to Study Landscape AOI
    gdf_aoi = gpd.clip(gdf, aoi.to_crs('EPSG:4326'))
    return gdf_aoi
`,
  },
  {
    id: 'snakemake-workflow',
    title: 'Snakefile — Orquestador Reproducible del Gemelo Digital',
    filename: 'Snakefile',
    language: 'yaml',
    category: 'Orquestación',
    description: 'Pipeline end-to-end automatizado con Snakemake y DVC para coordinar la ingesta satelital, fusión en DataCube Zarr, ejecución de 3-PG, inferencia del Transformer e informe científico de validación.',
    code: `# Snakefile - SilvaTwin Landscape Forest Digital Twin Pipeline
# Reproducible end-to-end scientific workflow

configfile: "config/landscape_config.yaml"

rule all:
    input:
        "results/reports/scientific_validation_report.pdf",
        "results/datacube/forest_datacube_30m.zarr",
        "results/models/hybrid_transformer_weights.pt",
        "results/scenarios/adaptive_management_projections.nc"

rule ingest_gedi_l4a:
    input:
        aoi="data/aoi/study_landscape_polygon.geojson"
    output:
        footprints="data/interim/gedi/gedi_filtered_shots.parquet"
    conda:
        "envs/geo_env.yaml"
    script:
        "scripts/ingest_gedi.py"

rule ingest_sentinel_gee:
    input:
        aoi="data/aoi/study_landscape_polygon.geojson"
    output:
        s2_optical="data/interim/satellite/s2_l2a_monthly_ndvi_ndwi.nc",
        s1_sar="data/interim/satellite/s1_grd_backscatter_fmc.nc"
    conda:
        "envs/geo_env.yaml"
    script:
        "scripts/earth_engine_ingest.py"

rule build_spatiotemporal_datacube:
    input:
        gedi="data/interim/gedi/gedi_filtered_shots.parquet",
        s2="data/interim/satellite/s2_l2a_monthly_ndvi_ndwi.nc",
        s1="data/interim/satellite/s1_grd_backscatter_fmc.nc",
        fluxnet="data/raw/fluxnet/hourly_eddy_covariance.csv",
        era5="data/raw/era5/monthly_reanalysis.nc"
    output:
        datacube=directory("results/datacube/forest_datacube_30m.zarr")
    conda:
        "envs/geo_env.yaml"
    script:
        "scripts/build_datacube.py"

rule run_py3pg_simulation:
    input:
        datacube="results/datacube/forest_datacube_30m.zarr"
    output:
        pg3_out="results/models/3pg_process_baseline.nc"
    conda:
        "envs/science_env.yaml"
    script:
        "scripts/run_3pg_grid.py"

rule train_hybrid_deep_learning:
    input:
        datacube="results/datacube/forest_datacube_30m.zarr",
        pg3_out="results/models/3pg_process_baseline.nc"
    output:
        weights="results/models/hybrid_transformer_weights.pt",
        metrics="results/reports/dl_training_metrics.json"
    conda:
        "envs/pytorch_env.yaml"
    script:
        "scripts/train_hybrid_model.py"

rule simulate_adaptive_scenarios:
    input:
        weights="results/models/hybrid_transformer_weights.pt",
        datacube="results/datacube/forest_datacube_30m.zarr"
    output:
        scenarios="results/scenarios/adaptive_management_projections.nc"
    conda:
        "envs/science_env.yaml"
    script:
        "scripts/simulate_scenarios.py"

rule validate_against_national_inventory:
    input:
        scenarios="results/scenarios/adaptive_management_projections.nc",
        nfi_plots="data/raw/nfi/inventario_forestal_nacional.csv"
    output:
        report="results/reports/scientific_validation_report.pdf",
        taylor_diagram="results/figures/taylor_diagram_uncertainty.png"
    conda:
        "envs/science_env.yaml"
    script:
        "scripts/validate_uncertainty.py"
`,
  },
  {
    id: 'replication-guide',
    title: 'REPLICATION.md — Protocolo de Transferibilidad a Nuevas Regiones',
    filename: 'REPLICATION.md',
    language: 'markdown',
    category: 'Pipeline',
    description: 'Guía paso a paso para calibrar, asimilar y replicar el gemelo digital en cualquier paisaje forestal (10³–10⁵ ha) a nivel global mediante polígonos GeoJSON.',
    code: `# REPLICATION GUIDE - SILVATWIN DIGITAL TWIN

Este documento describe el protocolo estandarizado para transferir y ejecutar el Gemelo Digital Forestal en un nuevo paisaje de estudio (10³–10⁵ ha).

---

## 1. Requisitos de Infraestructura
- **Python:** 3.10+
- **GPU:** NVIDIA CUDA >= 11.8 (VRAM >= 12GB recomendada para entrenamiento del Transformer)
- **Almacenamiento:** ~80 GB para el DataCube Zarr a 30m de resolución espacial.

\`\`\`bash
# 1. Clonar repositorio y crear entorno conda
git clone https://github.com/silvatwin-research/forest-digital-twin.git
cd forest-digital-twin
conda env create -f environment.yml
conda activate silvatwin_env
\`\`\`

---

## 2. Definición del Área de Interés (AOI)
Coloque su polígono de estudio en formato GeoJSON en \`data/aoi/study_landscape_polygon.geojson\`:

\`\`\`json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[2.38, 41.72], [2.52, 41.72], [2.52, 41.83], [2.38, 41.83], [2.38, 41.72]]]
      },
      "properties": {
        "landscape_id": "montseny_pilot",
        "target_crs": "EPSG:32631"
      }
    }
  ]
}
\`\`\`

---

## 3. Autenticación de APIs Satelitales
1. **NASA Earthdata (GEDI L4A):** Cree su archivo \`~/.netrc\` con sus credenciales de Earthdata.
2. **Google Earth Engine:** Ejecute \`earthengine authenticate\` para habilitar la descarga automatizada de Sentinel-1/2 y Landsat.
3. **Copernicus Data Space:** Configure credenciales OAuth en \`config/copernicus_auth.yaml\`.

---

## 4. Ejecución del Pipeline Snakemake
\`\`\`bash
# Ejecutar pipeline completo con 8 cores y soporte GPU
snakemake --use-conda --cores 8 --resources gpu=1
\`\`\`

---

## 5. Calibración de Especies 3-PG
Si trabaja con especies distintas a las precalibradas (Quercus, Pinus, Fagus, Pseudotsuga), actualice los parámetros en \`config/species_allometry.yaml\` utilizando datos del Inventario Forestal Nacional local o literatura ecofisiológica.
`,
  },
];
