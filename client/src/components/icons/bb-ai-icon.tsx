import bbAIIcon from "@assets/BB AI nav_1752765774390.png";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  // Use exact same color system as other navigation icons
  const isActive = strokeWidth === 2.5;
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div
        className={`w-8 h-8 ${isActive ? 'ios-blue' : 'ios-gray'}`}
        style={{
          maskImage: `url(${bbAIIcon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${bbAIIcon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          backgroundColor: 'currentColor',
        }}
      />
    </div>
  );
}