import { useState, useRef } from 'react';
import { Camera, Check, Edit3, ArrowLeft, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import BottomNav from '@/components/navigation/bottom-nav';

interface NutritionAnalysis {
  foodItems: string[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  insights: string[];
  mealType: string;
  portionSize: string;
  healthScore: number;
}

const MacroRing = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 mb-2">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
};

const InsightCard = ({ insight, index }: { insight: string; index: number }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-blue-400" />
      </div>
      <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
    </div>
  </div>
);

export default function PhotoFoodLogger() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get user context for AI analysis
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: personalizedPlan } = useQuery({
    queryKey: ['/api/personalized-plan'],
    staleTime: 1000 * 60 * 5,
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const userContext = {
        fitnessGoals: (profile as any)?.onboardingData?.goals || 'general health',
        activityLevel: (profile as any)?.onboardingData?.activityLevel || 'moderate',
        recentWorkouts: [], // TODO: Add recent workouts from your data
        previousMeals: [] // TODO: Add previous meals from your data
      };

      return await apiRequest('POST', '/api/analyze-food-photo', {
        imageBase64,
        userContext
      });
    },
    onSuccess: (data: NutritionAnalysis) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Couldn't analyze your food photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logMealMutation = useMutation({
    mutationFn: async (mealData: NutritionAnalysis) => {
      return await apiRequest('POST', '/api/log-meal', {
        ...mealData,
        imageBase64: capturedImage,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-nutrition'] });
      toast({
        title: "Meal Logged!",
        description: "Your nutrition has been tracked successfully.",
      });
      setLocation('/dashboard-v2');
    },
    onError: (error) => {
      console.error('Logging error:', error);
      toast({
        title: "Logging Failed",
        description: "Couldn't save your meal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageBase64 = (e.target?.result as string)?.split(',')[1];
      setCapturedImage(imageBase64);
      setIsAnalyzing(true);
      analyzeImageMutation.mutate(imageBase64);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const confirmAndLog = () => {
    if (analysisResult) {
      logMealMutation.mutate(analysisResult);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button
          onClick={() => setLocation('/dashboard-v2')}
          className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Log Your Meal</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <main className="max-w-md mx-auto px-6 pb-32">
        {!capturedImage ? (
          /* Camera Capture Screen */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl flex items-center justify-center">
                <Camera className="w-16 h-16 text-white/60" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Snap Your Food</h2>
                <p className="text-white/70">
                  Take a photo and get instant nutrition insights with personalized coaching
                </p>
              </div>
            </div>

            <Button
              onClick={triggerCamera}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 rounded-2xl text-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
          </div>
        ) : (
          /* Analysis Results Screen */
          <div className="space-y-6">
            {/* Photo Preview */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={`data:image/jpeg;base64,${capturedImage}`}
                alt="Food photo"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={retakePhoto}
                className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl p-2"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            </div>

            {isAnalyzing ? (
              /* Analysis Loading */
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Meal</h3>
                <p className="text-white/70">
                  Getting nutrition estimates and personalized insights...
                </p>
              </div>
            ) : analysisResult ? (
              /* Analysis Results */
              <>
                {/* Main Nutrition Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {analysisResult.totalCalories}
                    </div>
                    <div className="text-white/70">calories</div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Health Score: {analysisResult.healthScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-8 mb-6">
                    <MacroRing 
                      label="Protein" 
                      value={analysisResult.macros.protein} 
                      max={50} 
                      color="#EF4444" 
                    />
                    <MacroRing 
                      label="Carbs" 
                      value={analysisResult.macros.carbs} 
                      max={60} 
                      color="#F97316" 
                    />
                    <MacroRing 
                      label="Fat" 
                      value={analysisResult.macros.fat} 
                      max={30} 
                      color="#3B82F6" 
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Foods Detected:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.foodItems.map((item, index) => (
                        <span
                          key={index}
                          className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    Personalized Insights
                  </h3>
                  {analysisResult.insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} index={index} />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={confirmAndLog}
                    disabled={logMealMutation.isPending}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {logMealMutation.isPending ? 'Logging...' : 'Log Meal'}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}