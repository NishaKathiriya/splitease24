import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Split, Sparkles, Users, TrendingUp, MessageSquare, Receipt, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Parsing",
      description: "Just type naturally: 'I paid $30 for pizza' and let AI handle the rest",
    },
    {
      icon: MessageSquare,
      title: "Chat Interface",
      description: "Add expenses through natural conversation - no forms required",
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Create groups for trips, roommates, or any shared expenses",
    },
    {
      icon: TrendingUp,
      title: "Smart Settlements",
      description: "Minimize transactions with optimized payment suggestions",
    },
    {
      icon: Receipt,
      title: "Receipt Scanning",
      description: "Upload receipts and let OCR extract all the details automatically",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Stay synced with your group members instantly",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow mb-6 shadow-lg shadow-primary/25">
              <Split className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Split Expenses with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              No more manual calculations. Just chat naturally about expenses and let AI handle the splitting, tracking, and settlements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="text-lg px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                See Demo
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to split expenses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with AI and designed for simplicity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to simplify expense splitting?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of users who are already splitting smarter with AI
              </p>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Start Splitting Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Split className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SplitEase</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SplitEase. AI-powered expense splitting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
