import { useEffect, useState } from 'react';
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const calculate = () => Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));
  const [remainingMs, setRemainingMs] = useState(calculate);
  useEffect(() => {
    const sync = () => setRemainingMs(calculate());
    sync();
    const timer = window.setInterval(sync, 200);
    const wake = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', wake);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', wake); };
  }, [targetEpochMs, serverOffsetMs]);
  return { remainingMs, isLive: remainingMs === 0 };
}
