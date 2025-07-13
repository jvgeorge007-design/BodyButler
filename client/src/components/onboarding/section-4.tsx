import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic } from "lucide-react";

interface Section4Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

const timelineOptions = [
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
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
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your goals</h2>
          <p className="text-gray-600">What do you want to achieve?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-sm font-semibold text-gray-900">
              What's your goal or dream transformation?
            </Label>
            <div className="relative">
              <Textarea
                id="goals"
                placeholder="Describe your fitness and health goals..."
                rows={4}
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                required
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

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-semibold text-gray-900">
              What's your timeline?
            </Label>
            <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500">
                <SelectValue placeholder="Select your timeline" />
              </SelectTrigger>
              <SelectContent>
                {timelineOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Phase */}
          <div className="space-y-2">
            <Label htmlFor="goalPhase" className="text-sm font-semibold text-gray-900">
              Primary Goal Phase
            </Label>
            <Select value={formData.goalPhase} onValueChange={(value) => handleInputChange("goalPhase", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500">
                <SelectValue placeholder="Select your main focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cut">Cut (lose fat while maintaining muscle)</SelectItem>
                <SelectItem value="bulk">Bulk (gain muscle, accept some fat gain)</SelectItem>
                <SelectItem value="recomposition">Recomposition (gain muscle + lose fat simultaneously)</SelectItem>
                <SelectItem value="maintenance">Maintenance (maintain current physique)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Muscles */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-semibold text-gray-900">
              Priority/Lagging Muscle Groups (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="priority"
                placeholder="Which muscle groups do you want to prioritize or feel are lagging? (e.g., arms, shoulders, glutes, back)"
                rows={3}
                value={formData.priorityMuscles}
                onChange={(e) => handleInputChange("priorityMuscles", e.target.value)}
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
