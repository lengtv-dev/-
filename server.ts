import express, { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_SERVER = 'http://103.114.203.129:8080';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Enable CORS for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory registration and monitor storage
interface Registration {
  id: string;
  username: string;
  pkgName: string;
  pkgPrice: string;
  slipName?: string;
  hasSlip: boolean;
  createdAt: string;
  status: 'pending' | 'approved';
}

const registrations: Registration[] = [];
let activeSessions: Record<string, { username: string; title: string; device: string; duration: number; lastPing: number }> = {};

// 1. Xtream Codes API Proxy
app.get('/api/xtream', async (req: Request, res: Response) => {
  try {
    const serverUrl = (req.query.server as string) || DEFAULT_SERVER;
    const cleanServer = serverUrl.replace(/\/+$/, '');

    // Build target query string excluding 'server'
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'server' && typeof value === 'string') {
        queryParams.append(key, value);
      }
    }

    const targetUrl = `${cleanServer}/player_api.php?${queryParams.toString()}`;

    const protocol = targetUrl.startsWith('https') ? https : http;
    const clientReq = protocol.get(targetUrl, { timeout: 15000 }, (remoteRes) => {
      res.status(remoteRes.statusCode || 200);
      for (const [key, val] of Object.entries(remoteRes.headers)) {
        if (key.toLowerCase() !== 'content-security-policy' && val) {
          res.setHeader(key, val);
        }
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      remoteRes.pipe(res);
    });

    clientReq.on('error', (err) => {
      console.error('[API Xtream Proxy Error]:', err.message);
      res.status(502).json({ error: 'Proxy fetch failed', message: err.message });
    });

    clientReq.on('timeout', () => {
      clientReq.destroy();
      res.status(504).json({ error: 'Xtream server timeout' });
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// 2. Stream Media Proxy (TS / M3U8 / MP4 / MKV) with Range Support & CORS
app.get('/api/stream', (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const decodedUrl = decodeURIComponent(rawUrl);
    const protocol = decodedUrl.startsWith('https') ? https : http;

    const headers: Record<string, string> = {
      'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const clientReq = protocol.get(decodedUrl, { headers, timeout: 20000 }, (remoteRes) => {
      const statusCode = remoteRes.statusCode || 200;
      res.status(statusCode);

      // Copy headers safely
      for (const [key, val] of Object.entries(remoteRes.headers)) {
        if (val && !['content-security-policy', 'access-control-allow-origin'].includes(key.toLowerCase())) {
          res.setHeader(key, val);
        }
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Accept-Ranges', 'bytes');

      // Rewrite relative URLs inside M3U8 playlist to point back through our proxy
      const isM3u8 = decodedUrl.includes('.m3u8') || (remoteRes.headers['content-type'] && remoteRes.headers['content-type'].includes('mpegurl'));
      if (isM3u8) {
        let body = '';
        remoteRes.setEncoding('utf8');
        remoteRes.on('data', chunk => { body += chunk; });
        remoteRes.on('end', () => {
          const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
          // Replace relative lines with proxied lines
          const modified = body.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              let fullSegmentUrl = trimmed;
              if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                fullSegmentUrl = baseUrl + trimmed;
              }
              return `/api/stream?url=${encodeURIComponent(fullSegmentUrl)}`;
            }
            return line;
          }).join('\n');

          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          res.send(modified);
        });
      } else {
        remoteRes.pipe(res);
      }
    });

    clientReq.on('error', (err) => {
      console.error('[Stream Proxy Error]:', err.message);
      if (!res.headersSent) {
        res.status(502).send('Error streaming media: ' + err.message);
      }
    });

    clientReq.on('timeout', () => {
      clientReq.destroy();
      if (!res.headersSent) {
        res.status(504).send('Stream source connection timed out');
      }
    });
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).send('Stream Proxy Internal Error: ' + err.message);
    }
  }
});

// 3. EPG (Electronic Program Guide) Endpoint
app.get('/api/epg', async (req: Request, res: Response) => {
  try {
    const streamId = req.query.stream_id as string;
    const channelName = (req.query.name as string) || '';
    const serverUrl = (req.query.server as string) || DEFAULT_SERVER;
    const username = (req.query.username as string) || '';
    const password = (req.query.password as string) || '';

    // If username and password are provided, attempt to query the remote server's short EPG
    if (streamId && username && password) {
      const epgUrl = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_short_epg&stream_id=${encodeURIComponent(streamId)}`;
      try {
        const fetchRes = await fetch(epgUrl, { signal: AbortSignal.timeout(4000) });
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          if (data && data.epg_listings && data.epg_listings.length > 0) {
            return res.json({ status: 'ok', source: 'xtream', listings: data.epg_listings });
          }
        }
      } catch (e) {
        // Fallback to real-time generated EPG
      }
    }

    // Generate real-time realistic EPG based on current time & channel type
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Generate 4 program slots around current time
    const channelPrograms: Record<string, string[]> = {
      sports: ['ถ่ายทอดสด ฟุตบอลพรีเมียร์ลีก บิ๊กแมตช์', 'ไฮไลท์ฟุตบอลยุโรป & วิเคราะห์', 'กีฬาทั่วโลก เวลาจริง', 'สรุปเกมดังประจำวัน'],
      news: ['ข่าวเด่นประเด็นร้อน รอบวัน', 'คุยข่าวเช้า / เที่ยง เจาะลึกสถานการณ์', 'วิเคราะห์เศรษฐกิจและการเมือง', 'ข่าวภาคค่ำสรุปเหตุการณ์'],
      movies: ['ภาพยนตร์บล็อกบัสเตอร์ ฟอร์มยักษ์', 'แอคชั่นไซไฟ มันส์ระห่ำ', 'ภาพยนตร์ตลกสุดฮา', 'เรื่องยาวประจำวัน'],
      default: ['รายการวาไรตี้บันเทิงยามเย็น', 'ละครซีรีส์ดัง ช่วงไพรม์ไทม์', 'รายการข่าวและเสริมความรู้', 'คอนเทนต์สุดฮิตประจำคืน'],
    };

    const lower = channelName.toLowerCase();
    let category = 'default';
    if (lower.includes('sport') || lower.includes('บอล') || lower.includes('bein') || lower.includes('true') || lower.includes('premier')) {
      category = 'sports';
    } else if (lower.includes('news') || lower.includes('ข่าว') || lower.includes('mono') || lower.includes('ch3') || lower.includes('ch7') || lower.includes('thairath')) {
      category = 'news';
    } else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('hbo') || lower.includes('หนัง')) {
      category = 'movies';
    }

    const list = channelPrograms[category];
    const listings = list.map((title, idx) => {
      const startH = (currentHour + idx - 1 + 24) % 24;
      const endH = (startH + 1) % 24;
      const startStr = `${String(startH).padStart(2, '0')}:00`;
      const endStr = `${String(endH).padStart(2, '0')}:00`;
      const isNowPlaying = (idx === 1);
      const progressPercent = isNowPlaying ? Math.min(100, Math.max(5, Math.floor((currentMinute / 60) * 100))) : (idx < 1 ? 100 : 0);

      return {
        id: `epg-${streamId || 'ch'}-${idx}`,
        title,
        description: `รายการ ${title} รับชมแบบคมชัด Full HD / 4K ผ่าน STREAM M3U Player`,
        start: startStr,
        end: endStr,
        isNow: isNowPlaying,
        progress: progressPercent,
      };
    });

    res.json({ status: 'ok', source: 'generated', listings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Membership / Registration Handler
app.post('/api/membership/register', (req: Request, res: Response) => {
  try {
    const { reg_user, reg_pass, pkg_name, pkg_price, slip_name } = req.body;
    if (!reg_user || !reg_pass) {
      return res.status(400).json({ status: 'error', msg: 'กรุณากรอก Username และ Password' });
    }

    const reg: Registration = {
      id: 'REG-' + Date.now(),
      username: reg_user,
      pkgName: pkg_name || 'VIP Package',
      pkgPrice: pkg_price || '300',
      slipName: slip_name || 'slip_uploaded.jpg',
      hasSlip: true,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    registrations.unshift(reg);
    res.json({
      status: 'ok',
      msg: 'ส่งข้อมูลสมัครสมาชิกเรียบร้อยแล้ว! กำลังตรวจสอบสลิปภายใน 15 นาที',
      regId: reg.id,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', msg: err.message });
  }
});

// 5. Watch Session Ping / Monitor
app.post('/api/monitor/ping', (req: Request, res: Response) => {
  const { user, title, device, duration } = req.body;
  if (user) {
    activeSessions[user] = {
      username: user,
      title: title || 'รับชมรายการ',
      device: device || 'Web Browser',
      duration: duration || 0,
      lastPing: Date.now(),
    };
  }
  res.json({ status: 'ok' });
});

// Vite & Static file handling
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Stream M3U Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
