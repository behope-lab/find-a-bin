import type { DistrictSchedule } from '../types/resident';

/**
 * 종로구 안국·서촌 지역 거주자 생활쓰레기 배출 시간 및 요일 안내 (종로구 조례 기준)
 */
export const JONGNO_RESIDENT_SCHEDULES: Record<string, DistrictSchedule> = {
  anguk: {
    districtName: '종로구 삼청동·가회동 (안국·북촌 권역)',
    areaKey: 'anguk',
    allowedDays: ['일', '화', '목'],
    allowedHoursStart: 18, // 18:00
    allowedHoursEnd: 24,   // 24:00
    specialRules: [
      '일반 종량제 봉투 및 음식물 쓰레기는 해가 진 후(18시~24시) 내 집·상가 앞 배출',
      '토요일 및 공휴일 전날은 쓰레기를 수거하지 않으므로 전면 배출 금지',
      '투명 페트병 및 비닐류는 목요일 별도 전용 투명봉투 배출',
      '골목길 조기 배출 시 관광객 및 이웃 주민 통행 방해로 과태료 부과 대상',
    ],
    earlyDisposalFineWarning: '종로구 폐기물 관리 조례에 따라 배출시간 외 무단 조기 배출 시 최대 20만 원의 과태료가 부과될 수 있습니다.',
  },
  seochon: {
    districtName: '종로구 청운효자동·사직동 (서촌 권역)',
    areaKey: 'seochon',
    allowedDays: ['일', '화', '목'],
    allowedHoursStart: 18,
    allowedHoursEnd: 24,
    specialRules: [
      '배출 시간: 일·화·목요일 18:00 ~ 24:00 (새벽 04:00 이전 수거 완료)',
      '통인시장 및 체부동 먹자골목 인근은 보행자 안전을 위해 반드시 18시 정각 이후 배출',
      '재활용품은 품목별(플라스틱/캔/종이박스) 묶음 배출',
      '낮 시간 골목길 쓰레기 적치는 악취와 미관 저해의 주요 원인입니다.',
    ],
    earlyDisposalFineWarning: '규정 시간 전 쓰레기 적치 및 무단 투기 적발 시 10만~20만 원의 과태료가 부과됩니다.',
  },
};
