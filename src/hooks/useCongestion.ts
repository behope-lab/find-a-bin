import { useState, useEffect } from 'react';
import type { SeoulLivePopulationStatus } from '../types/congestion';
import { SeoulCityDataService } from '../services/seoulCityDataService';

export function useCongestion() {
  const [congestionList, setCongestionList] = useState<SeoulLivePopulationStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchCongestion = async () => {
    setIsLoading(true);
    try {
      const data = await SeoulCityDataService.getAreaCongestionList();
      setCongestionList(data);
      if (data.length > 0) {
        setLastUpdated(data[0].updatedAt);
      }
    } catch (err) {
      console.error('Failed to fetch congestion data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCongestion();
    // 3분마다 갱신
    const interval = setInterval(fetchCongestion, 180000);
    return () => clearInterval(interval);
  }, []);

  return {
    congestionList,
    isLoading,
    lastUpdated,
    refresh: fetchCongestion,
  };
}
