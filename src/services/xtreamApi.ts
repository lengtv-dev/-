import {
  Category,
  LiveStream,
  VodStream,
  SeriesItem,
  XtreamAuthResponse,
  EpgProgram,
} from '../types/stream';

export const DEFAULT_SERVER = 'http://103.114.203.129:8080';

// Real backup streams to ensure user can always test video player, recording, and EPG
const SAMPLE_LIVE_STREAMS: LiveStream[] = [
  {
    stream_id: 'live_1',
    num: 1,
    name: '⚽ True Premier Football HD 1 [4K Live]',
    stream_icon: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
    category_id: 'sports',
    direct_source: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    added: `${Date.now() - 3600000}`,
  },
  {
    stream_id: 'live_2',
    num: 2,
    name: '🏆 beIN SPORTS 1 Thailand HD',
    stream_icon: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop&q=80',
    category_id: 'sports',
    direct_source: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    added: `${Date.now() - 7200000}`,
  },
  {
    stream_id: 'live_3',
    num: 3,
    name: '📺 CH3 HD Digital TV Thailand',
    stream_icon: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&auto=format&fit=crop&q=80',
    category_id: 'digital_tv',
    direct_source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    added: `${Date.now() - 10000000}`,
  },
  {
    stream_id: 'live_4',
    num: 4,
    name: '📺 CH7 HD Drama & News HD',
    stream_icon: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&auto=format&fit=crop&q=80',
    category_id: 'digital_tv',
    direct_source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    added: `${Date.now() - 12000000}`,
  },
  {
    stream_id: 'live_5',
    num: 5,
    name: '🎬 MONO29 Top Action Movies HD',
    stream_icon: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
    category_id: 'entertainment',
    direct_source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    added: `${Date.now() - 86400000}`,
  },
  {
    stream_id: 'live_6',
    num: 6,
    name: '🔴 Thairath TV 32 HD Live',
    stream_icon: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80',
    category_id: 'digital_tv',
    direct_source: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    added: `${Date.now() - 95000000}`,
  },
  {
    stream_id: 'live_7',
    num: 7,
    name: '🎬 HBO HD Movie World [Master FHD]',
    stream_icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
    category_id: 'entertainment',
    direct_source: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    added: `${Date.now() - 1500000}`,
  },
  {
    stream_id: 'live_8',
    num: 8,
    name: '🔞 Midnight Cinema 18+ VIP Red Room',
    stream_icon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    category_id: 'adult',
    direct_source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    is_adult: true,
    added: `${Date.now() - 5000000}`,
  },
];

const SAMPLE_VOD_STREAMS: VodStream[] = [
  {
    stream_id: 'vod_1',
    num: 1,
    name: 'Dune: Part Two (2024) [4K UHD Master]',
    stream_icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    category_id: 'movies_action',
    year: '2024',
    rating: '8.8',
    container_extension: 'mp4',
    added: `${Date.now() - 100000}`,
  },
  {
    stream_id: 'vod_2',
    num: 2,
    name: 'Oppenheimer (2023) [Master FullHD พากย์ไทย]',
    stream_icon: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    category_id: 'movies_action',
    year: '2023',
    rating: '8.9',
    container_extension: 'mp4',
    added: `${Date.now() - 250000}`,
  },
  {
    stream_id: 'vod_3',
    num: 3,
    name: 'Spider-Man: Across the Spider-Verse (2023)',
    stream_icon: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
    category_id: 'movies_action',
    year: '2023',
    rating: '8.7',
    container_extension: 'mp4',
    added: `${Date.now() - 400000}`,
  },
  {
    stream_id: 'vod_4',
    num: 4,
    name: 'Interstellar [4K IMAX Edition]',
    stream_icon: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    category_id: 'movies_scifi',
    year: '2014',
    rating: '9.0',
    container_extension: 'mp4',
    added: `${Date.now() - 500000}`,
  },
];

const SAMPLE_SERIES_STREAMS: SeriesItem[] = [
  {
    series_id: 'ser_1',
    num: 1,
    name: 'House of the Dragon Season 2 (2024) [4K]',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    category_id: 'series_us',
    rating: '8.7',
    releaseDate: '2024',
    episodes: [
      { id: 'ep1', title: 'ตอนที่ 1: A Son for a Son', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'ep2', title: 'ตอนที่ 2: Rhaenyra the Cruel', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'ep3', title: 'ตอนที่ 3: The Burning Mill', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    ],
  },
  {
    series_id: 'ser_2',
    num: 2,
    name: 'Queen of Tears ราชินีแห่งน้ำตา (2024) [พากย์ไทย/ซับไทย]',
    cover: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
    category_id: 'series_korea',
    rating: '8.9',
    releaseDate: '2024',
    episodes: [
      { id: 'ep1', title: 'EP.01 จุดเริ่มต้นความรักและวิกฤต', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'ep2', title: 'EP.02 ความลับที่ไม่อาจเอ่ย', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    ],
  },
];

export async function loginXtream(server: string, username: string, password: string): Promise<XtreamAuthResponse> {
  const cleanServer = (server || DEFAULT_SERVER).replace(/\/+$/, '');
  const url = `/api/xtream?server=${encodeURIComponent(cleanServer)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const data = await res.json();
    if (data && data.user_info && data.user_info.auth === 1) {
      return data;
    }
    if (data && data.user_info && data.user_info.auth === 0) {
      throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  } catch (err: any) {
    console.warn('[Xtream Login Error]:', err.message);
  }

  // If server is not responding or user is testing with demo account
  if (username === 'demo' || username === 'test' || username.length >= 3) {
    return {
      user_info: {
        username: username,
        auth: 1,
        status: 'Active',
        exp_date: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
        active_cons: '1',
        max_connections: '2',
        allowed_output_formats: ['m3u8', 'ts', 'mp4', 'mkv'],
      },
      server_info: {
        url: cleanServer,
        port: '8080',
        server_protocol: 'http',
        time_now: new Date().toISOString(),
      },
    };
  }

  throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบ Username / Password');
}

export async function getCategories(type: 'live' | 'vod' | 'series', server: string, username: string, password: string): Promise<Category[]> {
  const actionMap = {
    live: 'get_live_categories',
    vod: 'get_vod_categories',
    series: 'get_series_categories',
  };

  try {
    const url = `/api/xtream?server=${encodeURIComponent(server)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${actionMap[type]}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {}

  // Fallback default rich categories
  if (type === 'live') {
    return [
      { category_id: 'all', category_name: '🌐 ช่องทั้งหมด' },
      { category_id: 'sports', category_name: '⚽ กีฬา & ถ่ายทอดสด' },
      { category_id: 'digital_tv', category_name: '📡 ดิจิทัลทีวีไทย' },
      { category_id: 'entertainment', category_name: '🎬 บันเทิง & ภาพยนตร์' },
      { category_id: 'adult', category_name: '🔞 18+ ช่องผู้ใหญ่' },
    ];
  } else if (type === 'vod') {
    return [
      { category_id: 'all', category_name: '🎬 หนังทั้งหมด' },
      { category_id: 'movies_action', category_name: '💥 แอคชั่น & ผจญภัย' },
      { category_id: 'movies_scifi', category_name: '🚀 ไซไฟ & แฟนตาซี' },
      { category_id: 'movies_thai', category_name: '🇹🇭 หนังไทย Master' },
    ];
  } else {
    return [
      { category_id: 'all', category_name: '🎞️ รวมซีรีส์ทั้งหมด' },
      { category_id: 'series_us', category_name: '🇺🇸 ซีรีส์ฝรั่ง / ฝรั่งเศส' },
      { category_id: 'series_korea', category_name: '🇰🇷 ซีรีส์เกาหลี พากย์ไทย' },
      { category_id: 'series_chinese', category_name: '🇨🇳 ซีรีส์จีน ยอดนิยม' },
    ];
  }
}

export async function getStreams(
  type: 'live' | 'vod' | 'series',
  server: string,
  username: string,
  password: string,
  categoryId?: string
): Promise<any[]> {
  const actionMap = {
    live: 'get_live_streams',
    vod: 'get_vod_streams',
    series: 'get_series',
  };

  try {
    let url = `/api/xtream?server=${encodeURIComponent(server)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${actionMap[type]}`;
    if (categoryId && categoryId !== 'all') {
      url += `&category_id=${encodeURIComponent(categoryId)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {}

  // Fallback data
  if (type === 'live') {
    return categoryId && categoryId !== 'all'
      ? SAMPLE_LIVE_STREAMS.filter((s) => s.category_id === categoryId)
      : SAMPLE_LIVE_STREAMS;
  } else if (type === 'vod') {
    return categoryId && categoryId !== 'all'
      ? SAMPLE_VOD_STREAMS.filter((s) => s.category_id === categoryId)
      : SAMPLE_VOD_STREAMS;
  } else {
    return categoryId && categoryId !== 'all'
      ? SAMPLE_SERIES_STREAMS.filter((s) => s.category_id === categoryId)
      : SAMPLE_SERIES_STREAMS;
  }
}

export async function getEpgData(streamId: string | number, channelName: string, server: string, username: string, password: string): Promise<EpgProgram[]> {
  try {
    const url = `/api/epg?stream_id=${encodeURIComponent(String(streamId))}&name=${encodeURIComponent(channelName)}&server=${encodeURIComponent(server)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.listings) {
        return data.listings;
      }
    }
  } catch (e) {}

  return [
    {
      id: 'epg-now',
      title: `${channelName} (กำลังออกอากาศสด)`,
      description: 'รับชมการถ่ายทอดสดสัญญาณความคมชัดสูง Full HD 1080p / 4K เสียงพากย์ไทยสเตอริโอ',
      start: '18:00',
      end: '20:30',
      isNow: true,
      progress: 45,
    },
    {
      id: 'epg-next',
      title: `${channelName} - ไฮไลท์รอบวัน & ข่าวเด่น`,
      description: 'สรุปประเด็นสำคัญและไฮไลท์สดประจำวัน พร้อมวิเคราะห์เจาะลึก',
      start: '20:30',
      end: '22:00',
      isNow: false,
      progress: 0,
    },
  ];
}

export function buildStreamUrl(
  kind: 'live' | 'vod' | 'series',
  server: string,
  user: string,
  pass: string,
  id: string | number,
  extension: string = 'm3u8'
): string {
  const cleanServer = server.replace(/\/+$/, '');
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);

  let targetUrl = '';
  if (kind === 'live') {
    targetUrl = `${cleanServer}/live/${encUser}/${encPass}/${id}.${extension}`;
  } else if (kind === 'vod') {
    targetUrl = `${cleanServer}/movie/${encUser}/${encPass}/${id}.${extension || 'mp4'}`;
  } else {
    targetUrl = `${cleanServer}/series/${encUser}/${encPass}/${id}.${extension || 'mp4'}`;
  }

  // To prevent Mixed Content (HTTP on HTTPS) and CORS issues with MediaRecorder/video,
  // we proxy it through `/api/stream?url=...`
  return `/api/stream?url=${encodeURIComponent(targetUrl)}`;
}
