import React from 'react';
import Countdown, { CountdownApi, CountdownRendererFn } from 'react-countdown';

type CountdownRendererProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
  api: CountdownApi;
};

interface CountdownProps {
  date: Date | string | number;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownProps> = ({ 
  date, 
  onComplete 
}) => {
  const renderer: CountdownRendererFn = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: CountdownRendererProps) => {
    if (completed) {
      return <p className='p-2 bg-green-300/20 rounded-xl'>Election has ended!</p>;
    }

    return (
      <div className="flex gap-2">
        <div className="bg-muted p-2 rounded text-center min-w-[50px]">
          <div className="text-2xl font-bold">{days}</div>
          <div className="text-xs">Days</div>
        </div>
        <div className="bg-muted p-2 rounded text-center min-w-[50px]">
          <div className="text-2xl font-bold">{hours}</div>
          <div className="text-xs">Hours</div>
        </div>
        <div className="bg-muted p-2 rounded text-center min-w-[50px]">
          <div className="text-2xl font-bold">{minutes}</div>
          <div className="text-xs">Minutes</div>
        </div>
        <div className="bg-muted p-2 rounded text-center min-w-[50px]">
          <div className="text-2xl font-bold">{seconds}</div>
          <div className="text-xs">Seconds</div>
        </div>
      </div>
    );
  };

  return (
    <Countdown
      date={date}
      renderer={renderer}
      onComplete={onComplete}
    />
  );
};

export default CountdownTimer;