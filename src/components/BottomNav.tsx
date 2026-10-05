import React from 'react';
import { Tv, Film, Clapperboard, Star, Calendar, Gem } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenPackages: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenPackages,
}) => {
  const tabs = [
    { id: 'live', label: 'ทีวีสด', icon: Tv },
    { id: 'vod', label: 'หนัง', icon: Film },
    { id: 'series', label: 'ซีรีส์', icon: Clapperboard },
    { id: 'favorites', label: 'ช่องโปรด', icon: Star },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md pb-safe">
      <div className="grid grid-cols-5 items-center h-full px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenPackages}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <Gem className="h-5 w-5 stroke-2" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">แพ็กเกจ VIP</span>
        </button>
      </div>
    </nav>
  );
};
