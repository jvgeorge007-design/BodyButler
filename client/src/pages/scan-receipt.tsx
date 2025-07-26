import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Camera, Upload, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/navigation/bottom-nav";


interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  originalText: string;
}

interface USDAMatch {
  originalItem: ParsedItem;
  usdaOptions: any[];
  bestMatch: any;
}

interface ParsedReceipt {
  receiptId: string;
  establishment: string;
  items: ParsedItem[];
  usdaMatches: USDAMatch[];
  confidence: number;
}

export default function ScanReceiptPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'confirm'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [forMeOnly, setForMeOnly] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; quantity: number }>>({});
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
      const response = await fetch('/api/receipt/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to parse receipt');
      return await response.json() as ParsedReceipt;
    },
    onSuccess: (data: ParsedReceipt) => {
      setIsProcessing(false);
      setParsedReceipt(data);
      // Initialize all items as selected with their parsed quantities
      const initialSelections: Record<number, { selected: boolean; quantity: number }> = {};
      data.items.forEach((item: ParsedItem, index: number) => {
        initialSelections[index] = {
          selected: true,
          quantity: item.quantity || 1
        };
      });
      setSelectedItems(initialSelections);
      setStep('confirm');
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Parsing Failed",
        description: "Could not parse the receipt. Please try again or enter food manually.",
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
      queryClient.invalidateQueries({ queryKey: ['/api/receipt/food-log'] });
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
      .map(([index, config]) => ({
        index: parseInt(index),
        quantity: config.quantity,
        selected: true,
      }));

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
                    className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                    style={{
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility'
                    }}
                  >
                    {isProcessing || parseReceiptMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                        Processing...
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
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{parsedReceipt.establishment}</h3>
                    <p className="text-sm text-white/70">
                      Found {parsedReceipt.items.length} food items • {Math.round(parsedReceipt.confidence * 100)}% confidence
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
                  {parsedReceipt.items.map((item, index) => {
                    const isSelected = selectedItems[index]?.selected || false;
                    const quantity = selectedItems[index]?.quantity || item.quantity || 1;
                    const usdaMatch = parsedReceipt.usdaMatches[index];

                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-black/20">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItemSelection(index)}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.name}</h4>
                          {usdaMatch?.bestMatch && (
                            <p className="text-sm text-white/60">
                              Matched: {usdaMatch.bestMatch.description}
                            </p>
                          )}
                          {!usdaMatch?.bestMatch && (
                            <p className="text-sm text-yellow-400 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              No nutrition data found
                            </p>
                          )}
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
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4">
            <Button
              onClick={handleConfirm}
              disabled={selectedCount === 0 || confirmReceiptMutation.isPending}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg"
            >
              {confirmReceiptMutation.isPending ? (
                <>
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                  Logging Food...
                </>
              ) : (
                `Log ${selectedCount} Item${selectedCount !== 1 ? 's' : ''} to ${mealType}`
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

  return null;
}