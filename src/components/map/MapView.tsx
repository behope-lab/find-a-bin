import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Coordinates, TrashBin } from '../../types/bin';
import type { WalkingRoute } from '../../types/congestion';
import { Play, RotateCcw, Navigation, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

interface MapViewProps {
  userLocation: Coordinates;
  userLocationName: string;
  bins: TrashBin[];
  selectedBin: TrashBin | null;
  onSelectBin: (bin: TrashBin) => void;
  activeRoute: WalkingRoute | null;
  onStartRouteSimulation: () => void;
  onClearRoute: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  userLocationName,
  bins,
  selectedBin,
  onSelectBin,
  activeRoute,
  onStartRouteSimulation,
  onClearRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Leaflet 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // CartoDB Voyager 타일 (카카오/네이버 맵 스타일의 정갈하고 시인성 높은 지도 타일)
    const map = L.map(mapContainerRef.current, {
      center: [37.5765, 126.9854], // 요구사항 1: 안국역 중심 좌표 (위도: 37.5765, 경도: 126.9854)
      zoom: 16, // 안국·서촌 골목길 확대 레벨
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. 사용자 위치 변경 시 지도 중심 이동 & 사용자 마커
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([userLocation.lat, userLocation.lng], map.getZoom() < 15 ? 16 : map.getZoom(), {
      animate: true,
    });
  }, [userLocation]);

  // 3. 쓰레기통 마커 렌더링 & 카카오 맵 스타일 커스텀 오버레이 (Custom Overlay)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 사용자 위치 마커
    const userMarkerHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
        <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
          나
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: 'user-pin-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(markersLayer)
      .bindPopup(
        `<div class="p-1.5 font-sans text-xs">
          <strong class="text-blue-600 font-bold">📍 내 현재 위치</strong><br/>
          <span class="text-slate-600">${userLocationName}</span>
        </div>`
      );

    // 필터링된 쓰레기통 마커 렌더링
    bins.forEach((bin) => {
      const isSelected = selectedBin?.id === bin.id;
      const isCup = bin.acceptedCategories.includes('disposable');
      const isRecycle = bin.acceptedCategories.includes('recycle');

      let iconEmoji = '🗑️';
      let bgColor = 'bg-slate-700';
      let borderColor = 'border-slate-400';

      if (isCup) {
        iconEmoji = '🥤';
        bgColor = 'bg-amber-600';
        borderColor = 'border-amber-300';
      } else if (isRecycle) {
        iconEmoji = '♻️';
        bgColor = 'bg-emerald-600';
        borderColor = 'border-emerald-300';
      }

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
          isSelected ? 'scale-125 z-50' : ''
        }">
          <div class="w-8 h-8 rounded-2xl ${bgColor} border-2 ${
        isSelected ? 'border-yellow-300 ring-4 ring-yellow-400/40' : borderColor
      } shadow-xl flex items-center justify-center text-sm text-white transition-all">
            ${iconEmoji}
          </div>
          ${
            bin.hasLiquidDrain
              ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white flex items-center justify-center text-[8px] font-bold text-slate-900 shadow">💧</span>`
              : ''
          }
          <div class="mt-0.5 px-1.5 py-0.5 bg-slate-900/90 text-[10px] text-white rounded-md whitespace-nowrap border border-slate-700 shadow font-medium pointer-events-none">
            ${bin.name.length > 8 ? bin.name.slice(0, 8) + '…' : bin.name}
          </div>
        </div>
      `;

      const binIcon = L.divIcon({
        html: markerHtml,
        className: 'bin-marker-icon',
        iconSize: [32, 52],
        iconAnchor: [16, 26],
      });

      // 품목 라벨 태그 HTML 생성
      const categoryBadgesHtml = bin.acceptedCategories
        .map((cat) => {
          if (cat === 'disposable') return '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">🥤 일회용 컵</span>';
          if (cat === 'recycle') return '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">♻️ 재활용</span>';
          if (cat === 'general') return '<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">🗑️ 일반 쓰레기</span>';
          if (cat === 'liquid') return '<span class="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-semibold">💧 액체 퇴수</span>';
          return '';
        })
        .join(' ');

      // 카카오 맵 스타일의 정갈한 커스텀 오버레이 (Custom Overlay) 팝업 HTML
      const overlayHtml = `
        <div class="font-sans text-slate-800 min-w-[210px] max-w-[260px] p-1">
          <div class="flex items-center justify-between border-b pb-1.5 mb-1.5">
            <h4 class="font-bold text-xs text-slate-900 flex items-center gap-1">
              <span>${iconEmoji}</span>
              <span>${bin.name}</span>
            </h4>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-medium ${bin.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
              ${bin.status === 'available' ? '이용가능' : '점검중'}
            </span>
          </div>

          <div class="text-[11px] text-slate-600 mb-2 leading-tight">
            📍 <span class="text-slate-500">${bin.detailLocation}</span>
          </div>

          <div class="mb-2">
            <div class="text-[10px] font-bold text-slate-500 mb-1">버릴 수 있는 품목:</div>
            <div class="flex flex-wrap gap-1">
              ${categoryBadgesHtml}
              ${bin.hasLiquidDrain ? '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">💧 음료 비움</span>' : ''}
            </div>
          </div>

          <div class="bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-[11px] text-slate-700 mb-1">
            <div class="flex items-center gap-1 font-semibold text-indigo-900">
              <span>⏰ 수거 시간대:</span>
            </div>
            <div class="text-[10px] text-slate-600 mt-0.5">
              ${bin.collectionSchedule || '매일 3회 정기 수거 (09:00, 14:00, 20:00)'}
            </div>
          </div>

          ${bin.fullnessLevel !== undefined ? `
            <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>스마트 적재율:</span>
              <span class="font-bold text-emerald-600">${bin.fullnessLevel}% (여유)</span>
            </div>
          ` : ''}
        </div>
      `;

      const marker = L.marker([bin.coordinates.lat, bin.coordinates.lng], { icon: binIcon });
      marker.bindPopup(overlayHtml, {
        className: 'kakao-style-overlay',
        closeButton: true,
        offset: [0, -20],
      });

      marker.on('click', () => {
        onSelectBin(bin);
        marker.openPopup();
      });

      marker.addTo(markersLayer);

      // 현재 선택된 쓰레기통인 경우 팝업 자동 오픈
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [bins, selectedBin, userLocation, userLocationName, onSelectBin]);

  // 4. 경로 시각화 (Green: 쾌적한 골목길 우회, Red: 붐비는 메인 길)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (!activeRoute) return;

    // A. 붐비는 메인도로 (Red - 혼잡) 시뮬레이션 라인
    // 안국역 출구 및 북촌로 메인 도로 구간: 인파가 몰리는 Red (혼잡) 색상 선 표시
    const crowdedMainRoadPath: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      [37.57685, 126.98565], // 안국역 1번 출구 메인 보도
      [37.57725, 126.98550], // 율곡로 사거리 횡단보도 (인파 밀집)
      [37.57780, 126.98530], // 북촌로 메인 입구 (관광객 인파 극심)
      [37.57840, 126.98500], // 북촌로 메인 거리 (혼잡)
    ];

    // Red 선 (혼잡 메인도로: 안국역 출구 및 북촌로 메인 도로)
    const crowdedPolyline = L.polyline(crowdedMainRoadPath, {
      color: '#ef4444',
      weight: 6,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(routeLayer);

    crowdedPolyline.bindPopup(
      `<div class="text-xs p-1 font-sans">
        <strong class="text-red-600 flex items-center gap-1">⚠️ 북촌로 메인 도로 (혼잡)</strong>
        <p class="text-slate-600 mt-1">관광객 인파 밀집 지역으로 보행 정체가 발생합니다.<br/><strong>쾌적한 감고당길 한옥 골목길(Green) 우회를 권장합니다.</strong></p>
      </div>`
    );

    // 혼잡 구역 라벨 뱃지 마커
    const crowdedBadgeHtml = `
      <div class="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xl border border-white flex items-center gap-1 whitespace-nowrap animate-pulse">
        <span>⚠️ 북촌로 메인 (혼잡)</span>
      </div>
    `;
    const crowdedBadgeIcon = L.divIcon({
      html: crowdedBadgeHtml,
      className: 'crowded-badge',
      iconSize: [88, 24],
      iconAnchor: [44, 12],
    });
    L.marker([37.57760, 126.98535], { icon: crowdedBadgeIcon }).addTo(routeLayer);

    // B. 쾌적한 골목길 (Green - 쾌적) 우회 경로
    // 감고당길 및 한옥 골목길 우회 구간: 쾌적하게 걸을 수 있는 Green (쾌적) 색상 선 표시
    const pleasantAlleyPath: [number, number][] = activeRoute.pathCoordinates.length > 0
      ? activeRoute.pathCoordinates
      : [
          [userLocation.lat, userLocation.lng],
          [37.57680, 126.98480], // 율곡로3길 골목 초입
          [37.57725, 126.98425], // 감고당길 덕성여고 돌담길 (한적한 보행로)
          [37.57760, 126.98395], // 감고당길 보행자 전용거리
          [37.57780, 126.98380], // 감고당길 공공 거점 쓰레기통 도착
        ];

    // Green 선 외곽 소프트 글로우
    L.polyline(pleasantAlleyPath, {
      color: '#10b981',
      weight: 10,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeLayer);

    // Green 선 메인 (쾌적한 골목길)
    const greenPolyline = L.polyline(pleasantAlleyPath, {
      color: '#059669',
      weight: 6,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeLayer);

    greenPolyline.bindPopup(
      `<div class="text-xs p-1 font-sans">
        <strong class="text-emerald-600 flex items-center gap-1">🌿 감고당길 한옥 골목길 (쾌적)</strong>
        <p class="text-slate-600 mt-1">서울시 실시간 도시데이터 혼잡도: <strong>여유</strong><br/>고즈넉한 돌담길로 안전하고 쾌적하게 이동합니다.</p>
      </div>`
    );

    // 쾌적 골목길 라벨 뱃지 마커
    const pleasantBadgeHtml = `
      <div class="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xl border border-white flex items-center gap-1 whitespace-nowrap">
        <span>🌿 감고당길 한옥 골목 (쾌적)</span>
      </div>
    `;
    const pleasantBadgeIcon = L.divIcon({
      html: pleasantBadgeHtml,
      className: 'pleasant-badge',
      iconSize: [110, 24],
      iconAnchor: [55, 12],
    });
    L.marker([37.57730, 126.98420], { icon: pleasantBadgeIcon }).addTo(routeLayer);

    // 경로가 지도에 모두 들어오도록 뷰포트 자동 조정
    const allCoords = [...crowdedMainRoadPath, ...pleasantAlleyPath];
    map.fitBounds(L.latLngBounds(allCoords), { padding: [70, 70], maxZoom: 17 });
  }, [activeRoute, userLocation]);

  // 지도 컨트롤 헬퍼
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetLocation = () => {
    mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-900 overflow-hidden">
      {/* 1. Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0" />

      {/* 2. 지도 상단/오버레이: [▶ 경로 시작 (쾌적한 골목길 우회)] 버튼 */}
      <div className="absolute top-[160px] sm:top-[124px] left-1/2 -translate-x-1/2 z-[800] w-full max-w-lg px-4 pointer-events-none">
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          {!activeRoute ? (
            <button
              onClick={onStartRouteSimulation}
              className="group flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-900/40 border border-emerald-400/40 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current text-white" />
              </div>
              <span>▶ 경로 시작 (쾌적한 골목길 우회)</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-normal">
                Green vs Red
              </span>
            </button>
          ) : (
            <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-emerald-500/40 shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300">
                  실시간 보행 혼잡도 우회 경로 안내 중
                </span>
              </div>
              <button
                onClick={onClearRoute}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] px-2"
                title="경로 종료"
              >
                <RotateCcw className="w-3 h-3" />
                <span>경로 종료</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. 요구사항 안내 카드 팝업: 경로선 렌더링 시 지도 하단에 요약 카드 노출 */}
      {activeRoute && (
        <div className="absolute bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-[850] w-[92%] max-w-md pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-950/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-black/80">
            {/* 카드 타이틀: 예상 소요시간: 도보 4분 | 쾌적한 한옥 골목길 우회 중 🌿 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>예상 소요시간: 도보 {activeRoute.totalDurationMinutes}분</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-emerald-300">쾌적한 한옥 골목길 우회 중 🌿</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    목적지: <strong>감고당길 공공 거점 쓰레기통</strong> ({activeRoute.totalDistanceMeters}m)
                  </p>
                </div>
              </div>

              <button
                onClick={onClearRoute}
                className="text-slate-400 hover:text-white p-1"
                title="닫기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 경로 범례 (Green vs Red) */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <span className="w-3.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Green: 감고당길 돌담길 (쾌적)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-red-400 font-medium">
                <span className="w-3.5 h-1.5 rounded-full bg-red-500" />
                <span>Red: 북촌로 메인길 (혼잡 회피)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 우측 컨트롤러 (내 위치, 줌, 범례 토글) */}
      <div className="absolute right-4 bottom-24 sm:bottom-8 z-[800] flex flex-col gap-2">
        <button
          onClick={handleResetLocation}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="내 위치로 이동"
          aria-label="내 위치로 이동"
        >
          <Navigation className="w-4 h-4 text-blue-400" />
        </button>
        <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition-colors border-b border-slate-800"
            title="확대"
            aria-label="확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center transition-colors"
            title="축소"
            aria-label="축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. 좌측 하단 정보 뱃지 (서울시 실시간 도시데이터 연동 상태) */}
      <div className="absolute left-4 bottom-24 sm:bottom-8 z-[800] hidden md:flex items-center space-x-2 px-3 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs text-slate-300 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>서울시 실시간 인구혼잡도 데이터 연동 중</span>
      </div>
    </div>
  );
};
