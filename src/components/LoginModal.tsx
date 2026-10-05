import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Server, 
  Gem, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { DEFAULT_SERVER } from '../services/xtreamApi';

interface LoginModalProps {
  onLogin: (server: string, anyname: string, user: string, pass: string, remember: boolean) => Promise<void>;
  onOpenPackages: () => void;
  initialServer?: string;
  initialAnyname?: string;
  initialUser?: string;
  initialPass?: string;
  initialRemember?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLogin,
  onOpenPackages,
  initialServer = DEFAULT_SERVER,
  initialAnyname = '',
  initialUser = '',
  initialPass = '',
  initialRemember = true,
}) => {
  const [server, setServer] = useState(initialServer);
  const [anyname, setAnyname] = useState(initialAnyname);
  const [user, setUser] = useState(initialUser);
  const [pass, setPass] = useState(initialPass);
  const [remember, setRemember] = useState(initialRemember);
  const [showPass, setShowPass] = useState(false);
  const [showServerInput, setShowServerInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Background poster info
  const [trendingMovie, setTrendingMovie] = useState<{ title: string; rating: string; bgUrl: string }>({
    title: 'Top Hits Cinema & Sports Live',
    rating: '8.9/10',
    bgUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920&auto=format&fit=crop',
  });

  useEffect(() => {
    // Attempt to fetch trending backdrop from TMDB
    const fetchTmdb = async () => {
      try {
        const apiKey = '8baba8ab6b8bbe247645bcae7df63d0d';
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=th-TH`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            const m = data.results[0];
            const imgPath = m.backdrop_path || m.poster_path;
            if (imgPath) {
              setTrendingMovie({
                title: m.title || m.name || m.original_title || 'ภาพยนตร์ฮิตประจำวัน',
                rating: `${m.vote_average ? m.vote_average.toFixed(1) : '8.8'}/10`,
                bgUrl: `https://image.tmdb.org/t/p/original${imgPath}`,
              });
            }
          }
        }
      } catch (e) {}
    };
    fetchTmdb();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) {
      setErrorMsg('กรุณากรอก Username และ Password');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await onLogin(
        server.trim() || DEFAULT_SERVER,
        anyname.trim() || user.trim(),
        user.trim(),
        pass.trim(),
        remember
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black p-4">
      {/* Dynamic TMDB / Cinematic Background */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url('${trendingMovie.bgUrl}')` }}
      />

      {/* Measured Vignette & Blur Scrim */}
      <div className="fixed inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40 backdrop-blur-[2px]" />

      {/* Bottom-left Trending Info */}
      <div className="fixed bottom-6 left-6 hidden md:block max-w-lg z-10 text-white pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-xs font-black uppercase tracking-wider shadow-lg mb-2">
          🔥 กำลังฮิตวันนี้
        </span>
        <h1 className="text-3xl font-black tracking-tight leading-tight text-balance mb-1">
          {trendingMovie.title}
        </h1>
        <p className="text-sm font-bold text-amber-400">
          ⭐ TMDb Rating: {trendingMovie.rating}
        </p>
      </div>

      {/* Center Glassmorphism Login Card */}
      <div className="relative z-20 w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950/85 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-600/30 mb-3">
            <Tv className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            STREAM M3U PLAYER
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            เข้าสู่ระบบ Xtream Codes Player เพื่อเข้าถึงคลังสัญญาณและผังรายการ EPG
          </p>
        </div>

        {/* Server Target Indicator */}
        <div className="mb-4 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate text-zinc-400">
            <Server className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate">{server}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowServerInput(!showServerInput)}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 shrink-0 ml-2"
          >
            {showServerInput ? 'ซ่อน' : 'เปลี่ยนเซิร์ฟเวอร์'}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {showServerInput && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                Xtream Server URL
              </label>
              <input
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="http://103.114.203.129:8080"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">
              Anyname (ชื่อที่ใช้แสดง)
            </label>
            <div className="relative">
              <input
                type="text"
                value={anyname}
                onChange={(e) => setAnyname(e.target.value)}
                placeholder="เช่น ห้องนั่งเล่น / Smart TV"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-zinc-700 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">
              Username (ชื่อผู้ใช้งาน)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ที่ลงทะเบียน"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-zinc-700 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">
              Password (รหัสผ่าน)
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-700 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
              />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>

            <button
              type="button"
              onClick={onOpenPackages}
              className="text-amber-400 hover:text-amber-300 font-bold"
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-xs font-bold text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-blue-600/30 transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังเชื่อมต่อเซิร์ฟเวอร์...
              </span>
            ) : (
              <>
                <span>เข้าสู่ระบบรับชม</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* VIP Package Direct CTA - Opens in-app modal on same page without changing page */}
          <button
            type="button"
            onClick={onOpenPackages}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Gem className="h-4 w-4 text-amber-400" />
            <span>ดูราคาแพ็กเกจ & สมัครสมาชิก VIP</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500">
          <p>เข้าสู่ระบบเฉพาะสมาชิกที่ลงทะเบียนเท่านั้น · playid.hstn.me</p>
        </div>

      </div>
    </div>
  );
};
