import { useEffect, useRef } from "react";

export function useRealtimePolling(callback, delayMs, isEnabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isEnabled || typeof delayMs !== "number" || delayMs <= 0) {
      return undefined;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delayMs);

    return () => clearInterval(id);
  }, [delayMs, isEnabled]);
}
