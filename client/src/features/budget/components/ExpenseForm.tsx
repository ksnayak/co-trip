import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExpense } from "../hooks/useExpenses";
import { useMembers } from "@/features/members/hooks/useMembers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

const categories = ["food", "transport", "accommodation", "activities", "shopping", "other"];

export function AddExpenseDialog({ tripId, currencySymbol = "\u20B9" }: { tripId: string; currencySymbol?: string }) {
  const [open, setOpen] = useState(false);
  const createExpense = useCreateExpense(tripId);
  const { data: members } = useMembers(tripId);
  const { user } = useAuth();
  const [splitType, setSplitType] = useState<string>("full");
  const [paidBy, setPaidBy] = useState<string>("");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.id && !paidBy) {
      setPaidBy(user.id);
    }
  }, [user?.id, paidBy]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amountCents = Math.round(Number(form.get("amount")) * 100);

    const splits =
      splitType === "custom" && members
        ? members
            .filter((m) => customSplits[m.user_id] && Number(customSplits[m.user_id]) > 0)
            .map((m) => ({
              user_id: m.user_id,
              amount_cents: Math.round(Number(customSplits[m.user_id]) * 100),
            }))
        : undefined;

    try {
      await createExpense.mutateAsync({
        title: form.get("title") as string,
        amount_cents: amountCents,
        category: (form.get("category") as string) || undefined,
        split_type: splitType as "equal" | "custom" | "full",
        paid_by: paidBy || user!.id,
        date: (form.get("date") as string) || undefined,
        notes: (form.get("notes") as string) || undefined,
        splits,
      });
      toast.success("Expense added");
      setOpen(false);
      setSplitType("full");
      setCustomSplits({});
    } catch {
      toast.error("Failed to add expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>Track a new expense for this trip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="exp-title">Title</Label>
            <Input id="exp-title" name="title" placeholder="Dinner at..." required className="h-11" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="exp-amount">Amount ({currencySymbol})</Label>
              <Input id="exp-amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input id="exp-date" name="date" type="date" className="h-11" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select name="category">
              <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members?.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.profile?.display_name || m.profile?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Split type</Label>
            <Select value={splitType} onValueChange={setSplitType}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">No split (full amount)</SelectItem>
                <SelectItem value="equal">Equal split</SelectItem>
                <SelectItem value="custom">Custom split</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {splitType === "custom" && members && (
            <div className="grid gap-2 rounded-lg border border-border/50 p-3">
              <Label className="text-xs text-muted-foreground">Per-member amounts ({currencySymbol})</Label>
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center gap-2">
                  <span className="text-sm flex-1 truncate">{m.profile?.display_name || m.profile?.email}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-8 w-24 text-xs"
                    placeholder="0.00"
                    value={customSplits[m.user_id] || ""}
                    onChange={(e) => setCustomSplits((prev) => ({ ...prev, [m.user_id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="exp-notes">Notes</Label>
            <Input id="exp-notes" name="notes" placeholder="Optional notes" className="h-11" />
          </div>
          <Button type="submit" disabled={createExpense.isPending} className="h-11 mt-1">
            {createExpense.isPending ? "Adding..." : "Add expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
