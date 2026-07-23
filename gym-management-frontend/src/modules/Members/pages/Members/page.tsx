import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { membersService } from "../../services";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export function MembersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [qrMember, setQrMember] = useState<{ fullName: string; qrCodeToken: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["members", page, search],
    queryFn: () => membersService.getAll({ page, limit: 10, q: search || undefined }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); toast.success("Member deleted"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Members</h1>
          <p className="text-sm text-muted mt-1">Manage all registered members</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search members..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container text-left text-xs text-muted uppercase">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Tier</th>
              <th className="py-3 px-4 font-medium">Points</th>
              <th className="py-3 px-4 font-medium">QR Code</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-8 text-center text-muted">Loading...</td></tr>}
            {!isLoading && (data?.data ?? []).length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted">No members found</td></tr>}
            {(data?.data ?? []).map((m: { id: string; fullName: string; email: string; tier: string; pointsBalance: number; qrCodeToken: string }) => (
              <tr key={m.id} className="border-t border-border hover:bg-surface-container/50">
                <td className="py-3 px-4 font-medium text-[#111111]">{m.fullName}</td>
                <td className="py-3 px-4 text-muted">{m.email || "—"}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    m.tier === "gold" ? "bg-yellow-100 text-yellow-700" : m.tier === "silver" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                  }`}>{m.tier}</span>
                </td>
                <td className="py-3 px-4 text-muted">{m.pointsBalance}</td>
                <td className="py-3 px-4">
                  <button onClick={() => setQrMember(m)} className="text-xs text-primary underline cursor-pointer">View QR</button>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => { if (confirm("Delete this member?")) deleteMutation.mutate(m.id); }}
                    className="text-xs text-error hover:underline cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted">
            <span>Page {data.page} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-border rounded-md disabled:opacity-40 cursor-pointer text-xs">Prev</button>
              <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-border rounded-md disabled:opacity-40 cursor-pointer text-xs">Next</button>
            </div>
          </div>
        )}
      </Card>

      {qrMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setQrMember(null)}>
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQrMember(null)} className="self-end text-muted hover:text-[#111111] cursor-pointer"><XMarkIcon className="w-5 h-5" /></button>
            <QRCodeSVG value={qrMember.qrCodeToken} size={200} />
            <p className="text-sm font-medium text-[#111111]">{qrMember.fullName}</p>
            <p className="text-[10px] text-muted break-all max-w-[200px] text-center">{qrMember.qrCodeToken}</p>
          </div>
        </div>
      )}
    </div>
  );
}
