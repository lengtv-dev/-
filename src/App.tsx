import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HeroSlider } from './components/HeroSlider';
import { CategoryFilter } from './components/CategoryFilter';
import { ChannelGrid } from './components/ChannelGrid';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { LoginModal } from './components/LoginModal';
import { PackageModal } from './components/PackageModal';
import { SportsModal } from './components/SportsModal';
import { EpgGuideModal } from './components/EpgGuideModal';
import { NotificationDrawer } from './components/NotificationDrawer';

import {
  UserInfo,
  Category,
  LiveStream,
  VodStream,
  SeriesItem,
  WatchHistoryItem,
  UserProfile,
} from './types/stream';

import {
  DEFAULT_SERVER,
  loginXtream,
  getCategories,
  getStreams,
  buildStreamUrl,
} from './services/xtreamApi';

import {
  getSavedAuth,
  saveAuth,
  clearAuth,
  getProfiles,
  getActiveProfile,
  getHistory,
  saveHistoryItem,
  getFavorites,
  toggleFavorite,
  getAdultPin,
  setAdultPin,
  isAdultEnabled,
  setAdultEnabled,
  getSavedTheme,
  saveTheme,
} from './services/storage';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(getSavedTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth & Session State
  const [auth, setAuth] = useState(getSavedAuth());
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activeProfile, setActiveProfileState] = useState<UserProfile>(getActiveProfile());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Content Tabs & Filters
  const [currentTab, setCurrentTab] = useState<string>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Adult 18+ Protection
  const [adultEnabled, setAdultEnabledState] = useState(isAdultEnabled());

  // Favorites & History
  const [favoritesList, setFavoritesList] = useState<string[]>(getFavorites());
  const [historyList, setHistoryList] = useState<WatchHistoryItem[]>([]);

  // Modals & Drawers
  const [packagesModalOpen, setPackagesModalOpen] = useState(false);
  const [sportsModalOpen, setSportsModalOpen] = useState(false);
  const [epgGuideModalOpen, setEpgGuideModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [newItems, setNewItems] = useState<any[]>([]);

  // Active Video Player State
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [activeEpIndex, setActiveEpIndex] = useState(0);

  // Initial Auth Check & Auto Login
  useEffect(() => {
    const saved = getSavedAuth();
    if (saved && saved.user && saved.pass) {
      loginXtream(saved.server || DEFAULT_SERVER, saved.user, saved.pass)
        .then((res) => {
          setUserInfo(res.user_info);
          setIsLoggedIn(true);
        })
        .catch(() => {
          // If auto login fails, user can enter credentials in LoginModal
        });
    }
  }, []);

  // Handle Login
  const handleLogin = async (
    server: string,
    anyname: string,
    user: string,
    pass: string,
    remember: boolean
  ) => {
    const res = await loginXtream(server, user, pass);
    setUserInfo(res.user_info);
    const authData = { server, anyname, user, pass, remember };
    setAuth(authData);
    saveAuth(authData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  // Load Categories when Tab changes
  useEffect(() => {
    if (!isLoggedIn || !auth) return;

    if (currentTab === 'favorites' || currentTab === 'history') {
      setCategories([]);
      return;
    }

    const type = currentTab as 'live' | 'vod' | 'series';
    getCategories(type, auth.server || DEFAULT_SERVER, auth.user, auth.pass).then((cats) => {
      let filteredCats = cats;
      if (!adultEnabled) {
        filteredCats = cats.filter(
          (c) =>
            !c.category_name.toLowerCase().includes('18+') &&
            !c.category_name.toLowerCase().includes('adult') &&
            !c.category_name.toLowerCase().includes('xxx')
        );
      }
      setCategories(filteredCats);
      if (filteredCats.length > 0) {
        setSelectedCategoryId(filteredCats[0].category_id);
      }
    });
  }, [currentTab, isLoggedIn, auth, adultEnabled]);

  // Load Content Items when Tab, Category, or Auth changes
  useEffect(() => {
    if (!isLoggedIn || !auth) return;

    if (currentTab === 'favorites') {
      setIsLoadingItems(true);
      const favIds = getFavorites();
      setFavoritesList(favIds);
      // Fetch live & VOD to display favorites
      Promise.all([
        getStreams('live', auth.server || DEFAULT_SERVER, auth.user, auth.pass),
        getStreams('vod', auth.server || DEFAULT_SERVER, auth.user, auth.pass),
      ]).then(([liveList, vodList]) => {
        const all = [...liveList, ...vodList];
        const favItems = all.filter((it) => favIds.includes(String(it.stream_id || it.series_id)));
        setItems(favItems);
        setIsLoadingItems(false);
      });
      return;
    }

    if (currentTab === 'history') {
      const history = getHistory(auth.user, auth.server || DEFAULT_SERVER);
      setHistoryList(history);
      setItems(history);
      return;
    }

    const type = currentTab as 'live' | 'vod' | 'series';
    setIsLoadingItems(true);
    getStreams(type, auth.server || DEFAULT_SERVER, auth.user, auth.pass, selectedCategoryId)
      .then((streamList) => {
        let visibleList = streamList;
        if (!adultEnabled) {
          visibleList = streamList.filter((it) => {
            const name = (it.name || it.title || '').toLowerCase();
            return (
              !it.is_adult &&
              !name.includes('18+') &&
              !name.includes('adult') &&
              !name.includes('xxx') &&
              !name.includes('r21')
            );
          });
        }
        setItems(visibleList);

        // Detect newly added items (added recently)
        const recent = visibleList.filter(
          (it) => it.added && Date.now() - Number(it.added) * 1000 < 86400000 * 7
        );
        if (recent.length > 0) {
          setNewItems((prev) => {
            const map = new Map();
            [...recent, ...prev].forEach((item) => map.set(item.stream_id || item.series_id, item));
            return Array.from(map.values()).slice(0, 10);
          });
        }
        setIsLoadingItems(false);
      })
      .catch(() => {
        setIsLoadingItems(false);
      });
  }, [currentTab, selectedCategoryId, isLoggedIn, auth, adultEnabled]);

  // Toggle Favorite
  const handleToggleFavorite = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    const updated = getFavorites();
    setFavoritesList(updated);

    if (currentTab === 'favorites') {
      setItems((prev) => prev.filter((it) => updated.includes(String(it.stream_id || it.series_id))));
    }
  };

  // Toggle Adult PIN Protection
  const handleToggleAdult = () => {
    if (!adultEnabled) {
      const savedPin = getAdultPin();
      if (!savedPin) {
        const newPin = prompt('ตั้งรหัส PIN 4 หลักใหม่สำหรับการเปิดหมวดหมู่ 18+:');
        if (newPin && newPin.trim()) {
          setAdultPin(newPin.trim());
          setAdultEnabled(true);
          setAdultEnabledState(true);
        }
      } else {
        const enteredPin = prompt('กรุณากรอกรหัส PIN เพื่อเปิดหมวดหมู่ 18+:');
        if (enteredPin === savedPin) {
          setAdultEnabled(true);
          setAdultEnabledState(true);
        } else if (enteredPin !== null) {
          alert('รหัส PIN ไม่ถูกต้อง!');
        }
      }
    } else {
      if (confirm('คุณต้องการซ่อนหมวดหมู่ 18+ ใช่หรือไม่?')) {
        setAdultEnabled(false);
        setAdultEnabledState(false);
      }
    }
  };

  // Select Item to Play
  const handleSelectItem = (item: any) => {
    setActiveItem(item);
    setActiveEpIndex(0);
    setPlayerOpen(true);

    // Record to watch history
    if (auth) {
      const kind = currentTab === 'favorites' ? (item.container_extension ? 'vod' : 'live') : (currentTab as any);
      const historyItem: WatchHistoryItem = {
        id: item.stream_id || item.series_id || item.id,
        name: item.name || item.title || 'รายการที่รับชม',
        kind: kind,
        cover: item.stream_icon || item.cover,
        pos: item.pos || 0,
        ts: Date.now(),
        ext: item.container_extension || 'm3u8',
      };
      saveHistoryItem(auth.user, auth.server || DEFAULT_SERVER, historyItem);
    }
  };

  // Live Channel Switching (Prev / Next)
  const currentItemIndex = items.findIndex(
    (x) => String(x.stream_id || x.series_id) === String(activeItem?.stream_id || activeItem?.series_id)
  );

  const handlePrevChannel = () => {
    if (currentItemIndex > 0) {
      handleSelectItem(items[currentItemIndex - 1]);
    }
  };

  const handleNextChannel = () => {
    if (currentItemIndex < items.length - 1) {
      handleSelectItem(items[currentItemIndex + 1]);
    }
  };

  // Filter items by search query
  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((it) => {
      const name = (it.name || it.title || '').toLowerCase();
      return name.includes(q);
    });
  }, [items, searchQuery]);

  // If not logged in, show Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans">
        <LoginModal
          onLogin={handleLogin}
          onOpenPackages={() => setPackagesModalOpen(true)}
          initialServer={auth?.server || DEFAULT_SERVER}
          initialAnyname={auth?.anyname || ''}
          initialUser={auth?.user || ''}
          initialPass={auth?.pass || ''}
          initialRemember={auth?.remember ?? true}
        />
        <PackageModal
          isOpen={packagesModalOpen}
          onClose={() => setPackagesModalOpen(false)}
          onRegisterSuccess={(newUser) => {
            alert(`สมัครสมาชิกสำเร็จสำหรับผู้ใช้: ${newUser} สามารถเข้าสู่ระบบได้ทันที`);
          }}
        />
      </div>
    );
  }

  // Active Stream URL
  let streamUrl = '';
  if (activeItem && auth) {
    if (activeItem.direct_source) {
      streamUrl = activeItem.direct_source;
    } else {
      const kind = currentTab === 'vod' ? 'vod' : currentTab === 'series' ? 'series' : 'live';
      const id = activeItem.stream_id || activeItem.series_id || activeItem.id;
      const ext = activeItem.container_extension || (kind === 'live' ? 'm3u8' : 'mp4');
      streamUrl = buildStreamUrl(kind, auth.server || DEFAULT_SERVER, auth.user, auth.pass, id, ext);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors pb-16 lg:pb-0">
      
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
        userInfo={userInfo}
        activeProfile={activeProfile}
        onOpenPackages={() => setPackagesModalOpen(true)}
        onOpenSports={() => setSportsModalOpen(true)}
        onOpenEpgGuide={() => setEpgGuideModalOpen(true)}
        onLogout={handleLogout}
        newChannelsCount={newItems.length}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          userInfo={userInfo}
          activeProfile={activeProfile}
          adultEnabled={adultEnabled}
          onToggleAdult={handleToggleAdult}
          onRefreshData={() => {
            const prev = selectedCategoryId;
            setSelectedCategoryId('');
            setTimeout(() => setSelectedCategoryId(prev), 100);
          }}
          onOpenPackages={() => setPackagesModalOpen(true)}
          onOpenSports={() => setSportsModalOpen(true)}
          onOpenEpgGuide={() => setEpgGuideModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* Featured Hero Slider */}
          {currentTab !== 'history' && !searchQuery && (
            <HeroSlider
              onPlayFeatured={(type) => {
                setCurrentTab(type);
                if (items.length > 0) handleSelectItem(items[0]);
              }}
              onOpenEpg={() => setEpgGuideModalOpen(true)}
            />
          )}

          {/* Category Filter Pills */}
          {categories.length > 0 && currentTab !== 'favorites' && currentTab !== 'history' && (
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              adultEnabled={adultEnabled}
              onToggleAdult={handleToggleAdult}
            />
          )}

          {/* Channels / Movies Grid */}
          <ChannelGrid
            items={displayedItems}
            type={currentTab as any}
            onSelectItem={handleSelectItem}
            favorites={favoritesList}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoadingItems}
            onClearHistory={() => {
              if (confirm('คุณต้องการล้างประวัติการรับชมทั้งหมดหรือไม่?')) {
                if (auth) {
                  localStorage.removeItem(`history_${btoa(encodeURIComponent(`${auth.server}_${auth.user}`))}`);
                  setHistoryList([]);
                  setItems([]);
                }
              }
            }}
          />

        </main>
      </div>

      {/* Mobile Touch-first Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenPackages={() => setPackagesModalOpen(true)}
      />

      {/* Video Player Modal with Recording & EPG */}
      {playerOpen && activeItem && auth && (
        <VideoPlayerModal
          isOpen={playerOpen}
          onClose={() => setPlayerOpen(false)}
          title={activeItem.name || activeItem.title || 'กำลังเล่น'}
          streamUrl={streamUrl}
          kind={currentTab === 'vod' ? 'vod' : currentTab === 'series' ? 'series' : 'live'}
          streamId={activeItem.stream_id || activeItem.series_id || activeItem.id}
          serverUrl={auth.server || DEFAULT_SERVER}
          username={auth.user}
          password={auth.pass}
          episodes={activeItem.episodes || []}
          currentEpIndex={activeEpIndex}
          onSelectEpisode={(idx) => {
            setActiveEpIndex(idx);
            if (activeItem.episodes && activeItem.episodes[idx]) {
              // Can update source or direct URL
            }
          }}
          onPrevChannel={currentTab === 'live' ? handlePrevChannel : undefined}
          onNextChannel={currentTab === 'live' ? handleNextChannel : undefined}
          savedPosition={activeItem.pos || 0}
          onSaveProgress={(pos) => {
            if (auth) {
              const histItem: WatchHistoryItem = {
                id: activeItem.stream_id || activeItem.series_id || activeItem.id,
                name: activeItem.name || activeItem.title,
                kind: currentTab as any,
                cover: activeItem.stream_icon || activeItem.cover,
                pos,
                ts: Date.now(),
              };
              saveHistoryItem(auth.user, auth.server || DEFAULT_SERVER, histItem);
            }
          }}
        />
      )}

      {/* Membership & Subscription Packages Modal */}
      <PackageModal
        isOpen={packagesModalOpen}
        onClose={() => setPackagesModalOpen(false)}
      />

      {/* Sports Fixtures Modal */}
      <SportsModal
        isOpen={sportsModalOpen}
        onClose={() => setSportsModalOpen(false)}
      />

      {/* EPG Timetable Guide Modal */}
      <EpgGuideModal
        isOpen={epgGuideModalOpen}
        onClose={() => setEpgGuideModalOpen(false)}
        channels={items.filter((it) => !it.container_extension)}
        onSelectChannel={handleSelectItem}
      />

      {/* New Channels Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        newItems={newItems}
        onSelectItem={handleSelectItem}
      />

    </div>
  );
}
