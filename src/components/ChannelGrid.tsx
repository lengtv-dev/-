import React from 'react';
import { Play, Star, Clock, Film, Tv, Clapperboard, Trash2 } from 'lucide-react';
import { LiveStream, VodStream, SeriesItem, WatchHistoryItem } from '../types/stream';

interface ChannelGridProps {
  items: (LiveStream | VodStream | SeriesItem | WatchHistoryItem)[];
  type: 'live' | 'vod' | 'series' | 'favorites' | 'history';
  onSelectItem: (item: any) => void;
  favorites: string[];
  onToggleFavorite: (id: string | number, e: React.MouseEvent) => void;
  isLoading: boolean;
  onClearHistory?: () => void;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  items,
  type,
  onSelectItem,
  favorites,
  onToggleFavorite,
  isLoading,
  onClearHistory,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-10 w-10 border-3 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
          กำลังโหลดรายการช่องและสื่อมีเดีย...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          {type === 'live' ? <Tv className="h-7 w-7" /> : type === 'favorites' ? <Star className="h-7 w-7" /> : <Film className="h-7 w-7" />}
        </div>
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
          {type === 'favorites'
            ? 'ยังไม่มีรายการโปรด'
            : type === 'history'
            ? 'ไม่มีประวัติการรับชม'
            : 'ไม่พบรายการที่ค้นหา'}
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          {type === 'favorites'
            ? 'กดปุ่มดาว ⭐ ที่มุมของช่องรายการใดๆ เพื่อเพิ่มไว้ในหน้ารายการโปรดของคุณ'
            : 'ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหารายการที่ต้องการ'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {type === 'history' && onClearHistory && (
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-bold text-zinc-500">
            ทั้งหมด {items.length} รายการที่รับชมล่าสุด
          </span>
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ล้างประวัติทั้งหมด
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {items.map((item, idx) => {
          const streamId = (item as any).stream_id || (item as any).series_id || (item as any).id;
          const name = (item as any).name || (item as any).title || 'ไม่ระบุชื่อ';
          const icon = (item as any).stream_icon || (item as any).cover || '';
          const isFav = favorites.includes(String(streamId));
          const isLive = type === 'live' || (item as any).kind === 'live';
          const rating = (item as any).rating;
          const year = (item as any).year || (item as any).releaseDate;

          const is4k =
            name.toUpperCase().includes('4K') ||
            name.toUpperCase().includes('2160') ||
            name.toUpperCase().includes('UHD');

          return (
            <div
              key={`${streamId}-${idx}`}
              onClick={() => onSelectItem(item)}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Media Thumbnail Container */}
              <div className={`relative w-full overflow-hidden bg-zinc-950 ${isLive ? 'aspect-video p-2 flex items-center justify-center' : 'aspect-[2/3]'}`}>
                <img
                  src={icon}
                  alt={name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${isLive ? 'object-contain' : 'object-cover'}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      isLive
                        ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80';
                  }}
                />

                {/* 4K or Master Badge */}
                {is4k ? (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md">
                    4K UHD
                  </span>
                ) : !isLive ? (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900/80 text-white backdrop-blur-sm border border-white/10">
                    FHD 1080p
                  </span>
                ) : null}

                {/* Favorite Star Button */}
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(streamId, e)}
                  title={isFav ? 'ลบออกจากช่องโปรด' : 'เพิ่มในช่องโปรด'}
                  className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                    isFav
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-black/50 text-white/70 hover:bg-black/80 hover:text-white'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>

                {/* Play Hover Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/50 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Resume Watch Progress bar if history item */}
                {(item as any).pos > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(10, (((item as any).pos || 0) / ((item as any).duration || 3600)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Title & Metadata Details */}
              <div className="p-2.5 flex flex-col flex-1 justify-between bg-white dark:bg-zinc-900">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {name}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                  {rating ? (
                    <span className="font-bold text-amber-500 flex items-center gap-0.5">
                      ★ {rating}
                    </span>
                  ) : (
                    <span>{isLive ? '🔴 LIVE' : year || 'Master'}</span>
                  )}
                  <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">
                    {isLive ? 'ดูสด' : 'ชมภาพยนตร์'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
