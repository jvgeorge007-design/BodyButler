import { cn } from "@/lib/utils";
import bbLogo from "@assets/image_1752718827591.png";

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
        objectFit: 'contain',
        objectPosition: 'center'
      }}
    />
  );
}
