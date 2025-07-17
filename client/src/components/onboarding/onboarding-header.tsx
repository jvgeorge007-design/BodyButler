import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface OnboardingHeaderProps {
  currentSection: number;
  totalSections: number;
  onBack: () => void;
}

export default function OnboardingHeader({ currentSection, totalSections, onBack }: OnboardingHeaderProps) {
  const progress = (currentSection / totalSections) * 100;

  return (
    <div className="sticky top-0 glass-card border-b border-white/20 px-6 py-4 z-10">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1 mx-4">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-700 to-orange-800 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-white/80 font-medium body-sans">
          {currentSection} of {totalSections}
        </span>
      </div>
    </div>
  );
}
