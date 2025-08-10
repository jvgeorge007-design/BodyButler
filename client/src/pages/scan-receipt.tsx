import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Camera, Upload, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/navigation/bottom-nav";


interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  originalText: string;
}

interface FatSecretMatch {
  originalItem: ParsedItem;
  fatSecretOptions: any[];
  selectedOption: any;
}

interface ParsedReceipt {
  receiptId: string;
  establishment: string;
  items: FatSecretMatch[];
  totalItems: number;
}

export default function ScanReceiptPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [forMeOnly, setForMeOnly] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; quantity: number; selectedFoodId?: string }>>({});
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');

  // Get current time-based meal suggestion
  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snacks';
  };

  useEffect(() => {
    setMealType(getCurrentMeal());
  }, []);

  const parseReceiptMutation = useMutation({
    mutationFn: async (data: { image?: string; text?: string }) => {
      console.log('Starting receipt parsing...');
      setProcessingStatus('Analyzing receipt image...');
      
      const response = await fetch('/api/receipt/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      setProcessingStatus('Extracting food items...');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Parse error:', errorData);
        throw new Error(errorData.error || 'Failed to parse receipt');
      }
      
      setProcessingStatus('Matching nutrition data...');
      const result = await response.json() as ParsedReceipt;
      console.log('Parsing completed:', result);
      return result;
    },
    onSuccess: (data: ParsedReceipt) => {
      console.log('Receipt parsing successful, switching to confirm step:', data);
      setIsProcessing(false);
      setProcessingStatus('');
      setParsedReceipt(data);
      // Initialize all items as selected with their parsed quantities and default food selection
      const initialSelections: Record<number, { selected: boolean; quantity: number; selectedFoodId?: string }> = {};
      data.items.forEach((match: FatSecretMatch, index: number) => {
        initialSelections[index] = {
          selected: true,
          quantity: match.originalItem.quantity || 1,
          selectedFoodId: match.fatSecretOptions?.[0]?.food_id // Default to first option
        };
      });
      setSelectedItems(initialSelections);
      setStep('confirm');
      console.log('Step set to confirm, initial selections:', initialSelections);
    },
    onError: (error) => {
      setIsProcessing(false);
      setProcessingStatus('');
      console.error('Receipt parsing error:', error);
      toast({
        title: "Parsing Failed",
        description: error.message || "Could not parse the receipt. Please try again or enter food manually.",
        variant: "destructive",
      });
    }
  });

  const confirmReceiptMutation = useMutation({
    mutationFn: async (data: {
      receiptId: string;
      forMeOnly: boolean;
      selectedItems: Array<{ index: number; quantity: number; selected: boolean }>;
      mealType: string;
    }) => {
      const response = await fetch('/api/receipt/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to confirm receipt');
      return await response.json() as { success: boolean; loggedItemsCount: number; loggedItems: any[] };
    },
    onSuccess: (data: { success: boolean; loggedItemsCount: number; loggedItems: any[] }) => {
      toast({
        title: "Food Logged Successfully",
        description: `Added ${data.loggedItemsCount} items to your ${mealType} log.`,
      });
      // Invalidate all food-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/receipt/food-log'] });
      queryClient.invalidateQueries({ queryKey: ['/api/food-log'] });
      
      // Navigate back to add food page to show the logged items
      setLocation('/add-food');
    },
    onError: (error) => {
      toast({
        title: "Logging Failed",
        description: "Could not save food items. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Accept JPEG, PNG, HEIC formats specifically
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "Invalid File Format",
        description: "Please select a JPEG, PNG, or HEIC image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Compress image if it's too large
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px width/height)
      const maxSize = 1920;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress - use higher quality for receipt text clarity
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = compressedBase64.split(',')[1];
      
      parseReceiptMutation.mutate({ image: base64Data });
    };
    
    img.onerror = () => {
      setIsProcessing(false);
      toast({
        title: "Image Error",
        description: "Could not process the image. Please try another file.",
        variant: "destructive",
      });
    };
    
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!parsedReceipt) return;

    const selectedItemsArray = Object.entries(selectedItems)
      .filter(([_, config]) => config.selected)
      .map(([index, config]) => {
        const match = parsedReceipt.items[parseInt(index)];
        // Use the first available food option if nutrition data exists
        const selectedFoodId = match?.fatSecretOptions?.[0]?.food_id;
        
        return {
          index: parseInt(index),
          quantity: config.quantity,
          selected: true,
          selectedFoodId: config.selectedFoodId || selectedFoodId,
        };
      });

    confirmReceiptMutation.mutate({
      receiptId: parsedReceipt.receiptId,
      forMeOnly,
      selectedItems: selectedItemsArray,
      mealType,
    });
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        selected: !prev[index]?.selected
      }
    }));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        quantity: Math.max(0.1, quantity)
      }
    }));
  };

  const updateItemFoodSelection = (index: number, foodId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        selectedFoodId: foodId
      }
    }));
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setLocation('/add-food')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-white">Scan Receipt</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-4 pb-6">
            <Card className="calm-card p-8 text-center" style={{ 
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white" style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>Upload Receipt</h2>
                  <p className="text-white/70" style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>
                    Take a photo or upload an image of your receipt to automatically log food items
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing || parseReceiptMutation.isPending}
                    className="w-full h-16 text-lg text-white"
                    style={{
                      backgroundColor: 'rgb(59, 130, 246)',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(59, 130, 246)'}
                  >
                    {isProcessing || parseReceiptMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                        {processingStatus || 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6 mr-3" />
                        Take Photo / Upload Image
                      </>
                    )}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    capture="environment"
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60" style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}>
                    Supported formats: JPEG, PNG, HEIC
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

  if (step === 'confirm' && parsedReceipt) {
    console.log('Rendering confirm step with parsedReceipt:', parsedReceipt.items.length, 'items');
    const selectedCount = Object.values(selectedItems).filter(item => item.selected).length;

    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep('upload')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-white">Confirm Items</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-4 pb-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Restaurant Info */}
              <Card className="calm-card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246)' }}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{parsedReceipt.establishment}</h3>
                    <p className="text-sm text-white/70">
                      Found {parsedReceipt.items.length} food items
                    </p>
                  </div>
                </div>
              </Card>

              {/* Meal Type Selection */}
              <Card className="calm-card p-4">
                <Label className="text-white font-medium mb-3 block">Add to meal:</Label>
                <RadioGroup value={mealType} onValueChange={(value: any) => setMealType(value)}>
                  <div className="flex space-x-4">
                    {[
                      { value: 'breakfast', label: 'Breakfast' },
                      { value: 'lunch', label: 'Lunch' },
                      { value: 'dinner', label: 'Dinner' },
                      { value: 'snacks', label: 'Snacks' }
                    ].map((meal) => (
                      <div key={meal.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={meal.value} id={meal.value} />
                        <Label htmlFor={meal.value} className="text-white/80">{meal.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              {/* For Me Only */}
              <Card className="calm-card p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="forMeOnly"
                    checked={forMeOnly}
                    onCheckedChange={(checked) => setForMeOnly(checked === true)}
                  />
                  <Label htmlFor="forMeOnly" className="text-white">
                    This order was just for me
                  </Label>
                </div>
              </Card>

              {/* Food Items */}
              <Card className="calm-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Select items to log ({selectedCount} selected)
                </h3>
                <div className="space-y-3">
                  {parsedReceipt.items.map((match, index) => {
                    const isSelected = selectedItems[index]?.selected || false;
                    const quantity = selectedItems[index]?.quantity || match.originalItem.quantity || 1;
                    const selectedFoodId = selectedItems[index]?.selectedFoodId;
                    const hasNutritionData = match.fatSecretOptions && match.fatSecretOptions.length > 0;

                    // Find the selected nutrition option for display
                    const selectedOption = match.fatSecretOptions?.find(option => option.food_id === selectedFoodId) || match.fatSecretOptions?.[0];

                    return (
                      <div key={index} className="p-4 rounded-lg bg-black/20 space-y-3">
                        {/* Top row: Checkbox, food name, quantity */}
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItemSelection(index)}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{match.originalItem.name}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-white/80 text-sm">Qty:</Label>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 1)}
                              className="w-20 bg-black/30 border-white/20 text-white"
                              min="0.1"
                              step="0.1"
                              disabled={!isSelected}
                            />
                          </div>
                        </div>

                        {/* Nutrition selection */}
                        {isSelected && hasNutritionData && (
                          <div className="space-y-2">
                            <Label className="text-white/80 text-sm">Choose nutrition match:</Label>
                            <Select
                              value={selectedFoodId}
                              onValueChange={(value) => updateItemFoodSelection(index, value)}
                            >
                              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                                <SelectValue placeholder="Select nutrition data..." />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-white/20">
                                {match.fatSecretOptions.map((option, optionIndex) => (
                                  <SelectItem key={option.food_id} value={option.food_id}>
                                    <div className="text-sm">
                                      <div className="font-medium text-white">{option.food_name}</div>
                                      <div className="text-white/60 text-xs">{option.food_description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Show selected option details */}
                            {selectedOption && (
                              <div className="text-xs text-white/60 mt-1">
                                Selected: {selectedOption.food_name} - {selectedOption.food_description}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Warning for no nutrition data */}
                        {isSelected && !hasNutritionData && (
                          <div className="flex items-center text-sm text-yellow-400">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            No nutrition data found for this item
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* CTA Button - Floating below content */}
              <div className="mt-6 px-4">
                <Button
                  onClick={handleConfirm}
                  disabled={selectedCount === 0 || confirmReceiptMutation.isPending}
                  className="w-full h-12 text-white text-lg font-semibold"
                  style={{
                    backgroundColor: selectedCount > 0 ? 'rgb(59, 130, 246)' : 'rgb(75, 85, 99)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCount > 0) e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCount > 0) e.currentTarget.style.backgroundColor = 'rgb(59, 130, 246)'
                  }}
                >
                  {confirmReceiptMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                      Logging Food...
                    </>
                  ) : selectedCount === 0 ? (
                    'Select items to continue'
                  ) : (
                    `Log ${selectedCount} Item${selectedCount !== 1 ? 's' : ''} to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

  console.log('Current step:', step, 'parsedReceipt exists:', !!parsedReceipt);
  return null;
}