import React, { useState, useEffect } from 'react';

interface DropCountdownTimerProps {
  targetDate: string;
}

export const DropCountdownTimer: React.FC<DropCountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 font-mono">
      <div className="bg-zinc-950 text-white px-2.5 py-1 rounded-none text-center">
        <span className="text-sm font-black block leading-none">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-400 block">Days</span>
      </div>
      <span className="font-bold text-zinc-950">:</span>
      <div className="bg-zinc-950 text-white px-2.5 py-1 rounded-none text-center">
        <span className="text-sm font-black block leading-none">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-400 block">Hours</span>
      </div>
      <span className="font-bold text-zinc-950">:</span>
      <div className="bg-zinc-950 text-white px-2.5 py-1 rounded-none text-center">
        <span className="text-sm font-black block leading-none">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-400 block">Mins</span>
      </div>
      <span className="font-bold text-zinc-950">:</span>
      <div className="bg-zinc-950 text-white px-2.5 py-1 rounded-none text-center">
        <span className="text-sm font-black block leading-none">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-zinc-400 block">Secs</span>
      </div>
    </div>
  );
};
