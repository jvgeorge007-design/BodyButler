import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic } from "lucide-react";

interface Section6Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const personalityTypes = [
  { value: "motivator", label: "The Motivator", description: "I need encouragement and positive reinforcement" },
  { value: "challenger", label: "The Challenger", description: "Push me hard, I thrive under pressure" },
  { value: "scientist", label: "The Scientist", description: "Give me data, facts, and detailed explanations" },
  { value: "buddy", label: "The Buddy", description: "Be friendly and supportive, like a workout partner" },
];

export default function Section6({ data, onNext, isLoading }: Section6Props) {
  const [formData, setFormData] = useState({
    coachingStyle: data.coachingStyle || "",
    personalityType: data.personalityType || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <main className="max-w-md mx-auto ios-padding min-h-screen" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)'
      }}>
        <div className="ios-spacing-large">
          <div className="text-center ios-spacing-medium">
            <h2 className="text-largeTitle text-white">Coaching Style</h2>
            <p className="text-body text-white/60">How do you like to be coached?</p>
          </div>

          <form onSubmit={handleSubmit} className="ios-spacing-large">
          {/* Personality Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              What type of coaching personality fits you best?
            </Label>
            <RadioGroup
              value={formData.personalityType}
              onValueChange={(value) => handleInputChange("personalityType", value)}
              className="space-y-3"
            >
              {personalityTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-start space-x-3 p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <RadioGroupItem value={type.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additional" className="text-sm font-semibold text-gray-900">
              Anything else you'd like to add?
            </Label>
            <div className="relative">
              <Textarea
                id="additional"
                placeholder="Any additional information that would help us customize your experience..."
                rows={3}
                value={formData.coachingStyle}
                onChange={(e) => handleInputChange("coachingStyle", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute bottom-3 right-3 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full gradient-button"
          >
            {isLoading ? "Completing Setup..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
