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
      className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full shadow-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
      }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <MessageCircle 
          className="w-6 h-6 text-white" 
          strokeWidth={2}
        />
      </div>
    </button>
  );
}