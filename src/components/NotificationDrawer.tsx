import React from 'react';
import { X, Bell, Play, Sparkles, Check, Film, Tv } from 'lucide-react';
import { LiveStream, VodStream } from '../types/stream';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  newItems: (LiveStream | VodStream)[];
  onSelectItem: (item: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  newItems,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('STREAM M3U Player', {
          body: 'เปิดระบบแจ้งเตือนช่องใหม่เรียบร้อยแล้ว!',
          icon: '/src/assets/images/avatar_streamer_1791216941283.jpg',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl p-5 text-white overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">แจ้งเตือนอัปเดตช่องใหม่</h3>
              <p className="text-[11px] text-zinc-400">ระบบตรวจสอบช่องและเนื้อหาใหม่อัตโนมัติ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Browser Push Notification Permission Banner */}
        <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-white">เปิดรับการแจ้งเตือนสด</p>
            <p className="text-[11px] text-zinc-400">แจ้งเตือนทันทีเมื่อมีช่องหรือหนังใหม่</p>
          </div>
          <button
            onClick={requestBrowserNotification}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
          >
            เปิดใช้งาน
          </button>
        </div>

        {/* New Channels & Movies List */}
        <div className="space-y-2.5 flex-1">
          <span className="text-xs font-bold text-zinc-400 block mb-2">
            รายการที่เพิ่มเข้ามาล่าสุด ({newItems.length} รายการ)
          </span>

          {newItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              ยังไม่มีการอัปเดตช่องใหม่ในขณะนี้
            </div>
          ) : (
            newItems.map((item, idx) => {
              const name = (item as any).name || (item as any).title;
              const icon = (item as any).stream_icon || (item as any).cover;
              const isLive = !(item as any).container_extension;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={icon}
                      alt={name}
                      className="h-10 w-10 rounded-xl object-cover bg-zinc-950 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-red-600 text-white">
                          NEW
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {isLive ? 'ช่องทีวีสด' : 'ภาพยนตร์ VOD'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate" title={name}>
                        {name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-md"
                  >
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 mt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            ระบบตรวจสอบการเปลี่ยนแปลงช่องรายการทุก 60 วินาที
          </p>
        </div>

      </div>
    </div>
  );
};
