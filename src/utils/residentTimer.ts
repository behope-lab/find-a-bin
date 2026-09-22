import type { DistrictSchedule, ResidentWasteStatus } from '../types/resident';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 거주자의 현재 시간 기준 쓰레기 배출 가능 여부 및 카운트다운 연산
 */
export function getResidentDisposalStatus(
  schedule: DistrictSchedule,
  currentDate: Date = new Date()
): ResidentWasteStatus {
  const dayIndex = currentDate.getDay();
  const currentDayName = DAY_NAMES[dayIndex];
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const isTodayAllowed = schedule.allowedDays.includes(currentDayName);
  const startMinutes = schedule.allowedHoursStart * 60; // 18:00 = 1080
  const endMinutes = schedule.allowedHoursEnd * 60;     // 24:00 = 1440

  if (isTodayAllowed) {
    if (currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes) {
      // 배출 가능한 시간대 (18:00 ~ 24:00)
      const remainingMinutesUntilEnd = endMinutes - currentTimeInMinutes;
      return {
        canDisposeNow: true,
        alertType: 'safe',
        nextDisposalTimeText: `오늘 24:00 마감까지 ${Math.floor(remainingMinutesUntilEnd / 60)}시간 ${remainingMinutesUntilEnd % 60}분 남음`,
        remainingMinutesUntilEnd,
      };
    } else if (currentTimeInMinutes < startMinutes) {
      // 오늘 배출일이지만 18시 이전 (낮 시간 조기 배출 금지 경고)
      const remainingMinutesUntilStart = startMinutes - currentTimeInMinutes;
      const hours = Math.floor(remainingMinutesUntilStart / 60);
      const mins = remainingMinutesUntilStart % 60;
      return {
        canDisposeNow: false,
        alertType: 'forbidden',
        nextDisposalTimeText: `오늘 18:00 배출 시작까지 ${hours}시간 ${mins}분 남음 (낮 시간 조기 배출 금지)`,
        remainingMinutesUntilStart,
      };
    }
  }

  // 오늘 배출일이 아니거나 24시 이후
  // 다음 배출 요일 계산
  let nextDayCount = 1;
  while (nextDayCount <= 7) {
    const nextDayIndex = (dayIndex + nextDayCount) % 7;
    const nextDayName = DAY_NAMES[nextDayIndex];
    if (schedule.allowedDays.includes(nextDayName)) {
      break;
    }
    nextDayCount++;
  }

  const nextDayName = DAY_NAMES[(dayIndex + nextDayCount) % 7];
  return {
    canDisposeNow: false,
    alertType: 'forbidden',
    nextDisposalTimeText: `다음 배출일은 [${nextDayName}요일 18:00] 입니다 (골목길 적치 금지)`,
  };
}
