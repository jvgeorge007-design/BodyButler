import bbAIIcon from "@assets/BB AI nav_1752765221546.png";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src={bbAIIcon} 
        alt="BB AI" 
        className="w-7 h-7 object-contain"
        style={{
          filter: strokeWidth === 2.5 
            ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)'
            : 'brightness(0) saturate(100%) invert(64%) sepia(11%) saturate(200%) hue-rotate(176deg) brightness(99%) contrast(93%)',
        }}
      />
    </div>
  );
}