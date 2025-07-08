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
      className="w-60 h-72 ml-[0px] mr-[0px] pl-[0px] pr-[0px] pt-[-4px] pb-[-4px]"
      style={{ 
        background: 'transparent',
        objectFit: 'cover',
        objectPosition: 'center'
      }}
    />
  );
}
