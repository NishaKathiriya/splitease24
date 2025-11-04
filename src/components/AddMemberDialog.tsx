import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onMemberAdded: () => void;
  existingMembers: string[];
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  groupId,
  onMemberAdded,
  existingMembers,
}: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsAdding(true);
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (userError) throw userError;

      if (!user) {
        toast.error("User not found. They need to sign up first.");
        return;
      }

      // Check if already a member
      if (existingMembers.includes(user.id)) {
        toast.error("User is already a member of this group");
        return;
      }

      // Add to group
      const { error: insertError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      toast.success(`${user.full_name} added to group!`);
      setEmail("");
      onOpenChange(false);
      onMemberAdded();
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to add to this group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <p className="text-xs text-muted-foreground">
              They must have a SplitEase account
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
