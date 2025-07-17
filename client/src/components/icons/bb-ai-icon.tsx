import bbAIIcon from "@assets/BB AI nav_1752766814225.png";

interface BBAIIconProps {
  className?: string;
  strokeWidth?: number;
}

export default function BBAIIcon({ className = "w-6 h-6", strokeWidth = 2 }: BBAIIconProps) {
  const isActive = strokeWidth === 2.5;
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div
        className="w-8 h-8"
        style={{
          maskImage: `url(${bbAIIcon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${bbAIIcon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          backgroundColor: isActive ? 'rgb(var(--system-blue))' : 'rgb(var(--system-gray))',
        }}
      />
    </div>
  );
}