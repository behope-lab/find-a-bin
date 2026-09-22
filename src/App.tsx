import React, { useState, useMemo } from 'react';
import { Header } from './components/common/Header';
import { WasteTypeFilter } from './components/waste/WasteTypeFilter';
import { MapView } from './components/map/MapView';
import { BinDetailSheet } from './components/waste/BinDetailSheet';
import { AiGuideModal } from './components/ai/AiGuideModal';
import { SEOUL_STREET_BINS } from './data/seoulBinsData';
import { generateCongestionAwareRoute } from './services/routingService';
import type { Coordinates, TrashBin, WasteCategory } from './types/bin';
import type { WalkingRoute } from './types/congestion';
import { calculateDistanceMeters, calculateWalkingMinutes } from './utils/distance';
import type { BinWithDistance } from './services/matchingService';
import { Sparkles, Calendar, MessageSquareText, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  // 모드 상태: 관광객 모드 / 거주자 모드
  const [currentMode, setCurrentMode] = useState<'tourist' | 'resident'>('tourist');

  // 사용자 위치 (기본: 안국역 1번 출구)
  const [userLocation, setUserLocation] = useState<Coordinates>({
    lat: 37.57685,
    lng: 126.98565,
  });
  const [userLocationName, setUserLocationName] = useState<string>('안국역 1번출구');

  // 쓰레기 카테고리 필터 (기본: 전체)
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'all'>('all');
  const [requiresLiquidDrain, setRequiresLiquidDrain] = useState(false);

  // 선택된 쓰레기통 및 활성 경로
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null);
  const [activeRoute, setActiveRoute] = useState<WalkingRoute | null>(null);

  // AI 가이드 모달 상태 및 초기 질문
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [initialAiQuery, setInitialAiQuery] = useState<string | undefined>(undefined);

  // 1. 카테고리 & 퇴수 여부에 따른 쓰레기통 필터링
  const filteredBins = useMemo(() => {
    return SEOUL_STREET_BINS.filter((bin) => {
      // 카테고리 필터
      if (selectedCategory !== 'all') {
        if (!bin.acceptedCategories.includes(selectedCategory)) {
          return false;
        }
      }

      // 음료 잔여물 비움(퇴수) 필터
      if (requiresLiquidDrain && !bin.hasLiquidDrain) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, requiresLiquidDrain]);

  // 2. 선택된 쓰레기통에 거리 및 도보 시간 계산
  const selectedBinWithDistance: BinWithDistance | null = useMemo(() => {
    if (!selectedBin) return null;
    const distanceMeters = calculateDistanceMeters(userLocation, selectedBin.coordinates);
    const walkingMinutes = calculateWalkingMinutes(distanceMeters);
    return {
      ...selectedBin,
      distanceMeters,
      walkingMinutes,
    };
  }, [selectedBin, userLocation]);

  // 3. '경로 시작' 테스트 시뮬레이션
  const handleStartRouteSimulation = () => {
    // 요구사항: 현재 위치(안국역)에서 가장 가까운 쓰레기통(감고당길 공공 거점)을 목적지로 설정
    const targetBin =
      filteredBins.find((b) => b.id === 'bin-ag-gamgo') ||
      filteredBins.find((b) => b.id === 'bin-ag-01') ||
      filteredBins[0] ||
      SEOUL_STREET_BINS[0];

    setSelectedBin(targetBin);

    // 혼잡도 우회 경로(Green 골목길 vs Red 메인도로) 계산 및 활성화
    const route = generateCongestionAwareRoute(userLocation, targetBin.coordinates);
    setActiveRoute(route);
  };

  // 경로 초기화
  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  // 4. 빠른 위치 변경 핸들러
  const handleSelectQuickLocation = (coords: Coordinates, label: string) => {
    setUserLocation(coords);
    setUserLocationName(label);
    setActiveRoute(null);
  };

  // 카테고리 선택 핸들러
  const handleSelectCategory = (cat: WasteCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'disposable') {
      setRequiresLiquidDrain(true);
    } else {
      setRequiresLiquidDrain(false);
    }
  };

  // AI 챗 드로어 질문 칩 클릭 핸들러
  const handleOpenAiWithQuestion = (question: string) => {
    setInitialAiQuery(question);
    setIsAiModalOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. 상단 Header (앱 타이틀: find a bin (안국·서촌)) */}
      <Header
        currentMode={currentMode}
        onModeChange={(mode) => setCurrentMode(mode)}
        onOpenAiGuide={() => {
          setInitialAiQuery(undefined);
          setIsAiModalOpen(true);
        }}
        onSelectQuickLocation={handleSelectQuickLocation}
      />

      {/* 2. 빠른 쓰레기 유형 필터 탭 4개 [ 전체 ] [ 🥤 일회용 컵/퇴수 ] [ ♻️ 재활용/플라스틱 ] [ 🗑️ 일반 쓰레기 ] */}
      <WasteTypeFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        requiresLiquidDrain={requiresLiquidDrain}
        onToggleLiquidDrain={() => setRequiresLiquidDrain((prev) => !prev)}
        matchedCount={filteredBins.length}
      />

      {/* 3. 중앙 지도 메인 영역 (Map View Container: 경로 시작 버튼 + Green/Red 우회 시각화) */}
      <main className="w-full h-full relative">
        <MapView
          userLocation={userLocation}
          userLocationName={userLocationName}
          bins={filteredBins}
          selectedBin={selectedBin}
          onSelectBin={(bin) => {
            setSelectedBin(bin);
            const route = generateCongestionAwareRoute(userLocation, bin.coordinates);
            setActiveRoute(route);
          }}
          activeRoute={activeRoute}
          onStartRouteSimulation={handleStartRouteSimulation}
          onClearRoute={handleClearRoute}
        />
      </main>

      {/* 4. 거주자 모드 전환 시 안내 배너 */}
      {currentMode === 'resident' && (
        <div className="fixed top-[180px] sm:top-[140px] left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[950] bg-amber-950/90 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
          <div className="flex items-start space-x-2.5">
            <Calendar className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">
                종로구 삼청·가회동 거주자 배출 안내
              </h4>
              <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                • <strong>배출 시간:</strong> 일·화·목요일 18:00 ~ 21:00 (문전 배출)
                <br />
                • <strong>토요일 배출 금지:</strong> 주말 무단 투기 적발 시 10만원 과태료
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. 선택된 쓰레기통 상세 정보 바텀 시트 */}
      <BinDetailSheet
        bin={selectedBinWithDistance}
        activeRoute={activeRoute}
        onClose={() => setSelectedBin(null)}
        onOpenAiGuide={() => {
          setInitialAiQuery(undefined);
          setIsAiModalOpen(true);
        }}
      />

      {/* 6. 하단 다국어 AI Agent 대화 모달 트리거 (Chat Drawer 바 & 추천 질문 칩) */}
      <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[460px] z-[950]">
        <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-indigo-950/60 flex flex-col gap-2">
          {/* 상단 추천 질문 칩 2개 */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => handleOpenAiWithQuestion('남은 음료가 든 컵은 어떻게 버리나요?')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/30 text-[11px] sm:text-xs text-indigo-200 hover:text-white whitespace-nowrap transition-all shadow-sm active:scale-95"
            >
              <span>🥤</span>
              <span>남은 음료가 든 컵은 어떻게 버리나요?</span>
            </button>
            <button
              onClick={() => handleOpenAiWithQuestion('서촌 주변에서 쓰레기를 어디에 내놓아야 하나요?')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/30 text-[11px] sm:text-xs text-indigo-200 hover:text-white whitespace-nowrap transition-all shadow-sm active:scale-95"
            >
              <span>📍</span>
              <span>서촌 주변에서 쓰레기를 어디에 내놓아야 하나요?</span>
            </button>
          </div>

          {/* 하단 전체 열기 버튼 */}
          <button
            onClick={() => {
              setInitialAiQuery(undefined);
              setIsAiModalOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>다국어 AI 배출 안내 Chat Drawer 열기</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-indigo-200">
              <MessageSquareText className="w-3.5 h-3.5" />
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* 7. 하단 다국어 AI Agent 대화 모달 (Chat Drawer: 상단 슬라이드업 + 다국어 + 질문 칩) */}
      <AiGuideModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectCategory={(cat) => handleSelectCategory(cat)}
        initialQuery={initialAiQuery}
      />
    </div>
  );
};

export default App;
