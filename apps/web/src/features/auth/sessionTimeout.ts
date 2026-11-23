export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export const sessionActivityEvents: readonly (keyof WindowEventMap)[] = [
  'keydown',
  'mousedown',
  'mousemove',
  'pointerdown',
  'scroll',
  'touchstart',
];

export const getSessionTimeoutLabel = (timeoutMs = SESSION_TIMEOUT_MS): string => {
  const minutes = Math.max(1, Math.round(timeoutMs / 60000));

  return `${minutes.toString()} minutes`;
};

export const hasSessionExpired = (
  lastActivityAt: number,
  currentTime = Date.now(),
  timeoutMs = SESSION_TIMEOUT_MS,
): boolean => currentTime - lastActivityAt >= timeoutMs;

export const getMillisecondsUntilTimeout = (
  lastActivityAt: number,
  currentTime = Date.now(),
  timeoutMs = SESSION_TIMEOUT_MS,
): number => Math.max(0, timeoutMs - (currentTime - lastActivityAt));
