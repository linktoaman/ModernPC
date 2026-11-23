import { useEffect, useRef, useState } from 'react';

import type { RouteRole } from '../../routes/router';
import {
  SESSION_TIMEOUT_MS,
  getMillisecondsUntilTimeout,
  sessionActivityEvents,
} from './sessionTimeout';

export interface AuthenticatedSession {
  readonly email: string;
  readonly lastActivityAt: number;
  readonly role: RouteRole;
  readonly status: 'signed-in';
}

export interface SignedOutSession {
  readonly status: 'signed-out';
}

export interface TimedOutSession {
  readonly email: string;
  readonly role: RouteRole;
  readonly status: 'timed-out';
  readonly timedOutAt: number;
}

export type Session = AuthenticatedSession | SignedOutSession | TimedOutSession;

interface SignInPayload {
  readonly email: string;
  readonly role: RouteRole;
}

interface UseSessionOptions {
  readonly onTimeout?: (session: TimedOutSession) => void;
  readonly timeoutMs?: number;
}

interface UseSessionResult {
  readonly clearTimedOutSession: () => void;
  readonly session: Session;
  readonly signIn: (payload: SignInPayload) => void;
  readonly signOut: () => void;
}

export const useSession = ({
  onTimeout,
  timeoutMs = SESSION_TIMEOUT_MS,
}: UseSessionOptions = {}): UseSessionResult => {
  const [session, setSession] = useState<Session>({ status: 'signed-out' });
  const onTimeoutRef = useRef<typeof onTimeout>(onTimeout);
  const sessionRef = useRef<Session>(session);
  const timeoutIdRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (session.status !== 'signed-in') {
      return undefined;
    }

    const clearSessionTimeout = (): void => {
      if (timeoutIdRef.current !== undefined) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = undefined;
      }
    };

    const timeoutCurrentSession = (): void => {
      const currentSession = sessionRef.current;

      if (currentSession.status !== 'signed-in') {
        return;
      }

      const timedOutSession: TimedOutSession = {
        email: currentSession.email,
        role: currentSession.role,
        status: 'timed-out',
        timedOutAt: Date.now(),
      };

      setSession(timedOutSession);
      onTimeoutRef.current?.(timedOutSession);
    };

    const scheduleSessionTimeout = (): void => {
      const currentSession = sessionRef.current;

      clearSessionTimeout();

      if (currentSession.status !== 'signed-in') {
        return;
      }

      timeoutIdRef.current = window.setTimeout(
        timeoutCurrentSession,
        getMillisecondsUntilTimeout(currentSession.lastActivityAt, Date.now(), timeoutMs),
      );
    };

    const handleActivity = (): void => {
      const currentSession = sessionRef.current;

      if (currentSession.status !== 'signed-in') {
        return;
      }

      const activeSession: AuthenticatedSession = {
        ...currentSession,
        lastActivityAt: Date.now(),
      };

      sessionRef.current = activeSession;
      scheduleSessionTimeout();
    };

    scheduleSessionTimeout();
    sessionActivityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      clearSessionTimeout();
      sessionActivityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [session.status, timeoutMs]);

  const signIn = ({ email, role }: SignInPayload): void => {
    setSession({
      email,
      lastActivityAt: Date.now(),
      role,
      status: 'signed-in',
    });
  };

  const signOut = (): void => {
    setSession({ status: 'signed-out' });
  };

  const clearTimedOutSession = (): void => {
    setSession({ status: 'signed-out' });
  };

  return {
    clearTimedOutSession,
    session,
    signIn,
    signOut,
  };
};
