import bbAIIcon from "@assets/BB AI nav_1752765221546.png";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  // Calculate opacity based on strokeWidth to simulate thickness
  const opacity = strokeWidth === 2.5 ? 1 : 0.7;
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src={bbAIIcon} 
        alt="BB AI" 
        className="w-6 h-6 object-contain"
        style={{
          opacity,
          filter: strokeWidth === 2.5 
            ? 'brightness(1.2) saturate(1.3) hue-rotate(195deg) contrast(1.2)' 
            : 'brightness(1.0) saturate(1.0) contrast(1.0)',
        }}
      />
    </div>
  );
}