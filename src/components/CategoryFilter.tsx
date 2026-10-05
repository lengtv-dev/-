import React from 'react';
import { Category } from '../types/stream';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  adultEnabled: boolean;
  onToggleAdult: () => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  adultEnabled,
  onToggleAdult,
  categoryCounts = {},
}) => {
  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 mb-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          หมวดหมู่ช่องรายการ
        </span>

        {/* Adult Toggle Pill */}
        <button
          onClick={onToggleAdult}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            adultEnabled
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {adultEnabled ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              <span>🔞 18+ (เปิดอยู่)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>🔞 18+ (ซ่อน)</span>
            </>
          )}
        </button>
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.category_id;
          const count = categoryCounts[cat.category_id];

          return (
            <button
              key={cat.category_id}
              onClick={() => onSelectCategory(cat.category_id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60'
              }`}
            >
              <span>{cat.category_name}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
