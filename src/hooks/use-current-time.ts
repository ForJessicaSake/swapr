"use client";

import { useEffect, useState } from "react";

export function useCurrentTime(intervalMs = 1_000) {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(
      () => setCurrentTimeMs(Date.now()),
      intervalMs,
    );
    return () => window.clearInterval(timerId);
  }, [intervalMs]);

  return currentTimeMs;
}
