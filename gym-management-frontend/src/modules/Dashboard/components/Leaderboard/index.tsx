import { Card } from "@/shared/components/ui/Card";
import { FireIcon } from "@heroicons/react/24/solid";

interface Member {
  name: string;
  streak: number;
  points: number;
  tier: string;
  avatar: string;
}

const topMembers: Member[] = [
  { name: "Alex Rivera", streak: 24, points: 1250, tier: "Gold", avatar: "AR" },
  { name: "Sarah Chen", streak: 18, points: 980, tier: "Silver", avatar: "SC" },
  { name: "Marcus Thorne", streak: 15, points: 1560, tier: "Gold", avatar: "MT" },
];

export function Leaderboard() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[#111111] mb-4">Top Members</h3>
      <div className="space-y-3">
        {topMembers.map((m, i) => (
          <div key={m.name} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <span className="text-xs font-semibold text-muted w-4">{i + 1}</span>
            <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-xs font-semibold">
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">{m.name}</p>
              <p className="text-xs text-muted">{m.tier} · {m.points.toLocaleString()} pts</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-500">
              <FireIcon className="w-4 h-4" />
              {m.streak}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
