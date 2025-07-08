import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Mic } from "lucide-react";

interface Section2Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const sleepOptions = [
  { label: "<4h", value: "less_than_4" },
  { label: "4h", value: "4" },
  { label: "5h", value: "5" },
  { label: "6h", value: "6" },
  { label: "7h", value: "7" },
  { label: "8h", value: "8" },
  { label: "9h", value: "9" },
  { label: "9h+", value: "more_than_9" },
];

const equipmentOptions = [
  "Full commercial gym",
  "Home gym setup",
  "Dumbbells",
  "Barbell and weights",
  "Resistance bands",
  "Pull-up bar",
  "Kettlebells",
  "Cardio equipment (treadmill, bike, etc.)",
  "Bodyweight only",
  "Outdoor space (park, trail)",
];

export default function Section2({ data, onNext, isLoading }: Section2Props) {
  const [formData, setFormData] = useState({
    activityDescription: data.activityDescription || "",
    sleepHours: data.sleepHours || null,
    equipmentAccess: data.equipmentAccess || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipmentAccess: checked
        ? [...prev.equipmentAccess, equipment]
        : prev.equipmentAccess.filter((item: string) => item !== equipment)
    }));
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your lifestyle</h2>
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
            <div className="grid grid-cols-4 gap-2">
              {sleepOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.sleepHours === option.value ? "default" : "outline"}
                  className={`py-3 px-2 rounded-xl transition-all text-sm ${
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

          {/* Equipment Access */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Equipment Access</Label>
            <div className="space-y-2">
              {equipmentOptions.map((equipment) => (
                <label
                  key={equipment}
                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <Checkbox
                    checked={formData.equipmentAccess.includes(equipment)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-900">{equipment}</span>
                </label>
              ))}
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
