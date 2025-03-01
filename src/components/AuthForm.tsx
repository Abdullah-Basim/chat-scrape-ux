
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Supabase is not configured. Please set the proper environment variables.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);

        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "Check your email for the confirmation link",
        });
        
        // Optionally redirect or show a confirmation screen
        // navigate('/email-confirmation');
      } else {
        const { error } = await signIn(email, password);

        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur-sm border border-border/50">
      {!supabaseConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Supabase is not properly configured. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create an Account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' 
              ? 'Enter your credentials to access your account' 
              : 'Fill in the form below to create your account'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !supabaseConfigured}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'signin' ? 'Signing in...' : 'Signing up...'}
            </>
          ) : (
            <>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</>
          )}
        </Button>

        <div className="mt-4 text-center text-sm">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="text-primary hover:underline"
              >
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a 
                href="/signin" 
                className="text-primary hover:underline"
              >
                Sign in
              </a>
            </p>
          )}
        </div>
      </form>
    </Card>
  );
};

export default AuthForm;
