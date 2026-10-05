import React, { useState, useEffect } from 'react';
import { Play, Calendar, ChevronLeft, ChevronRight, Video, Sparkles } from 'lucide-react';

interface HeroSliderProps {
  onPlayFeatured: (type: 'live' | 'vod') => void;
  onOpenEpg: () => void;
}

const SLIDES = [
  {
    id: 1,
    badge: 'ถ่ายทอดสด 4K UHD',
    title: 'พรีเมียร์ลีก บิ๊กแมตช์ & กีฬาระดับโลก สัญญาณสดลื่นไหล',
    description: 'รับชมถ่ายทอดสดกีฬาชั้นนำ ฟุตบอลสด เทนนิส กอล์ฟ มวย พร้อมระบบบันทึกวิดีโอในตัวและผังรายการ EPG เรียลไทม์',
    image: '/src/assets/images/hero_sports_live_1791216918090.jpg',
    actionType: 'live' as const,
  },
  {
    id: 2,
    badge: 'ภาพยนตร์ MASTER 4K',
    title: 'มหาศึกภาพยนตร์ฟอร์มยักษ์ & ซีรีส์ฮิต พากย์ไทยคมชัด',
    description: 'เพลิดเพลินกับคลังภาพยนตร์และซีรีส์ใหม่ล่าสุด รับชมต่อจากเดิมอัตโนมัติ รองรับเสียงพากย์ไทยและซับไตเติล',
    image: '/src/assets/images/hero_cinema_stream_1791216930085.jpg',
    actionType: 'vod' as const,
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onPlayFeatured, onOpenEpg }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-6 group">
      {/* Background Media with Dark Gradient Scrim */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <img
          src={slide.image}
          alt={slide.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        {/* Measured Scrim for contrast: at least 4.5:1 text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3 w-3" />
            {slide.badge}
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            Xtream Player · TS / M3U8 / MP4
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2 tracking-tight text-balance">
          {slide.title}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
          {slide.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onPlayFeatured(slide.actionType)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-600/25 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>เริ่มรับชมทันที</span>
          </button>

          <button
            onClick={onOpenEpg}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-colors cursor-pointer border border-white/15"
          >
            <Calendar className="h-4 w-4" />
            <span>ผังรายการสด EPG</span>
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Dots */}
      <div className="absolute right-6 bottom-6 flex items-center gap-1.5">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              currentSlide === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
