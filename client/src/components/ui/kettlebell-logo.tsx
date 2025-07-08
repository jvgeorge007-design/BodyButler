import { cn } from "@/lib/utils";
import bbLogo from "@assets/BB logo_1751937804698.png";

interface KettlebellLogoProps {
  className?: string;
}

export default function KettlebellLogo({ className }: KettlebellLogoProps) {
  return (
    <img 
      src={bbLogo}
      alt="Body Butler Logo"
      className={cn("w-12 h-12", className)}
      style={{ 
        background: 'transparent'
      }}
    />
  );
}
