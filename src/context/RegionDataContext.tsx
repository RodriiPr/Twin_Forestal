import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LandscapeRegion, RasterPixelInfo, MonthlyFluxPoint } from '../types';
import { LANDSCAPE_REGIONS, MOCK_FLUX_TIMESERIES } from '../data/mockScientificData';
import { ForestTwinAPI } from '../services/api';

interface RegionDataContextType {
  regions: LandscapeRegion[];
  currentRegion: LandscapeRegion;
  stands: RasterPixelInfo[];
  timeseries: MonthlyFluxPoint[];
  selectedStand: RasterPixelInfo | null;
  isLoadingStands: boolean;
  isLoadingTimeseries: boolean;
  isSyncing: boolean;
  error: string | null;
  selectRegion: (region: LandscapeRegion) => Promise<void>;
  setSelectedStand: (stand: RasterPixelInfo | null) => void;
  refreshRegionData: () => Promise<void>;
}

const RegionDataContext = createContext<RegionDataContextType | undefined>(undefined);

export const RegionDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<LandscapeRegion[]>(LANDSCAPE_REGIONS);
  const [currentRegion, setCurrentRegion] = useState<LandscapeRegion>(LANDSCAPE_REGIONS[0]);
  const [stands, setStands] = useState<RasterPixelInfo[]>([]);
  const [timeseries, setTimeseries] = useState<MonthlyFluxPoint[]>(MOCK_FLUX_TIMESERIES);
  const [selectedStand, setSelectedStand] = useState<RasterPixelInfo | null>(null);
  const [isLoadingStands, setIsLoadingStands] = useState<boolean>(false);
  const [isLoadingTimeseries, setIsLoadingTimeseries] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDataForRegion = useCallback(async (region: LandscapeRegion) => {
    setIsLoadingStands(true);
    setIsLoadingTimeseries(true);
    setError(null);

    try {
      // Parallel fetch for optimal throughput
      const [fetchedStands, fetchedTimeseries] = await Promise.all([
        ForestTwinAPI.getStandsByRegion(region.id),
        ForestTwinAPI.getFluxTimeSeries(region.id),
      ]);

      if (fetchedStands && fetchedStands.length > 0) {
        setStands(fetchedStands);
        setSelectedStand(fetchedStands[0]);
      } else {
        setStands([]);
        setSelectedStand(null);
      }

      if (fetchedTimeseries && fetchedTimeseries.length > 0) {
        setTimeseries(fetchedTimeseries);
      }
    } catch (err: any) {
      console.error('[RegionDataContext] Error cargando datos telemétricos:', err);
      setError('Error al sincronizar rodales y series temporales para la región seleccionada.');
    } finally {
      setIsLoadingStands(false);
      setIsLoadingTimeseries(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const fetchedRegions = await ForestTwinAPI.getRegions();
      if (isMounted && fetchedRegions && fetchedRegions.length > 0) {
        setRegions(fetchedRegions);
        const initialRegion = fetchedRegions[0];
        setCurrentRegion(initialRegion);
        await loadDataForRegion(initialRegion);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadDataForRegion]);

  const selectRegion = useCallback(async (region: LandscapeRegion) => {
    setCurrentRegion(region);
    await loadDataForRegion(region);
  }, [loadDataForRegion]);

  const refreshRegionData = useCallback(async () => {
    await loadDataForRegion(currentRegion);
  }, [currentRegion, loadDataForRegion]);

  const isSyncing = isLoadingStands || isLoadingTimeseries;

  return (
    <RegionDataContext.Provider
      value={{
        regions,
        currentRegion,
        stands,
        timeseries,
        selectedStand,
        isLoadingStands,
        isLoadingTimeseries,
        isSyncing,
        error,
        selectRegion,
        setSelectedStand,
        refreshRegionData,
      }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

export const useRegionData = (): RegionDataContextType => {
  const context = useContext(RegionDataContext);
  if (!context) {
    throw new Error('useRegionData must be used within a RegionDataProvider');
  }
  return context;
};
