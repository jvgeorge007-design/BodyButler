interface GoatGuideIconProps {
  className?: string;
}

export default function GoatGuideIcon({ className = "w-6 h-6" }: GoatGuideIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Goat Head */}
      <ellipse cx="50" cy="55" rx="28" ry="25" fill="#F5E6D3" />
      
      {/* Horns */}
      <path d="M38 35 C35 25, 32 20, 28 18" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M62 35 C65 25, 68 20, 72 18" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" fill="none" />
      
      {/* Horn segments */}
      <circle cx="32" cy="28" r="2" fill="#A0522D" />
      <circle cx="35" cy="32" r="1.5" fill="#A0522D" />
      <circle cx="68" cy="28" r="2" fill="#A0522D" />
      <circle cx="65" cy="32" r="1.5" fill="#A0522D" />
      
      {/* Sunglasses */}
      <rect x="35" y="45" width="30" height="12" rx="6" fill="#333333" />
      <circle cx="42" cy="51" r="6" fill="#FF6B35" opacity="0.8" />
      <circle cx="58" cy="51" r="6" fill="#4ECDC4" opacity="0.8" />
      
      {/* Nose */}
      <ellipse cx="50" cy="65" rx="3" ry="2" fill="#333333" />
      
      {/* Mouth */}
      <path d="M45 72 Q50 75 55 72" stroke="#333333" strokeWidth="2" strokeLinecap="round" fill="none" />
      
      {/* Beard tuft */}
      <path d="M50 78 C48 82, 52 82, 50 78" fill="#F5E6D3" />
      
      {/* Ears */}
      <ellipse cx="32" cy="50" rx="6" ry="10" fill="#F5E6D3" transform="rotate(-25 32 50)" />
      <ellipse cx="68" cy="50" rx="6" ry="10" fill="#F5E6D3" transform="rotate(25 68 50)" />
    </svg>
  );
}