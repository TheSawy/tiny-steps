import { useEffect } from "react";

// ============================================================
// FONT LOADER
// ============================================================
export const FontLoader = () => { useEffect(() => { const l = document.createElement("link"); l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"; l.rel = "stylesheet"; document.head.appendChild(l); }, []); return null; };
