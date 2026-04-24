import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Building2, Package, ShoppingBag, Calendar as CalendarIcon, 
  DollarSign, MessageSquare, Map as MapIcon, LogOut, Bell, 
  Moon, Sun, Edit3, Trash2, CheckCircle, Plus, Image as ImageIcon, Send,
  Menu, X, FileText, Activity, Eye, EyeOff, Search, Filter, AlertCircle,
  LayoutGrid, List as ListIcon, Database, Download, Upload, FileSpreadsheet, Settings
} from 'lucide-react';

// --- SES SİSTEMİ ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  try {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if(type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else if(type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch(e) { console.error("Audio error", e); }
};

export default function App() {
  // --- DURUMLAR (STATES) ---
  const [isLogged, setIsLogged] = useState(false);
  const [activeUser, setActiveUser] = useState("");
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('yaer_theme') || 'dark');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- GÜVENLİK DURUMLARI ---
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isUnlockMode, setIsUnlockMode] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => setLockoutTime(prev => prev - 1), 1000);
    } else if (lockoutTime === 0 && loginAttempts >= 3) {
      setLoginAttempts(0);
    }
    return () => clearInterval(timer);
  }, [lockoutTime, loginAttempts]);

  // Veri Durumları
  const [notes, setNotes] = useState(localStorage.getItem('yaer_notes') || "");
  const [kurumlar, setKurumlar] = useState(() => JSON.parse(localStorage.getItem('yaer_kurumlar')) || []);
  const [siparisler, setSiparisler] = useState(() => JSON.parse(localStorage.getItem('yaer_siparisler')) || []);
  const [planlar, setPlanlar] = useState(() => JSON.parse(localStorage.getItem('yaer_planlar')) || []);
  const [urunler, setUrunler] = useState(() => JSON.parse(localStorage.getItem('yaer_urunler')) || []);
  const [finans, setFinans] = useState(() => JSON.parse(localStorage.getItem('yaer_finans')) || []);
  const [mesajlar, setMesajlar] = useState(() => JSON.parse(localStorage.getItem('yaer_mesajlar')) || []);

  // --- EFEKTLER ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('yaer_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => localStorage.setItem('yaer_kurumlar', JSON.stringify(kurumlar)), [kurumlar]);
  useEffect(() => localStorage.setItem('yaer_siparisler', JSON.stringify(siparisler)), [siparisler]);
  useEffect(() => localStorage.setItem('yaer_planlar', JSON.stringify(planlar)), [planlar]);
  useEffect(() => localStorage.setItem('yaer_urunler', JSON.stringify(urunler)), [urunler]);
  useEffect(() => localStorage.setItem('yaer_finans', JSON.stringify(finans)), [finans]);
  useEffect(() => localStorage.setItem('yaer_mesajlar', JSON.stringify(mesajlar)), [mesajlar]);
  useEffect(() => localStorage.setItem('yaer_notes', notes), [notes]);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeOrdersCount = siparisler.filter(s => s.durum !== "Teslim Edildi").length;
  const todaysPlans = planlar.filter(p => p.tarih === todayStr && !p.tamamlandi);

  let notifications = [];
  if (mesajlar.length > 0 && mesajlar[mesajlar.length - 1].gonderen !== activeUser) {
    notifications.push(`💬 Yeni Mesaj: ${mesajlar[mesajlar.length - 1].gonderen}`);
  }
  todaysPlans.forEach(p => notifications.push(`📅 BUGÜN: ${p.baslik}`));

  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutTime > 0) { playSound('error'); return; }
    const u = e.target.username.value.toLowerCase().trim();
    const p = e.target.password.value;

    if ((u === "ömer bey" || u === "omer bey") && p === "123456") { 
      setActiveUser("Ömer Bey");
      setIsLogged(true); setLoginAttempts(0); playSound('success'); 
    } else if ((u === "yağız bey" || u === "yagiz bey") && p === "654321") { 
      setActiveUser("Yağız Bey");
      setIsLogged(true); setLoginAttempts(0); playSound('success'); 
    } else { 
      playSound('error'); 
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) setIsUnlockMode(true);
      else alert(`Hatalı giriş! Kalan deneme hakkınız: ${3 - newAttempts}`); 
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (unlockCode === "YAER123") {
        setLoginAttempts(0); setIsUnlockMode(false); setUnlockCode(""); playSound('success');
    } else {
        setLockoutTime(60); setIsUnlockMode(false); setUnlockCode(""); playSound('error');
    }
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-orange-500/20 blur-3xl"></div>
           <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>
        <div className="relative z-10 w-full max-w-md p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30 transform -rotate-6">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">YAER</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-8">"Yağız ve Ömer'e güven."</p>
          
          {isUnlockMode ? (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
                Çok fazla hatalı giriş yaptınız. Beklememek için kilit açma kodunu girin veya yanlış girip 1 dakika bekleyin.
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Kilit Açma Kodu" required value={unlockCode} onChange={e=>setUnlockCode(e.target.value)} 
                  className="w-full px-5 py-3 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1">KİLİDİ AÇ</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="username" type="text" placeholder="Kullanıcı Adı" required disabled={lockoutTime > 0}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-white disabled:opacity-50" />
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Şifre" required disabled={lockoutTime > 0}
                  className="w-full px-5 py-3 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-white disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={lockoutTime > 0} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-50">
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {lockoutTime > 0 && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-bold animate-pulse">Lütfen {lockoutTime} saniye bekleyin.</div>}
              <button type="submit" disabled={lockoutTime > 0} className="w-full py-3 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50">SİSTEME GİRİŞ YAP</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- YARDIMCI BİLEŞENLER ---
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      {children}
    </div>
  );
  const Input = ({ className = "", ...props }) => (
    <input className={`px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-white ${className}`} {...props} />
  );
  const Select = ({ children, className = "", ...props }) => (
    <select className={`px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-white ${className}`} {...props}>
      {children}
    </select>
  );
  const Button = ({ children, variant = 'primary', onClick, className="" }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ";
    const variants = {
      primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20",
      secondary: "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20",
      success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
      danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20",
      ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
    };
    return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
  };

  // --- MODÜL İÇERİKLERİ ---

  const Dashboard = () => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0,0,0,0);

    // İstatistiksel Hesaplamalar
    const kurumSiparisSayilari = siparisler.reduce((acc, curr) => {
        acc[curr.kurum] = (acc[curr.kurum] || 0) + 1;
        return acc;
    }, {});
    const top5Kurum = Object.entries(kurumSiparisSayilari).sort(([,a], [,b]) => b - a).slice(0, 5);

    const gelTop = finans.filter(f=>f.tip==='Gelir').reduce((a,b)=>a+b.tutar,0);
    const gidTop = finans.filter(f=>f.tip==='Gider').reduce((a,b)=>a+b.tutar,0);
    const totalFin = gelTop + gidTop || 1;
    const gelYuzde = (gelTop / totalFin) * 100;
    const gidYuzde = (gidTop / totalFin) * 100;

    return (
      <div className="space-y-6 fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hoş Geldiniz, {activeUser}</h2>
            <p className="text-slate-500 dark:text-slate-400">YAER Yönetim Sisteminin güncel özeti.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Aktif Sipariş", value: activeOrdersCount, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Kayıtlı Kurum", value: kurumlar.length, icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10" },
            { title: "Bugünkü Planlar", value: todaysPlans.length, icon: CalendarIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { title: "Toplam Ürün", value: urunler.length, icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={28} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Yeni Eklenen: İstatistikler ve Finans Çubukları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Building2 size={20}/> En Çok Sipariş Veren 5 Kurum</h3>
            <div className="space-y-4 mt-4">
              {top5Kurum.length > 0 ? top5Kurum.map(([kurumAd, miktar], idx) => (
                <div key={kurumAd} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <span className="text-sm font-bold text-slate-400 w-4">{idx+1}.</span>
                     <span className="font-medium text-slate-700 dark:text-slate-300">{kurumAd}</span>
                   </div>
                   <span className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">{miktar} Sipariş</span>
                </div>
              )) : <p className="text-slate-500 text-sm">Yeterli veri yok.</p>}
            </div>
           </Card>

           <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign size={20}/> Finansal Özet</h3>
            <div className="space-y-6 mt-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Gelir</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₺{gelTop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${gelYuzde}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Gider</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">₺{gidTop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${gidYuzde}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                 <span className="font-bold text-slate-600 dark:text-slate-400">Net Durum:</span>
                 <span className={`text-xl font-black ${gelTop - gidTop >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₺{(gelTop - gidTop).toLocaleString()}</span>
              </div>
            </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Package size={20}/> Son Bekleyen Siparişler</h3>
            <div className="space-y-3">
              {siparisler.filter(s => s.durum !== "Teslim Edildi").slice(0,4).map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      {s.kurum} 
                      {s.oncelik === 'Acil' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                    </p>
                    <p className="text-xs text-slate-500">{s.urun}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full font-medium">{s.durum}</span>
                </div>
              ))}
              {siparisler.length === 0 && <p className="text-slate-500 text-sm">Bekleyen sipariş yok.</p>}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><CalendarIcon size={20}/> Yaklaşan Planlar</h3>
            <div className="space-y-3">
              {planlar.filter(p => !p.tamamlandi).sort((a,b)=>new Date(a.tarih)-new Date(b.tarih)).slice(0,5).map(p => {
                const planDate = new Date(p.tarih);
                planDate.setHours(0,0,0,0);
                const diff = Math.floor((planDate - todayMidnight) / (1000 * 60 * 60 * 24));
                
                let timeDesc = ""; let colorClass = "text-slate-500";
                if (diff === 0) { timeDesc = "Bugün"; colorClass = "text-orange-500 font-bold"; } 
                else if (diff > 0) { timeDesc = `${diff} gün sonra`; colorClass = "text-blue-500"; } 
                else { timeDesc = `${Math.abs(diff)} gün önceydi`; colorClass = "text-rose-500"; }

                return (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{p.baslik}</p>
                      <p className={`text-xs ${colorClass}`}>{timeDesc} ({p.tarih.split('-').reverse().join('.')})</p>
                    </div>
                    <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500"><CalendarIcon size={16}/></div>
                  </div>
                );
              })}
               {planlar.filter(p => !p.tamamlandi).length === 0 && <p className="text-slate-500 text-sm">Henüz bir plan yok.</p>}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const Siparisler = () => {
    const [form, setForm] = useState({ id: null, kurum: '', hoca: '', urun: '', durum: 'Bekliyor', oncelik: 'Normal' });
    const [search, setSearch] = useState('');
    const [filterDurum, setFilterDurum] = useState('Tümü');

    const handleSave = () => {
      if(!form.kurum || !form.hoca || !form.urun) { playSound('error'); return alert("Zorunlu alanları doldurun!"); }
      if(form.id) setSiparisler(siparisler.map(s => s.id === form.id ? {...form, ekleyen: activeUser} : s));
      else setSiparisler([...siparisler, { ...form, id: Date.now(), ekleyen: activeUser }]);
      setForm({ id: null, kurum: '', hoca: '', urun: '', durum: 'Bekliyor', oncelik: 'Normal' });
      playSound('success');
    };
    
    const handleDrop = (e, newStatus) => {
      e.preventDefault(); const id = e.dataTransfer.getData("id");
      setSiparisler(siparisler.map(s => s.id == id ? {...s, durum: newStatus} : s)); playSound('success');
    };

    const filteredSiparisler = siparisler.filter(s => {
      const matchSearch = search === '' || s.kurum.toLowerCase().includes(search.toLowerCase()) || s.urun.toLowerCase().includes(search.toLowerCase()) || s.hoca.toLowerCase().includes(search.toLowerCase());
      const matchDurum = filterDurum === 'Tümü' || s.durum === filterDurum;
      return matchSearch && matchDurum;
    });

    return (
      <div className="space-y-6 fade-in">
        <Card className="flex flex-col gap-4">
           <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Kurum</label><Select value={form.kurum} onChange={e=>setForm({...form, kurum: e.target.value})} className="w-full"><option value="">Seçiniz...</option>{kurumlar.map(k=><option key={k.id}>{k.ad}</option>)}</Select></div>
            <div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Hoca</label><Input placeholder="Örn: Ahmet Hoca" value={form.hoca} onChange={e=>setForm({...form, hoca: e.target.value})} className="w-full"/></div>
            <div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Ürün</label><Select value={form.urun} onChange={e=>setForm({...form, urun: e.target.value})} className="w-full"><option value="">Seçiniz...</option>{urunler.map(u=><option key={u.id}>{u.ad}</option>)}</Select></div>
            <div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Durum</label><Select value={form.durum} onChange={e=>setForm({...form, durum: e.target.value})} className="w-full"><option>Bekliyor</option><option>Optikleri okunacak</option><option>.txt bekleniyor</option><option>Karne atılacak</option><option>Cevap anahtarı atılacak</option><option>Teslim Edildi</option></Select></div>
            <div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Öncelik</label><Select value={form.oncelik} onChange={e=>setForm({...form, oncelik: e.target.value})} className="w-full"><option>Düşük</option><option>Normal</option><option>Acil</option></Select></div>
            <div className="flex gap-2 w-full lg:w-auto"><Button onClick={handleSave} className="flex-1">{form.id ? 'Güncelle' : 'Kaydet'}</Button>{form.id && <Button variant="ghost" onClick={()=>setForm({ id: null, kurum: '', hoca: '', urun: '', durum: 'Bekliyor', oncelik: 'Normal' })}><X size={20}/></Button>}</div>
           </div>
        </Card>

        {/* Yeni Eklenen: Filtre ve Arama */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 w-full md:w-96 relative">
             <Search size={18} className="absolute left-3 text-slate-400" />
             <Input placeholder="Kurum, hoca veya ürün ara..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Filter size={18} className="text-slate-400" />
             <Select value={filterDurum} onChange={e=>setFilterDurum(e.target.value)} className="w-full md:w-48">
               <option>Tümü</option><option>Bekliyor</option><option>Optikleri okunacak</option><option>.txt bekleniyor</option><option>Karne atılacak</option><option>Cevap anahtarı atılacak</option>
             </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800" onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, 'Bekliyor')}>
            <h3 className="font-bold text-orange-500 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> İşlem Bekleyenler</h3>
            <div className="space-y-3 min-h-[150px]">
              {filteredSiparisler.filter(s=>s.durum !== 'Teslim Edildi').map(s=>(
                <div key={s.id} draggable onDragStart={(e)=>e.dataTransfer.setData("id", s.id)} 
                  className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 ${s.oncelik === 'Acil' ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-rose-500/20 shadow-lg' : s.oncelik === 'Düşük' ? 'border-slate-400 opacity-80' : 'border-orange-500'} cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative overflow-hidden`}>
                  {s.oncelik === 'Acil' && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1"><AlertCircle size={10}/> ACİL</div>}
                  <div className="flex justify-between items-start mb-2 mt-1"><h4 className="font-bold text-slate-800 dark:text-white">{s.kurum}</h4><span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{s.durum}</span></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"><Package size={14}/> {s.urun}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1"><CheckCircle size={14}/> {s.hoca}</p>
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-2"><button onClick={()=>setForm(s)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded"><Edit3 size={16}/></button><button onClick={()=>{setSiparisler(siparisler.filter(x=>x.id!==s.id)); playSound('success')}} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1 rounded"><Trash2 size={16}/></button></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700" onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, 'Teslim Edildi')}>
            <h3 className="font-bold text-emerald-500 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Teslim Edilenler</h3>
            <div className="space-y-3 min-h-[150px]">
              {filteredSiparisler.filter(s=>s.durum === 'Teslim Edildi').map(s=>(
                <div key={s.id} draggable onDragStart={(e)=>e.dataTransfer.setData("id", s.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 cursor-grab opacity-70 hover:opacity-100 transition-opacity">
                   <h4 className="font-bold text-slate-800 dark:text-white line-through decoration-emerald-500/50">{s.kurum}</h4><p className="text-sm text-slate-500 mt-1">{s.urun}</p>
                   <div className="mt-3 flex justify-end"><button onClick={()=>{setSiparisler(siparisler.filter(x=>x.id!==s.id)); playSound('success')}} className="text-rose-500 p-1"><Trash2 size={16}/></button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Kurumlar = () => {
    const [form, setForm] = useState({ id:null, ad:'', adres:'', link:'', gorsel:'', koordinat:''});
    const [search, setSearch] = useState('');

    const handleSave = () => { if(!form.ad) return playSound('error'); setKurumlar(form.id ? kurumlar.map(k=>k.id===form.id?form:k) : [...kurumlar, {...form, id:Date.now()}]);
    setForm({id:null, ad:'', adres:'', link:'', gorsel:'', koordinat:''}); playSound('success'); };
    
    const filteredKurumlar = kurumlar.filter(k => k.ad.toLowerCase().includes(search.toLowerCase()) || k.adres.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="space-y-6 fade-in">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Kurum Adı" value={form.ad} onChange={e=>setForm({...form, ad:e.target.value})} className="flex-1"/>
            <Input placeholder="Adres" value={form.adres} onChange={e=>setForm({...form, adres:e.target.value})} className="flex-[2]"/>
            <Input placeholder="Harita Linki (Yol Tarifi)" value={form.link} onChange={e=>setForm({...form, link:e.target.value})} className="flex-1"/>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Kapak Görsel URL (İsteğe Bağlı)" value={form.gorsel} onChange={e=>setForm({...form, gorsel:e.target.value})} className="flex-1"/>
            <Input placeholder="Koordinat (Örn: 39.92, 32.85)" value={form.koordinat} onChange={e=>setForm({...form, koordinat:e.target.value})} className="flex-1"/>
            <Button onClick={handleSave} className="md:w-32">{form.id ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </Card>

        {/* Yeni Eklenen: Arama Çubuğu */}
        <div className="relative max-w-md">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <Input placeholder="Kurum ara..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10" />
        </div>

        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="p-4 text-slate-500 font-medium">Kurum Adı</th><th className="p-4 text-slate-500 font-medium">Adres</th><th className="p-4 text-slate-500 font-medium">Konum</th><th className="p-4 text-slate-500 font-medium w-24">İşlem</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredKurumlar.map(k=>(
                <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{k.ad}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{k.adres}</td>
                  <td className="p-4">{k.link && <a href={k.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><MapIcon size={14}/> Haritada Gör</a>}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={()=>setForm(k)} className="text-blue-500 hover:text-blue-700"><Edit3 size={18}/></button>
                    <button onClick={()=>{setKurumlar(kurumlar.filter(x=>x.id!==k.id)); playSound('success')}} className="text-rose-500 hover:text-rose-700"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {filteredKurumlar.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  const Urunler = () => {
    const [form, setForm] = useState({ad:'', kategori:'Soru Bankası', gorsel:''});
    const handleSave = () => { if(!form.ad) return playSound('error'); setUrunler([...urunler, {...form, id:Date.now(), gorsel: form.gorsel || 'https://via.placeholder.com/150/e67e22/ffffff?text=Urun'}]); setForm({ad:'', kategori:'Soru Bankası', gorsel:''}); playSound('success'); };
    return (
      <div className="space-y-6 fade-in">
        <Card className="flex flex-col md:flex-row gap-4"><Input placeholder="Ürün Adı" value={form.ad} onChange={e=>setForm({...form, ad:e.target.value})} className="flex-1"/><Select value={form.kategori} onChange={e=>setForm({...form, kategori:e.target.value})} className="flex-1"><option>Soru Bankası</option><option>Deneme Sınavı</option><option>Kırtasiye</option></Select><Input placeholder="Görsel URL" value={form.gorsel} onChange={e=>setForm({...form, gorsel:e.target.value})} className="flex-1"/><Button onClick={handleSave}>Ekle</Button></Card>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{urunler.map(u=>(<div key={u.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow group"><div className="h-32 bg-slate-100 dark:bg-slate-900 overflow-hidden relative"><img src={u.gorsel} alt={u.ad} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><button onClick={()=>{setUrunler(urunler.filter(x=>x.id!==u.id)); playSound('success')}} className="p-2 bg-rose-500 rounded-full text-white hover:bg-rose-600 transform scale-0 group-hover:scale-100 transition-transform"><Trash2 size={16}/></button></div></div><div className="p-3"><h4 className="font-bold text-slate-800 dark:text-white truncate">{u.ad}</h4><p className="text-xs text-slate-500">{u.kategori}</p></div></div>))}</div>
      </div>
    );
  };

  const Planlama = () => {
    const [form, setForm] = useState({ id: null, tarih: '', baslik: '', not: '' });
    const [viewMode, setViewMode] = useState('list'); // 'list' veya 'calendar'

    const handleSave = () => { 
      if(!form.tarih || !form.baslik) { playSound('error'); return alert("Lütfen Tarih ve Başlık giriniz!"); }
      if(form.id) { setPlanlar(planlar.map(p => p.id === form.id ? {...form} : p)); } 
      else { setPlanlar([...planlar, {...form, id:Date.now(), tamamlandi:false}]); }
      setForm({ id: null, tarih: '', baslik: '', not: '' });  playSound('success'); 
    };
    
    const bg = new Date(); bg.setHours(0,0,0,0);
    
    // Yeni Eklenen: Basit Takvim Grid Görünümü
    const renderCalendar = () => {
       const today = new Date();
       const year = today.getFullYear();
       const month = today.getMonth();
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       const firstDay = new Date(year, month, 1).getDay();
       
       const grid = [];
       // Boş günler (haftanın başına kadar)
       for(let i=0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
         grid.push(<div key={`e-${i}`} className="p-2 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 min-h-[100px]"></div>);
       }
       
       for(let d=1; d<=daysInMonth; d++) {
         const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
         const dPlans = planlar.filter(p => p.tarih === dStr);
         const isToday = dStr === new Date().toISOString().split('T')[0];

         grid.push(
           <div key={d} className={`p-2 min-h-[100px] border border-slate-100 dark:border-slate-800 ${isToday ? 'bg-orange-50/50 dark:bg-orange-500/10' : 'bg-white dark:bg-slate-800'}`}>
             <div className={`text-xs font-bold mb-1 ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>{d}</div>
             <div className="space-y-1">
               {dPlans.map(p => (
                 <div key={p.id} className={`text-[10px] p-1 rounded truncate cursor-pointer ${p.tamamlandi ? 'bg-slate-100 text-slate-400 line-through' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`} title={p.baslik} onClick={()=>setForm(p)}>
                   {p.baslik}
                 </div>
               ))}
             </div>
           </div>
         );
       }

       return (
         <div className="bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
           <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900 text-center text-xs font-bold text-slate-500 py-2">
             <div>Pzt</div><div>Sal</div><div>Çar</div><div>Per</div><div>Cum</div><div>Cmt</div><div>Paz</div>
           </div>
           <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">{grid}</div>
         </div>
       );
    };

    return (
      <div className="space-y-6 fade-in">
        <Card className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col gap-1 w-full md:w-48"><label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Tarih</label><Input type="date" value={form.tarih} onChange={e=>setForm({...form, tarih:e.target.value})} className="w-full" /></div>
          <div className="flex flex-col gap-1 flex-[2] w-full"><label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Plan/Toplantı Başlığı</label><Input placeholder="Nereye gidilecek? Ne yapılacak?" value={form.baslik} onChange={e=>setForm({...form, baslik:e.target.value})} className="w-full" /></div>
          <div className="flex flex-col gap-1 flex-1 w-full"><label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Kısa Notlar</label><Input placeholder="Opsiyonel notlar..." value={form.not} onChange={e=>setForm({...form, not:e.target.value})} className="w-full" /></div>
          <div className="flex gap-2 w-full md:w-auto"><Button onClick={handleSave} className="flex-1 md:w-28">{form.id ? 'Güncelle' : 'Ekle'}</Button>{form.id && <Button variant="ghost" onClick={()=>setForm({ id: null, tarih: '', baslik: '', not: '' })} className="px-2"><X size={20}/></Button>}</div>
        </Card>

        {/* Görünüm Değiştirici */}
        <div className="flex justify-end gap-2">
           <button onClick={()=>setViewMode('list')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-500' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}><ListIcon size={16}/> Liste</button>
           <button onClick={()=>setViewMode('calendar')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-500' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}><LayoutGrid size={16}/> Takvim</button>
        </div>

        {viewMode === 'list' ? (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {planlar.sort((a,b)=>new Date(a.tarih)-new Date(b.tarih)).map(p=>{
                  const pt = new Date(p.tarih); pt.setHours(0,0,0,0); const diff = Math.floor((pt-bg)/(1000*60*60*24));
                  let statusColor = p.tamamlandi ? 'bg-slate-100 text-slate-400' : (diff < 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : (diff === 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20'));
                  let statusText = p.tamamlandi ? 'Tamamlandı' : (diff < 0 ? 'Geçti' : (diff === 0 ? 'Bugün!' : `${diff} gün kaldı`));
                  
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${p.tamamlandi?'opacity-50':''}`}>
                      <td className="p-4 w-32 font-medium text-slate-800 dark:text-slate-200 border-l-4 border-transparent hover:border-orange-500">{p.tarih.split('-').reverse().join('.')}</td>
                      <td className="p-4"><p className={`font-bold text-slate-800 dark:text-white ${p.tamamlandi ? 'line-through' : ''}`}>{p.baslik}</p><p className="text-sm text-slate-500 italic">{p.not}</p></td>
                      <td className="p-4 w-32"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${statusColor}`}>{statusText}</span></td>
                      <td className="p-4 w-40">
                        <div className="flex items-center justify-end gap-2">
                          {!p.tamamlandi && (
                            <><button onClick={()=>setForm(p)} className="w-9 h-9 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Düzenle"><Edit3 size={18}/></button>
                              <button onClick={()=>{setPlanlar(planlar.map(x=>x.id===p.id?{...x, tamamlandi:true}:x)); playSound('success')}} className="w-9 h-9 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Tamamlandı"><CheckCircle size={18}/></button></>
                          )}
                          <button onClick={()=>{setPlanlar(planlar.filter(x=>x.id!==p.id)); playSound('success')}} className="w-9 h-9 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Sil"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {planlar.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-medium">Henüz bir plan eklenmedi.</td></tr>}
              </tbody>
            </table>
          </Card>
        ) : (
          renderCalendar()
        )}
      </div>
    );
  };

  const Finans = () => {
    const [form, setForm] = useState({tarih:'', tip:'Gelir', aciklama:'', tutar:''});
    const handleSave = () => { if(!form.tutar) return playSound('error'); setFinans([...finans, {...form, id:Date.now(), tutar:parseFloat(form.tutar)}]); setForm({tarih:'', tip:'Gelir', aciklama:'', tutar:''}); playSound('success'); };
    const gelTop = finans.filter(f=>f.tip==='Gelir').reduce((a,b)=>a+b.tutar,0);
    const gidTop = finans.filter(f=>f.tip==='Gider').reduce((a,b)=>a+b.tutar,0);
    const bakiye = gelTop - gidTop;
    return (
      <div className="space-y-6 fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
           <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg"><p className="text-emerald-100 text-sm mb-1">Toplam Gelir</p><h3 className="text-3xl font-bold">₺{gelTop.toLocaleString()}</h3></Card>
           <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-lg"><p className="text-rose-100 text-sm mb-1">Toplam Gider</p><h3 className="text-3xl font-bold">₺{gidTop.toLocaleString()}</h3></Card>
           <Card className={`text-white border-none shadow-lg ${bakiye >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}><p className="text-white/80 text-sm mb-1">Net Durum</p><h3 className="text-3xl font-bold">₺{bakiye.toLocaleString()}</h3></Card>
        </div>
        <Card className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Tarih</label><Input type="date" value={form.tarih} onChange={e=>setForm({...form, tarih:e.target.value})} className="w-full"/></div><div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Tür</label><Select value={form.tip} onChange={e=>setForm({...form, tip:e.target.value})} className="w-full"><option>Gelir</option><option>Gider</option></Select></div><div className="flex-[2] w-full"><label className="text-xs text-slate-500 mb-1 block">Açıklama</label><Input placeholder="Örn: Kırtasiye Alımı" value={form.aciklama} onChange={e=>setForm({...form, aciklama:e.target.value})} className="w-full"/></div><div className="flex-1 w-full"><label className="text-xs text-slate-500 mb-1 block">Tutar (₺)</label><Input type="number" placeholder="1000" value={form.tutar} onChange={e=>setForm({...form, tutar:e.target.value})} className="w-full"/></div><Button onClick={handleSave} className="w-full md:w-auto">İşle</Button></Card>
        <Card className="overflow-x-auto p-0"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"><tr><th className="p-3">Tarih</th><th className="p-3">Açıklama</th><th className="p-3">Tutar</th><th className="p-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{finans.slice().reverse().map(f=>(<tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="p-3 text-sm text-slate-500">{f.tarih.split('-').reverse().join('.')}</td><td className="p-3 font-medium text-slate-800 dark:text-slate-200">{f.aciklama}</td><td className={`p-3 font-bold ${f.tip==='Gelir'?'text-emerald-500':'text-rose-500'}`}>{f.tip==='Gelir'?'+':'-'}₺{f.tutar}</td><td className="p-3 text-right"><button onClick={()=>{setFinans(finans.filter(x=>x.id!==f.id)); playSound('success')}} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table></Card>
      </div>
    );
  };

  const Mesajlar = () => {
    const [msg, setMsg] = useState('');
    const [imgBase64, setImgBase64] = useState('');
    const chatRef = useRef(null);
    useEffect(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [mesajlar]);
    const handleImg = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (ev) => setImgBase64(ev.target.result); reader.readAsDataURL(file); };
    const handleSend = () => { if(!msg && !imgBase64) return; const t = new Date(); setMesajlar([...mesajlar, { id:Date.now(), gonderen:activeUser, metin:msg, foto:imgBase64, tarih: `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}` }]); setMsg(''); setImgBase64(''); playSound('success'); };
    return (
      <Card className="h-[calc(100vh-140px)] flex flex-col p-0 overflow-hidden fade-in">
        <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4"><div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold"><MessageSquare size={20}/></div><div><h3 className="font-bold text-slate-800 dark:text-white">Ekip İçi İletişim</h3><p className="text-xs text-slate-500">Uçtan uca şifreli :)</p></div></div>
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">{mesajlar.map(m => (<div key={m.id} className={`flex flex-col ${m.gonderen === activeUser ? 'items-end' : 'items-start'}`}><span className="text-[10px] text-slate-400 mb-1 px-1">{m.gonderen}</span><div className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative ${m.gonderen === activeUser ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>{m.foto && <img src={m.foto} alt="Görsel" className="w-full rounded-xl mb-2 object-cover max-h-64"/>}{m.metin && <p className="text-sm leading-relaxed">{m.metin}</p>}<span className={`text-[9px] block text-right mt-1 ${m.gonderen === activeUser ? 'text-orange-200':'text-slate-400'}`}>{m.tarih}</span></div></div>))}</div>
        {imgBase64 && <div className="bg-slate-200 dark:bg-slate-800 p-2 flex items-center justify-between px-4 border-t border-slate-300 dark:border-slate-700"><span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><ImageIcon size={14}/> Görsel eklendi</span><button onClick={()=>setImgBase64('')} className="text-rose-500 text-xs">İptal Et</button></div>}
        <div className="p-4 bg-white dark:bg-slate-800 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700"><label className="cursor-pointer p-2 text-slate-400 hover:text-orange-500 transition-colors"><ImageIcon size={24}/><input type="file" className="hidden" accept="image/*" onChange={handleImg} /></label><input type="text" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Bir şeyler yazın..." className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-6 py-3 focus:outline-none text-sm text-slate-800 dark:text-white" /><button onClick={handleSend} className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95"><Send size={20} className="ml-1"/></button></div>
      </Card>
    );
  };

  const Harita = () => {
    useEffect(() => {
      if (!document.getElementById('leaflet-css')) { const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link); }
      if (!document.getElementById('leaflet-js')) { const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => initMap(); document.head.appendChild(script); } else { initMap(); }

      function initMap() {
        if(window.L && !window.yaerMapInstance) {
          const m = window.L.map('map-container').setView([39.92, 32.85], 6);
          const tileUrl = theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
          window.L.tileLayer(tileUrl, { attribution: '© CartoDB' }).addTo(m);
          window.yaerMapInstance = m; window.yaerMarkers = window.L.layerGroup().addTo(m);
        } else if(window.yaerMapInstance) { window.yaerMapInstance.invalidateSize(); }

        if(window.yaerMapInstance && window.yaerMarkers && window.L) {
          window.yaerMarkers.clearLayers();
          const redIcon = window.L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
          kurumlar.forEach(k => {
              if (k.koordinat && k.koordinat.includes(',')) {
                  const [lat, lng] = k.koordinat.split(',').map(c => parseFloat(c.trim()));
                  if(!isNaN(lat) && !isNaN(lng)) {
                      const bgImg = k.gorsel || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop';
                      const popupHtml = `<div style="width: 260px; font-family: sans-serif;"><div style="height: 140px; background: url('${bgImg}') center/cover; border-radius: 12px 12px 0 0;"></div><div style="padding: 15px;"><h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #1e293b; line-height: 1.2;">${k.ad}</h3><p style="margin: 0 0 15px 0; font-size: 12px; color: #64748b;">Eğitim Merkezi</p><div style="font-size: 13px; color: #475569; display: flex; align-items: start; gap: 6px; margin-bottom: 15px; line-height: 1.4;"><span>📍</span> <span>${k.adres || 'Adres belirtilmemiş'}</span></div><a href="${k.link || '#'}" target="_blank" style="display: block; text-align: center; background: #0ea5e9; color: white; padding: 10px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);">Yol Tarifi</a></div></div>`;
                      window.L.marker([lat, lng], {icon: redIcon}).bindPopup(popupHtml, { className: 'custom-map-popup' }).addTo(window.yaerMarkers);
                  }
              }
          });
        }
      }
      return () => { if(window.yaerMapInstance) { window.yaerMapInstance.remove(); window.yaerMapInstance = null; window.yaerMarkers = null; } }
    }, [theme, kurumlar]);
    return (<Card className="h-[calc(100vh-140px)] p-2"><div id="map-container" className="w-full h-full rounded-xl z-0" style={{background: theme==='dark'?'#1e293b':'#f1f5f9'}}></div></Card>)
  };

  // Yeni Eklenen: Sistem ve Raporlar (Yedekleme & Excel)
  const SistemRaporlar = () => {
    const handleExportJSON = () => {
      const data = { yaer_kurumlar: kurumlar, yaer_siparisler: siparisler, yaer_planlar: planlar, yaer_urunler: urunler, yaer_finans: finans, yaer_mesajlar: mesajlar, yaer_notes: notes };
      const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `yaer_yedek_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); playSound('success');
    };

    const handleImportJSON = (e) => {
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if(data.yaer_kurumlar) setKurumlar(data.yaer_kurumlar);
          if(data.yaer_siparisler) setSiparisler(data.yaer_siparisler);
          if(data.yaer_planlar) setPlanlar(data.yaer_planlar);
          if(data.yaer_urunler) setUrunler(data.yaer_urunler);
          if(data.yaer_finans) setFinans(data.yaer_finans);
          if(data.yaer_mesajlar) setMesajlar(data.yaer_mesajlar);
          if(data.yaer_notes) setNotes(data.yaer_notes);
          playSound('success'); alert("Yedek başarıyla yüklendi!");
        } catch(err) { playSound('error'); alert("Geçersiz yedek dosyası!"); }
      };
      reader.readAsText(file);
    };

    const handleExportCSV = (dataArray, fileName) => {
      if(dataArray.length === 0) return alert("Dışa aktarılacak veri yok!");
      const headers = Object.keys(dataArray[0]).join(',');
      const rows = dataArray.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
      const csvContent = headers + '\n' + rows;
      const blob = new Blob(["\uFEFF"+csvContent], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    };

    return (
      <div className="space-y-6 fade-in">
        <Card>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-white"><Database size={20}/> Sistem Yedekleme (JSON)</h3>
          <p className="text-sm text-slate-500 mb-4">Tüm sistem verilerinizi güvenli bir şekilde bilgisayarınıza indirebilir veya daha önce aldığınız yedeği geri yükleyebilirsiniz.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <Button onClick={handleExportJSON} className="flex-1 bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20"><Download size={18}/> Yedek İndir (.json)</Button>
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 cursor-pointer">
              <Upload size={18}/> Yedeği Geri Yükle
              <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
            </label>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-white"><FileSpreadsheet size={20}/> Excel (CSV) Çıktıları</h3>
          <p className="text-sm text-slate-500 mb-4">Modüllerdeki verileri Excel'de açabileceğiniz virgülle ayrılmış (.csv) formatta indirin.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" onClick={()=>handleExportCSV(siparisler, 'siparisler')}><Package size={16}/> Siparişler</Button>
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" onClick={()=>handleExportCSV(kurumlar, 'kurumlar')}><Building2 size={16}/> Kurumlar</Button>
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" onClick={()=>handleExportCSV(finans, 'finans')}><DollarSign size={16}/> Finans</Button>
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" onClick={()=>handleExportCSV(planlar, 'planlar')}><CalendarIcon size={16}/> Planlar</Button>
          </div>
        </Card>
      </div>
    );
  };

  const menuItems = [
    { id: 'Dashboard', icon: Home, label: 'Ana Panel' },
    { id: 'Kurumlar', icon: Building2, label: 'Kurumlar' },
    { id: 'Siparisler', icon: Package, label: 'Siparişler' },
    { id: 'Urunler', icon: ShoppingBag, label: 'Ürünler' },
    { id: 'Planlama', icon: CalendarIcon, label: 'Takvim/Plan' },
    { id: 'Finans', icon: DollarSign, label: 'Finans' },
    { id: 'Mesajlar', icon: MessageSquare, label: 'Mesajlaşma' },
    { id: 'Harita', icon: MapIcon, label: 'Harita' },
    { id: 'Sistem', icon: Settings, label: 'Sistem & Raporlar' }, // Yeni Eklendi
  ];

  const renderModule = () => {
    switch(activeModule) {
      case 'Dashboard': return <Dashboard />;
      case 'Siparisler': return <Siparisler />;
      case 'Kurumlar': return <Kurumlar />;
      case 'Urunler': return <Urunler />;
      case 'Planlama': return <Planlama />;
      case 'Finans': return <Finans />;
      case 'Mesajlar': return <Mesajlar />;
      case 'Harita': return <Harita />;
      case 'Sistem': return <SistemRaporlar />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans overflow-hidden">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 flex flex-col shadow-2xl lg:shadow-none`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30"><Activity size={20} className="text-white"/></div><span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">YAER</span></div>
          <button className="lg:hidden text-slate-500" onClick={()=>setIsSidebarOpen(false)}><X size={24}/></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">{menuItems.map(item => (<button key={item.id} onClick={() => { setActiveModule(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === item.id ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}><item.icon size={20} /><span className="font-medium">{item.label}</span></button>))}</nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700"><div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800"><div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-inner">{activeUser.charAt(0)}</div><div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-slate-800 dark:text-white truncate">{activeUser}</p><p className="text-[10px] text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Çevrimiçi</p></div><button onClick={()=>{setIsLogged(false); setActiveUser("");}} className="text-slate-400 hover:text-rose-500"><LogOut size={18}/></button></div></div>
      </aside>
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 z-30">
           <div className="flex items-center gap-4"><button className="lg:hidden text-slate-500" onClick={()=>setIsSidebarOpen(true)}><Menu size={24}/></button><h1 className="text-xl font-bold hidden sm:block text-slate-800 dark:text-white">{menuItems.find(m=>m.id===activeModule)?.label}</h1></div>
           <div className="flex items-center gap-3 sm:gap-4 relative">
             <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}</button>
             <div className="relative"><button onClick={()=>{setIsNoteOpen(!isNoteOpen); setIsNotifOpen(false);}} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isNoteOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><FileText size={20}/></button>{isNoteOpen && (<div className="absolute right-0 top-12 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-4"><h4 className="font-bold mb-2 flex items-center gap-2 text-slate-800 dark:text-white"><FileText size={16}/> Hızlı Notlar</h4><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Buraya hızlıca not alabilirsiniz..." className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none text-slate-800 dark:text-white resize-none"/></div>)}</div>
             <div className="relative"><button onClick={()=>{setIsNotifOpen(!isNotifOpen); setIsNoteOpen(false);}} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${isNotifOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><Bell size={20}/>{notifications.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>}</button>{isNotifOpen && (<div className="absolute right-0 top-12 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden"><div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700"><h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white"><Bell size={16}/> Bildirimler</h4></div><div className="max-h-64 overflow-y-auto">{notifications.length > 0 ? notifications.map((n, i)=>(<div key={i} className="p-3 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300">{n}</div>)) : <div className="p-4 text-center text-sm text-slate-500">Yeni bildiriminiz yok.</div>}</div></div>)}</div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8"><div className="max-w-7xl mx-auto w-full">{renderModule()}</div></div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-in-out; } 
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
        ::-webkit-scrollbar { width: 6px; height: 6px; } 
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; } 
        .dark ::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); }
        .custom-map-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
        .custom-map-popup .leaflet-popup-content { margin: 0; width: 260px !important; }
        .custom-map-popup .leaflet-popup-close-button { color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5); top: 8px !important; right: 8px !important; background: rgba(0,0,0,0.3); border-radius: 50%; width: 24px !important; height: 24px !important; display: flex; align-items: center; justify-content: center; font-size: 16px !important; font-weight: bold; padding: 0 !important; }
        .custom-map-popup .leaflet-popup-close-button:hover { background: rgba(0,0,0,0.5); }
      `}} />
    </div>
  );
}