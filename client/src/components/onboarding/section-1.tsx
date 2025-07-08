import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    const lowerText = text.toLowerCase();
    const newFormData = { ...formData };

    // Parse name - look for "I'm" or "my name is"
    const nameMatch = lowerText.match(/(?:i'm|my name is|i am)\s+([a-zA-Z]+)/);
    if (nameMatch) {
      newFormData.name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // Parse sex/gender
    if (lowerText.includes('male') && !lowerText.includes('female')) {
      newFormData.sex = 'male';
    } else if (lowerText.includes('female')) {
      newFormData.sex = 'female';
    }

    // Parse height - handle formats like "5'7", "5 feet 7", "57", "67"
    const heightMatch = lowerText.match(/(\d+)(?:'|feet|\s+feet)?\s*(\d+)?(?:"|inches|\s+inches)?/);
    if (heightMatch) {
      const feet = parseInt(heightMatch[1]);
      const inches = heightMatch[2] ? parseInt(heightMatch[2]) : 0;
      
      // If single number like 57, 67, convert to feet'inches"
      if (!heightMatch[2] && feet >= 48 && feet <= 84) {
        const convertedFeet = Math.floor(feet / 12);
        const convertedInches = feet % 12;
        newFormData.height = `${convertedFeet}'${convertedInches}"`;
      } else if (feet <= 8) {
        newFormData.height = `${feet}'${inches}"`;
      }
    }

    // Parse weight - look for numbers followed by "lbs", "pounds", or standalone numbers
    const weightMatch = lowerText.match(/(\d+)(?:\s*(?:lbs|pounds|lb))?/);
    if (weightMatch) {
      const weight = parseInt(weightMatch[1]);
      if (weight >= 50 && weight <= 500) { // reasonable weight range
        newFormData.weight = weight.toString();
      }
    }

    // Parse birth date - handle various formats
    const birthMatch = lowerText.match(/(?:born|birth|birthday).*?(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/);
    if (birthMatch) {
      let month = parseInt(birthMatch[1]);
      let day = parseInt(birthMatch[2]);
      let year = parseInt(birthMatch[3]);
      
      // Convert 2-digit year to 4-digit
      if (year < 100) {
        year = year > 30 ? 1900 + year : 2000 + year;
      }
      
      const date = new Date(year, month - 1, day);
      newFormData.birthDate = date.toISOString().split('T')[0];
    }

    // Handle month names
    const monthNameMatch = lowerText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,\s*|\s+)(\d{2,4})/);
    if (monthNameMatch) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const month = months.indexOf(monthNameMatch[1]) + 1;
      const day = parseInt(monthNameMatch[2]);
      let year = parseInt(monthNameMatch[3]);
      
      if (year < 100) {
        year = year > 30 ? 1900 + year : 2000 + year;
      }
      
      const date = new Date(year, month - 1, day);
      newFormData.birthDate = date.toISOString().split('T')[0];
    }

    setFormData(newFormData);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
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
          
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500">Try saying:</p>
            <p className="text-sm text-gray-700 italic">
              "I'm Jerry, male, 5'7", 165 lbs, and born 1/1/1998."
            </p>
          </div>
          
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3 border max-w-full">
              <p className="text-xs text-gray-500 mb-1">Listening:</p>
              <p className="text-sm text-gray-700">{transcript}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
              What's your name?
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your first name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Biological Sex Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Biological Sex</Label>
            <div className="flex bg-gray-100 rounded-xl p-1">
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
              <Label htmlFor="height" className="text-sm font-semibold text-gray-900">Height</Label>
              <Input
                id="height"
                type="text"
                placeholder="5'10&quot;"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-semibold text-gray-900">Weight</Label>
              <Input
                id="weight"
                type="text"
                placeholder="180 lbs"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-900">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
