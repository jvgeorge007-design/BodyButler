import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Body Butler AI coach. How can I help you today? I can assist with workout plans, nutrition advice, form tips, and motivation!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('workout') || message.includes('exercise')) {
      return "Great question about workouts! Based on your current plan, I recommend focusing on compound movements like squats, deadlifts, and bench press. These exercises work multiple muscle groups efficiently. Would you like me to suggest a specific routine for today?";
    } else if (message.includes('nutrition') || message.includes('food') || message.includes('eat')) {
      return "Nutrition is key to reaching your goals! I see you're tracking your macros well. For optimal results, try to eat protein with every meal and include plenty of vegetables. Are you having trouble meeting your protein goals?";
    } else if (message.includes('motivation') || message.includes('tired') || message.includes('difficult')) {
      return "I understand it can be challenging sometimes! Remember, every small step counts toward your goals. You've already made great progress by being here and tracking your fitness. What's one small thing you can do today to move forward?";
    } else if (message.includes('form') || message.includes('technique')) {
      return "Proper form is crucial for both safety and effectiveness! Here are some key tips: keep your core engaged, maintain neutral spine, and focus on controlled movements. Would you like specific form cues for any particular exercise?";
    } else {
      return "That's a great question! I'm here to help you with all aspects of your fitness journey. Whether it's about workouts, nutrition, motivation, or technique - I've got you covered. What specific area would you like to focus on today?";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-4">
        <button 
          onClick={() => setLocation("/dashboard")}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">BB</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Body Butler AI</h1>
            <p className="text-sm text-blue-100">Your personal fitness coach</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about fitness..."
            className="flex-1 p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}