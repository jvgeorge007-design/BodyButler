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
        className="w-8 h-8 object-contain"
        style={{
          filter: strokeWidth === 2.5 
            ? 'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1352%) hue-rotate(214deg) brightness(102%) contrast(102%)'
            : 'brightness(0) saturate(100%) invert(59%) sepia(8%) saturate(178%) hue-rotate(176deg) brightness(95%) contrast(93%)',
        }}
      />
    </div>
  );
}