type AnnaProps = {
  size?: number;
  className?: string;
};

export function Anna({ size, className }: AnnaProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <span className={`anna-avatar ${className ?? ""}`} style={style} aria-hidden>
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18c0-3.5 2.5-7 7-7s7 3.5 7 7" />
        <circle cx="16" cy="13" r="4.2" />
        <path d="M11.8 11.5c.8-3 2.5-4.5 4.4-4.5s3.6 1.5 4.4 4.5" />
        <path d="M13.5 14.5c.4.4.9.6 1.4.6M17 15c.6 0 1.1-.2 1.5-.6" strokeWidth="1.2" />
        <path d="M14.5 17c.5.4 1.1.6 1.7.6s1.2-.2 1.7-.6" strokeWidth="1.2" />
        <path d="M9 22c2 1.5 4.5 2.2 7 2.2s5-.7 7-2.2" strokeOpacity="0.5" />
      </svg>
    </span>
  );
}

export function SkPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 19.5v2a2 2 0 0 1-2.2 2A15 15 0 0 1 6.5 12.2 2 2 0 0 1 8.5 10h2a2 2 0 0 1 2 1.7 9 9 0 0 0 .5 2 2 2 0 0 1-.4 2L11.4 17a13 13 0 0 0 4.6 4.6l1.3-1.2a2 2 0 0 1 2-.4 9 9 0 0 0 2 .5 2 2 0 0 1 1.7 2z" />
      <path d="M5 5l4 4M27 5l-4 4M16 3v3" strokeOpacity="0.45" />
    </svg>
  );
}

export function SkScroll({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="20" height="20" rx="2" />
      <path d="M10 11h12M10 15h12M10 19h8" strokeOpacity="0.7" />
      <path d="M10 23h6" strokeOpacity="0.4" />
    </svg>
  );
}
