import { cn } from "@/lib/utils";
import bbLogo from "@assets/BB logo_1752757975860.png";

interface KettlebellLogoProps {
  className?: string;
}

export default function KettlebellLogo({ className }: KettlebellLogoProps) {
  return (
    <div className={cn("w-60 h-72 relative", className)}>
      <img 
        src={bbLogo}
        alt="Body Butler Logo"
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          objectFit: 'cover',
          objectPosition: 'center 35%',
          filter: 'brightness(0)'
        }}
      />
      <div 
        className="absolute inset-0 bg-blue-500"
        style={{ 
          maskImage: `url(${bbLogo})`,
          maskSize: 'cover',
          maskPosition: 'center 35%',
          maskRepeat: 'no-repeat',
          WebkitMaskImage: `url(${bbLogo})`,
          WebkitMaskSize: 'cover',
          WebkitMaskPosition: 'center 35%',
          WebkitMaskRepeat: 'no-repeat'
        }}
      />
    </div>
  );
}
