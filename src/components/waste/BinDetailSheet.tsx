import React from 'react';
import type { BinWithDistance } from '../../services/matchingService';
import type { WalkingRoute } from '../../types/congestion';
import { formatDistance } from '../../utils/distance';
import { Navigation, Droplets, CheckCircle2, Clock, X, Sparkles } from 'lucide-react';

interface BinDetailSheetProps {
  bin: BinWithDistance | null;
  activeRoute: WalkingRoute | null;
  onClose: () => void;
  onOpenAiGuide: () => void;
}

const CATEGORY_NAMES: Record<string, { label: string; bg: string }> = {
  general: { label: '일반쓰레기', bg: 'bg-slate-700/60 text-slate-200' },
  recycle: { label: '재활용품 (캔/병)', bg: 'bg-emerald-800/50 text-emerald-300' },
  disposable: { label: '일회용 음료컵', bg: 'bg-amber-800/50 text-amber-300' },
  cigarette: { label: '담배꽁초', bg: 'bg-rose-900/40 text-rose-300' },
  liquid: { label: '음료 잔여액체', bg: 'bg-cyan-800/50 text-cyan-300' },
};

export const BinDetailSheet: React.FC<BinDetailSheetProps> = ({
  bin,
  activeRoute,
  onClose,
  onOpenAiGuide,
}) => {
  if (!bin) return null;

  const fullnessColor =
    (bin.fullnessLevel ?? 40) > 80
      ? 'bg-rose-500'
      : (bin.fullnessLevel ?? 40) > 60
        ? 'bg-amber-500'
        : 'bg-brand-500';

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[420px] z-[1000] animate-in slide-in-from-bottom-6 duration-300">
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-700/60 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Distance & Bin Name */}
        <div className="flex items-start justify-between pr-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Navigation className="w-3 h-3 mr-1" />
                {formatDistance(bin.distanceMeters)} • 도보 {bin.walkingMinutes}분
              </span>
              {bin.isSmartBin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-900/40 text-purple-300 border border-purple-500/30">
                  스마트 압축형
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
              {bin.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{bin.address}</p>
          </div>
        </div>

        {/* Detail Location Note */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-center space-x-2">
          <span className="text-brand-400 flex-shrink-0">📍</span>
          <span className="truncate">{bin.detailLocation}</span>
        </div>

        {/* Fullness & Liquid Drain Info */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {/* Fullness Level Bar */}
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span>적재 여유도</span>
              <span className="font-semibold text-slate-200">
                {bin.fullnessLevel ?? 40}% 사용 중
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${fullnessColor}`}
                style={{ width: `${bin.fullnessLevel ?? 40}%` }}
              />
            </div>
          </div>

          {/* Liquid Drain Feature */}
          <div
            className={`p-2.5 rounded-xl border flex items-center space-x-2 ${bin.hasLiquidDrain
              ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
              }`}
          >
            <Droplets
              className={`w-4 h-4 flex-shrink-0 ${bin.hasLiquidDrain ? 'text-cyan-400 animate-bounce-slow' : 'text-slate-500'
                }`}
            />
            <div>
              <p className="font-semibold leading-tight">
                {bin.hasLiquidDrain ? '남은 음료 비움 가능' : '음료 퇴수구 없음'}
              </p>
              <p className="text-[10px] opacity-75">
                {bin.hasLiquidDrain ? '얼음·액체 투입구 완비' : '음료 비운 후 배출'}
              </p>
            </div>
          </div>
        </div>

        {/* Accepted Categories Badges */}
        <div className="mt-3">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5">버릴 수 있는 품목:</p>
          <div className="flex flex-wrap gap-1.5">
            {bin.acceptedCategories.map((cat) => {
              const meta = CATEGORY_NAMES[cat] || {
                label: cat,
                bg: 'bg-slate-700 text-slate-200',
              };
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-lg font-medium border border-white/5 ${meta.bg}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1 opacity-70" />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Congestion Routing Note */}
        {activeRoute && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeRoute.overallCongestion === '여유'
                  ? 'bg-emerald-500'
                  : activeRoute.overallCongestion === '약간 붐빔'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                  }`}
              />
              <span className="text-slate-300">{activeRoute.recommendationNote}</span>
            </div>
            <span className="text-slate-400 flex items-center flex-shrink-0 ml-2">
              <Clock className="w-3 h-3 mr-1" />
              {activeRoute.totalDurationMinutes}분
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAiGuide}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI 배출법 묻기</span>
          </button>
          <a
            href={`https://map.kakao.com/link/to/${encodeURIComponent(bin.name)},${bin.coordinates.lat},${bin.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium text-xs transition-all shadow-lg shadow-brand-500/20"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>큰 지도에서 길찾기</span>
          </a>
        </div>
      </div>
    </div>
  );
};
