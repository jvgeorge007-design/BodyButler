import { cn } from "@/lib/utils";

interface KettlebellLogoProps {
  className?: string;
}

export default function KettlebellLogo({ className }: KettlebellLogoProps) {
  return (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Main kettlebell body */}
      <path 
        d="M12 16C12 11.5817 15.5817 8 20 8H28C32.4183 8 36 11.5817 36 16V32C36 36.4183 32.4183 40 28 40H20C15.5817 40 12 36.4183 12 32V16Z" 
        fill="currentColor"
      />
      
      {/* Handle opening */}
      <ellipse 
        cx="24" 
        cy="16" 
        rx="6" 
        ry="4" 
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Top handle part */}
      <path 
        d="M18 12C16.3431 12 15 10.6569 15 9C15 7.34315 16.3431 6 18 6H30C31.6569 6 33 7.34315 33 9C33 10.6569 31.6569 12 30 12H18Z" 
        fill="currentColor"
      />
      
      {/* Handle sides */}
      <rect 
        x="15" 
        y="9" 
        width="3" 
        height="8" 
        rx="1.5" 
        fill="currentColor"
      />
      <rect 
        x="30" 
        y="9" 
        width="3" 
        height="8" 
        rx="1.5" 
        fill="currentColor"
      />
      
      {/* Base/platform */}
      <rect 
        x="8" 
        y="38" 
        width="32" 
        height="4" 
        rx="2" 
        fill="currentColor"
      />
      
      {/* Highlight accent */}
      <path 
        d="M16 14C16 13.4477 16.4477 13 17 13H19C19.5523 13 20 13.4477 20 14V16C20 16.5523 19.5523 17 19 17H17C16.4477 17 16 16.5523 16 16V14Z" 
        fill="#60A5FA"
        opacity="0.8"
      />
    </svg>
  );
}
