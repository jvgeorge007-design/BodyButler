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
      <path 
        d="M16 20C16 16.6863 18.6863 14 22 14H26C29.3137 14 32 16.6863 32 20V28C32 31.3137 29.3137 34 26 34H22C18.6863 34 16 31.3137 16 28V20Z" 
        fill="currentColor"
      />
      <path 
        d="M12 18C10.3431 18 9 19.3431 9 21V27C9 28.6569 10.3431 30 12 30C13.6569 30 15 28.6569 15 27V21C15 19.3431 13.6569 18 12 18Z" 
        fill="currentColor"
      />
      <path 
        d="M36 18C34.3431 18 33 19.3431 33 21V27C33 28.6569 34.3431 30 36 30C37.6569 30 39 28.6569 39 27V21C39 19.3431 37.6569 18 36 18Z" 
        fill="currentColor"
      />
      <circle 
        cx="24" 
        cy="20" 
        r="2" 
        fill="#3B82F6"
      />
    </svg>
  );
}
