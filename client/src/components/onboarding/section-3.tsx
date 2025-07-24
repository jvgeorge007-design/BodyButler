import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, DollarSign, Utensils, Clock } from "lucide-react";

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

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Diet Preferences */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className="w-5 h-5 text-white/80" />
                  <Label htmlFor="diet" className="text-headline font-semibold text-white">
                    Diet Preferences
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">Tell us about any specific eating patterns, restrictions, or foods you prefer/avoid</p>
                <div className="relative">
                  <Textarea
                    id="diet"
                    placeholder="Examples: vegetarian, keto, gluten-free, no dairy, love Mediterranean foods..."
                    rows={4}
                    value={formData.dietPreferences}
                    onChange={(e) => handleInputChange("dietPreferences", e.target.value)}
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

            {/* Weekly Budget */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-white/80" />
                  <Label htmlFor="budget" className="text-headline font-semibold text-white">
                    Weekly Grocery Budget
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">This helps us suggest meals that fit your budget</p>
                <Input
                  id="budget"
                  type="number"
                  placeholder="$150"
                  value={formData.weeklyBudget}
                  onChange={(e) => handleInputChange("weeklyBudget", e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="10"
                />
              </div>
            </div>

            {/* Fasting Window */}
            <div className="calm-card">
              <div className="form-field">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-white/80" />
                  <Label htmlFor="fasting" className="text-headline font-semibold text-white">
                    Fasting Window (Optional)
                  </Label>
                </div>
                <p className="text-caption-1 text-white/60 mb-3">If you practice intermittent fasting, let us know your preferred eating schedule</p>
                <div className="relative">
                  <Textarea
                    id="fasting"
                    placeholder="Examples: 16:8 fasting, eat 12pm-8pm, no breakfast, only lunch and dinner..."
                    rows={3}
                    value={formData.fastingWindow}
                    onChange={(e) => handleInputChange("fastingWindow", e.target.value)}
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