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
    
    // Try to parse the full guided format first
    const fullFormatMatch = cleanText.match(/i'm\s+([a-zA-Z]+)(?:\s+|,\s*)?(male|female)(?:\s+|,\s*)?(\d+)(?:'|')?(\d+)?(?:\s+|,\s*)?(\d+)?\s*(?:lbs?|pounds?)?(?:\s*(?:and\s*)?born\s*)?(?:(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})|(\d+))?/);
    
    if (fullFormatMatch && fullFormatMatch[1] && fullFormatMatch[2]) {
      const newFormData = { ...formData };
      
      // Name
      newFormData.name = fullFormatMatch[1].charAt(0).toUpperCase() + fullFormatMatch[1].slice(1);
      
      // Gender
      newFormData.sex = fullFormatMatch[2];
      
      // Height
      if (fullFormatMatch[3]) {
        const feet = parseInt(fullFormatMatch[3]);
        const inches = fullFormatMatch[4] ? parseInt(fullFormatMatch[4]) : 0;
        if (feet >= 4 && feet <= 8 && inches <= 11) {
          newFormData.height = `${feet}'${inches}"`;
        }
      }
      
      // Weight
      if (fullFormatMatch[5]) {
        const weight = parseInt(fullFormatMatch[5]);
        if (weight >= 50 && weight <= 500) {
          newFormData.weight = weight.toString();
        }
      }
      
      // Birth date
      if (fullFormatMatch[6] && fullFormatMatch[7] && fullFormatMatch[8]) {
        let month = parseInt(fullFormatMatch[6]);
        let day = parseInt(fullFormatMatch[7]);
        let year = parseInt(fullFormatMatch[8]);
        
        if (year < 100) {
          year = year > 30 ? 1900 + year : 2000 + year;
        }
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
          newFormData.birthDate = date.toISOString().split('T')[0];
        }
      } else if (fullFormatMatch[9]) {
        // Handle compact date format like "1997"
        const dateStr = fullFormatMatch[9];
        if (dateStr.length === 4) {
          const year = parseInt(dateStr);
          if (year >= 1900 && year <= 2010) {
            // Default to Jan 1 for just year
            const date = new Date(year, 0, 1);
            newFormData.birthDate = date.toISOString().split('T')[0];
          }
        }
      }
      
      console.log('Parsed data:', newFormData);
      setFormData(newFormData);
      return;
    }
    
    // Fallback: parse components individually for partial input
    const newFormData = { ...formData };
    let updated = false;
    
    // Name
    const nameMatch = cleanText.match(/i'm\s+([a-zA-Z]+)/);
    if (nameMatch && nameMatch[1] !== formData.name.toLowerCase()) {
      newFormData.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      updated = true;
    }
    
    // Gender
    if (cleanText.includes('male') && !cleanText.includes('female') && formData.sex !== 'male') {
      newFormData.sex = 'male';
      updated = true;
    } else if (cleanText.includes('female') && formData.sex !== 'female') {
      newFormData.sex = 'female';
      updated = true;
    }
    
    // Height - handle "5 6" or "56" formats
    const heightMatch = cleanText.match(/(?:^|\s)(\d+)(?:\s+|')(\d+)?(?:\s|$)/);
    if (heightMatch) {
      const feet = parseInt(heightMatch[1]);
      const inches = heightMatch[2] ? parseInt(heightMatch[2]) : 0;
      if (feet >= 4 && feet <= 8 && inches <= 11) {
        const heightStr = `${feet}'${inches}"`;
        if (heightStr !== formData.height) {
          newFormData.height = heightStr;
          updated = true;
        }
      }
    }
    
    // Weight
    const weightMatch = cleanText.match(/(\d+)(?:\s*(?:lbs?|pounds?))?/);
    if (weightMatch) {
      const weight = parseInt(weightMatch[1]);
      if (weight >= 50 && weight <= 500 && weight.toString() !== formData.weight) {
        newFormData.weight = weight.toString();
        updated = true;
      }
    }
    
    // Birth date
    const dateMatch = cleanText.match(/(?:born\s*)?(\d{4})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      if (year >= 1900 && year <= 2010) {
        const date = new Date(year, 0, 1);
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr !== formData.birthDate) {
          newFormData.birthDate = dateStr;
          updated = true;
        }
      }
    }
    
    if (updated) {
      setFormData(newFormData);
    }
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
              <span className="font-medium">Say something like:</span> "I'm Jerry, male, 5'7", 165 lbs, and born 1/1/1998."
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
