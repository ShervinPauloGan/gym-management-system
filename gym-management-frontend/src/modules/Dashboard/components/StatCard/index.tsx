import { Card } from "@/shared/components/ui/Card";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  isLive?: boolean;
}

export function StatCard({ label, value, trend, trendUp, isLive }: StatCardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold text-muted uppercase tracking-[0.06em]">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-metric-lg text-[#111111]">{value}</p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-sm font-medium mb-1 ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
            {trendUp ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
            {trend}
          </span>
        )}
        {isLive && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            live
          </span>
        )}
      </div>
    </Card>
  );
}
