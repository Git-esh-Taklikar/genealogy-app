import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Track user activity and determine idle state.
 * @param {number} timeout - Idle timeout in seconds (default 90).
 * @returns {{ isIdle: boolean, secondsRemaining: number, resetTimer: () => void }}
 */
export function useIdleTimer(timeout = 90) {
  const [isIdle, setIsIdle] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(timeout);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setSecondsRemaining(timeout);
  }, [timeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Countdown interval
    countdownRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeout - elapsed);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [timeout, resetTimer]);

  return { isIdle, secondsRemaining, resetTimer };
}

