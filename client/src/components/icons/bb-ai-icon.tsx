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
        className="w-full h-full object-contain"
        style={{
          filter: isActive 
            ? 'brightness(1.8) saturate(1.5) hue-rotate(195deg) contrast(1.2)' 
            : 'brightness(1.4) saturate(1.2) contrast(1.1)',
        }}
      />
    </div>
  );
}