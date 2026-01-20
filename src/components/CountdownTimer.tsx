import { useState, useEffect } from 'react';
import { PartyPopper } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Target: March 14, 2026 at 9:00 AM Pacific Time
const EVENT_START_DATE = new Date('2026-03-14T09:00:00-08:00');
// Event ends March 15, 2026 at 6:00 PM Pacific Time
const EVENT_END_DATE = new Date('2026-03-15T18:00:00-08:00');

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'happening' | 'concluded'>('upcoming');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      // Check if event has concluded
      if (now >= EVENT_END_DATE) {
        setEventStatus('concluded');
        return;
      }
      
      // Check if event is happening now
      if (now >= EVENT_START_DATE && now < EVENT_END_DATE) {
        setEventStatus('happening');
        return;
      }
      
      // Event is upcoming - calculate countdown
      setEventStatus('upcoming');
      const difference = EVENT_START_DATE.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Post-event state
  if (eventStatus === 'concluded') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <PartyPopper className="w-12 h-12 text-primary animate-bounce" />
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Event Concluded
          </h3>
          <p className="text-lg text-muted-foreground">
            See you next year! 🎉
          </p>
        </div>
      </div>
    );
  }

  // Event happening now state
  if (eventStatus === 'happening') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="relative">
          <span className="absolute w-4 h-4 rounded-full bg-green-500 animate-ping"></span>
          <span className="relative w-4 h-4 rounded-full bg-green-500 block"></span>
        </div>
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Happening Now!
          </h3>
          <p className="text-lg text-muted-foreground">
            NateCon 2026 is live 🚀
          </p>
        </div>
      </div>
    );
  }

  // Countdown state
  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
      {timeBlocks.map((block, index) => (
        <div key={block.label} className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <div className="flex flex-col items-center">
            <div className="bg-card border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 min-w-[60px] sm:min-w-[70px] md:min-w-[90px] text-center shadow-lg">
              <span className="countdown-number text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground">
                {String(block.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider">
              {block.label}
            </span>
          </div>
          {index < timeBlocks.length - 1 && (
            <span className="text-2xl sm:text-3xl md:text-4xl text-primary font-light mb-6">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
