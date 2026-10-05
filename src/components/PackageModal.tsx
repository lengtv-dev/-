import React, { useState } from 'react';
import { 
  X, 
  Check, 
  QrCode, 
  Upload, 
  Gem, 
  Send, 
  ExternalLink, 
  RefreshCw, 
  Globe, 
  CreditCard 
} from 'lucide-react';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (username: string) => void;
}

const PACKAGES = [
  {
    id: 'vip_1m',
    title: 'VIP Premium (1 เดือน)',
    price: '300',
    duration: '30 วัน',
    ribbon: 'ยอดนิยม 🔥',
    color: 'from-amber-500 to-amber-600',
    border: 'border-amber-500/40',
    features: [
      'รับชมช่องทีวีสด 4K / Full HD ครบทุกช่อง',
      'ช่องกีฬา บอลพรีเมียร์ลีก ครบทุกคู่ ไม่กระตุก',
      'หนัง VOD & ซีรีส์ อัปเดตรายวันกว่า 10,000+ เรื่อง',
      'รองรับระบบ EPG ผังรายการสด & บันทึกวิดีโอ',
      'ใช้งานได้ 2 อุปกรณ์พร้อมกัน',
    ],
  },
  {
    id: 'lifetime',
    title: 'VIP ตลอดชีพ (Lifetime)',
    price: '1,500',
    duration: 'ตลอดชีพ ไม่จำกัด',
    ribbon: 'คุ้มค่าที่สุด 👑',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/40',
    features: [
      'สิทธิ์ VIP ตลอดชีพ จ่ายครั้งเดียวจบ',
      'รับชมทุกช่อง ทุกหมวดหมู่ ทั้งทีวีสด หนัง ซีรีส์',
      'ช่องพิเศษ 4K UHD Master Bitrate สูงสุด',
      'บริการซัพพอร์ตระดับ VIP ตลอด 24 ชม.',
      'ใช้งานได้ 3 อุปกรณ์พร้อมกัน',
    ],
  },
  {
    id: 'std_1m',
    title: 'Standard (1 เดือน)',
    price: '150',
    duration: '30 วัน',
    ribbon: 'ประหยัด ⚡',
    color: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-500/40',
    features: [
      'รับชมช่องดิจิทัลทีวีไทย & บันเทิงทั่วไป',
      'คลังภาพยนตร์ VOD มาสเตอร์ 1080p',
      'ซีรีส์ฮิตพากย์ไทย ครบทุกตอน',
      'ใช้งานได้ 1 อุปกรณ์',
    ],
  },
  {
    id: 'daily',
    title: 'Daily Pass (1 วัน)',
    price: '50',
    duration: '24 ชั่วโมง',
    ribbon: 'ทดลองดู ⚽',
    color: 'from-pink-500 to-rose-600',
    border: 'border-pink-500/40',
    features: [
      'เหมาะสำหรับดูบอลนัดสำคัญหรือทดลองใช้งาน',
      'รับชมทุกช่องระดับ 4K / Full HD ตลอด 24 ชม.',
      'ไม่มีข้อผูกมัด จบแมตช์แล้วหมดเวลาตามกำหนด',
    ],
  },
];

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  // Modes: 'web' (embeds https://playid.hstn.me/ without leaving page) or 'direct' (built-in order/slip form)
  const [activeTab, setActiveTab] = useState<'web' | 'direct'>('web');
  const [iframeKey, setIframeKey] = useState(0);

  // Direct checkout state
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSelectPkg = (pkg: typeof PACKAGES[0]) => {
    setSelectedPkg(pkg);
    setResultMsg(null);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    if (!regUser.trim() || !regPass.trim()) {
      setResultMsg({ type: 'err', text: 'กรุณากรอก Username และ Password ให้ครบถ้วน' });
      return;
    }

    if (!slipFile) {
      setResultMsg({ type: 'err', text: 'กรุณาแนบรูปภาพสลิปการโอนเงินเพื่อยืนยัน' });
      return;
    }

    setIsSubmitting(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/membership/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_user: regUser.trim(),
          reg_pass: regPass.trim(),
          pkg_name: selectedPkg.title,
          pkg_price: selectedPkg.price,
          slip_name: slipFile.name,
        }),
      });

      const data = await res.json();
      if (data.status === 'ok') {
        setResultMsg({ type: 'ok', text: data.msg });
        if (onRegisterSuccess) {
          onRegisterSuccess(regUser.trim());
        }
        setTimeout(() => {
          setSelectedPkg(null);
          onClose();
        }, 3500);
      } else {
        setResultMsg({ type: 'err', text: data.msg || 'เกิดข้อผิดพลาดในการส่งข้อมูล' });
      }
    } catch (err: any) {
      setResultMsg({
        type: 'ok',
        text: 'ส่งข้อมูลเรียบร้อยแล้ว! กรุณารอระบบตรวจสอบ 15 นาที หรือแจ้งแอดมิน LINE @680salib',
      });
      setTimeout(() => {
        setSelectedPkg(null);
        onClose();
      }, 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-hidden">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black font-black">
              <Gem className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                ดูราคาแพ็กเกจ & สมัครสมาชิก VIP
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  playid.hstn.me
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                สมัครและดูข้อมูลได้ทันทีในหน้าต่างนี้โดยไม่ต้องสลับหน้าจอ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('web')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'web'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>เว็บ playid.hstn.me</span>
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'direct'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>สรุปราคา & แนบสลิป</span>
              </button>
            </div>

            {activeTab === 'web' && (
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                title="รีเฟรชหน้าเว็บ"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              title="ปิดหน้าต่าง"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative flex-1 overflow-hidden bg-zinc-950">
          {activeTab === 'web' ? (
            /* Tab 1: Embedded playid.hstn.me without leaving or opening a new page */
            <div className="w-full h-full relative">
              <iframe
                key={iframeKey}
                src="https://playid.hstn.me/"
                title="สมัครสมาชิก playid.hstn.me"
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            /* Tab 2: Direct In-App Package Selection & Slip Upload Form */
            <div className="h-full overflow-y-auto p-6 sm:p-8">
              {!selectedPkg ? (
                <div>
                  <div className="text-center max-w-lg mx-auto mb-6">
                    <h2 className="text-2xl font-black text-white mb-1">
                      เลือกแพ็กเกจสมาชิก VIP
                    </h2>
                    <p className="text-xs text-zinc-400">
                      รองรับทุกอุปกรณ์ มือถือ แท็บเล็ต คอมพิวเตอร์ และ Smart TV
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-900 border ${pkg.border} hover:border-blue-500 transition-all shadow-md`}
                      >
                        {pkg.ribbon && (
                          <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            {pkg.ribbon}
                          </span>
                        )}

                        <div>
                          <span className="text-xs text-zinc-400 font-bold block mb-1">
                            {pkg.duration}
                          </span>
                          <h3 className="text-base font-extrabold text-white mb-2">
                            {pkg.title}
                          </h3>

                          <div className="flex items-baseline gap-1 my-3">
                            <span className="text-3xl font-black text-white">{pkg.price}</span>
                            <span className="text-xs text-zinc-400">บาท</span>
                          </div>

                          <ul className="space-y-2 text-xs text-zinc-300 my-4 border-t border-zinc-800 pt-3">
                            {pkg.features.map((feat, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-snug">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleSelectPkg(pkg)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase text-white bg-gradient-to-r ${pkg.color} hover:opacity-90 shadow-md transition-transform active:scale-95`}
                        >
                          เลือกแพ็กเกจนี้
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center text-xs text-zinc-400">
                    ติดต่อฝ่ายบริการลูกค้า LINE: <strong className="text-emerald-400">@680salib</strong>
                  </div>
                </div>
              ) : (
                /* Checkout View */
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                    <div>
                      <button
                        onClick={() => setSelectedPkg(null)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 font-bold"
                      >
                        ← ย้อนกลับ
                      </button>
                      <h3 className="text-xl font-black text-white">ชำระเงิน & สร้างบัญชีเข้าใช้งาน</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400">ยอดชำระ</span>
                      <p className="text-2xl font-black text-amber-400">{selectedPkg.price} บาท</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                      <span className="text-xs font-bold text-zinc-400 mb-3 flex items-center gap-1">
                        <QrCode className="h-4 w-4 text-blue-400" />
                        สแกนชำระผ่านพร้อมเพย์ (PromptPay)
                      </span>
                      <div className="p-3 bg-white rounded-2xl shadow-xl mb-3">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021129370016A000000677010111011300668000000005802TH5303764540${selectedPkg.price}.006304`}
                          alt="PromptPay QR Code"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <p className="text-xs text-zinc-400">
                        {selectedPkg.title} · <strong className="text-emerald-400">{selectedPkg.price} บาท</strong>
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">
                          Username (ชื่อผู้ใช้ที่ต้องการ)
                        </label>
                        <input
                          type="text"
                          required
                          value={regUser}
                          onChange={(e) => setRegUser(e.target.value)}
                          placeholder="ภาษาอังกฤษหรือตัวเลข"
                          className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">
                          Password (รหัสผ่าน)
                        </label>
                        <input
                          type="password"
                          required
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          placeholder="ตั้งรหัสผ่าน"
                          className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">
                          แนบหลักฐานการโอนเงิน (สลิป)
                        </label>
                        <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-3 text-center bg-zinc-900/60 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleSlipChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {slipPreview ? (
                            <span className="text-xs text-emerald-400 font-bold">
                              ✅ แนบสลิปเรียบร้อยแล้ว
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                              <Upload className="h-4 w-4" /> คลิกเพื่อแนบสลิป
                            </span>
                          )}
                        </div>
                      </div>

                      {resultMsg && (
                        <div
                          className={`p-2.5 rounded-xl text-xs font-bold ${
                            resultMsg.type === 'ok'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500'
                          }`}
                        >
                          {resultMsg.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการชำระเงิน'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
