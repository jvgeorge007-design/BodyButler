import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Mic, MicOff } from "lucide-react";

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Section1Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
}

export default function Section1({ data, onNext, isLoading }: Section1Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: data.name || "",
    sex: data.sex || "",
    height: data.height || "",
    weight: data.weight || "",
    birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : "",
    profilePhotoUrl: data.profilePhotoUrl || "",
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    // Validate required fields
    const requiredFields = [
      { field: 'name', label: 'Name' },
      { field: 'sex', label: 'Biological Sex' },
      { field: 'height', label: 'Height' },
      { field: 'weight', label: 'Weight' },
      { field: 'birthDate', label: 'Birth Date' }
    ];
    
    const emptyFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData].trim());
    
    if (emptyFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: `Please fill out: ${emptyFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript and parse in real-time
        const currentTranscript = finalTranscript + interimTranscript;
        setTranscript(currentTranscript);
        
        if (currentTranscript.trim()) {
          parseAndFillForm(currentTranscript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const parseAndFillForm = (text: string) => {
    const cleanText = text.toLowerCase().trim();
    if (!cleanText) return;
    
    console.log('Parsing:', text);
    
    // Use functional state update to get the latest formData
    setFormData((currentFormData) => {
      console.log('Current formData before parsing:', currentFormData);
      
      // Extract all numbers and categorize by digit count
      const numbers = cleanText.match(/\d+/g) || [];
      const newFormData = { ...currentFormData };
      let updated = false;
    
      // Parse name - update if we find a different/better name
      const nameMatch = cleanText.match(/i'm\s+([a-zA-Z]+)/);
      if (nameMatch) {
        const newName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
        if (newName !== currentFormData.name && newName.length >= currentFormData.name.length) {
          newFormData.name = newName;
          updated = true;
        }
      }
      
      // Parse gender - only if we don't already have one
      if (!currentFormData.sex) {
        if (cleanText.includes('male') && !cleanText.includes('female')) {
          newFormData.sex = 'male';
          updated = true;
        } else if (cleanText.includes('female')) {
          newFormData.sex = 'female';
          updated = true;
        }
      }
    
      // Check for natural date patterns first (born/birthday followed by date)
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                         'july', 'august', 'september', 'october', 'november', 'december'];
      
      // Pattern: "born january 1st 1998" or "birthday march 15th 1995"
      const naturalDateMatch = cleanText.match(/(?:born|birthday)\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})/);
      if (naturalDateMatch && !currentFormData.birthDate) {
        const monthName = naturalDateMatch[1].toLowerCase();
        const day = parseInt(naturalDateMatch[2]);
        const year = parseInt(naturalDateMatch[3]);
        
        const monthIndex = monthNames.findIndex(name => name.startsWith(monthName.substring(0, 3)));
        if (monthIndex !== -1 && day >= 1 && day <= 31 && year >= 1900 && year <= 2030) {
          const date = new Date(year, monthIndex, day);
          newFormData.birthDate = date.toISOString().split('T')[0];
          updated = true;
        }
      }
      
      // Fallback: simple year pattern "born 1998"
      if (!updated) {
        const yearMatch = cleanText.match(/(?:born|birthday)\s+(\d{4})/);
        if (yearMatch && !currentFormData.birthDate) {
          const year = parseInt(yearMatch[1]);
          if (year >= 1900 && year <= 2030) {
            const date = new Date(year, 0, 1);
            newFormData.birthDate = date.toISOString().split('T')[0];
            updated = true;
          }
        }
      }
      
      // Categorize numbers by digit count (skip if we already parsed a date)
      if (!naturalDateMatch && !updated) {
        for (const numStr of numbers) {
          const num = parseInt(numStr);
          
          if (numStr.length === 2) {
            // 2-digit = height (like 58 = 5'8") - only if we don't have height yet
            if (!currentFormData.height && num >= 48 && num <= 84) {
              const feet = Math.floor(num / 10);
              const inches = num % 10;
              if (feet >= 4 && feet <= 8 && inches <= 11) {
                newFormData.height = `${feet}'${inches}"`;
                updated = true;
              }
            }
          } else if (numStr.length === 3) {
            // 3-digit = weight (like 170, 190) - only if we don't have weight yet
            if (!currentFormData.weight && num >= 50 && num <= 500) {
              newFormData.weight = num.toString();
              updated = true;
            }
          } else if (numStr.length === 4) {
            // 4-digit = birth year only (like 1998)
            if (!currentFormData.birthDate && num >= 1900 && num <= 2030) {
              const date = new Date(num, 0, 1);
              newFormData.birthDate = date.toISOString().split('T')[0];
              updated = true;
            }
          }
        }
      }
      
      // Special case: handle space-separated height like "5 8" - only if we don't have height yet
      if (!currentFormData.height) {
        const heightSpaceMatch = cleanText.match(/(?:^|\s)(\d)\s+(\d+)(?:\s|$)/);
        if (heightSpaceMatch) {
          const feet = parseInt(heightSpaceMatch[1]);
          const inches = parseInt(heightSpaceMatch[2]);
          if (feet >= 4 && feet <= 8 && inches <= 11) {
            newFormData.height = `${feet}'${inches}"`;
            updated = true;
          }
        }
      }
      
      if (updated) {
        console.log('Parsed data:', newFormData);
        return newFormData;
      }
      
      return currentFormData;
    });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
        
        // Auto-stop after 15 seconds
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
          }
        }, 15000);
      }
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">The Basics</h2>
          <p className="text-gray-600">Fill out the forms below or tell me more about yourself</p>
        </div>

        {/* Voice Input Section */}
        <div className="flex flex-col items-center space-y-3">
          <Button
            type="button"
            onClick={toggleListening}
            size="lg"
            className={`w-16 h-16 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white shadow-lg transition-all`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          
          <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <span className="font-medium">Say something like:</span> "I'm Jerry, male, 5'7", 165 lbs, born January 1st, 1998."
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
              What's your name? *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your first name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 ${
                hasAttemptedSubmit && !formData.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              required
            />
          </div>

          {/* Biological Sex Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Biological Sex *</Label>
            <div className={`flex rounded-xl p-1 ${
              hasAttemptedSubmit && !formData.sex ? 'bg-red-50 border border-red-300' : 'bg-gray-100'
            }`}>
              <button
                type="button"
                onClick={() => handleInputChange("sex", "male")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  formData.sex === "male"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("sex", "female")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  formData.sex === "female"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-semibold text-gray-900">Height *</Label>
              <Input
                id="height"
                type="text"
                placeholder="5'10&quot;"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 ${
                  hasAttemptedSubmit && !formData.height ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-semibold text-gray-900">Weight *</Label>
              <Input
                id="weight"
                type="text"
                placeholder="180 lbs"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 ${
                  hasAttemptedSubmit && !formData.weight ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-900">Birth Date *</Label>
            <Input
              id="birthDate"
              type="date"
              placeholder="Try: born January 1st, 1998"
              value={formData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 ${
                hasAttemptedSubmit && !formData.birthDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Body Composition Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Upload or take a photo</p>
              <p className="text-xs text-gray-400 mt-1">Helps us estimate body composition</p>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
