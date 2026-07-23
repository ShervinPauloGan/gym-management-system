import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planShopService } from "../../services";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const emptyForm = { planName: "", durationDays: 30, price: 0, tier: "silver", description: "" };

export function PlanShopPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: plans, isLoading } = useQuery({ queryKey: ["plans"], queryFn: () => planShopService.getAll().then((r) => r.data) });

  const createMutation = useMutation({
    mutationFn: () => planShopService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); setShowForm(false); setForm(emptyForm); toast.success("Plan created"); },
  });
  const updateMutation = useMutation({
    mutationFn: () => planShopService.update(editing.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); setEditing(null); setForm(emptyForm); toast.success("Plan updated"); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => planShopService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); toast.success("Plan deleted"); },
  });

  function openEdit(plan: any) { setEditing(plan); setForm(plan); setShowForm(true); }
  function openCreate() { setEditing(null); setForm(emptyForm); setShowForm(true); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Plan Shop</h1>
          <p className="text-sm text-muted mt-1">Manage membership plans</p>
        </div>
        <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-sm text-muted col-span-full">Loading...</p>}
        {(plans ?? []).map((p: any) => (
          <Card key={p.id} className={`p-5 ${!p.isActive ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#111111]">{p.planName}</h3>
                <p className="text-xs text-muted mt-0.5">₱{Number(p.price).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1 text-muted hover:text-[#111111] cursor-pointer"><PencilSquareIcon className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="p-1 text-muted hover:text-error cursor-pointer"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-muted">
              <span className="px-2 py-0.5 bg-surface-container rounded-full">{p.durationDays}d</span>
              <span className="px-2 py-0.5 bg-surface-container rounded-full capitalize">{p.tier}</span>
              {!p.isActive && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full">Inactive</span>}
            </div>
            {p.description && <p className="text-xs text-muted mt-2">{p.description}</p>}
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <Card className="p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-[#111111] mb-4">{editing ? "Edit Plan" : "New Plan"}</h2>
            <form onSubmit={submit} className="space-y-4">
              <Input id="pn" label="Plan Name" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted font-medium mb-1 block">Duration (days)</label>
                  <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted font-medium mb-1 block">Price (₱)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted font-medium mb-1 block">Tier</label>
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="walk-in">Walk-In</option><option value="silver">Silver</option><option value="gold">Gold</option>
                </select>
              </div>
              <Input id="desc" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>{editing ? "Update" : "Create"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
