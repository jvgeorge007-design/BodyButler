import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic } from "lucide-react";

interface Section2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const sleepOptions = [
  { label: "<5h", value: "less_than_5" },
  { label: "6h", value: "6" },
  { label: "7h", value: "7" },
  { label: "8h", value: "8" },
  { label: "8h+", value: "more_than_8" },
];

export default function Section2({ data, onNext, isLoading }: Section2Props) {
  const [formData, setFormData] = useState({
    activityDescription: data.activityDescription || "",
    sleepHours: data.sleepHours || null,
    equipmentAccess: data.equipmentAccess || "",
    activityLevel: data.activityLevel || "",
    recoveryCapacity: data.recoveryCapacity || "",
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
            <h2 className="text-largeTitle text-white">Your lifestyle</h2>
            <p className="text-body text-white/60">Help us understand your daily routine</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Activity Description */}
            <div className="ios-card">
              <div className="form-field">
                <Label htmlFor="activity" className="text-headline font-semibold text-white">
                  Current Physical Activity
                </Label>
                <div className="relative">
                  <Textarea
                    id="activity"
                    placeholder="Describe your current physical activity or routine..."
                    rows={4}
                    value={formData.activityDescription}
                    onChange={(e) => handleInputChange("activityDescription", e.target.value)}
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

            {/* Sleep Hours */}
            <div className="ios-card">
              <div className="form-field">
                <Label className="text-headline font-semibold text-white">Average Sleep Hours *</Label>
                <div className="flex gap-2">
                  {sleepOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.sleepHours === option.value ? "default" : "outline"}
                      className={`flex-1 py-3 px-4 rounded-xl text-body font-medium transition-all ios-touch-target ${
                        formData.sleepHours === option.value
                          ? "ios-bg-blue text-white shadow-sm"
                          : "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:border-blue-500"
                      }`}
                      onClick={() => handleInputChange("sleepHours", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="ios-card">
              <div className="form-field">
                <Label htmlFor="activityLevel" className="text-headline font-semibold text-white">
                  Activity Level *
                </Label>
                <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
                  <SelectTrigger className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (physical job + exercise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recovery Capacity */}
            <div className="ios-card">
              <div className="form-field">
                <Label htmlFor="recoveryCapacity" className="text-headline font-semibold text-white">
                  Recovery Capacity *
                </Label>
                <Select value={formData.recoveryCapacity} onValueChange={(value) => handleInputChange("recoveryCapacity", value)}>
                  <SelectTrigger className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="How well do you recover from workouts?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor (always sore, need extra rest days)</SelectItem>
                    <SelectItem value="average">Average (normal soreness, recover in 1-2 days)</SelectItem>
                    <SelectItem value="good">Good (recover quickly, rarely sore)</SelectItem>
                    <SelectItem value="excellent">Excellent (can train hard daily, recover overnight)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipment Access */}
            <div className="ios-card">
              <div className="form-field">
                <Label htmlFor="equipment" className="text-headline font-semibold text-white">
                  Equipment Access
                </Label>
                <div className="relative">
                  <Textarea
                    id="equipment"
                    placeholder="Examples: full gym access, home gym with only dumbbells, no weights, resistance bands, bodyweight only, pull-up bar, etc."
                    rows={3}
                    value={formData.equipmentAccess}
                    onChange={(e) => handleInputChange("equipmentAccess", e.target.value)}
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
              {isLoading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}