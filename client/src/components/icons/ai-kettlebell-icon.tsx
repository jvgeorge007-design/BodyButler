interface AIKettlebellIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function AIKettlebellIcon({ className = "w-6 h-6", strokeWidth = 2 }: AIKettlebellIconProps) {
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
      {/* Kettlebell handle - top rounded rectangle */}
      <path d="M7 6h10c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z" />
      
      {/* Kettlebell body - main circular body */}
      <circle cx="12" cy="15" r="5" />
      
      {/* Connection between handle and body */}
      <path d="M10 11v2M14 11v2" />
      
      {/* Base platform */}
      <rect x="4" y="20.5" width="16" height="1" rx="0.5" />
    </svg>
  );
}