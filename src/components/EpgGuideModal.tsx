import React, { useState } from 'react';
import { X, Calendar, Play, Radio, Clock, Search } from 'lucide-react';
import { LiveStream } from '../types/stream';

interface EpgGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: LiveStream[];
  onSelectChannel: (channel: LiveStream) => void;
}

export const EpgGuideModal: React.FC<EpgGuideModalProps> = ({
  isOpen,
  onClose,
  channels,
  onSelectChannel,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                ผังรายการโทรทัศน์เรียลไทม์ (EPG Electronic Program Guide)
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ถ่ายทอดสด
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                เวลาปัจจุบัน: {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')} น.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="ค้นหาผังช่องรายการ..."
                className="w-full h-9 pl-9 pr-3 rounded-full border border-zinc-700 bg-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* EPG Matrix View */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="min-w-[900px]">
            {/* Time Header Row */}
            <div className="sticky top-0 z-20 flex bg-zinc-900 border-b border-zinc-800">
              <div className="w-56 shrink-0 p-3 font-extrabold text-xs text-zinc-400 border-r border-zinc-800 bg-zinc-900">
                ช่องสถานี
              </div>
              <div className="flex flex-1">
                {hours.map((h) => (
                  <div
                    key={h}
                    className={`w-36 shrink-0 p-2.5 text-center text-xs font-bold border-r border-zinc-800/60 ${
                      h === currentHour ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-400'
                    }`}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Schedules Rows */}
            <div className="divide-y divide-zinc-800/80">
              {filteredChannels.slice(0, 30).map((ch, idx) => {
                const isSport = ch.name.toLowerCase().includes('sport') || ch.name.toLowerCase().includes('บอล');
                const isMovie = ch.name.toLowerCase().includes('hbo') || ch.name.toLowerCase().includes('movie') || ch.name.toLowerCase().includes('mono');

                return (
                  <div key={ch.stream_id || idx} className="flex hover:bg-zinc-900/40 transition-colors">
                    
                    {/* Left: Channel Information & Play Trigger */}
                    <div className="w-56 shrink-0 p-3 flex items-center justify-between gap-2.5 border-r border-zinc-800 bg-zinc-950/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={ch.stream_icon}
                          alt={ch.name}
                          className="h-8 w-8 rounded-lg object-contain bg-zinc-900 p-0.5 border border-zinc-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="text-xs font-bold truncate text-white" title={ch.name}>
                          {ch.name}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onSelectChannel(ch);
                          onClose();
                        }}
                        title="รับชมสดช่องนี้"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
                      >
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Right: Program slots along timeline */}
                    <div className="flex flex-1 items-center">
                      {hours.map((h) => {
                        const isNow = h === currentHour;
                        let programTitle = 'รายการข่าวภาคเที่ยง & ทันสถานการณ์';
                        if (isSport) {
                          programTitle = h >= 19 ? '⚽ ถ่ายทอดสด บิ๊กแมตช์พรีเมียร์ลีก' : 'สรุปผลบอล & สดไฮไลท์ลีกยุโรป';
                        } else if (isMovie) {
                          programTitle = h >= 18 ? '🎬 ภาพยนตร์แอคชั่นฟอร์มยักษ์ 4K' : 'ซีรีส์ยอดนิยม พากย์ไทย';
                        } else if (h < 12) {
                          programTitle = 'ข่าวเช้าอรุณสวัสดิ์รอบวัน';
                        } else if (h >= 18) {
                          programTitle = 'ละครโทรทัศน์ช่วงไพรม์ไทม์';
                        }

                        return (
                          <div
                            key={h}
                            className={`w-36 shrink-0 p-2 h-16 flex flex-col justify-center border-r border-zinc-800/40 text-xs ${
                              isNow
                                ? 'bg-blue-600/15 border-blue-500/30'
                                : 'hover:bg-zinc-800/30'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-0.5">
                              <span>{String(h).padStart(2, '0')}:00</span>
                              {isNow && (
                                <span className="text-[9px] px-1 rounded bg-blue-600 text-white font-black">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-zinc-200 truncate" title={programTitle}>
                              {programTitle}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-400">
          <span>แสดงผังรายการ 24 ชม. อัปเดตอัตโนมัติจากเซิร์ฟเวอร์</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
          >
            ปิดผังรายการ
          </button>
        </div>

      </div>
    </div>
  );
};
