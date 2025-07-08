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
      {/* Handle top part */}
      <path 
        d="M14 8C12.8954 8 12 8.89543 12 10V14C12 15.1046 12.8954 16 14 16H34C35.1046 16 36 15.1046 36 14V10C36 8.89543 35.1046 8 34 8H14Z" 
        fill="currentColor"
      />
      
      {/* Handle opening/cutout */}
      <ellipse 
        cx="24" 
        cy="12" 
        rx="8" 
        ry="3" 
        fill="white"
      />
      
      {/* Main kettlebell body */}
      <path 
        d="M8 18C8 16.8954 8.89543 16 10 16H38C39.1046 16 40 16.8954 40 18V32C40 36.4183 36.4183 40 32 40H16C11.5817 40 8 36.4183 8 32V18Z" 
        fill="currentColor"
      />
      
      {/* Base platform */}
      <path 
        d="M6 40C6 38.8954 6.89543 38 8 38H40C41.1046 38 42 38.8954 42 40V42C42 43.1046 41.1046 44 40 44H8C6.89543 44 6 43.1046 6 42V40Z" 
        fill="currentColor"
      />
      
      {/* Highlight/shine effect */}
      <ellipse 
        cx="20" 
        cy="24" 
        rx="2" 
        ry="4" 
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  );
}
