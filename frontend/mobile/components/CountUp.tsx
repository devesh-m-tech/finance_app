import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { formatPaiseToRupees } from '@shared/theme/typography';
import { motionTokens } from '@shared/motion/tokens';

export interface CountUpProps {
  endPaise: number;
  durationMs?: number;
  style?: TextStyle;
  includeDecimals?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  endPaise,
  durationMs = motionTokens.duration.hero,
  style,
  includeDecimals = true,
}) => {
  const [currentPaise, setCurrentPaise] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const startPaise = currentPaise;
    const diff = endPaise - startPaise;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startPaise + diff * eased);

      setCurrentPaise(nextVal);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [endPaise, durationMs]);

  return (
    <Text style={style}>
      {formatPaiseToRupees(currentPaise, includeDecimals)}
    </Text>
  );
};
