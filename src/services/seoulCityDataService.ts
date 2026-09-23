import { type SeoulLivePopulationStatus } from '../types/congestion';
import { SEOUL_CONGESTION_HOTSPOTS } from '../data/seoulCongestionAreas';

/**
 * 서울 실시간 도시데이터 (Seoul Real-Time City Data) 서비스
 */
export class SeoulCityDataService {
  private static apiKey: string = '';

  public static setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * 종로구 안국·서촌·북촌 핫스팟의 실시간 보행 혼잡도 가져오기
   */
  public static async getAreaCongestionList(): Promise<SeoulLivePopulationStatus[]> {
    if (!this.apiKey) {
      // API Key가 설정되지 않은 경우 정밀 시뮬레이션 데이터 제공
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      return SEOUL_CONGESTION_HOTSPOTS.map((spot) => ({
        ...spot,
        updatedAt: timeStr,
      }));
    }

    try {
      // 실시간 서울시 API 연동 (사용자가 키를 입력했을 때)
      const results: SeoulLivePopulationStatus[] = [];
      const areas = ['북촌한옥마을', '안국동·삼청동', '경복궁·서촌마을', '인사동·익선동'];

      for (const area of areas) {
        const url = `http://openapi.seoul.go.kr:8088/${this.apiKey}/json/citydata/1/5/${encodeURIComponent(area)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const cityData = json['CITYDATA'];
          if (cityData && cityData.LIVE_PPLTN_STTS && cityData.LIVE_PPLTN_STTS.LIVE_PPLTN_STTS) {
            const live = cityData.LIVE_PPLTN_STTS.LIVE_PPLTN_STTS;
            results.push({
              areaName: area,
              areaCode: live.AREA_CD || '',
              congestionLevel: live.AREA_CONGEST_LVL || '보통',
              congestionMessage: live.AREA_CONGEST_MSG || '',
              populationDensity: parseFloat(live.PPLTN_TIME || '30'),
              maleRate: parseFloat(live.MALE_PPLTN_RATE || '50'),
              femaleRate: parseFloat(live.FEMALE_PPLTN_RATE || '50'),
              updatedAt: live.PPLTN_TIME || '',
            });
          }
        }
      }

      return results.length > 0 ? results : SEOUL_CONGESTION_HOTSPOTS;
    } catch (e) {
      console.warn('서울시 실시간 도시데이터 패치 실패, 로컬 캐시 데이터 사용:', e);
      return SEOUL_CONGESTION_HOTSPOTS;
    }
  }
}
