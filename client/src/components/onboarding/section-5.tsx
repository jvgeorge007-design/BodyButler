import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Calendar, AlertTriangle, BookOpen, Activity, Heart } from "lucide-react";

interface Section5Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const workoutDaysOptions = [
  { label: "1-2 days", value: 2, description: "Light commitment" },
  { label: "3-4 days", value: 4, description: "Balanced routine" },
  { label: "5-6 days", value: 6, description: "High commitment" },
  { label: "7 days", value: 7, description: "Daily routine" },
];

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to structured fitness" },
  { value: "intermediate", label: "Intermediate", description: "Some gym/workout experience" },
  { value: "advanced", label: "Advanced", description: "Years of consistent training" },
];

const cardioPreferences = [
  { value: "low", label: "Minimal Cardio", description: "Focus mainly on strength training" },
  { value: "moderate", label: "Moderate Cardio", description: "Mix of strength and cardio" },
  { value: "high", label: "Love Cardio", description: "Enjoy cardio-focused workouts" },
];

export default function Section5({ data, onNext, isLoading }: Section5Props) {
  const [formData, setFormData] = useState({
    workoutDaysPerWeek: data.workoutDaysPerWeek || null,
    injuries: data.injuries || "",
    pastExperience: data.pastExperience || "",
    experienceLevel: data.experienceLevel || "",
    cardioPreference: data.cardioPreference || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: any) => {
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
            <h2 className="text-largeTitle text-white">Availability & Experience</h2>
            <p className="text-body text-white/60">Help us customize your plan</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Workout Days */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-white/80" />
                  <Label className="text-headline font-semibold text-white">
                    Weekly Workout Days *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">How many days per week can you realistically work out?</p>
                <div className="grid grid-cols-2 gap-2">
                  {workoutDaysOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.workoutDaysPerWeek === option.value ? "default" : "outline"}
                      className={`p-3 rounded-xl text-left transition-all h-auto ${
                        formData.workoutDaysPerWeek === option.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("workoutDaysPerWeek", option.value)}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-80">{option.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-white/80" />
                  <Label htmlFor="experienceLevel" className="text-headline font-semibold text-white">
                    Experience Level *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">What's your fitness background?</p>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <Button
                      key={level.value}
                      type="button"
                      variant={formData.experienceLevel === level.value ? "default" : "outline"}
                      className={`w-full p-3 rounded-xl text-left transition-all h-auto ${
                        formData.experienceLevel === level.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("experienceLevel", level.value)}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm opacity-80">{level.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cardio Preference */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-white/80" />
                  <Label htmlFor="cardioPreference" className="text-headline font-semibold text-white">
                    Cardio Preference *
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">How much cardio do you want in your routine?</p>
                <div className="space-y-2">
                  {cardioPreferences.map((pref) => (
                    <Button
                      key={pref.value}
                      type="button"
                      variant={formData.cardioPreference === pref.value ? "default" : "outline"}
                      className={`w-full p-3 rounded-xl text-left transition-all h-auto ${
                        formData.cardioPreference === pref.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("cardioPreference", pref.value)}
                    >
                      <div className="font-medium">{pref.label}</div>
                      <div className="text-sm opacity-80">{pref.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Injuries */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-white/80" />
                  <Label htmlFor="injuries" className="text-headline font-semibold text-white">
                    Injuries & Limitations
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Tell us about any current or past injuries we should consider</p>
                <div className="relative">
                  <Textarea
                    id="injuries"
                    placeholder="Examples: bad knee, lower back issues, shoulder problems, no limitations..."
                    rows={3}
                    value={formData.injuries}
                    onChange={(e) => handleInputChange("injuries", e.target.value)}
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

            {/* Past Experience */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-white/80" />
                  <Label htmlFor="pastExperience" className="text-headline font-semibold text-white">
                    Past Fitness Experience (Optional)
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Share any previous fitness routines, sports, or training you've done</p>
                <div className="relative">
                  <Textarea
                    id="pastExperience"
                    placeholder="Examples: played soccer in college, did CrossFit for 2 years, yoga classes, home workouts..."
                    rows={3}
                    value={formData.pastExperience}
                    onChange={(e) => handleInputChange("pastExperience", e.target.value)}
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