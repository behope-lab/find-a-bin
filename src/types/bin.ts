export type WasteCategory = 
  | 'general'    // 일반 쓰레기
  | 'recycle'    // 재활용품 (캔, 병, 플라스틱)
  | 'disposable' // 일회용 음료수 컵
  | 'cigarette'  // 담배꽁초
  | 'liquid';    // 음료 잔여 액체 퇴수 가능

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TrashBin {
  id: string;
  name: string;
  address: string;
  detailLocation: string;
  area: 'anguk' | 'seochon' | 'bukchon' | 'samcheong';
  coordinates: Coordinates;
  acceptedCategories: WasteCategory[];
  hasLiquidDrain: boolean; // 액체 잔여물 퇴수구 유무
  isSmartBin: boolean;     // 압축형/센서 부착 스마트 휴지통 여부
  fullnessLevel?: number;  // 0~100% 적재율 (센서 시뮬레이션)
  managedBy: '종로구청' | '공공협약 상점' | '서울시';
  installedYear?: number;
  lastEmptiedTime?: string; // 최근 비운 시간
  collectionSchedule?: string; // 정기 수거 시간대
  status: 'available' | 'full' | 'maintenance';
}

export interface BinFilterOptions {
  selectedCategory: WasteCategory | 'all';
  onlyAvailable: boolean;
  requiresLiquidDrain: boolean;
  areaFilter: 'all' | 'anguk' | 'seochon';
}
