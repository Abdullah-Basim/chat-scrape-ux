
import AuthForm from '@/components/AuthForm';
import { Separator } from "@/components/ui/separator";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">All-in-One AI Platform</h1>
        <p className="text-muted-foreground mt-2">
          Create an account to get started with our AI tools
        </p>
      </div>
      
      <Separator className="my-6 max-w-xs mx-auto" />
      
      <AuthForm mode="signup" />
    </div>
  );
};

export default SignUp;
