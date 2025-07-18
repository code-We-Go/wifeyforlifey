// components/Fireworks.tsx
'use client';

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Fireworks() {
  useEffect(() => {
    const duration = 7 * 1000;
    const animationEnd = Date.now() + duration;

    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return null;
}
