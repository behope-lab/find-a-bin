import React from 'react';
import type { WasteCategory } from '../../types/bin';

interface WasteTypeFilterProps {
  selectedCategory: WasteCategory | 'all';
  onSelectCategory: (category: WasteCategory | 'all') => void;
  requiresLiquidDrain: boolean;
  onToggleLiquidDrain: () => void;
  matchedCount: number;
}

const CATEGORIES: { id: WasteCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '📍' },
  { id: 'disposable', label: '일회용 컵/퇴수', icon: '🥤' },
  { id: 'recycle', label: '재활용/플라스틱', icon: '♻️' },
  { id: 'general', label: '일반 쓰레기', icon: '🗑️' },
];

export const WasteTypeFilter: React.FC<WasteTypeFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  requiresLiquidDrain,
  onToggleLiquidDrain,
  matchedCount,
}) => {
  return (
    <div className="fixed top-[110px] sm:top-[74px] left-0 right-0 z-[900] px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Horizontal Category Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 px-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl max-w-full">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${isSelected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}

          {/* Liquid Drain Filter Toggle */}
          <div className="h-4 w-[1px] bg-slate-700 mx-1 flex-shrink-0" />
          <button
            onClick={onToggleLiquidDrain}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${requiresLiquidDrain
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-800/60 text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30'
              }`}
          >
            <span>💧</span>
            <span>남은 음료 비움</span>
          </button>
        </div>

        {/* Available Count Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 backdrop-blur-md ml-3 flex-shrink-0 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span>주변 가용 휴지통:</span>
          <strong className="text-brand-400 font-bold">{matchedCount}개</strong>
        </div>
      </div>
    </div>
  );
};
