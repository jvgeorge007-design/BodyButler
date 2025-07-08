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
    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1 mx-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {currentSection} of {totalSections}
        </span>
      </div>
    </div>
  );
}
