import React from 'react';
import { 
  Tv, 
  Film, 
  Clapperboard, 
  Star, 
  History, 
  Calendar, 
  Flame, 
  Gem, 
  ShieldAlert, 
  RefreshCw, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { UserInfo, UserProfile } from '../types/stream';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userInfo: UserInfo | null;
  activeProfile: UserProfile;
  adultEnabled: boolean;
  onToggleAdult: () => void;
  onRefreshData: () => void;
  onOpenPackages: () => void;
  onOpenSports: () => void;
  onOpenEpgGuide: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userInfo,
  activeProfile,
  adultEnabled,
  onToggleAdult,
  onRefreshData,
  onOpenPackages,
  onOpenSports,
  onOpenEpgGuide,
  onLogout,
}) => {
  let expText = 'ไม่มีวันหมดอายุ';
  if (userInfo?.exp_date && userInfo.exp_date !== 'null') {
    const expDate = new Date(Number(userInfo.exp_date) * 1000);
    expText = expDate.toLocaleDateString('th-TH');
  }

  const menuItems = [
    { id: 'live', label: 'ช่องทีวีถ่ายทอดสด', icon: Tv },
    { id: 'vod', label: 'ภาพยนตร์ VOD', icon: Film },
    { id: 'series', label: 'ซีรีส์ยอดนิยม', icon: Clapperboard },
    { id: 'favorites', label: 'รายการโปรดของฉัน', icon: Star },
    { id: 'history', label: 'ประวัติการรับชม', icon: History },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-colors shrink-0">
      
      {/* User Info Card */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 mb-4">
        <img
          src={activeProfile.avatarUrl}
          alt={activeProfile.name}
          className="h-11 w-11 rounded-xl object-cover ring-2 ring-blue-500/20"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {userInfo?.username || 'ผู้ใช้งาน M7'}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            วันหมดอายุ: {expText}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              สถานะ: ปกติ (Active)
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="space-y-1 flex-1">
        <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          หมวดหมู่หลัก
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          ฟังก์ชันพิเศษ
        </div>

        <button
          onClick={onOpenEpgGuide}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-left"
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>ผังรายการทีวี (EPG)</span>
        </button>

        <button
          onClick={onOpenSports}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
        >
          <Flame className="h-4 w-4 text-red-500" />
          <span>ตารางบอลสดวันนี้</span>
        </button>

        <button
          onClick={onOpenPackages}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-left cursor-pointer"
        >
          <Gem className="h-4 w-4 text-amber-500" />
          <span>ดูราคาแพ็กเกจ & สมัครสมาชิก VIP</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        {/* Adult 18+ Toggle */}
        <button
          onClick={onToggleAdult}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            adultEnabled
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>หมวด 18+ ({adultEnabled ? 'เปิด' : 'ซ่อน'})</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
            {adultEnabled ? 'ON' : 'PIN'}
          </span>
        </button>

        <button
          onClick={onRefreshData}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>รีเฟรชรายการช่อง</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>ออกจากระบบ</span>
        </button>

        <div className="pt-2 text-center">
          <a
            href="https://playid.hstn.me"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-zinc-400 hover:text-blue-500 inline-flex items-center gap-1"
          >
            playid.hstn.me <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

    </aside>
  );
};
