import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Send, Loader2 } from "lucide-react";

interface ExpenseChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Array<{ id: string; full_name: string }>;
  onExpenseAdded: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ExpenseChat = ({ open, onOpenChange, groupId, members, onExpenseAdded }: ExpenseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! Tell me about an expense naturally, like: 'I paid $30 for pizza' or 'Spent 50 on groceries'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Call edge function to parse expense
      const { data, error } = await supabase.functions.invoke("parse-expense", {
        body: { message: userMessage, members: members.map(m => m.full_name) },
      });

      if (error) throw error;

      const parsed = data.expense;
      
      // Find payer by name
      const payer = members.find(m => 
        m.full_name.toLowerCase() === parsed.payer.toLowerCase()
      );

      if (!payer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't find "${parsed.payer}" in your group. Please specify one of: ${members.map(m => m.full_name).join(", ")}`,
          },
        ]);
        return;
      }

      // Create expense
      const { error: insertError } = await supabase.from("expenses").insert({
        group_id: groupId,
        payer_id: payer.id,
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
      });

      if (insertError) throw insertError;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Added expense: ${parsed.description} - $${parsed.amount} (${parsed.category}) paid by ${payer.full_name}`,
        },
      ]);

      toast.success("Expense added successfully!");
      onExpenseAdded();
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setMessages([
          {
            role: "assistant",
            content: "Hi! Tell me about an expense naturally, like: 'I paid $30 for pizza' or 'Spent 50 on groceries'",
          },
        ]);
      }, 1500);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't understand that. ${error.message || "Please try again with more details."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Expense Parser
          </DialogTitle>
          <DialogDescription>
            Just describe your expense naturally and I'll extract the details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary-glow">
                    <AvatarFallback className="bg-transparent text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary-glow">
                  <AvatarFallback className="bg-transparent text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-4 py-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I paid $30 for pizza last night"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
