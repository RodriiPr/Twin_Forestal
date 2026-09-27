export const DATA_QUALITY_METRICS = [
  {
    id: 'gedi',
    name: 'GEDI L4A Coverage',
    value: '95%',
    status: 'good',
    description: 'Proporción de píxeles con métricas estructurales confiables.',
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1 SAR Quality',
    value: '88%',
    status: 'good',
    description: 'Porcentaje de imágenes sin interferencia de ruido.',
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2 Cloud Mask',
    value: '92%',
    status: 'good',
    description: 'Porcentaje de observaciones con cobertura de nubes < 15%.',
  },
  {
    id: 'fluxnet',
    name: 'FLUXNET GPP Consistency',
    value: '±3.2% RMSE',
    status: 'good',
    description: 'Desviación típica entre mediciones in situ y modelo.',
  },
];
