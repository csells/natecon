import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DEADLINE_DATE = new Date('2026-03-01T23:59:59');

export function TalkDeadlineCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = DEADLINE_DATE.getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setIsPastDeadline(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isPastDeadline) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-semibold">Talk submissions are now closed</p>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.days < 7;

  return (
    <div className={`rounded-xl p-6 text-center ${isUrgent ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'}`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className={`w-5 h-5 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
        <span className={`font-semibold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
          Talk Submission Deadline: March 1, 2026
        </span>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        <div className="bg-card border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
            {timeLeft.days}
          </div>
          <div className="text-xs text-muted-foreground uppercase">Days</div>
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
            {timeLeft.hours}
          </div>
          <div className="text-xs text-muted-foreground uppercase">Hours</div>
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
            {timeLeft.minutes}
          </div>
          <div className="text-xs text-muted-foreground uppercase">Min</div>
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
            {timeLeft.seconds}
          </div>
          <div className="text-xs text-muted-foreground uppercase">Sec</div>
        </div>
      </div>

      <Link to="/auth">
        <Button variant={isUrgent ? 'destructive' : 'default'} size="sm">
          Submit Your Talk
        </Button>
      </Link>
    </div>
  );
}
