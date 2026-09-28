export const DATA_QUALITY_METRICS = [
  {
    id: 'gedi',
    name: 'GEDI L4A Coverage',
    value: '95%',
    status: 'good',
    description: 'Proporción de huellas LiDAR con métricas estructurales confiables (RH98).',
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2 Cloud Mask',
    value: '92%',
    status: 'good',
    description: 'Porcentaje de observaciones multiespectrales con cobertura de nubes < 15%.',
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1 SAR Quality',
    value: '88%',
    status: 'good',
    description: 'Porcentaje de imágenes radar sin interferencia y calibración gamma-naught.',
  },
  {
    id: 'era5',
    name: 'ERA5-Land Bioclimatic Quality',
    value: '98%',
    status: 'good',
    description: 'Consistencia temporal de series meteorológicas horarias (T2m, VPD, Radiación).',
  },
  {
    id: 'soilgrids',
    name: 'SoilGrids 2.0 SOC Coverage',
    value: '94%',
    status: 'good',
    description: 'Completitud de malla espacial edáfica 250m de Carbono Orgánico del Suelo 0-30cm.',
  },
  {
    id: 'fluxnet',
    name: 'FLUXNET GPP Consistency',
    value: '78% (±3.2% RMSE)',
    status: 'warn',
    description: 'Desviación típica y 22% gap-filling entre mediciones in situ y modelo.',
  },
];

