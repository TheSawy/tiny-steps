import { useState, useEffect } from "react";

export const useTimer = (start) => {
  const [e, setE] = useState(start ? Date.now() - new Date(start).getTime() : 0);
  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => setE(Date.now() - new Date(start).getTime()), 1000);
    return () => clearInterval(id);
  }, [start]);
  return e;
};
