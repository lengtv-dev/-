import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Download, 
  Camera, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  ExternalLink,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  ListVideo
} from 'lucide-react';
import { EpgProgram, Episode } from '../types/stream';
import { getEpgData } from '../services/xtreamApi';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  streamUrl: string;
  kind: 'live' | 'vod' | 'series';
  streamId: string | number;
  serverUrl: string;
  username: string;
  password: string;
  episodes?: Episode[];
  currentEpIndex?: number;
  onSelectEpisode?: (index: number) => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  savedPosition?: number;
  onSaveProgress?: (pos: number) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  streamUrl,
  kind,
  streamId,
  serverUrl,
  username,
  password,
  episodes = [],
  currentEpIndex = 0,
  onSelectEpisode,
  onPrevChannel,
  onNextChannel,
  savedPosition = 0,
  onSaveProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  // In-browser Stream Recording (ระบบบันทึกวิดีโอ)
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordSuccessMsg, setRecordSuccessMsg] = useState<string | null>(null);

  // EPG Real-time State (ระบบ EPG ผังรายการ)
  const [epgListings, setEpgListings] = useState<EpgProgram[]>([]);
  const [epgDrawerOpen, setEpgDrawerOpen] = useState(false);
  const [epDrawerOpen, setEpDrawerOpen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);

  // Load EPG data for live channels
  useEffect(() => {
    if (kind === 'live' && isOpen) {
      getEpgData(streamId, title, serverUrl, username, password).then((data) => {
        setEpgListings(data);
      });
    }
  }, [kind, streamId, title, isOpen, serverUrl, username, password]);

  // Video playback & HLS initialization
  useEffect(() => {
    if (!isOpen || !streamUrl) return;

    setPlayerError(null);
    const video = videoRef.current;
    if (!video) return;

    // Check if resume position exists
    if (savedPosition > 10 && kind !== 'live') {
      setResumePrompt(savedPosition);
    } else {
      setResumePrompt(null);
    }

    // Cleanup previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = streamUrl.includes('.m3u8') || kind === 'live';

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS Network Error] Retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS Media Error] Recovering...');
              hls.recoverMediaError();
              break;
            default:
              setPlayerError('ไม่สามารถเล่นสตรีม HLS ได้ กรุณาลองเปิดด้วย VLC หรือตรวจสอบการเชื่อมต่อ');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHlsStream) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
    };
  }, [isOpen, streamUrl, kind]);

  // Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastSave = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSave > 5000 && onSaveProgress && kind !== 'live') {
        lastSave = now;
        onSaveProgress(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onSaveProgress, kind]);

  if (!isOpen) return null;

  // 1. In-Browser Stream Video Recording Handler (MediaRecorder)
  const startRecording = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Capture stream from HTMLMediaElement
      let stream: MediaStream | null = null;
      if ((video as any).captureStream) {
        stream = (video as any).captureStream();
      } else if ((video as any).mozCaptureStream) {
        stream = (video as any).mozCaptureStream();
      }

      if (!stream) {
        alert('เบราว์เซอร์ของคุณไม่รองรับ captureStream กรุณาใช้ Chrome, Edge หรือ Firefox เวอร์ชั่นล่าสุด');
        return;
      }

      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const cleanTitle = title.replace(/[^\w\sก-๙-]/gi, '_').substring(0, 30);
        a.href = url;
        a.download = `บันทึกรายการ_${cleanTitle}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        setRecordSuccessMsg('บันทึกวิดีโอสำเร็จและเริ่มดาวน์โหลดไฟล์แล้ว!');
        setTimeout(() => setRecordSuccessMsg(null), 4000);
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
    } catch (err: any) {
      console.error('[Recording Error]:', err);
      alert('ไม่สามารถเริ่มบันทึกวิดีโอได้: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 2. Snapshot Tool
  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        const cleanTitle = title.replace(/[^\w\sก-๙-]/gi, '_').substring(0, 30);
        a.href = dataUrl;
        a.download = `ภาพแคปเจอร์_${cleanTitle}_${Date.now()}.png`;
        a.click();
      }
    } catch (e) {
      alert('ไม่สามารถแคปภาพได้เนื่องจากข้อจำกัดด้านความปลอดภัยของสตรีมภายนอก');
    }
  };

  // 3. Open in VLC / External Player
  const openInVlc = () => {
    const cleanUrl = streamUrl.startsWith('/api/stream?url=')
      ? decodeURIComponent(streamUrl.replace('/api/stream?url=', ''))
      : streamUrl;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      const match = cleanUrl.match(/^(https?):\/\/(.*)$/i);
      if (match) {
        window.location.href = `intent://${match[2]}#Intent;package=org.videolan.vlc;scheme=${match[1]};type=video/*;end`;
        return;
      }
    } else if (isIOS) {
      window.location.href = `vlc://${cleanUrl}`;
      return;
    }

    // Desktop: Generate M3U playlist file to open instantly in VLC
    const m3uContent = `#EXTM3U\n#EXTINF:-1,${title}\n${cleanUrl}\n`;
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${title.replace(/[^\w\sก-๙-]/gi, '_')}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  };

  // 4. Toggle Fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      const playerBox = document.getElementById('playerContainerBox');
      if (playerBox && playerBox.requestFullscreen) {
        playerBox.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const nowPlaying = epgListings.find((p) => p.isNow) || epgListings[0];
  const nextPlaying = epgListings[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      
      {/* Player Modal Container */}
      <div 
        id="playerContainerBox"
        className="relative flex flex-col w-full max-w-6xl max-h-[96vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden"
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {kind === 'live' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-[10px] font-bold">
                {kind === 'series' ? 'SERIES' : 'MOVIE'}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-extrabold truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Record Status Blinker */}
            {isRecording && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-400 text-xs font-black animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>REC {formatTime(recordSeconds)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              title="ปิดเครื่องเล่น (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Area & Overlay Drawer */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[460px]">
          
          <video
            ref={videoRef}
            playsInline
            controls={false}
            className={`w-full max-h-[70vh] bg-black ${
              aspectRatio === 'fill' ? 'object-fill h-full' : aspectRatio === 'cover' ? 'object-cover h-full' : 'object-contain'
            }`}
            onClick={() => {
              const video = videoRef.current;
              if (video) {
                if (video.paused) {
                  video.play();
                  setIsPlaying(true);
                } else {
                  video.pause();
                  setIsPlaying(false);
                }
              }
            }}
          />

          {/* Resume Playback Prompt Banner */}
          {resumePrompt && (
            <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-20 flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/95 text-white border border-zinc-700 shadow-xl backdrop-blur-md">
              <Clock className="h-5 w-5 text-blue-400" />
              <div className="text-xs">
                <p className="font-bold">รับชมค้างไว้ที่ {formatTime(Math.floor(resumePrompt))}</p>
                <p className="text-zinc-400 text-[11px]">ต้องการดูต่อจากเดิมหรือไม่?</p>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = resumePrompt;
                    setResumePrompt(null);
                  }}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  ดูต่อ
                </button>
                <button
                  onClick={() => setResumePrompt(null)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  เริ่มใหม่
                </button>
              </div>
            </div>
          )}

          {/* Recording Toast Message */}
          {recordSuccessMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg animate-bounce">
              {recordSuccessMsg}
            </div>
          )}

          {/* Player Error Banner */}
          {playerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/85 text-center z-10">
              <p className="text-rose-400 text-sm font-bold mb-3 max-w-md">{playerError}</p>
              <div className="flex gap-2">
                <button
                  onClick={openInVlc}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  🎬 เปิดใน VLC Player
                </button>
                <button
                  onClick={() => {
                    setPlayerError(null);
                    if (videoRef.current) videoRef.current.load();
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}

          {/* Side Drawer: EPG Schedule Viewer */}
          {epgDrawerOpen && (
            <div className="absolute inset-y-0 right-0 w-80 max-w-full z-30 bg-zinc-950/95 border-l border-zinc-800 p-4 overflow-y-auto backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  ผังรายการสด EPG
                </span>
                <button
                  onClick={() => setEpgDrawerOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {epgListings.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      p.isNow
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                      <span>{p.start} - {p.end}</span>
                      {p.isNow && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-black text-[9px]">
                          กำลังฉาย
                        </span>
                      )}
                    </div>
                    <p className="font-extrabold text-white mb-1">{p.title}</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side Drawer: Episodes Picker for Series */}
          {epDrawerOpen && episodes.length > 0 && (
            <div className="absolute inset-y-0 right-0 w-72 max-w-full z-30 bg-zinc-950/95 border-l border-zinc-800 p-4 overflow-y-auto backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <ListVideo className="h-4 w-4 text-blue-500" />
                  เลือกตอนรับชม ({episodes.length} ตอน)
                </span>
                <button
                  onClick={() => setEpDrawerOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.id || idx}
                    onClick={() => {
                      if (onSelectEpisode) onSelectEpisode(idx);
                      setEpDrawerOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      idx === currentEpIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {ep.title || `ตอนที่ ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Real-time EPG Live Bar (When watching Live TV) */}
        {kind === 'live' && nowPlaying && (
          <div className="px-4 py-2.5 bg-zinc-900/90 border-t border-zinc-800/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold text-blue-400 flex items-center gap-1">
                  <Radio className="h-3.5 w-3.5" />
                  ตอนนี้:
                </span>
                <span className="font-bold text-zinc-100 truncate">{nowPlaying.title}</span>
                <span className="text-[11px] text-zinc-400 shrink-0">
                  ({nowPlaying.start} - {nowPlaying.end})
                </span>
              </div>

              {/* Live progress indicator bar */}
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${nowPlaying.progress || 50}%` }}
                />
              </div>
            </div>

            {nextPlaying && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 shrink-0 pl-4 border-l border-zinc-800">
                <span className="text-zinc-500 font-semibold">ถัดไป:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{nextPlaying.title}</span>
                <span className="text-[11px]">({nextPlaying.start})</span>
              </div>
            )}

            <button
              onClick={() => setEpgDrawerOpen(!epgDrawerOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shrink-0 self-end sm:self-auto"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>ดูผังรายการ</span>
            </button>
          </div>
        )}

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-zinc-900 border-t border-zinc-800 text-white">
          
          {/* Left Controls: Play/Pause, Channel Switching, Mute */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (video.paused) {
                  video.play();
                  setIsPlaying(true);
                } else {
                  video.pause();
                  setIsPlaying(false);
                }
              }}
              title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            {kind === 'live' && onPrevChannel && (
              <button
                onClick={onPrevChannel}
                title="ช่องก่อนหน้า"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">⏮</span>
              </button>
            )}

            {kind === 'live' && onNextChannel && (
              <button
                onClick={onNextChannel}
                title="ช่องถัดไป"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">⏭</span>
              </button>
            )}

            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.muted = !video.muted;
                  setIsMuted(video.muted);
                }
              }}
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Middle Controls: Video Recorder & Snapshot Tool */}
          <div className="flex items-center gap-2">
            {/* 🔴 ระบบบันทึกวิดีโอ (In-browser Stream Recorder) */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>บันทึกวิดีโอ (REC)</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-red-500 text-red-400 hover:bg-zinc-700 text-xs font-bold transition-transform active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>หยุด & ดาวน์โหลด ({formatTime(recordSeconds)})</span>
              </button>
            )}

            {/* 📸 แคปรูปภาพ (Snapshot) */}
            <button
              onClick={captureSnapshot}
              title="แคปรูปภาพปัจจุบัน"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">แคปภาพ</span>
            </button>

            {/* Series episode list toggle */}
            {kind === 'series' && episodes.length > 0 && (
              <button
                onClick={() => setEpDrawerOpen(!epDrawerOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                <ListVideo className="h-3.5 w-3.5" />
                <span>เลือกตอน ({currentEpIndex + 1}/{episodes.length})</span>
              </button>
            )}
          </div>

          {/* Right Controls: Aspect Ratio, External VLC, Fullscreen */}
          <div className="flex items-center gap-1.5">
            {/* Aspect Ratio Switcher */}
            <button
              onClick={() => {
                const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'fill', 'cover'];
                const next = modes[(modes.indexOf(aspectRatio) + 1) % modes.length];
                setAspectRatio(next);
              }}
              title={`ปรับอัตราส่วนจอภาพ: ${aspectRatio}`}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
            >
              {aspectRatio === 'contain' ? '16:9' : aspectRatio === 'fill' ? 'ยืดเต็ม' : 'ซูม'}
            </button>

            {/* VLC Button */}
            <button
              onClick={openInVlc}
              title="เปิดในแอป VLC"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">เปิดใน VLC</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'ย่อหน้าจอ' : 'เปิดเต็มจอ'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
