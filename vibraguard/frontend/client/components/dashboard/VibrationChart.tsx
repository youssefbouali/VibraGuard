import { useState, useMemo } from "react";
import { useVibrations } from "@/hooks/use-vibrations";
import { useMoteurs } from "@/hooks/use-moteurs";
import { formatTime } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#0EA5E9", "#F43F5E", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#84CC16", "#06B6D4"];

export function VibrationChart() {
  const [selectedMotorId, setSelectedMotorId] = useState<string>("all");
  const { data: vibrations = [], isLoading } = useVibrations(selectedMotorId === "all" ? undefined : selectedMotorId);
  const { data: moteurs = [] } = useMoteurs();

  const groupedVibrations = useMemo(() => {
    if (selectedMotorId !== "all") {
      return { [selectedMotorId]: vibrations };
    }
    
    return vibrations.reduce((acc, v) => {
      const mId = v.motorId || 'unknown';
      if (!acc[mId]) acc[mId] = [];
      acc[mId].push(v);
      return acc;
    }, {} as Record<string, typeof vibrations>);
  }, [vibrations, selectedMotorId]);

  const motorNames = useMemo(() => {
    return moteurs.reduce((acc, m) => {
      acc[m.id] = m.type + " " + m.id.substring(0, 4);
      return acc;
    }, {} as Record<string, string>);
  }, [moteurs]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Vibrations Temps Réel</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMotorId} onValueChange={setSelectedMotorId}>
            <SelectTrigger className="w-[180px] h-8 bg-white/5 border-white/10 text-white text-xs">
              <SelectValue placeholder="Sélectionner moteur" />
            </SelectTrigger>
            <SelectContent className="bg-[#111A24] border-white/10 text-white">
              <SelectItem value="all">Tous les moteurs</SelectItem>
              {moteurs.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.type} ({m.id.substring(0, 5)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Détails</button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(17,26,36,0.50)] rounded-lg">
            <span className="text-white">Chargement...</span>
          </div>
        )}
        <svg viewBox="0 0 606 356" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g clipPath="url(#vib-clip)">
            {/* Grid lines */}
            <line x1="40.35" y1="59.3" x2="606" y2="59.3" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="118.6" x2="606" y2="118.6" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="177.9" x2="606" y2="177.9" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="237.2" x2="606" y2="237.2" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="296.5" x2="606" y2="296.5" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>

            {/* Y-axis labels */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="64">20 mm/s</text>
import { useState, useMemo } from "react";
import { useVibrations } from "@/hooks/use-vibrations";
import { useMoteurs } from "@/hooks/use-moteurs";
import { formatTime } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#0EA5E9", "#F43F5E", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#84CC16", "#06B6D4"];

export function VibrationChart() {
  const [selectedMotorId, setSelectedMotorId] = useState<string>("all");
  const { data: vibrations = [], isLoading } = useVibrations(selectedMotorId === "all" ? undefined : selectedMotorId);
  const { data: moteurs = [] } = useMoteurs();

  const groupedVibrations = useMemo(() => {
    if (selectedMotorId !== "all") {
      return { [selectedMotorId]: vibrations };
    }
    
    return vibrations.reduce((acc, v) => {
      const mId = v.motorId || 'unknown';
      if (!acc[mId]) acc[mId] = [];
      acc[mId].push(v);
      return acc;
    }, {} as Record<string, typeof vibrations>);
  }, [vibrations, selectedMotorId]);

  const motorNames = useMemo(() => {
    return moteurs.reduce((acc, m) => {
      acc[m.id] = m.type + " " + m.id.substring(0, 4);
      return acc;
    }, {} as Record<string, string>);
  }, [moteurs]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Vibrations Temps Réel</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMotorId} onValueChange={setSelectedMotorId}>
            <SelectTrigger className="w-[180px] h-8 bg-white/5 border-white/10 text-white text-xs">
              <SelectValue placeholder="Sélectionner moteur" />
            </SelectTrigger>
            <SelectContent className="bg-[#111A24] border-white/10 text-white">
              <SelectItem value="all">Tous les moteurs</SelectItem>
              {moteurs.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.type} ({m.id.substring(0, 5)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Détails</button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(17,26,36,0.50)] rounded-lg">
            <span className="text-white">Chargement...</span>
          </div>
        )}
        <svg viewBox="0 0 606 356" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g clipPath="url(#vib-clip)">
            {/* Grid lines */}
            <line x1="40.35" y1="59.3" x2="606" y2="59.3" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="118.6" x2="606" y2="118.6" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="177.9" x2="606" y2="177.9" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="237.2" x2="606" y2="237.2" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="296.5" x2="606" y2="296.5" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>

            {/* Y-axis labels */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="64">20 mm/s</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="183">10 mm/s</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="302">0 mm/s</text>

            {/* X-axis labels */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="40" y="334">{vibrations.length > 0 ? formatTime(vibrations[0].time) : ""}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="274" y="334">{vibrations.length > 2 ? formatTime(vibrations[Math.floor(vibrations.length/2)].time) : ""}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="520" y="334">{vibrations.length > 1 ? formatTime(vibrations[vibrations.length-1].time) : ""}</text>
            {/* Dynamic paths */}
            {selectedMotorId === "all" ? (
              Object.entries(groupedVibrations).map(([mId, data], index) => {
                if (data.length < 2) return null;
                const color = COLORS[index % COLORS.length];
                const gradId = `grad-${mId}`;
                const points = data.map((v, i) => {
                  const x = 40.35 + (i * (565 / (data.length - 1)));
                  const y = 296.5 - (v.vibRms * 11.8); // Primary metric
                  return `${x} ${y}`;
                });
                const pathD = `M ${points.join(' L ')}`;
                return (
                  <g key={mId}>
                    <defs>
                      <linearGradient id={gradId} x1="40.35" y1="24.87" x2="40.35" y2="296.51" gradientUnits="userSpaceOnUse">
                        <stop stopColor={color} stopOpacity="0.2"/>
                        <stop offset="1" stopColor={color} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={`${pathD} L 606 296.5 L 40.35 296.5 Z`} fill={`url(#${gradId})`} />
                    <path d={pathD} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                    {/* Anomalous dots */}
                    {data.map((v, i) => {
                      if (!v.isAnomalous) return null;
                      const x = 40.35 + (i * (565 / (data.length - 1)));
                      const y = 296.5 - (v.vibRms * 11.8);
                      return <circle key={`${mId}-${i}`} cx={x} cy={y} r="3" fill="#EF4444" className="animate-pulse" />;
                    })}
                  </g>
                );
              })
            ) : (
              // Single motor view: Show all 5 metrics
              vibrations.length >= 2 && (
                <>
                  {[
                    { key: "vibRms", color: "#0EA5E9", label: "RMS", scale: 11.8 },
                    { key: "vibPeak", color: "#F43F5E", label: "Peak", scale: 5.9 }, // Scaled differently for peak
                    { key: "vibKurtosis", color: "#10B981", label: "Kurtosis", scale: 20 },
                    { key: "temperature", color: "#F59E0B", label: "Temp", scale: 2 },
                    { key: "currentRms", color: "#8B5CF6", label: "Current", scale: 10 }
                  ].map((metric) => {
                    const points = vibrations.map((v, i) => {
                      const x = 40.35 + (i * (565 / (vibrations.length - 1)));
                      // Simple scaling logic for demo
                      let val = (v as any)[metric.key] || 0;
                      if (metric.key === "temperature") val = (val - 50) / 2; // Offset for temp
                      const y = 296.5 - (val * metric.scale);
                      return `${x} ${y}`;
                    });
                    const pathD = `M ${points.join(' L ')}`;
                    return (
                      <g key={metric.key}>
                        <path d={pathD} stroke={metric.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                        {vibrations.map((v, i) => {
                          if (!v.isAnomalous || metric.key !== "vibRms") return null;
                          const x = 40.35 + (i * (565 / (vibrations.length - 1)));
                          const y = 296.5 - (v.vibRms * 11.8);
                          return <circle key={`${metric.key}-${i}`} cx={x} cy={y} r="3" fill="#EF4444" className="animate-pulse" />;
                        })}
                      </g>
                    );
                  })}
                </>
              )
            )}
          </g>

          <defs>
            <clipPath id="vib-clip">
              <rect width="605.19" height="355.81" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 border-t border-white/5">
        {selectedMotorId === "all" ? (
          Object.keys(groupedVibrations).map((mId, index) => (
            <div key={mId} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-[#94A3B8] text-[10px] font-medium whitespace-nowrap">
                {motorNames[mId] || `Moteur ${mId.substring(0, 4)}`}
              </span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0EA5E9]" /><span className="text-[#94A3B8] text-[10px]">RMS (mm/s)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F43F5E]" /><span className="text-[#94A3B8] text-[10px]">Peak</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" /><span className="text-[#94A3B8] text-[10px]">Kurtosis</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span className="text-[#94A3B8] text-[10px]">Temp (°C)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /><span className="text-[#94A3B8] text-[10px]">Current (A)</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
