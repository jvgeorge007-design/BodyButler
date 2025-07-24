import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, MessageCircle, Zap, BarChart3, Users, Plus } from "lucide-react";

interface Section6Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const personalityTypes = [
  { 
    value: "motivator", 
    label: "The Motivator", 
    description: "I need encouragement and positive reinforcement",
    icon: Zap
  },
  { 
    value: "challenger", 
    label: "The Challenger", 
    description: "Push me hard, I thrive under pressure",
    icon: BarChart3
  },
  { 
    value: "scientist", 
    label: "The Scientist", 
    description: "Give me data, facts, and detailed explanations",
    icon: BarChart3
  },
  { 
    value: "buddy", 
    label: "The Buddy", 
    description: "Be friendly and supportive, like a workout partner",
    icon: Users
  },
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
            <h2 className="text-largeTitle text-white">Almost Done!</h2>
            <p className="text-body text-white/60">Just a few final touches</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Personality Type */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-5 h-5 text-white/80" />
                  <Label className="text-headline font-semibold text-white">
                    Coaching Personality *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">What type of coaching personality fits you best?</p>
                <RadioGroup
                  value={formData.personalityType}
                  onValueChange={(value) => handleInputChange("personalityType", value)}
                  className="space-y-3"
                >
                  {personalityTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-start space-x-3 p-4 rounded-2xl transition-all cursor-pointer ${
                          formData.personalityType === type.value
                            ? "ios-bg-blue/20 border-2 border-blue-500"
                            : "bg-white/10 border border-white/20 hover:border-blue-500 hover:bg-white/15"
                        }`}
                      >
                        <RadioGroupItem 
                          value={type.value} 
                          className="mt-1 border-white/40 text-blue-500" 
                        />
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-0.5">
                            <IconComponent className="w-4 h-4 text-white/80" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{type.label}</div>
                            <div className="text-sm text-white/70 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>

            {/* Additional Information */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-5 h-5 text-white/80" />
                  <Label htmlFor="coachingStyle" className="text-headline font-semibold text-white">
                    Anything Else You'd Like to Add?
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Share any additional preferences, goals, or information that would help us create your perfect plan</p>
                <div className="relative">
                  <Textarea
                    id="coachingStyle"
                    placeholder="Examples: I work night shifts, prefer morning workouts, have specific foods I love/hate, training for an event..."
                    rows={4}
                    value={formData.coachingStyle}
                    onChange={(e) => handleInputChange("coachingStyle", e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-3 right-3 p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button"
            >
              {isLoading ? "Creating Your Plan..." : "Complete Setup"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}