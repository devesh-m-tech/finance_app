export const motionTokens = {
  duration: {
    instant: 0,
    fast: 150,     // Tooltips, micro-toggles, icon states
    base: 250,     // Modal pop, sheet snap, card entrance
    slow: 400,     // Page transitions, wizard step slide
    hero: 600,     // Hero counters, celebratory burst
    celebrationMax: 1500, // Maximum celebratory confetti duration (always skippable)
  },
  easing: {
    standard: [0.2, 0.0, 0.0, 1.0] as [number, number, number, number],
    emphasized: [0.05, 0.7, 0.1, 1.0] as [number, number, number, number],
    decelerate: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
    accelerate: [0.3, 0.0, 1.0, 1.0] as [number, number, number, number],
  },
  spring: {
    gentle: {
      damping: 20,
      mass: 1,
      stiffness: 120,
    },
    snappy: {
      damping: 24,
      mass: 0.8,
      stiffness: 220,
    },
    bouncy: {
      damping: 12,
      mass: 0.9,
      stiffness: 180,
    },
  },
  stagger: {
    itemDelayMs: 40,
    maxStaggerItems: 12, // Capped at 12 items (480ms max stagger)
  },
} as const;

export type MotionDuration = keyof typeof motionTokens.duration;
export type MotionSpring = keyof typeof motionTokens.spring;

/**
 * Calculates stagger delay for item index, enforcing the 12-item cap.
 */
export function getStaggerDelay(index: number): number {
  const cappedIndex = Math.min(index, motionTokens.stagger.maxStaggerItems);
  return cappedIndex * motionTokens.stagger.itemDelayMs;
}
