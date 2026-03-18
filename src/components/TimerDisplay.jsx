const TimerDisplay = ({ startTime, color = C.pri }) => {
  const e = useTimer(startTime);
  const s = Math.floor(e / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  return <div style={{ ...S.timer, color }}>{h > 0 && `${h}:`}{String(m % 60).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</div>;
};

// ============================================================
// MODAL
// ============================================================
