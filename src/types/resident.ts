export interface DistrictSchedule {
  districtName: string; // '종로구 삼청동', '종로구 가회동', '종로구 청운효자동', '종로구 사직동'
  areaKey: 'anguk' | 'seochon';
  allowedDays: ('일' | '월' | '화' | '수' | '목' | '금' | '토')[]; // 예: ['일', '화', '목']
  allowedHoursStart: number; // 18 (18:00)
  allowedHoursEnd: number;   // 24 (24:00)
  specialRules: string[];
  earlyDisposalFineWarning: string;
}

export interface ResidentWasteStatus {
  canDisposeNow: boolean;
  nextDisposalTimeText: string;
  remainingMinutesUntilStart?: number;
  remainingMinutesUntilEnd?: number;
  alertType: 'safe' | 'warning' | 'forbidden'; // safe: 배출시간대, warning: 임박, forbidden: 배출금지(골목길 적치 금지)
}
