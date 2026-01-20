import { useState, useCallback, useRef } from 'react';

interface RateLimiterOptions {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimiterState {
  attempts: number;
  lockedUntil: number | null;
  remaining: number;
  isLocked: boolean;
  lockoutSecondsRemaining: number;
}

export function useRateLimiter(options: RateLimiterOptions = {
  maxAttempts: 5,
  windowMs: 60000, // 1 minute
  lockoutMs: 30000, // 30 second lockout
}) {
  const [state, setState] = useState<RateLimiterState>({
    attempts: 0,
    lockedUntil: null,
    remaining: options.maxAttempts,
    isLocked: false,
    lockoutSecondsRemaining: 0,
  });

  const attemptTimestamps = useRef<number[]>([]);
  const lockoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkAndRecord = useCallback((): { allowed: boolean; message?: string } => {
    const now = Date.now();

    // Check if currently locked out
    if (state.lockedUntil && now < state.lockedUntil) {
      const secondsRemaining = Math.ceil((state.lockedUntil - now) / 1000);
      return {
        allowed: false,
        message: `Too many attempts. Please wait ${secondsRemaining} seconds.`,
      };
    }

    // Clear lockout if expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      attemptTimestamps.current = [];
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
        lockoutIntervalRef.current = null;
      }
    }

    // Clean old attempts outside the window
    attemptTimestamps.current = attemptTimestamps.current.filter(
      (timestamp) => now - timestamp < options.windowMs
    );

    // Check if max attempts reached
    if (attemptTimestamps.current.length >= options.maxAttempts) {
      const lockedUntil = now + options.lockoutMs;
      
      // Start countdown interval
      lockoutIntervalRef.current = setInterval(() => {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          if (lockoutIntervalRef.current) {
            clearInterval(lockoutIntervalRef.current);
            lockoutIntervalRef.current = null;
          }
          setState({
            attempts: 0,
            lockedUntil: null,
            remaining: options.maxAttempts,
            isLocked: false,
            lockoutSecondsRemaining: 0,
          });
        } else {
          setState((prev) => ({
            ...prev,
            lockoutSecondsRemaining: remaining,
          }));
        }
      }, 1000);

      setState({
        attempts: attemptTimestamps.current.length,
        lockedUntil,
        remaining: 0,
        isLocked: true,
        lockoutSecondsRemaining: Math.ceil(options.lockoutMs / 1000),
      });

      return {
        allowed: false,
        message: `Too many attempts. Please wait ${Math.ceil(options.lockoutMs / 1000)} seconds.`,
      };
    }

    // Record this attempt
    attemptTimestamps.current.push(now);
    const remaining = options.maxAttempts - attemptTimestamps.current.length;

    setState({
      attempts: attemptTimestamps.current.length,
      lockedUntil: null,
      remaining,
      isLocked: false,
      lockoutSecondsRemaining: 0,
    });

    return { allowed: true };
  }, [state.lockedUntil, options.maxAttempts, options.windowMs, options.lockoutMs]);

  const reset = useCallback(() => {
    attemptTimestamps.current = [];
    if (lockoutIntervalRef.current) {
      clearInterval(lockoutIntervalRef.current);
      lockoutIntervalRef.current = null;
    }
    setState({
      attempts: 0,
      lockedUntil: null,
      remaining: options.maxAttempts,
      isLocked: false,
      lockoutSecondsRemaining: 0,
    });
  }, [options.maxAttempts]);

  return {
    ...state,
    checkAndRecord,
    reset,
  };
}
