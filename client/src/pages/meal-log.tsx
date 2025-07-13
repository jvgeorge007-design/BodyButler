import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Plus, Utensils, Target } from "lucide-react";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
}

interface DayMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function MealLog() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: "1",
  });

  const { data: personalizedPlan, isLoading: planLoading, error } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Session expired",
        description: "Please log in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const handleBack = () => {
    setLocation("/");
  };

  const addFood = () => {
    if (!newFood.name || !newFood.calories) {
      toast({
        title: "Missing information",
        description: "Please enter food name and calories",
        variant: "destructive",
      });
      return;
    }

    const foodEntry: FoodEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: parseFloat(newFood.calories) * parseFloat(newFood.quantity),
      protein: parseFloat(newFood.protein || "0") * parseFloat(newFood.quantity),
      carbs: parseFloat(newFood.carbs || "0") * parseFloat(newFood.quantity),
      fat: parseFloat(newFood.fat || "0") * parseFloat(newFood.quantity),
      quantity: parseFloat(newFood.quantity),
    };

    setFoodEntries(prev => [...prev, foodEntry]);
    setNewFood({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      quantity: "1",
    });
    setShowAddFood(false);
    
    toast({
      title: "Food added!",
      description: `${foodEntry.name} logged successfully`,
    });
  };

  const removeFood = (id: string) => {
    setFoodEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addSampleMeal = () => {
    if (!personalizedPlan?.mealPlan?.meals) return;
    
    // Add breakfast as sample
    const breakfast = personalizedPlan.mealPlan.meals.find((meal: any) => meal.meal === "Breakfast");
    if (breakfast?.items) {
      const sampleEntries = breakfast.items.map((item: string, index: number) => ({
        id: `sample-${Date.now()}-${index}`,
        name: item,
        calories: 150, // Estimated calories per item
        protein: 15,
        carbs: 20,
        fat: 8,
        quantity: 1,
      }));
      
      setFoodEntries(prev => [...prev, ...sampleEntries]);
      toast({
        title: "Sample meal added!",
        description: "Breakfast items from your meal plan",
      });
    }
  };

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const macroTargets = personalizedPlan?.macroTargets || {
    dailyCalories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
  };

  const currentMacros: DayMacros = foodEntries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getProgress = (current: number, target: number) => 
    Math.min((current / target) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Meal Log</h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>

        {/* Macro Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Today's Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calories</span>
                <span>{Math.round(currentMacros.calories)} / {macroTargets.dailyCalories}</span>
              </div>
              <Progress value={getProgress(currentMacros.calories, macroTargets.dailyCalories)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Protein</span>
                <span>{Math.round(currentMacros.protein)}g / {macroTargets.protein_g}g</span>
              </div>
              <Progress value={getProgress(currentMacros.protein, macroTargets.protein_g)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Carbs</span>
                <span>{Math.round(currentMacros.carbs)}g / {macroTargets.carbs_g}g</span>
              </div>
              <Progress value={getProgress(currentMacros.carbs, macroTargets.carbs_g)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fat</span>
                <span>{Math.round(currentMacros.fat)}g / {macroTargets.fat_g}g</span>
              </div>
              <Progress value={getProgress(currentMacros.fat, macroTargets.fat_g)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Add Food */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add Food</span>
              <Button variant="outline" size="sm" onClick={() => setShowAddFood(!showAddFood)}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          {showAddFood && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Food Name</Label>
                  <Input
                    value={newFood.name}
                    onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grilled Chicken"
                  />
                </div>
                
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) => setNewFood(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newFood.quantity}
                    onChange={(e) => setNewFood(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={newFood.protein}
                    onChange={(e) => setNewFood(prev => ({ ...prev, protein: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood(prev => ({ ...prev, carbs: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={newFood.fat}
                    onChange={(e) => setNewFood(prev => ({ ...prev, fat: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={addFood} className="flex-1">
                  Add Food
                </Button>
                <Button variant="outline" onClick={addSampleMeal} className="flex-1">
                  Add Sample Meal
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Food Entries */}
        <div className="space-y-3">
          {foodEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{entry.name}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {Math.round(entry.calories)} cal • {Math.round(entry.protein)}p • {Math.round(entry.carbs)}c • {Math.round(entry.fat)}f
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFood(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {foodEntries.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No food logged yet today</p>
                <p className="text-sm">Add your first meal above!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}