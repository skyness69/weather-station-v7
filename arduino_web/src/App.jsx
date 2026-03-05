import { useEffect, useState } from 'react';
import { database } from './firebaseSetup';
import { ref, onValue } from 'firebase/database';
import {
  Droplets,
  Gauge,
  Thermometer,
  Clock,
  Calendar,
  Zap,
  Sunrise,
  Sunset,
  Wifi,
  WifiOff,
  History
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    time: "--:--",
    date: "Awaiting..."
  });

  const [device, setDevice] = useState({
    status: "OFFLINE",
    lastTime: "",
    lastDate: ""
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    const liveRef = ref(database, 'Live_Weather');
    const unsubscribeLive = onValue(liveRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData({
          temperature: val.Temperature || 0,
          humidity: val.Humidity || 0,
          pressure: val.Pressure || 0,
          time: val.Time || "--:--",
          date: val.Date || ""
        });
      }
    });

    const deviceRef = ref(database, 'device');
    const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setDevice({
          status: val.status || "OFFLINE",
          lastTime: val.last_seen_time || "",
          lastDate: val.last_seen_date || ""
        });
      }
    });

    return () => {
      clearInterval(clockTimer);
      unsubscribeLive();
      unsubscribeDevice();
    };
  }, []);

  // Stabilized Offline Logic
  const getStabilizedStatus = () => {
    if (!device.lastTime || !device.lastDate) return "OFFLINE";
    if (device.status === "OFFLINE") return "OFFLINE";

    try {
      // Input is day-month-year, e.g., 05-03-2026
      const parts = device.lastDate.split('-');
      // Convert to ISO format: YYYY-MM-DD for reliable parsing
      const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}T${device.lastTime}`;
      const lastSeen = new Date(isoDate).getTime();
      const now = new Date().getTime();

      // If time difference > 15s or DB says OFFLINE, force OFFLINE
      return (now - lastSeen > 15000) ? "OFFLINE" : "ONLINE";
    } catch (e) {
      return "OFFLINE";
    }
  };

  const currentStatus = getStabilizedStatus();
  const isOnline = currentStatus === "ONLINE";
  const hour = currentTime.getHours();
  const isDay = hour >= 6 && hour < 18;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0C10] font-sans selection:bg-blue-500/30">

      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] transition-colors duration-2000 ${isDay ? 'bg-sky-500' : 'bg-indigo-600'} animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px] transition-colors duration-2000 ${isDay ? 'bg-orange-400' : 'bg-purple-600'} animate-pulse delay-700`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-16 min-h-screen flex flex-col items-center">

        <header className="w-full flex justify-between items-center mb-8 lg:mb-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="text-white w-4 h-4 sm:w-6 sm:h-6 fill-current" />
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase italic">STATION_V7</h1>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 bg-white/5 ${isOnline ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black tracking-widest uppercase">{currentStatus}</span>
          </div>
        </header>

        {/* The 7 Widgets Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full auto-rows-fr">

          {/* Widget 1: Temperature (Hero) */}
          <div className="col-span-2 row-span-2 glass-panel-compact p-6 sm:p-10 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Thermometer className="w-32 h-32 -rotate-12" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <div className="hidden sm:block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-400 uppercase">Atmosphere</div>
            </div>
            <div className="mt-4 flex flex-col relative z-10">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-[7rem] sm:text-[12rem] md:text-[14rem] font-thin leading-none tracking-tighter text-white drop-shadow-2xl">
                  {data.temperature.toFixed(0)}
                </span>
                <span className="text-4xl sm:text-6xl md:text-8xl font-thin text-blue-400/50">&deg;C</span>
              </div>
              <p className="text-sm sm:text-lg font-medium text-white/40 tracking-wider">Thermal Telemetry</p>
            </div>
          </div>

          {/* Widget 2: Clock & Date */}
          <div className="glass-panel-compact p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Clock className="w-5 h-5 text-emerald-400" />
              <Calendar className="w-5 h-5 text-white/10" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-none mb-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-white/30 tracking-widest uppercase">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Widget 3: Humidity */}
          <div className="glass-panel-compact p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Moisture</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none">{data.humidity.toFixed(0)}%</div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${data.humidity}%` }} />
              </div>
            </div>
          </div>

          {/* Widget 4: Pressure */}
          <div className="glass-panel-compact p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Pressure</span>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none">{data.pressure.toFixed(0)}</div>
              <div className="text-[9px] font-black text-purple-400/60 uppercase tracking-widest mt-1 italic">Hectopascals</div>
            </div>
          </div>

          {/* Widget 5: Last Seen Details - Premium Redesign */}
          <div className="glass-panel-compact p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative group">
            {/* Subtle highlight glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <History className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Latest Sync</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-[8px] font-black text-white/30 tracking-widest uppercase">{isOnline ? 'Live' : 'Static'}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col relative z-10">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-none tracking-tighter mb-1">
                {device.lastTime || "SYNCING..."}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/20 tracking-widest uppercase">
                  {device.lastDate || "---"}
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            </div>
          </div>

          {/* Widget 6: Orbital Redesign (Sunrise/Sunset) */}
          <div className="col-span-2 glass-panel-compact p-4 sm:p-8 flex items-center justify-between overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Sunrise className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Sunrise</span>
                  <span className="text-xs sm:text-sm font-bold text-white">05:40 AM</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <Sunset className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Sunset</span>
                  <span className="text-xs sm:text-sm font-bold text-white">18:20 PM</span>
                </div>
              </div>
            </div>

            {/* Earth/Sun/Moon Orbital Visualization */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
              {/* Realistic "Blue Marble" Earth Globe */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full relative z-10 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.5)] border border-white/20">

                {/* 1. Deep Ocean Base (Vibrant Earth Blue) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#001020]" />

                {/* 2. Realistic Continent Layer (Rotating) */}
                <div
                  className="absolute inset-0 opacity-90 animate-earth-spin-accurate mix-blend-screen"
                  style={{
                    backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
                    backgroundSize: '200% 100%',
                    backgroundRepeat: 'repeat-x',
                    filter: 'sepia(1) hue-rotate(60deg) saturate(3) brightness(1.1)' // Makes them realistic Green/Brown
                  }}
                />

                {/* 3. Wispy Cloud Layer (Floating) */}
                <div
                  className="absolute inset-0 opacity-30 animate-earth-clouds"
                  style={{
                    backgroundImage: `url('https://www.transparenttextures.com/patterns/textured-paper.png')`,
                    backgroundSize: '300% 100%',
                    filter: 'brightness(2) contrast(0.5)'
                  }}
                />

                {/* 4. Atmospheric Blue Glow (Cyan Rim) */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(34,211,238,0.4)] z-10" />

                {/* 5. 3D Spherical Volume Lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)] z-20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent z-30 shadow-[inset_-6px_-6px_15px_rgba(0,0,0,0.6)]" />

                {/* 6. Realistic Specular Highlight */}
                <div className="absolute top-2 left-4 w-5 h-2.5 bg-white/20 blur-[3px] rounded-full rotate-[-35deg] z-40" />
              </div>

              {/* Orbital Paths (Luxury Style) */}
              <div className="absolute w-[80%] h-[80%] border border-white/10 rounded-full" />
              <div className="absolute w-full h-full border border-white/5 rounded-full border-dashed opacity-40" />

              {/* Sun */}
              <div className="absolute w-full h-full animate-orbital-sun">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 shadow-[0_0_15px_#facc15] border border-white/40 absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2" />
              </div>

              {/* Moon */}
              <div className="absolute w-[80%] h-[80%] animate-orbital-moon">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-300 shadow-[0_0_10px_#cbd5e1] border border-white/40 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>

        </div>

        <footer className="mt-auto py-8 text-[8px] font-black tracking-[0.5em] text-white/10 uppercase border-t border-white/5 w-full text-center">
          STATION V7
        </footer>
      </div>

      <style>{`
        .glass-panel-compact {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        
        @media (min-width: 640px) {
          .glass-panel-compact {
            border-radius: 32px;
          }
        }

        .glass-panel-compact:hover {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
        }

        @keyframes earth-spin-accurate {
          from { background-position: 0% 0; }
          to { background-position: 100% 0; }
        }
        @keyframes earth-clouds {
          from { background-position: 0% 0; }
          to { background-position: -200% 0; }
        }
        .animate-earth-spin-accurate {
          animation: earth-spin-accurate 25s linear infinite;
        }
        .animate-earth-clouds {
          animation: earth-clouds 40s linear m-out infinite;
        }

        @keyframes orbital-sun {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbital-moon {
          from { transform: rotate(180deg); }
          to { transform: rotate(540deg); }
        }
        
        .animate-orbital-sun {
          animation: orbital-sun 20s linear infinite;
        }
        .animate-orbital-moon {
          animation: orbital-moon 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
