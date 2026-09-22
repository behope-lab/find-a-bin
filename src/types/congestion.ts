export type CongestionLevel = '여유' | '보통' | '약간 붐빔' | '붐빔';

export interface SeoulLivePopulationStatus {
  areaName: string; // e.g. '북촌한옥마을', '경복궁·서촌마을', '안국동·삼청동'
  areaCode: string;
  congestionLevel: CongestionLevel; // 여유, 보통, 붐빔
  congestionMessage: string;        // 실시간 안내 메시지 (e.g. "사람이 몰려 있어 통행에 주의하세요")
  populationDensity: number;        // 인구 밀집도 수치 (명/100m²)
  maleRate: number;
  femaleRate: number;
  updatedAt: string;
}

export interface CongestionZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number; // meters
  congestionLevel: CongestionLevel;
  color: string;
}

export interface RouteStep {
  coordinates: [number, number]; // [lat, lng]
  congestion: CongestionLevel;
}

export interface WalkingRoute {
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  steps: RouteStep[];
  overallCongestion: CongestionLevel;
  pathCoordinates: [number, number][];
  recommendationNote: string; // "쾌적한 삼청동 골목길로 안내합니다"
}
