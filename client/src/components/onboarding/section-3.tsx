import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";

interface Section3Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export default function Section3({ data, onNext, isLoading }: Section3Props) {
  const [formData, setFormData] = useState({
    dietPreferences: data.dietPreferences || "",
    weeklyBudget: data.weeklyBudget || "",
    fastingWindow: data.fastingWindow || "",
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
            <h2 className="text-largeTitle text-white">Diet & Budget</h2>
            <p className="text-body text-white/60">Tell us about your eating preferences and budget</p>
          </div>

          <form onSubmit={handleSubmit} className="ios-spacing-large">
          {/* Diet Preferences */}
          <div className="space-y-2">
            <Label htmlFor="diet" className="text-sm font-semibold text-gray-900">
              Diet Preferences
            </Label>
            <div className="relative">
              <Textarea
                id="diet"
                placeholder="Tell us how you like to eat — any diets, foods you avoid, or must-haves?"
                rows={4}
                value={formData.dietPreferences}
                onChange={(e) => handleInputChange("dietPreferences", e.target.value)}
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

          {/* Weekly Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-semibold text-gray-900">
              Weekly Grocery Budget
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="$150"
              value={formData.weeklyBudget}
              onChange={(e) => handleInputChange("weeklyBudget", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              min="0"
              step="10"
            />
          </div>

          {/* Fasting Window */}
          <div className="space-y-2">
            <Label htmlFor="fasting" className="text-sm font-semibold text-gray-900">
              Fasting Window (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="fasting"
                placeholder="Do you practice intermittent fasting? (e.g., 16:8, OMAD, or specific eating window)"
                rows={2}
                value={formData.fastingWindow}
                onChange={(e) => handleInputChange("fastingWindow", e.target.value)}
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
    </main>
    </div>
  );
}
