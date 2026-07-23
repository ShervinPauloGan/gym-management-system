import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services";

export function TrendChart() {
  const [period, setPeriod] = useState(30);
  const { data } = useQuery({ queryKey: ["trends", period], queryFn: () => dashboardService.getTrends().then((r) => r.data) });

  const records = (data ?? []).slice(-period);
  const max = Math.max(1, ...records.map((r: { checkIns: number }) => r.checkIns), ...records.map((r: { registrations: number }) => r.registrations));

  const w = 600;
  const h = 200;
  const pad = 30;
  const gw = w - pad * 2;
  const gh = h - pad * 2;

  function line(points: number[]) {
    return points
      .map((v, i) => {
        const x = pad + (i / Math.max(1, points.length - 1)) * gw;
        const y = pad + gh - (v / max) * gh;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  const checkInLine = line(records.map((r: { checkIns: number }) => r.checkIns));
  const regLine = line(records.map((r: { registrations: number }) => r.registrations));
  const labels = records.filter((_: unknown, i: number) => i % 5 === 0 || i === records.length - 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111111]">Growth Trends</h3>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1 text-xs rounded-md cursor-pointer transition-colors ${period === d ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-container"}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={pad} y1={pad + (gh / 4) * i} x2={w - pad} y2={pad + (gh / 4) * i} stroke="#E5E7EB" strokeWidth="1" />
        ))}
        <path d={checkInLine} fill="none" stroke="#111111" strokeWidth="2" />
        <path d={regLine} fill="none" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 2" />
        {labels.map((r: { date: string }, i: number) => {
          const idx = records.findIndex((d: { date: string }) => d.date === r.date);
          const x = pad + (idx / Math.max(1, records.length - 1)) * gw;
          return <text key={i} x={x} y={h - 4} textAnchor="middle" className="fill-muted text-[8px]">{r.date.slice(5)}</text>;
        })}
        <text x={w - pad} y={pad + 10} textAnchor="end" className="fill-[#111111] text-[8px]">Check-ins</text>
        <text x={w - pad} y={pad + 22} textAnchor="end" className="fill-muted text-[8px]">Registrations</text>
      </svg>
    </div>
  );
}
