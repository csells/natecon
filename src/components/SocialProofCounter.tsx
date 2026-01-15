import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function SocialProofCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const { count: userCount, error } = await supabase
        .from('profiles_public')
        .select('*', { count: 'exact', head: true });

      if (!error && userCount !== null) {
        setCount(userCount);
      }
    };

    fetchCount();
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-2 h-2 rounded-full bg-primary animate-ping opacity-75"></span>
        <span className="relative w-2 h-2 rounded-full bg-primary"></span>
      </div>
      <Users className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">
        <span className="text-primary font-bold">{count.toLocaleString()}</span> people interested
      </span>
    </div>
  );
}
