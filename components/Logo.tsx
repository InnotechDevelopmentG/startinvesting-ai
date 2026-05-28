export default function Logo({ size = 32, iconOnly = false }: { size?: number; iconOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#00C896" />
        <polyline
          points="5,22 11,16 17,19 27,9"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="27" cy="9" r="2.2" fill="white" />
      </svg>

      {!iconOnly && (
        <span
          style={{
            fontSize: size * 0.5,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#111',
            lineHeight: 1,
          }}
        >
          startinvesting
          <span style={{ color: '#00C896' }}>.ai</span>
        </span>
      )}
    </div>
  );
}
