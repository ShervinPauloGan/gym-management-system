import { Card } from "@/shared/components/ui/Card";

export function TrendChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111111]">Growth Trends</h3>
          <p className="text-xs text-muted">Monthly overview</p>
        </div>
        <div className="flex items-center gap-2">
          {["7D", "30D", "90D"].map((p) => (
            <button key={p} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${p === "30D" ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-container"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-48 bg-surface-container-low rounded-lg flex items-center justify-center">
        <svg className="w-full h-full px-2" viewBox="0 0 340 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111111" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,100 L20,85 L40,90 L60,70 L80,75 L100,55 L120,60 L140,40 L160,45 L180,30 L200,35 L220,20 L240,25 L260,15 L280,18 L300,10 L320,12 L340,8" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M0,110 L20,100 L40,95 L60,85 L80,80 L100,70 L120,65 L140,55 L160,50 L180,40 L200,35 L220,25 L240,20 L260,15 L280,12 L300,8 L320,5 L340,3" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
          <path d="M0,105 L20,95 L40,85 L60,80 L80,70 L100,65 L120,55 L140,50 L160,40 L180,35 L200,25 L220,20 L240,15 L260,12 L280,10 L300,8 L320,6 L340,4" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
