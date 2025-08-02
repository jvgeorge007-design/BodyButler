import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface FloatingChatButtonProps {
  className?: string;
}

export default function FloatingChatButton({ className = "" }: FloatingChatButtonProps) {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const handleChatClick = () => {
    setLocation("/ai-chat");
  };

  return (
    <button
      onClick={handleChatClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
        boxShadow: isHovered 
          ? '0 8px 25px rgba(59, 130, 246, 0.4)' 
          : '0 4px 15px rgba(59, 130, 246, 0.3)'
      }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <MessageCircle 
          className="w-6 h-6 text-white" 
          strokeWidth={2}
        />
      </div>
      
      {/* Pulse animation ring */}
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
        }}
      />
    </button>
  );
}