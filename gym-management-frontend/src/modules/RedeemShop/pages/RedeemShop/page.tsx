import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redeemShopService } from "../../services";
import { useAuthStore } from "@/shared/stores/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { PencilSquareIcon, TrashIcon, PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const emptyForm = { itemName: "", pointsCost: 50, stockQuantity: 10, description: "" };

export function RedeemShopPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: items, isLoading } = useQuery({ queryKey: ["redeem"], queryFn: () => redeemShopService.getAll().then((r) => r.data) });

  const createMutation = useMutation({
    mutationFn: () => redeemShopService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["redeem"] }); setShowForm(false); setForm(emptyForm); toast.success("Item added"); },
  });
  const updateMutation = useMutation({
    mutationFn: () => redeemShopService.update(editing.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["redeem"] }); setEditing(null); setForm(emptyForm); toast.success("Item updated"); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => redeemShopService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["redeem"] }); toast.success("Item removed"); },
  });
  const redeemMutation = useMutation({
    mutationFn: (itemId: string) => redeemShopService.redeem(itemId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["redeem"] }); queryClient.invalidateQueries({ queryKey: ["members"] }); toast.success("Redeemed successfully!"); },
    onError: (err: any) => toast.error(err.response?.data?.error || "Redemption failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Redeem Shop</h1>
          <p className="text-sm text-muted mt-1">Spend points on rewards</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}><PlusIcon className="w-4 h-4 mr-1" /> Add Item</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-sm text-muted col-span-full">Loading...</p>}
        {(items ?? []).map((item: any) => (
          <Card key={item.id} className={`p-5 ${!item.isAvailable ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-surface-dim flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-muted" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(item); setForm(item); setShowForm(true); }} className="p-1 text-muted hover:text-[#111111] cursor-pointer"><PencilSquareIcon className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }} className="p-1 text-muted hover:text-error cursor-pointer"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-[#111111]">{item.itemName}</h3>
            <p className="text-xs text-muted mt-1">{item.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-bold text-[#111111]">{item.pointsCost} pts</span>
              <span className="text-xs text-muted">Stock: {item.stockQuantity}</span>
            </div>
            <Button size="sm" className="w-full mt-3" disabled={!item.isAvailable || item.stockQuantity < 1}
              loading={redeemMutation.isPending} onClick={() => redeemMutation.mutate(item.id)}>
              {item.stockQuantity < 1 ? "Out of Stock" : "Redeem"}
            </Button>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <Card className="p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-[#111111] mb-4">{editing ? "Edit Item" : "New Item"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); editing ? updateMutation.mutate() : createMutation.mutate(); }} className="space-y-4">
              <Input id="in" label="Item Name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted font-medium mb-1 block">Points Cost</label>
                  <input type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted font-medium mb-1 block">Stock</label>
                  <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
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
