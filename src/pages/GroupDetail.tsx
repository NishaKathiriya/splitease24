import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Calendar, DollarSign, Users as UsersIcon } from "lucide-react";
import { ExpenseChat } from "@/components/ExpenseChat";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
  payer_id: string;
  profiles: {
    full_name: string;
  };
}

interface Member {
  id: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
}

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          profiles:payer_id (full_name)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select(`
          id,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq("group_id", groupId);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error: any) {
      toast.error("Failed to load group data");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      Transport: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      Entertainment: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      Shopping: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
      Utilities: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      General: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    };
    return colors[category] || colors.General;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{group?.name}</h1>
              <p className="text-sm text-muted-foreground">{group?.description || "No description"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Members */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Group Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                  </div>
                  <span className="font-semibold">${totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                  </div>
                  <span className="font-semibold">{expenses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Members</span>
                  </div>
                  <span className="font-semibold">{members.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Members Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary-glow">
                      <AvatarFallback className="bg-transparent text-primary-foreground text-xs">
                        {getInitials(member.profiles.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.profiles.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.profiles.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Expenses & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setShowChat(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Chat to Add Expense
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAddExpense(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </div>

            {/* Expenses List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>All group transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding an expense using AI chat or manual entry
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense, index) => (
                      <div key={expense.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{expense.description}</h4>
                              <Badge variant="outline" className={getCategoryColor(expense.category)}>
                                {expense.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Paid by {expense.profiles.full_name} • {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${parseFloat(expense.amount.toString()).toFixed(2)}</p>
                          </div>
                        </div>
                        {index < expenses.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ExpenseChat
        open={showChat}
        onOpenChange={setShowChat}
        groupId={groupId!}
        members={members.map(m => m.profiles)}
        onExpenseAdded={loadGroupData}
      />
      
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        groupId={groupId!}
        members={members.map(m => m.profiles)}
        onExpenseAdded={loadGroupData}
      />
    </div>
  );
};

export default GroupDetail;
