import type { Coordinates, TrashBin, WasteCategory, BinFilterOptions } from '../types/bin';
import { calculateDistanceMeters, calculateWalkingMinutes } from '../utils/distance';

export interface BinWithDistance extends TrashBin {
  distanceMeters: number;
  walkingMinutes: number;
}

/**
 * 다차원 매칭 알고리즘:
 * 1. 사용자의 실시간 GPS 좌표 기반
 * 2. 버릴 쓰레기 품목(일반/재활용/일회용 컵/담배 등) 필터링
 * 3. 액체 퇴수구 필요 여부 및 가용 상태(available) 검증
 * 4. 최단 도보 거리 순 정렬
 */
export function matchAndRankBins(
  bins: TrashBin[],
  userLocation: Coordinates,
  options: BinFilterOptions
): BinWithDistance[] {
  return bins
    .filter((bin) => {
      // 1. 가용성 필터 (점검 중 제외)
      if (options.onlyAvailable && bin.status !== 'available') {
        return false;
      }

      // 2. 권역 필터
      if (options.areaFilter !== 'all' && bin.area !== options.areaFilter) {
        return false;
      }

      // 3. 액체 퇴수구 필요 여부
      if (options.requiresLiquidDrain && !bin.hasLiquidDrain) {
        return false;
      }

      // 4. 품목 필터링
      if (options.selectedCategory !== 'all') {
        if (options.selectedCategory === 'liquid') {
          return bin.hasLiquidDrain;
        }
        return bin.acceptedCategories.includes(options.selectedCategory as WasteCategory);
      }

      return true;
    })
    .map((bin) => {
      const distanceMeters = calculateDistanceMeters(userLocation, bin.coordinates);
      const walkingMinutes = calculateWalkingMinutes(distanceMeters);
      return {
        ...bin,
        distanceMeters,
        walkingMinutes,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
