import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Send, Bot, User, Plus, MessageSquare } from "lucide-react";
import IOSNavHeader from "@/components/navigation/ios-nav-header";
import { IOSButton } from "@/components/ui/ios-button";
import BottomNav from "@/components/navigation/bottom-nav";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Body Butler, your AI fitness coach. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're asking about " + inputText + ". Let me help you with that! As your AI fitness coach, I can assist with workout planning, nutrition advice, and tracking your progress.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const quickPrompts = [
    "Create a workout plan for today",
    "What should I eat for breakfast?",
    "Track my progress this week",
    "Help me stay motivated"
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* iOS Navigation Header */}
      <IOSNavHeader 
        title="AI Coach" 
        subtitle="Your personal fitness assistant"
        rightButton={
          <IOSButton 
            variant="plain" 
            size="small"
            onClick={() => {/* TODO: Clear chat */}}
            icon={<Plus className="w-5 h-5" />}
          />
        }
      />

      {/* Chat Messages */}
      <main className="max-w-md mx-auto ios-padding min-h-screen" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 200px)'
      }}>
        <div className="ios-spacing-small">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex items-start ios-spacing-small ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'ios-bg-blue text-white ml-12' 
                  : 'bg-white/10 text-white mr-12'
              }`}>
                <p className="text-body">{message.text}</p>
                <p className="text-caption-2 ios-gray mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center ml-3 flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="ios-card mt-6">
            <h3 className="text-headline font-semibold text-white mb-4">Quick Actions</h3>
            <div className="ios-spacing-small">
              {quickPrompts.map((prompt, index) => (
                <IOSButton
                  key={index}
                  variant="secondary"
                  size="default"
                  fullWidth
                  onClick={() => {
                    setInputText(prompt);
                    handleSendMessage();
                  }}
                  className="justify-start"
                >
                  {prompt}
                </IOSButton>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Message Input */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto"
        style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)'
        }}
      >
        <div className="ios-padding">
          <div className="flex items-center ios-spacing-small">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <IOSButton
              variant="primary"
              size="default"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              icon={<Send className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}