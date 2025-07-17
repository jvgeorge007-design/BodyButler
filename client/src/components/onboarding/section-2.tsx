import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Your lifestyle</h2>
          <p className="text-gray-600">Help us understand your daily routine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Description */}
          <div className="space-y-2">
            <Label htmlFor="activity" className="text-sm font-semibold text-gray-900">
              Current Physical Activity
            </Label>
            <div className="relative">
              <Textarea
                id="activity"
                placeholder="Describe your current physical activity or routine..."
                rows={4}
                value={formData.activityDescription}
                onChange={(e) => handleInputChange("activityDescription", e.target.value)}
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

          {/* Sleep Hours */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Average Sleep Hours</Label>
            <div className="flex gap-2">
              {sleepOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.sleepHours === option.value ? "default" : "outline"}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                    formData.sleepHours === option.value
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={() => handleInputChange("sleepHours", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel" className="text-sm font-semibold text-gray-900">
              Activity Level
            </Label>
            <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500">
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

          {/* Recovery Capacity */}
          <div className="space-y-2">
            <Label htmlFor="recoveryCapacity" className="text-sm font-semibold text-gray-900">
              Recovery Capacity
            </Label>
            <Select value={formData.recoveryCapacity} onValueChange={(value) => handleInputChange("recoveryCapacity", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500">
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

          {/* Equipment Access */}
          <div className="space-y-2">
            <Label htmlFor="equipment" className="text-sm font-semibold text-gray-900">
              Equipment Access
            </Label>
            <div className="relative">
              <Textarea
                id="equipment"
                placeholder="Examples: full gym access, home gym with only dumbbells, no weights, resistance bands, bodyweight only, pull-up bar, etc."
                rows={3}
                value={formData.equipmentAccess}
                onChange={(e) => handleInputChange("equipmentAccess", e.target.value)}
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
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
