import { cn } from "@/lib/utils";
import bbLogo from "@assets/BB logo_1752757975860.png";

interface KettlebellLogoProps {
  className?: string;
}

export default function KettlebellLogo({ className }: KettlebellLogoProps) {
  return (
    <img 
      src={bbLogo}
      alt="Body Butler Logo"
      className={cn("w-60 h-72", className)}
      style={{ 
        background: 'transparent',
        objectFit: 'cover',
        objectPosition: 'center 35%',
        filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(7471%) hue-rotate(218deg) brightness(99%) contrast(90%)'
      }}
    />
  );
}
