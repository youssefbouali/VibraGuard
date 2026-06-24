import { useState, useMemo, useEffect, useRef } from "react";
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
const VISIBLE_COUNT = 60;

export function VibrationChart() {
  const { data: moteurs = [] } = useMoteurs();
  const [selectedMotorId, setSelectedMotorId] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<string>("vibRms");
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedMotorId && moteurs.length > 0) {
      setSelectedMotorId(moteurs[0].id);
    }
  }, [moteurs, selectedMotorId]);

  const { data: vibrations = [], isLoading } = useVibrations(selectedMotorId || undefined);

  const METRICS = [
    { value: "vibRms", label: "Vibration RMS", color: "#0EA5E9", unit: "mm/s", scale: 11.8 },
    { value: "vibPeak", label: "Vibration Peak", color: "#F43F5E", unit: "mm/s", scale: 5.9 },
    { value: "vibKurtosis", label: "Kurtosis", color: "#10B981", unit: "", scale: 20 },
    { value: "temperature", label: "Température", color: "#F59E0B", unit: "°C", scale: 2 },
    { value: "currentRms", label: "Courant RMS", color: "#8B5CF6", unit: "mm/s", scale: 10 },
  ];

  const currentMetric = METRICS.find(m => m.value === selectedMetric) || METRICS[0];

  const maxPan = Math.max(0, vibrations.length - VISIBLE_COUNT);
  const clampedPan = Math.max(-maxPan, Math.min(0, panOffset));
  const startIdx = vibrations.length - VISIBLE_COUNT + clampedPan;
  const visibleData = vibrations.slice(Math.max(0, startIdx), Math.max(0, startIdx + VISIBLE_COUNT));

  // Reset pan when motor changes or new data arrives at the end
  useEffect(() => {
    setPanOffset(0);
  }, [selectedMotorId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, offset: panOffset });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const svgWidth = rect.width;
    if (svgWidth === 0) return;
    const dx = e.clientX - dragStart.x;
    const pixelPerPoint = svgWidth / VISIBLE_COUNT;
    const deltaPoints = Math.round(dx / pixelPerPoint);
    setPanOffset(dragStart.offset + deltaPoints);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke={currentMetric.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke={currentMetric.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Analyse {currentMetric.label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {vibrations.length > VISIBLE_COUNT && (
            <div className="flex items-center gap-1 mr-1">
              <button
                onClick={() => setPanOffset(prev => Math.max(-maxPan, prev - 15))}
                className="p-1 rounded hover:bg-white/10 text-[#64748B] hover:text-white transition-colors"
                title="Défiler vers la gauche"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => setPanOffset(prev => Math.min(0, prev + 15))}
                className="p-1 rounded hover:bg-white/10 text-[#64748B] hover:text-white transition-colors"
                title="Défiler vers la droite"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[120px] h-8 bg-white/5 border-white/10 text-white text-[11px]">
              <SelectValue placeholder="Métrique" />
            </SelectTrigger>
            <SelectContent className="bg-[#111A24] border-white/10 text-white">
              {METRICS.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMotorId} onValueChange={setSelectedMotorId}>
            <SelectTrigger className="w-[140px] h-8 bg-white/5 border-white/10 text-white text-[11px]">
              <SelectValue placeholder="Moteur" />
            </SelectTrigger>
            <SelectContent className="bg-[#111A24] border-white/10 text-white">
              {moteurs.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.type} ({m.id.substring(0, 5)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div
        ref={chartRef}
        className="flex-1 min-h-0 relative select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? "grabbing" : vibrations.length > VISIBLE_COUNT ? "grab" : "default" }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(17,26,36,0.50)] rounded-lg">
            <span className="text-white">Chargement...</span>
          </div>
        )}
        <svg viewBox="0 0 606 356" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none' }}>
          <g clipPath="url(#vib-clip)">
            {/* Grid lines */}
            <line x1="40.35" y1="59.3" x2="606" y2="59.3" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="118.6" x2="606" y2="118.6" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="177.9" x2="606" y2="177.9" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="237.2" x2="606" y2="237.2" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="296.5" x2="606" y2="296.5" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>

            {/* Y-axis labels with Units */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="0" y="64">{selectedMetric === 'temperature' ? '70' : '20'} {currentMetric.unit}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="0" y="183">{selectedMetric === 'temperature' ? '50' : '10'} {currentMetric.unit}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="0" y="302">0 {currentMetric.unit}</text>

            {/* X-axis labels */}
            {visibleData.length > 0 && (
              <>
                <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="40" y="334">{formatTime(visibleData[0].time)}</text>
                <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="274" y="334">{visibleData.length > 2 ? formatTime(visibleData[Math.floor(visibleData.length/2)].time) : ""}</text>
                <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="10" x="520" y="334">{formatTime(visibleData[visibleData.length-1].time)}</text>
              </>
            )}
            
            {/* Dynamic path */}
            {visibleData.length >= 2 && (
              <g>
                {(() => {
                  const points = visibleData.map((v, i) => {
                    const x = 40.35 + (i * (565 / (visibleData.length - 1)));
                    let val = (v as any)[selectedMetric] || 0;
                    if (selectedMetric === "temperature") val = (val - 50) / 2;
                    const y = 296.5 - (val * currentMetric.scale);
                    return `${x} ${y}`;
                  });
                  const pathD = `M ${points.join(' L ')}`;
                  return (
                    <>
                      <path d={pathD} stroke={currentMetric.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                      {visibleData.map((v, i) => {
                        if (!v.isAnomalous) return null;
                        const x = 40.35 + (i * (565 / (visibleData.length - 1)));
                        let val = (v as any)[selectedMetric] || 0;
                        if (selectedMetric === "temperature") val = (val - 50) / 2;
                        const y = 296.5 - (val * currentMetric.scale);
                        return <circle key={`single-${i}`} cx={x} cy={y} r="3.5" fill="#EF4444" className="animate-pulse" />;
                      })}
                    </>
                  );
                })()}
              </g>
            )}
          </g>

          <defs>
            <clipPath id="vib-clip">
              <rect width="605.19" height="355.81" fill="white"/>
            </clipPath>
          </defs>
        </svg>

        {/* Pan hints */}
        {vibrations.length > VISIBLE_COUNT && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 11l-6-6-6 6M18 19l-6-6-6 6"/>
              </svg>
              {clampedPan < 0 && (
                <span>{Math.min(startIdx + VISIBLE_COUNT, vibrations.length)}/{vibrations.length}</span>
              )}
              {clampedPan === 0 && <span>Récent</span>}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentMetric.color }} />
          <span className="text-[#94A3B8] text-xs font-semibold">{currentMetric.label} : {vibrations.length > 0 ? (vibrations[vibrations.length-1] as any)[selectedMetric]?.toFixed(2) : '0'} {currentMetric.unit}</span>
        </div>
        {vibrations.length > VISIBLE_COUNT && (
          <span className="text-[#4FB3AF] text-[10px]">
            {isDragging ? "Glisser" : "← glisser pour naviguer →"}
          </span>
        )}
      </div>
    </div>
  );
}
