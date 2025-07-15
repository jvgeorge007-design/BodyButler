import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hey there! I'm your AI coach. How can I help you today? 💪",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! Let me help you with that.",
        "I'm here to support your fitness journey. What specific area would you like to focus on?",
        "That's a common concern. Here's what I recommend...",
        "Let's work together to optimize your routine!"
      ];
      
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="floating-chat"
        aria-label="Open AI Coach Chat"
      >
        <KettlebellLogo className="w-6 h-6" />
      </button>

      {/* Full Screen Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="system-blur border-b border-[hsl(var(--border))] px-4 py-3">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] flex items-center justify-center">
                  <KettlebellLogo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-headline text-[hsl(var(--text-primary))]">AI Coach</h2>
                  <p className="text-caption2">Your personal fitness assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-4 rounded-2xl
                      ${message.role === 'user'
                        ? 'bg-[hsl(var(--blue-primary))] text-white rounded-br-md'
                        : 'bg-[hsl(var(--surface-secondary))] text-[hsl(var(--text-primary))] rounded-bl-md'
                      }
                    `}
                  >
                    <p className="text-body">{message.content}</p>
                    <p className={`text-caption2 mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-[hsl(var(--text-secondary))]'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="system-blur border-t border-[hsl(var(--border))] px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your fitness journey..."
                  className="flex-1 rounded-2xl border-[hsl(var(--border))] min-h-[44px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="gradient-button"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}