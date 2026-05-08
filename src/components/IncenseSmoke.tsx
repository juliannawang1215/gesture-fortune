import { motion } from 'motion/react';

export function IncenseSmoke() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex flex-row items-end justify-around px-10">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="relative w-32 h-64 md:w-64 md:h-96 rounded-[100%] bg-white mix-blend-screen opacity-0 animate-smoke"
          style={{
            transformOrigin: '50% 100%',
            animationDelay: `${i * 3.5}s`,
            animationDuration: `${18 + (i % 3) * 5}s`,
            left: `${-10 + (i * 20)}%`,
          }}
        />
      ))}
    </div>
  );
}
