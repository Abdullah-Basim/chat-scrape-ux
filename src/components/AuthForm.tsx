
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Check your email for the confirmation link",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur-sm border border-border/50">
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
          disabled={loading}
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
