import React from 'react';
import { X, ExternalLink, Flame } from 'lucide-react';

interface SportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SportsModal: React.FC<SportsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-red-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            <h3 className="text-base font-extrabold">
              ⚽ ตารางถ่ายทอดสดกีฬา & บอลสดวันนี้ (playid.hstn.me/tvonline)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://playid.hstn.me/tvonline"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-black/20 hover:bg-black/40 text-xs font-bold transition-colors"
            >
              <span>เปิดในแท็บใหม่</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="relative flex-1 bg-zinc-900">
          <iframe
            src="https://playid.hstn.me/tvonline"
            title="Sports Live Schedule"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

      </div>
    </div>
  );
};
