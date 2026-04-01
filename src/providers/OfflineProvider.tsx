"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface OfflineContextType {
  isOffline: boolean;
  queuedActions: number;
  addQueuedAction: () => void;
  clearQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType>({
  isOffline: false,
  queuedActions: 0,
  addQueuedAction: () => {},
  clearQueue: () => {},
});

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [queuedActions, setQueuedActions] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addQueuedAction = useCallback(() => {
    setQueuedActions((prev) => prev + 1);
  }, []);

  const clearQueue = useCallback(() => {
    setQueuedActions(0);
  }, []);

  return (
    <OfflineContext.Provider
      value={{ isOffline, queuedActions, addQueuedAction, clearQueue }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
