import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Target, Calendar, TrendingUp, Dumbbell } from "lucide-react";

interface Section4Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const timelineOptions = [
  { value: "1-3 months", label: "1-3 months", description: "Quick results" },
  { value: "3-6 months", label: "3-6 months", description: "Balanced approach" },
  { value: "6-12 months", label: "6-12 months", description: "Steady progress" },
  { value: "12+ months", label: "12+ months", description: "Long-term transformation" },
];

const goalPhaseOptions = [
  { value: "cutting", label: "Cutting", description: "Lose fat while maintaining muscle" },
  { value: "bulking", label: "Bulking", description: "Build muscle with some fat gain" },
  { value: "maintaining", label: "Maintaining", description: "Maintain current physique" },
  { value: "recomposition", label: "Recomposition", description: "Build muscle and lose fat simultaneously" },
];

export default function Section4({ data, onNext, isLoading }: Section4Props) {
  const [formData, setFormData] = useState({
    goals: data.goals || "",
    timeline: data.timeline || "",
    goalPhase: data.goalPhase || "",
    priorityMuscles: data.priorityMuscles || "",
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
            <h2 className="text-largeTitle text-white">Your Goals</h2>
            <p className="text-body text-white/60">What do you want to achieve?</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Goals */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-white/80" />
                  <Label htmlFor="goals" className="text-headline font-semibold text-white">
                    Your Dream Transformation *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Describe your fitness and health goals in detail</p>
                <div className="relative">
                  <Textarea
                    id="goals"
                    placeholder="Examples: lose 20 lbs and tone up, build muscle for beach body, get stronger for daily activities, train for marathon..."
                    rows={4}
                    value={formData.goals}
                    onChange={(e) => handleInputChange("goals", e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-3 right-3 p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5 text-white/80" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-white/80" />
                  <Label htmlFor="timeline" className="text-headline font-semibold text-white">
                    Target Timeline *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">How long do you want to work toward this goal?</p>
                <div className="grid grid-cols-2 gap-2">
                  {timelineOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.timeline === option.value ? "default" : "outline"}
                      className={`p-3 rounded-xl text-left transition-all h-auto ${
                        formData.timeline === option.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("timeline", option.value)}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-80">{option.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Goal Phase */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-white/80" />
                  <Label htmlFor="goalPhase" className="text-headline font-semibold text-white">
                    Primary Focus *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">What's your main priority right now?</p>
                <div className="space-y-2">
                  {goalPhaseOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.goalPhase === option.value ? "default" : "outline"}
                      className={`w-full p-3 rounded-xl text-left transition-all h-auto ${
                        formData.goalPhase === option.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("goalPhase", option.value)}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-80">{option.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Muscles */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-5 h-5 text-white/80" />
                  <Label htmlFor="priorityMuscles" className="text-headline font-semibold text-white">
                    Priority Muscle Groups (Optional)
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Any specific areas you want to focus on?</p>
                <div className="relative">
                  <Textarea
                    id="priorityMuscles"
                    placeholder="Examples: bigger arms, stronger legs, better posture, core strength, glutes..."
                    rows={3}
                    value={formData.priorityMuscles}
                    onChange={(e) => handleInputChange("priorityMuscles", e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-3 right-3 p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5 text-white/80" />
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button"
            >
              {isLoading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}