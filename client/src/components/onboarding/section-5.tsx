import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic } from "lucide-react";

interface Section5Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const workoutDaysOptions = [
  { label: "1-2 days", value: 2 },
  { label: "3-4 days", value: 4 },
  { label: "5-6 days", value: 6 },
  { label: "7 days", value: 7 },
];

export default function Section5({ data, onNext, isLoading }: Section5Props) {
  const [formData, setFormData] = useState({
    workoutDaysPerWeek: data.workoutDaysPerWeek || null,
    injuries: data.injuries || "",
    pastExperience: data.pastExperience || "",
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
          <h2 className="text-2xl font-bold text-gray-900">Availability & Constraints</h2>
          <p className="text-gray-600">Help us customize your plan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Days */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              How many days per week can you work out?
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {workoutDaysOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.workoutDaysPerWeek === option.value ? "default" : "outline"}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    formData.workoutDaysPerWeek === option.value
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={() => handleInputChange("workoutDaysPerWeek", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Injuries */}
          <div className="space-y-2">
            <Label htmlFor="injuries" className="text-sm font-semibold text-gray-900">
              Any injuries or chronic conditions?
            </Label>
            <div className="relative">
              <Textarea
                id="injuries"
                placeholder="Tell us about any injuries, conditions, or physical limitations..."
                rows={3}
                value={formData.injuries}
                onChange={(e) => handleInputChange("injuries", e.target.value)}
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

          {/* Past Experience */}
          <div className="space-y-2">
            <Label htmlFor="pastExperience" className="text-sm font-semibold text-gray-900">
              What has or hasn't worked for you in past diets or workouts? (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="pastExperience"
                placeholder="Share your past experiences with fitness and nutrition..."
                rows={3}
                value={formData.pastExperience}
                onChange={(e) => handleInputChange("pastExperience", e.target.value)}
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
