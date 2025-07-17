import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Edit, FileText, QrCode, Camera } from "lucide-react";

interface AddFoodCarouselProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFoodCarousel({ isOpen, onClose }: AddFoodCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const options = [
    {
      icon: Edit,
      title: "Manual Add",
      description: "Enter food details manually",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      action: () => {
        console.log("Manual add selected");
        onClose();
      }
    },
    {
      icon: FileText,
      title: "Receipt Scan",
      description: "Scan grocery receipt",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      action: () => {
        console.log("Receipt scan selected");
        onClose();
      }
    },
    {
      icon: QrCode,
      title: "Barcode Scan",
      description: "Scan product barcode",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      action: () => {
        console.log("Barcode scan selected");
        onClose();
      }
    },
    {
      icon: Camera,
      title: "Take Photo",
      description: "Take a photo of your food",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      action: () => {
        console.log("Take photo selected");
        onClose();
      }
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % options.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + options.length) % options.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-black text-white heading-serif">Add Food</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Carousel */}
        <div className="p-6">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {options.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-700 to-orange-800 rounded-3xl flex items-center justify-center mx-auto">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 heading-serif">{option.title}</h3>
                        <p className="text-sm text-white/70 mb-6 body-sans">{option.description}</p>
                      </div>
                      <button
                        onClick={option.action}
                        className="w-full bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
                      >
                        Choose {option.title}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevSlide}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className={`w-6 h-6 ${currentIndex === 0 ? 'text-white/30' : 'text-white'}`} />
            </button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {options.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-orange-600' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              disabled={currentIndex === options.length - 1}
            >
              <ChevronRight className={`w-6 h-6 ${currentIndex === options.length - 1 ? 'text-white/30' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}