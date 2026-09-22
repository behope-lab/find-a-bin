import type { Coordinates } from '../types/bin';

/**
 * 하버사인 공식(Haversine Formula)을 이용한 두 지점 간의 보행 직선 거리(m) 계산
 */
export function calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
  const R = 6371e3; // 지구 반경 (meters)
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * 도보 평균 보행 속도 (분당 약 75m, 골목길 감안) 기준 예상 소요 시간(분)
 */
export function calculateWalkingMinutes(distanceMeters: number): number {
  const minutes = Math.ceil(distanceMeters / 75);
  return Math.max(1, minutes);
}

/**
 * 거리를 읽기 쉬운 텍스트(m / km)로 변환
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters}m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}
