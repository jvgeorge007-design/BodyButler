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
      {/* Kettlebell handle - outer rounded rectangle */}
      <rect x="6" y="6" width="12" height="4" rx="2" />
      
      {/* Handle grip - inner rounded rectangle */}
      <rect x="8" y="7.5" width="8" height="1" rx="0.5" />
      
      {/* Kettlebell main body - rounded bell shape */}
      <path d="M8 10v1c0 3.3 1.8 6 4 6s4-2.7 4-6v-1" />
      <path d="M6 10v1c0 4.4 2.7 8 6 8s6-3.6 6-8v-1" />
      
      {/* Base platform */}
      <rect x="4" y="20" width="16" height="1.5" rx="0.75" />
    </svg>
  );
}