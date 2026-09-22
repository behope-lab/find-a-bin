import type { SupportedLanguage } from '../types/ai';

export interface AiResponse {
  answer: string;
  recommendedCategory?: 'general' | 'recycle' | 'disposable' | 'cigarette' | 'liquid';
  relatedTips?: string[];
}

export class AiGuideService {

  public static setApiKey(_provider: 'openai' | 'claude' = 'openai') {
  }

  /**
   * 쓰레기 배출 및 종로구 안국/서촌 규정 관련 지능형 답변
   */
  public static async askAiGuide(
    question: string,
    lang: SupportedLanguage = 'ko'
  ): Promise<AiResponse> {
    const qLower = question.toLowerCase();

    // 1. 일회용 플라스틱 컵 / 커피 / 얼음
    if (
      qLower.includes('컵') ||
      qLower.includes('커피') ||
      qLower.includes('얼음') ||
      qLower.includes('음료') ||
      qLower.includes('cup') ||
      qLower.includes('coffee') ||
      qLower.includes('drink') ||
      qLower.includes('ice')
    ) {
      return this.getCupResponse(lang);
    }

    // 2. 꼬치 / 탕후루 / 음식물 묻은 쓰레기
    if (
      qLower.includes('꼬치') ||
      qLower.includes('탕후루') ||
      qLower.includes('나무') ||
      qLower.includes('skewer') ||
      qLower.includes('food')
    ) {
      return this.getSkewerResponse(lang);
    }

    // 3. 거주자 배출 시간 / 요일 / 서촌 배출 장소 / 과태료
    if (
      qLower.includes('배출') ||
      qLower.includes('요일') ||
      qLower.includes('시간') ||
      qLower.includes('서촌') ||
      qLower.includes('내놓') ||
      qLower.includes('어디에') ||
      qLower.includes('거주자') ||
      qLower.includes('과태료') ||
      qLower.includes('schedule') ||
      qLower.includes('time') ||
      qLower.includes('fine')
    ) {
      return this.getResidentScheduleResponse(lang);
    }

    // 4. 종량제 봉투 구매 방법 (관광객/외국인)
    if (
      qLower.includes('종량제') ||
      qLower.includes('봉투') ||
      qLower.includes('bag') ||
      qLower.includes('trash bag') ||
      qLower.includes('where to buy')
    ) {
      return this.getTrashBagResponse(lang);
    }

    // 5. 페트병 / 캔 / 플라스틱 분리배출
    if (
      qLower.includes('페트') ||
      qLower.includes('캔') ||
      qLower.includes('플라스틱') ||
      qLower.includes('병') ||
      qLower.includes('plastic') ||
      qLower.includes('bottle') ||
      qLower.includes('can')
    ) {
      return this.getRecycleResponse(lang);
    }

    // 기본 가이드 응답
    return this.getDefaultResponse(lang);
  }

  private static getCupResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '테이크아웃 일회용 컵은 **남은 음료와 얼음을 반드시 먼저 비운 후** 배출해야 합니다. 지도에서 💧 [액체 퇴수 가능] 뱃지가 붙은 스마트 쓰레기통을 찾으면 남은 음료수를 버릴 수 있습니다. 비운 플라스틱 컵과 빨대는 재활용함에 버려주세요.',
        tips: ['홀더(종이)는 종이류, 플라스틱 컵과 뚜껑은 플라스틱류로 분리하면 더욱 좋습니다.'],
      },
      en: {
        answer: 'Disposable takeout cups must have **all remaining liquid and ice emptied first** before disposal! Look for bins on the map with the 💧 [Liquid Drain] badge. After draining, place the plastic cup in the recyclables bin.',
        tips: ['Paper cup sleeves go to Paper, and plastic lids/straws go to Plastic.'],
      },
      ja: {
        answer: 'テイクアウトの使い捨てカップは、**必ず残った飲み物と氷を捨ててから**分別してください。地図上の 💧 [液体排水可能] バッジが付いたゴミ箱で液体を処理できます。カップ本体はリサイクル用ゴミ箱に捨ててください。',
        tips: ['紙のスリーブは紙類へ、プラスチックの蓋とストローはプラスチックへ。'],
      },
      zh: {
        answer: '外带一次性饮料杯在丢弃前，**必须先将剩余饮料和冰块倒掉**！请在地图上寻找带有 💧 [可倒液体] 标识的智能垃圾桶排空液体。空杯请投入塑料可回收垃圾桶。',
        tips: ['纸质杯套投入纸类，塑料杯盖和吸管投入塑料类。'],
      },
    };
    return {
      answer: responses[lang].answer,
      recommendedCategory: 'liquid',
      relatedTips: responses[lang].tips,
    };
  }

  private static getSkewerResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '탕후루 꼬치나 길거리 음식 나무 꼬치는 재활용이 되지 않으며, 비닐 봉투를 찢을 위험이 있어 **[일반 쓰레기(종량제)]**로 배출해야 합니다. 뾰족한 끝을 부러뜨려 일반 쓰레기통에 안전하게 넣어주세요.',
        tips: ['길거리에 그냥 버리시면 보행자가 다칠 수 있으니 꼭 쓰레기통에 배출해 주세요.'],
      },
      en: {
        answer: 'Wooden skewers from street food or tanghulu cannot be recycled and should be disposed of in **[General Waste]**. Please snap the sharp tip before placing it in the bin for safety.',
        tips: ['Never litter skewers on the street as they can hurt pedestrians.'],
      },
      ja: {
        answer: 'タンフルや屋台料理の竹串・木串はリサイクルできません。**[一般ゴミ]**として廃棄してください。ゴミ袋を破かないよう、先端を折ってから捨ててください。',
        tips: ['道端に放置すると歩行者が怪我をする危険があります。'],
      },
      zh: {
        answer: '糖葫芦或街头小吃的竹签不能回收，必须投入 **[一般垃圾 (General Waste)]**。丢弃前请折断尖锐端，以免刺破垃圾袋或伤及他人。',
        tips: ['切勿随意乱扔竹签，以免造成安全隐患。'],
      },
    };
    return {
      answer: responses[lang].answer,
      recommendedCategory: 'general',
      relatedTips: responses[lang].tips,
    };
  }

  private static getResidentScheduleResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '종로구 삼청·가회·효자·사직동의 생활쓰레기 배출 요일은 **[일요일, 화요일, 목요일 18:00 ~ 24:00]** 입니다. 낮 시간(00:00~18:00)이나 토요일에 골목길에 미리 내놓으시면 **최대 20만 원의 과태료**가 부과됩니다.',
        tips: ['수거 완료 시간: 익일 오전 04:00 이전', '반드시 내 집·내 점포 바로 앞 배출'],
      },
      en: {
        answer: 'In Jongno-gu (Anguk, Bukchon, Seochon), residential garbage is collected on **[Sunday, Tuesday, Thursday from 18:00 to 24:00]**. Leaving trash in alleys during daytime or Saturdays is strictly prohibited (fines up to 200,000 KRW).',
        tips: ['Collected before 04:00 the following morning', 'Place directly in front of your own doorstep'],
      },
      ja: {
        answer: '鍾路区（安国・北村・西村）の家庭ゴミ排出曜日は **[日・火・木曜日 18:00〜24:00]** です。昼間や土曜日に路地に放置すると最大20万ウォンの過怠金が科せられます。',
        tips: ['回収完了時間：翌朝 04:00 前', '必ず自宅や店舗の玄関前に排出'],
      },
      zh: {
        answer: '首尔钟路区（安国、北村、西村）的生活垃圾投放时间为 **[周日、周二、周四 18:00 ~ 24:00]**。白天或周六提前堆放在胡同道路上属于违法行为，最高可罚款20万韩元。',
        tips: ['收集作业时间：次日凌晨 04:00 前', '必须投放在自家住宅或商铺门前'],
      },
    };
    return {
      answer: responses[lang].answer,
      relatedTips: responses[lang].tips,
    };
  }

  private static getTrashBagResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '종량제 규격봉투는 안국역과 서촌 주변의 **모든 편의점(CU, GS25, 세븐일레븐 등) 카운터**에서 구매하실 수 있습니다. "종로구 일반 쓰레기 봉투(또는 음식물 봉투) 주세요"라고 말씀하시면 5L, 10L, 20L 단위로 소량 구매 가능합니다.',
        tips: ['외국인 방문객도 편의점에서 낱장 단위로 쉽게 구매할 수 있습니다.'],
      },
      en: {
        answer: 'Standard volume-based trash bags (Jongnyangje) can be purchased at the counter of **any nearby convenience store (CU, GS25, 7-Eleven)**. Ask for "Jongno-gu general trash bag" (sizes: 5L, 10L, 20L).',
        tips: ['You can buy single bags without buying a whole pack.'],
      },
      ja: {
        answer: '規格ゴミ袋（従量制袋）は、安国・西村周辺の**すべてのコンビニ（CU、GS25、セブンイレブンなど）**のレジで購入できます。「鍾路区の一般ゴミ袋をください」と伝えれば、1枚単位で購入可能です。',
        tips: ['旅行者でも手軽に1枚から購入できます。'],
      },
      zh: {
        answer: '韩国按量计费标准垃圾袋可在附近的**所有便利店（CU、GS25、7-Eleven等）收银台**购买。告诉店员需要“钟路区一般垃圾袋”（可买5L、10L单张）。',
        tips: ['便利店支持单张购买，价格亲民。'],
      },
    };
    return {
      answer: responses[lang].answer,
      relatedTips: responses[lang].tips,
    };
  }

  private static getRecycleResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '투명 페트병은 내용물을 비우고 물로 헹군 뒤 **라벨을 떼고 압착**하여 뚜껑을 닫아 배출합니다. 캔과 유리병도 내용물을 비운 후 재활용 전용 수거함에 넣어주세요.',
        tips: ['투명 페트병은 고품질 재생원료로 재활용되므로 라벨 제거가 매우 중요합니다.'],
      },
      en: {
        answer: 'For clear plastic bottles: empty liquids, rinse with water, **remove the plastic label**, crush flat, and close the cap before recycling. Empty aluminum cans and glass bottles go into recycling bins.',
        tips: ['Removing labels allows high-grade recycling into clothing fibers.'],
      },
      ja: {
        answer: '透明ペットボトルは中身を空にして水ですすぎ、**ラベルを剥がして**つぶしてからキャップを閉めて出してください。缶・ビンも中身を空にしてリサイクル箱へ。',
        tips: ['ラベルを剥がすことで高品質な再生資源になります。'],
      },
      zh: {
        answer: '透明塑料瓶请先倒空并冲洗干净，**撕掉外包装标签**，压扁后拧上瓶盖投入可回收箱。易拉罐与玻璃瓶也请清空后投放。',
        tips: ['撕掉标签有助于高质量再生利用。'],
      },
    };
    return {
      answer: responses[lang].answer,
      recommendedCategory: 'recycle',
      relatedTips: responses[lang].tips,
    };
  }

  private static getDefaultResponse(lang: SupportedLanguage): AiResponse {
    const responses = {
      ko: {
        answer: '안국과 서촌의 스마트 쓰레기통 및 분리배출에 대해 무엇이든 물어보세요! 예: "커피 컵 어떻게 버려?", "오늘 서촌 배출 시간 언제야?", "탕후루 꼬치는 어디에 버려?"',
        tips: ['상단 지도에서 버릴 품목 필터를 누르면 가장 가까운 쓰레기통을 즉시 찾을 수 있습니다.'],
      },
      en: {
        answer: 'Ask me anything about waste sorting and smart bins in Anguk & Seochon! (e.g., "How to throw away a coffee cup?", "When is garbage collection time in Seochon?")',
        tips: ['Use the top filter chips to find the nearest bin for your specific trash item.'],
      },
      ja: {
        answer: '安国・西村のスマートゴミ箱やゴミの分別について何でも質問してください！（例：「コーヒーカップの捨て方は？」「西村の回収時間は？」）',
        tips: ['上部のフィルターボタンを押すと、捨てたいゴミに対応した最寄りのゴミ箱がすぐに見つかります。'],
      },
      zh: {
        answer: '欢迎咨询安国与西村智能垃圾桶导航与垃圾分类规则！（例如：“咖啡杯怎么丢？”、“西村倒垃圾时间是几点？”）',
        tips: ['点击顶部垃圾类型标签，即可快速导航至最近的可用垃圾桶。'],
      },
    };
    return {
      answer: responses[lang].answer,
      relatedTips: responses[lang].tips,
    };
  }
}
