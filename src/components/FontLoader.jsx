// ============================================================
// FONT LOADER
// ============================================================
const FontLoader = () => { useEffect(() => { const l = document.createElement("link"); l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"; l.rel = "stylesheet"; document.head.appendChild(l); }, []); return null; };

// ============================================================
// TIMER
// ============================================================
const useTimer = (start) => {
  const [e, setE] = useState(start ? Date.now() - new Date(start).getTime() : 0);
  useEffect(() => { if (!start) return; const id = setInterval(() => setE(Date.now() - new Date(start).getTime()), 1000); return () => clearInterval(id); }, [start]);
  return e;
};
