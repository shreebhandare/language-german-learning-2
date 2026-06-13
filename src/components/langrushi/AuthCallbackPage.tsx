import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      } else {
        // Fallback timeout to ensure redirection happens even if auth is delayed
        const timeout = setTimeout(() => {
          navigate('/');
        }, 2000);
        return () => clearTimeout(timeout);
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="flex flex-col items-center max-w-sm text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl font-bold">Completing Sign In</h1>
        <p className="text-muted-foreground text-sm">
          Please wait while we establish your secure session and redirect you.
        </p>
      </div>
    </div>
  );
};
