export default function Logo({ size = 32, iconOnly = false }: { size?: number; iconOnly?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Dark background */}
        <rect width="32" height="32" rx="7" fill="#0F0F0F" />

        {/* Subtle baseline */}
        <line x1="4" y1="26.5" x2="28" y2="26.5" stroke="#2a2a2a" strokeWidth="0.8" />

        {/* Data nodes — ascending, fading in */}
        <circle cx="6" cy="25.5" r="1.2" fill="#00C896" fillOpacity="0.35" />
        <circle cx="14" cy="21.5" r="1.4" fill="#00C896" fillOpacity="0.6" />
        <circle cx="21" cy="14.5" r="1.6" fill="#00C896" fillOpacity="0.8" />

        {/* Compound growth curve — flat start, steep finish (hockey stick) */}
        <path
          d="M6 25.5 C 9 24.5, 14 23, 18 19 C 22 15, 24 11.5, 27 6.5"
          stroke="#00C896"
          strokeWidth="1.9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Terminal glow */}
        <circle cx="27" cy="6.5" r="4" fill="#00C896" fillOpacity="0.15" />
        <circle cx="27" cy="6.5" r="2.4" fill="#00C896" />
        <circle cx="27" cy="6.5" r="1.1" fill="white" fillOpacity="0.45" />
      </svg>

      {!iconOnly && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          <span
            style={{
              fontSize: size * 0.47,
              fontWeight: 300,
              letterSpacing: '-0.01em',
              color: '#999',
            }}
          >
            start
          </span>
          <span
            style={{
              fontSize: size * 0.47,
              fontWeight: 650,
              letterSpacing: '-0.025em',
              color: '#111',
            }}
          >
            investing
          </span>
          <span
            style={{
              fontSize: size * 0.47,
              fontWeight: 650,
              letterSpacing: '-0.02em',
              color: '#00C896',
            }}
          >
            .ai
          </span>
        </div>
      )}
    </div>
  );
}
