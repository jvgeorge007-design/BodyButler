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
      <div className="rounded-2xl shadow-2xl w-full max-w-sm" style={{
        background: 'rgba(20, 20, 25, 0.4)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 className="text-xl font-black heading-serif" style={{color: 'rgb(235, 235, 240)'}}>Add Food</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
            style={{color: 'rgb(180, 180, 190)'}}
          >
            <X className="w-5 h-5" />
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
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{
                        background: 'linear-gradient(90deg, rgb(0, 95, 115) 0%, rgb(0, 85, 105) 50%, rgb(0, 75, 95) 100%)',
                        boxShadow: '0 0 15px rgba(87, 168, 255, 0.2)'
                      }}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 heading-serif" style={{color: 'rgb(235, 235, 240)'}}>{option.title}</h3>
                        <p className="text-sm mb-6 body-sans" style={{color: 'rgb(180, 180, 190)'}}>{option.description}</p>
                      </div>
                      <button
                        onClick={option.action}
                        className="w-full gradient-button"
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
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-6 h-6" style={{
                color: currentIndex === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgb(180, 180, 190)'
              }} />
            </button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {options.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: index === currentIndex ? 'rgb(0, 95, 115)' : 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              disabled={currentIndex === options.length - 1}
            >
              <ChevronRight className="w-6 h-6" style={{
                color: currentIndex === options.length - 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgb(180, 180, 190)'
              }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}