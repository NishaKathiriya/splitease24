import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Array<{ id: string; full_name: string }>;
  onExpenseAdded: () => void;
}

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
  category: z.string().min(1, "Category is required"),
  payerId: z.string().min(1, "Please select who paid"),
});

export const AddExpenseDialog = ({ open, onOpenChange, groupId, members, onExpenseAdded }: AddExpenseDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [payerId, setPayerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Food", "Transport", "Entertainment", "Shopping", "Utilities", "General"];

  const handleSubmit = async () => {
    try {
      const validation = expenseSchema.parse({
        amount: parseFloat(amount),
        description,
        category,
        payerId,
      });

      setIsSubmitting(true);

      const { error } = await supabase.from("expenses").insert({
        group_id: groupId,
        payer_id: validation.payerId,
        amount: validation.amount,
        description: validation.description,
        category: validation.category,
      });

      if (error) throw error;

      toast.success("Expense added successfully!");
      onExpenseAdded();
      onOpenChange(false);
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("General");
      setPayerId("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to add expense");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense Manually</DialogTitle>
          <DialogDescription>Enter the expense details below</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="payer">Who Paid?</Label>
            <Select value={payerId} onValueChange={setPayerId}>
              <SelectTrigger id="payer">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="30.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Pizza dinner, Uber ride, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
