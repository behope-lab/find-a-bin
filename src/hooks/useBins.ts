import { useState, useMemo } from 'react';
import type { Coordinates, TrashBin, WasteCategory, BinFilterOptions } from '../types/bin';
import { SEOUL_STREET_BINS } from '../data/seoulBinsData';
import { matchAndRankBins, type BinWithDistance } from '../services/matchingService';
import { generateCongestionAwareRoute } from '../services/routingService';
import type { WalkingRoute } from '../types/congestion';

export function useBins(userLocation: Coordinates) {
  const [bins] = useState<TrashBin[]>(SEOUL_STREET_BINS);
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'all'>('all');
  const [requiresLiquidDrain, setRequiresLiquidDrain] = useState<boolean>(false);
  const [areaFilter, setAreaFilter] = useState<'all' | 'anguk' | 'seochon'>('all');
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  const filterOptions: BinFilterOptions = useMemo(
    () => ({
      selectedCategory,
      onlyAvailable: true,
      requiresLiquidDrain,
      areaFilter,
    }),
    [selectedCategory, requiresLiquidDrain, areaFilter]
  );

  // 거리순 정렬 및 필터링된 쓰레기통 목록
  const rankedBins: BinWithDistance[] = useMemo(() => {
    return matchAndRankBins(bins, userLocation, filterOptions);
  }, [bins, userLocation, filterOptions]);

  // 가장 가까운 쓰레기통
  const closestBin: BinWithDistance | null = rankedBins[0] || null;

  // 현재 선택된 쓰레기통 객체
  const selectedBin: BinWithDistance | null = useMemo(() => {
    if (!selectedBinId) return null;
    return rankedBins.find((b) => b.id === selectedBinId) || null;
  }, [selectedBinId, rankedBins]);

  // 현재 선택된 쓰레기통(또는 최단거리 쓰레기통)으로 향하는 혼잡도 반영 보행 경로
  const activeRoute: WalkingRoute | null = useMemo(() => {
    const target = selectedBin || closestBin;
    if (!target) return null;
    return generateCongestionAwareRoute(userLocation, target.coordinates);
  }, [userLocation, selectedBin, closestBin]);

  return {
    bins,
    rankedBins,
    closestBin,
    selectedBin,
    selectedBinId,
    setSelectedBinId,
    selectedCategory,
    setSelectedCategory,
    requiresLiquidDrain,
    setRequiresLiquidDrain,
    areaFilter,
    setAreaFilter,
    activeRoute,
  };
}
