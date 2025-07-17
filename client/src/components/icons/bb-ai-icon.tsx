interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Kettlebell handle - outer rounded rectangle */}
      <path d="M6 6h12c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z" />
      
      {/* Handle grip - inner rounded rectangle */}
      <path d="M8 7.5h8v1H8v-1z" />
      
      {/* Kettlebell main body - rounded dome shape */}
      <path d="M9 11c0 3.9 1.3 7 3 7s3-3.1 3-7" />
      <path d="M7 11c0 4.4 2.2 8 5 8s5-3.6 5-8" />
      
      {/* Base platform */}
      <rect x="4" y="20" width="16" height="1.5" rx="0.75" />
    </svg>
  );
}