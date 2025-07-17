import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

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
    birthDate: data.birthDate || "",
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
    console.log('Clean text for parsing:', cleanText);
    
    // Use functional state update to get the latest formData
    setFormData((currentFormData) => {
      console.log('Current formData before parsing:', currentFormData);
      
      // Extract all numbers and categorize by digit count
      const numbers = cleanText.match(/\d+/g) || [];
      const newFormData = { ...currentFormData };
      let updated = false;
    
      // Parse name - update if we find a different/better name
      const nameMatch = cleanText.match(/(?:i'm|my name is|i am)\s+([a-zA-Z]+)/);
      if (nameMatch) {
        const excludedWords = ['male', 'mail', 'female', 'born', 'birthday', 'weight', 'height', 'pounds', 'lbs'];
        const candidateName = nameMatch[1];
        if (!excludedWords.includes(candidateName.toLowerCase())) {
          const newName = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);
          if (newName !== currentFormData.name && newName.length >= currentFormData.name.length) {
            newFormData.name = newName;
            updated = true;
            console.log(`Updated name to: ${newName}`);
          }
        }
      } else if (!currentFormData.name && /^[a-zA-Z]+$/.test(cleanText)) {
        // If just a name is spoken and we don't have one yet
        // Exclude gender words and common misrecognitions
        const excludedWords = ['male', 'mail', 'female', 'born', 'birthday', 'weight', 'height', 'pounds', 'lbs'];
        if (!excludedWords.includes(cleanText.toLowerCase())) {
          const name = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
          newFormData.name = name;
          updated = true;
          console.log(`Updated name to: ${name}`);
        }
      }
      
      // Parse gender - handle common speech recognition errors
      if (cleanText.includes('female')) {
        if (currentFormData.sex !== 'female') {
          newFormData.sex = 'female';
          updated = true;
          console.log('Updated sex to female');
        }
      } else if (cleanText.includes('male') || cleanText.includes('mail')) {
        // Handle "mail" as common misrecognition of "male"
        if (currentFormData.sex !== 'male') {
          newFormData.sex = 'male';
          updated = true;
          console.log('Updated sex to male');
        }
      }
    
      // Check for natural date patterns first (born/birthday followed by date)
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                         'july', 'august', 'september', 'october', 'november', 'december'];
      
      // Pattern: "born january 1st 1998" or "birthday march 15th 1995"  
      console.log('Checking for natural date in:', cleanText);
      const naturalDateMatch = cleanText.match(/(?:born|birthday)\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})/);
      console.log('Natural date match result:', naturalDateMatch);
      if (naturalDateMatch) {
        const monthName = naturalDateMatch[1].toLowerCase();
        const day = parseInt(naturalDateMatch[2]);
        const year = parseInt(naturalDateMatch[3]);
        
        console.log('Natural date match:', monthName, day, year);
        
        const monthIndex = monthNames.findIndex(name => name.startsWith(monthName.substring(0, 3)));
        if (monthIndex !== -1 && day >= 1 && day <= 31 && year >= 1900 && year <= 2030) {
          const date = new Date(year, monthIndex, day);
          const newDateStr = date.toISOString().split('T')[0];
          if (newDateStr !== currentFormData.birthDate) {
            newFormData.birthDate = newDateStr;
            updated = true;
            console.log('Updated birth date to:', newDateStr);
          }
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
            // 3-digit could be height (511 = 5'11") or weight (170 lbs)
            // Check if it's followed by weight indicators
            if (cleanText.includes('pound') || cleanText.includes('lb') || cleanText.includes('weight')) {
              if (!currentFormData.weight && num >= 50 && num <= 500) {
                newFormData.weight = num.toString();
                updated = true;
                console.log(`Updated weight to ${num} lbs`);
              }
            } else if (num >= 410 && num <= 811) {
              // Parse as height: 511 = 5'11" (prioritize if no height or override 2-digit)
              const feet = Math.floor(num / 100);
              const inches = num % 100;
              if (feet >= 4 && feet <= 8 && inches <= 11) {
                newFormData.height = `${feet}'${inches}"`;
                updated = true;
                console.log(`Updated height to ${feet}'${inches}" from ${num}`);
              }
            } else if (!currentFormData.weight && num >= 50 && num <= 500) {
              // Parse as weight if not height range
              newFormData.weight = num.toString();
              updated = true;
              console.log(`Updated weight to ${num}`);
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
            className="w-full gradient-button"
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
