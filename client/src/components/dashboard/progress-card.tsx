import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  showCheckmarks?: boolean;
}

export default function ProgressCard({ 
  title, 
  current, 
  total, 
  description, 
  icon, 
  color = "hsl(var(--blue-primary))",
  showCheckmarks = false 
}: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="calm-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-xl bg-[hsl(var(--surface-secondary))]">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-headline text-[hsl(var(--text-primary))]">{title}</h3>
            <p className="text-caption2 mt-1">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-title2 font-bold" style={{ color }}>{current}</span>
          <span className="text-subhead text-[hsl(var(--text-secondary))]">/{total}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Progress 
          value={percentage} 
          className="h-2"
          style={{ 
            background: `${color}20`,
          }}
        />
        
        {showCheckmarks && (
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, index) => (
              <div key={index} className="flex-1 flex justify-center">
                {index < current ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color }} />
                ) : (
                  <Circle className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-caption1" style={{ color }}>{percentage}% complete</span>
          {percentage === 100 && (
            <span className="success-badge">
              <CheckCircle2 className="w-3 h-3" />
              Completed!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}