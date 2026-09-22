import React from 'react';
import { Trash2, Sparkles, Navigation, MapPin } from 'lucide-react';
import type { Coordinates } from '../../types/bin';

interface HeaderProps {
  currentMode: 'tourist' | 'resident';
  onModeChange: (mode: 'tourist' | 'resident') => void;
  onOpenAiGuide: () => void;
  onSelectQuickLocation: (coords: Coordinates, label: string) => void;
}

const QUICK_LOCATIONS: { label: string; coords: Coordinates }[] = [
  { label: '안국역 1번출구', coords: { lat: 37.57685, lng: 126.98565 } },
  { label: '북촌 한옥마을', coords: { lat: 37.58260, lng: 126.98520 } },
  { label: '삼청동 카페거리', coords: { lat: 37.58350, lng: 126.98180 } },
  { label: '경복궁역 (서촌)', coords: { lat: 37.57660, lng: 126.97230 } },
  { label: '통인시장 입구', coords: { lat: 37.58070, lng: 126.97010 } },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenAiGuide,
  onSelectQuickLocation,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] glass-panel px-4 py-3 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Brand Title & Live Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
                  find a bin
                  <span className="ml-1.5 text-xs font-normal text-brand-400 bg-brand-950/60 border border-brand-500/30 px-1.5 py-0.5 rounded-full">
                    안국·서촌
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                서울 실시간 도시데이터 혼잡도 & 가로휴지통 내비
              </p>
            </div>
          </div>

          {/* AI Guide Button (Mobile) */}
          <button
            onClick={onOpenAiGuide}
            className="sm:hidden flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI 가이드</span>
          </button>
        </div>

        {/* Action Controls: Dual Mode Switcher & Quick Locations */}
        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          {/* Quick Location Selector */}
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              onChange={(e) => {
                const target = QUICK_LOCATIONS.find((l) => l.label === e.target.value);
                if (target) {
                  onSelectQuickLocation(target.coords, target.label);
                }
              }}
              defaultValue="안국역 1번출구"
              className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {QUICK_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label}>
                  📍 {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: 관광객 ↔ 거주자 */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onModeChange('tourist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'tourist'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>관광객 모드</span>
            </button>
            <button
              onClick={() => onModeChange('resident')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'resident'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏡 거주자 모드</span>
            </button>
          </div>

          {/* AI Guide Button (Desktop) */}
          <button
            onClick={onOpenAiGuide}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 배출 가이드</span>
          </button>
        </div>
      </div>
    </header>
  );
};
