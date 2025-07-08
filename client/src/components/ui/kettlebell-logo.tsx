import { cn } from "@/lib/utils";

interface KettlebellLogoProps {
  className?: string;
}

export default function KettlebellLogo({ className }: KettlebellLogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-12 h-12", className)}
    >
      {/* Kettlebell Handle - Top curved part */}
      <path 
        d="M20 15C15 15 12 18 12 23C12 25 12 30 15 35C18 40 25 42 30 42H70C75 42 82 40 85 35C88 30 88 25 88 23C88 18 85 15 80 15H20Z" 
        fill="currentColor"
      />
      
      {/* Handle opening - black cutout */}
      <path 
        d="M25 25C25 22 27 20 30 20H70C73 20 75 22 75 25V32C75 35 73 37 70 37H30C27 37 25 35 25 32V25Z" 
        fill="transparent"
      />
      
      {/* Main kettlebell body - large rounded bottom */}
      <path 
        d="M15 40C10 40 8 43 8 48V75C8 85 15 92 25 92H75C85 92 92 85 92 75V48C92 43 90 40 85 40H15Z" 
        fill="currentColor"
      />
      
      {/* Base platform */}
      <path 
        d="M5 88C5 85 7 83 10 83H90C93 83 95 85 95 88V92C95 95 93 97 90 97H10C7 97 5 95 5 92V88Z" 
        fill="currentColor"
      />
      
      {/* Highlight on main body */}
      <ellipse 
        cx="35" 
        cy="65" 
        rx="3" 
        ry="8" 
        fill="rgba(255,255,255,0.2)"
      />
    </svg>
  );
}
