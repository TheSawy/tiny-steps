import { useState, useEffect } from "react";
import { C, S } from "../styles/theme.js";

// ============================================================
// TIMER
// ============================================================
export const useTimer = (start) => {
  const [e, setE] = useState(start ? Date.now() - new Date(start).getTime() : 0);
  useEffect(() => { if (!start) return; const id = setInterval(() => setE(Date.now() - new Date(start).getTime()), 1000); return () => clearInterval(id); }, [start]);
  return e;
};
export const TimerDisplay = ({ startTime, color = C.pri }) => {
  const e = useTimer(startTime);
  const s = Math.floor(e / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  return <div style={{ ...S.timer, color }}>{h > 0 && `${h}:`}{String(m % 60).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</div>;
};
