import type { CongestionZone, SeoulLivePopulationStatus } from '../types/congestion';

/**
 * 서울 실시간 도시데이터(Seoul Real-Time City Data) - 안국/서촌/북촌 권역 주요 핫스팟
 * API 엔드포인트: http://openapi.seoul.go.kr:8088/{KEY}/json/citydata/1/5/{AREA_NM}
 */
export const SEOUL_CONGESTION_HOTSPOTS: SeoulLivePopulationStatus[] = [
  {
    areaName: '북촌한옥마을',
    areaCode: 'POI023',
    congestionLevel: '붐빔',
    congestionMessage: '관광객과 거주자 통행이 많아 계동길·가회동 골목이 매우 붐비고 있습니다. 골목길 쓰레기 투기에 유의하세요.',
    populationDensity: 42.5,
    maleRate: 46.2,
    femaleRate: 53.8,
    updatedAt: '2026-09-15 19:30',
  },
  {
    areaName: '안국동·삼청동',
    areaCode: 'POI024',
    congestionLevel: '보통',
    congestionMessage: '삼청로 메인 도로는 보행 흐름이 원활하며, 카페 거리 주변으로 보행자가 다소 모여 있습니다.',
    populationDensity: 28.1,
    maleRate: 48.0,
    femaleRate: 52.0,
    updatedAt: '2026-09-15 19:30',
  },
  {
    areaName: '경복궁·서촌마을',
    areaCode: 'POI025',
    congestionLevel: '약간 붐빔',
    congestionMessage: '세종마을 음식문화거리 및 통인시장 방면으로 저녁 시간대 유동 인구가 증가하고 있습니다.',
    populationDensity: 36.8,
    maleRate: 49.5,
    femaleRate: 50.5,
    updatedAt: '2026-09-15 19:30',
  },
  {
    areaName: '인사동·익선동',
    areaCode: 'POI026',
    congestionLevel: '붐빔',
    congestionMessage: '북인사마당과 쌈지길 주변으로 인파가 밀집되어 있어 메인 보행로 이동 시 우회 경로를 권장합니다.',
    populationDensity: 51.2,
    maleRate: 47.1,
    femaleRate: 52.9,
    updatedAt: '2026-09-15 19:30',
  },
  {
    areaName: '사직공원·옥인동 한적한 골목',
    areaCode: 'POI027',
    congestionLevel: '여유',
    congestionMessage: '통행이 쾌적하며 한적한 보행 환경입니다. 거주자 주거 지역이므로 조용히 이동해 주세요.',
    populationDensity: 11.4,
    maleRate: 50.0,
    femaleRate: 50.0,
    updatedAt: '2026-09-15 19:30',
  },
];

export const CONGESTION_MAP_ZONES: CongestionZone[] = [
  {
    id: 'zone-bukchon',
    name: '북촌한옥마을 메인길',
    center: { lat: 37.5826, lng: 126.9852 },
    radius: 280,
    congestionLevel: '붐빔',
    color: '#ef4444', // Red
  },
  {
    id: 'zone-samcheong',
    name: '삼청동 카페거리',
    center: { lat: 37.5840, lng: 126.9816 },
    radius: 240,
    congestionLevel: '보통',
    color: '#3b82f6', // Blue/Sky
  },
  {
    id: 'zone-seochon-market',
    name: '서촌 세종마을 음식문화거리',
    center: { lat: 37.5772, lng: 126.9715 },
    radius: 230,
    congestionLevel: '약간 붐빔',
    color: '#f59e0b', // Amber
  },
  {
    id: 'zone-tongin',
    name: '통인시장 일대',
    center: { lat: 37.5807, lng: 126.9708 },
    radius: 200,
    congestionLevel: '보통',
    color: '#3b82f6',
  },
  {
    id: 'zone-sajik',
    name: '사직단 및 옥인동 한적길',
    center: { lat: 37.5765, lng: 126.9675 },
    radius: 300,
    congestionLevel: '여유',
    color: '#10b981', // Green
  },
  {
    id: 'zone-anguk-station',
    name: '안국역 사거리',
    center: { lat: 37.5764, lng: 126.9855 },
    radius: 220,
    congestionLevel: '약간 붐빔',
    color: '#f59e0b',
  },
];
