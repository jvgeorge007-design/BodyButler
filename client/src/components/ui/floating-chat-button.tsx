import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

interface FloatingChatButtonProps {
  className?: string;
}

export default function FloatingChatButton({ className = "" }: FloatingChatButtonProps) {
  const [, setLocation] = useLocation();

  const handleChatClick = () => {
    setLocation("/ai-chat");
  };

  return (
    <button
      onClick={handleChatClick}
      className={`fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full shadow-lg ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <MessageCircle 
          className="w-5 h-5 text-white" 
          strokeWidth={2}
        />
      </div>
    </button>
  );
}