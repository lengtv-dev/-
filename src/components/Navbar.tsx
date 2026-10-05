import React, { useState } from 'react';
import { 
  Tv, 
  Film, 
  Clapperboard, 
  Star, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Calendar,
  LogOut,
  Sparkles,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { UserInfo, UserProfile } from '../types/stream';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  userInfo: UserInfo | null;
  activeProfile: UserProfile;
  onOpenPackages: () => void;
  onOpenSports: () => void;
  onOpenEpgGuide: () => void;
  onLogout: () => void;
  newChannelsCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  userInfo,
  activeProfile,
  onOpenPackages,
  onOpenSports,
  onOpenEpgGuide,
  onLogout,
  newChannelsCount,
  onOpenNotifications,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onTabChange('live')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Tv className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                STREAM M3U
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  XTREAM
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean unboxed text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => onTabChange('live')}
            className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              currentTab === 'live' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            ทีวีสด
          </button>
          <button
            onClick={() => onTabChange('vod')}
            className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              currentTab === 'vod' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            ภาพยนตร์
          </button>
          <button
            onClick={() => onTabChange('series')}
            className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              currentTab === 'series' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            ซีรีส์
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 ${
              currentTab === 'favorites' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
            ช่องโปรด
          </button>
          <button
            onClick={onOpenEpgGuide}
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            ผังรายการ EPG
          </button>
          <button
            onClick={onOpenSports}
            className="transition-colors text-red-600 dark:text-red-400 hover:text-red-700 font-bold flex items-center gap-1"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            ตารางบอลสด
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 xl:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาช่อง / หนัง / ซีรีส์..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* New Channel Notification Bell */}
          <button
            onClick={onOpenNotifications}
            title="การแจ้งเตือนช่องใหม่"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {newChannelsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {newChannelsCount > 9 ? '9+' : newChannelsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
          </button>

          {/* VIP Package CTA */}
          <button
            onClick={onOpenPackages}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition-transform active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            แพ็กเกจ VIP
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <img
                src={activeProfile.avatarUrl}
                alt={activeProfile.name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                }}
              />
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl z-50 text-xs"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {userInfo?.username || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    สถานะ: {userInfo?.status || 'Active'}
                  </p>
                  {userInfo?.exp_date && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      หมดอายุ: {new Date(Number(userInfo.exp_date) * 1000).toLocaleDateString('th-TH')}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenPackages();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    💎 ดูราคาแพ็กเกจ & สมัครสมาชิก VIP
                  </button>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาช่อง / หนัง / ซีรีส์..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <button
              onClick={() => { onTabChange('live'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-xl text-left border border-zinc-200 dark:border-zinc-800 ${currentTab === 'live' ? 'bg-blue-600 text-white' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              📺 ทีวีสด
            </button>
            <button
              onClick={() => { onTabChange('vod'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-xl text-left border border-zinc-200 dark:border-zinc-800 ${currentTab === 'vod' ? 'bg-blue-600 text-white' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              🎬 หนัง VOD
            </button>
            <button
              onClick={() => { onTabChange('series'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-xl text-left border border-zinc-200 dark:border-zinc-800 ${currentTab === 'series' ? 'bg-blue-600 text-white' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              🎞️ ซีรีส์
            </button>
            <button
              onClick={() => { onTabChange('favorites'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-xl text-left border border-zinc-200 dark:border-zinc-800 ${currentTab === 'favorites' ? 'bg-blue-600 text-white' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              ⭐ ช่องโปรด
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onOpenSports(); setMobileMenuOpen(false); }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold text-center"
            >
              ⚽ ตารางบอลสด
            </button>
            <button
              onClick={() => { onOpenPackages(); setMobileMenuOpen(false); }}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              💎 ดูราคาแพ็กเกจ & สมัครสมาชิก
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
