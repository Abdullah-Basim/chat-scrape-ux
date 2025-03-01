
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Bot, Globe, LogOut } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          throw new Error('Not authenticated');
        }
        
        setUser(data.user);
      } catch (error) {
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-24">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Welcome to your AI Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {user?.email}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <div className="p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Web Scraping Module</h2>
              <p className="text-muted-foreground mb-6">
                Extract data from any website with our AI-powered scraper.
                Just enter a URL and our system will analyze the available data elements.
              </p>
              <Button 
                onClick={() => navigate('/web-scraper')}
                className="w-full flex items-center justify-center"
              >
                Go to Web Scraper
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <div className="p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chatbot Development Module</h2>
              <p className="text-muted-foreground mb-6">
                Create a custom AI chatbot with a single click by uploading your data.
                Our system will automatically train a personalized model for your needs.
              </p>
              <Button 
                onClick={() => navigate('/chatbot-builder')}
                className="w-full flex items-center justify-center"
              >
                Go to Chatbot Builder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
