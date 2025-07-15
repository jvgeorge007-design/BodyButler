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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Food</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
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
                      <div className={`w-20 h-20 ${option.color} rounded-3xl flex items-center justify-center mx-auto`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                        <p className="text-sm text-gray-600 mb-6">{option.description}</p>
                      </div>
                      <button
                        onClick={option.action}
                        className={`w-full ${option.color} ${option.hoverColor} text-white font-medium py-3 rounded-2xl transition-colors`}
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
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className={`w-6 h-6 ${currentIndex === 0 ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {options.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={currentIndex === options.length - 1}
            >
              <ChevronRight className={`w-6 h-6 ${currentIndex === options.length - 1 ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}