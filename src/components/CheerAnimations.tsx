import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/utils';

type CheerParticlesProps = {
  className?: string;
  density?: number;
};

export const CheerParticles: React.FC<CheerParticlesProps> = ({ className, density = 12 }) => {
  const shouldReduceMotion = useReducedMotion();

  const particles = useMemo(() => {
    const symbols = ['👏', '🎉', '🏆', '⚽', '🏀', '🏏'];
    return Array.from({ length: density }).map((_, i) => {
      const left = ((i + 1) / (density + 1)) * 100;
      const delay = (i % 6) * 0.25;
      const duration = 2.8 + (i % 5) * 0.35;
      const drift = (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 4);
      return { id: i, left, delay, duration, drift, symbol: symbols[i % symbols.length] };
    });
  }, [density]);

  if (shouldReduceMotion) return null;

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-[-20px] text-base sm:text-lg opacity-0"
          style={{ left: `${p.left}%` }}
          animate={{
            y: [-10, -220],
            x: [0, p.drift],
            opacity: [0, 0.9, 0],
            rotate: [0, p.drift > 0 ? 8 : -8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
          }}
        >
          <span className="drop-shadow-sm">{p.symbol}</span>
        </motion.div>
      ))}
    </div>
  );
};

type CheerBurstProps = {
  className?: string;
};

export const CheerBurst: React.FC<CheerBurstProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  const items = ['👏', '🎉', '🏆'];

  return (
    <div aria-hidden className={cn('pointer-events-none inline-flex items-center gap-2', className)}>
      {items.map((s, i) => (
        <motion.span
          key={s}
          className="text-lg sm:text-xl"
          animate={{ y: [0, -6, 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
          transition={{ duration: 1.4 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
};

