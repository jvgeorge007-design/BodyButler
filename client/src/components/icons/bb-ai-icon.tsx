import { MessageCircle } from "lucide-react";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  return (
    <MessageCircle 
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}