import bbAIIcon from "@assets/BB AI nav_1752764664483.png";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
  isActive?: boolean;
}

export default function BBAIIcon({ className = "w-6 h-6", isActive = false }: BBAIIconProps) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src={bbAIIcon} 
        alt="BB AI" 
        className={`w-full h-full object-contain ${isActive ? 'brightness-125' : 'brightness-75'}`}
        style={{
          filter: isActive 
            ? 'brightness(1.2) saturate(1.3) hue-rotate(195deg)' 
            : 'brightness(0.7) saturate(0.8)',
        }}
      />
    </div>
  );
}