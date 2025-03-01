
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/AuthContext';

const SignIn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">All-in-One AI Platform</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to access your AI tools
        </p>
      </div>
      
      <Separator className="my-6 max-w-xs mx-auto" />
      
      <AuthForm mode="signin" />
    </div>
  );
};

export default SignIn;
