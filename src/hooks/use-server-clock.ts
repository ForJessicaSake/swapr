"use client";

export function useServerClock(serverTime: string | null) {
  if (!serverTime) {
    return { offsetMs: 0 };
  }

  const offsetMs = Date.now() - new Date(serverTime).getTime();
  return { offsetMs };
}
