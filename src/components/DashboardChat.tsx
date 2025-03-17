
import { useState } from "react";
import { Bot, User, SendHorizontal, Sparkles, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const DashboardChat = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your health assistant. I can help you understand your blood test results, suggest lifestyle improvements, or answer general health questions. What would you like to know today?"
    }
  ]);
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI thinking
    setIsTyping(true);
    
    try {
      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add simulated assistant response
      let responseContent = "";
      
      if (message.toLowerCase().includes("score") || message.toLowerCase().includes("health score")) {
        responseContent = "🏆 Your health score is calculated based on the values from your blood tests. For more detailed information, please check the Health Overview section on your dashboard. If you've recently uploaded a new test, it may take a moment to update.";
      } else if (message.toLowerCase().includes("next test") || message.toLowerCase().includes("when")) {
        responseContent = "📅 For most people, an annual comprehensive blood test is recommended. However, this can vary based on your age, existing health conditions, and risk factors. I suggest discussing with your healthcare provider about the ideal frequency for your specific situation.";
      } else if (message.toLowerCase().includes("improve") || message.toLowerCase().includes("better")) {
        responseContent = "💪 To improve your health scores, focus on: \n\n1. Regular physical activity (at least 150 minutes/week)\n2. A balanced diet rich in fruits, vegetables, whole grains\n3. Adequate hydration (8-10 glasses of water daily)\n4. Quality sleep (7-9 hours nightly)\n5. Stress management techniques\n\nSmall, consistent changes often yield the best long-term results!";
      } else if (message.toLowerCase().includes("cholesterol") || message.toLowerCase().includes("hdl") || message.toLowerCase().includes("ldl")) {
        responseContent = "🥗 To maintain healthy cholesterol levels:\n\n• Increase soluble fiber (oats, beans, fruits)\n• Choose healthy fats (olive oil, avocados, nuts)\n• Limit saturated and trans fats\n• Stay physically active\n• Consider plant sterols/stanols\n\nWould you like more specific advice based on your latest test results?";
      } else {
        responseContent = "I understand you're asking about " + message.slice(0, 30) + (message.length > 30 ? "..." : "") + ". For more personalized insights, I'd recommend uploading your latest blood test results so I can provide tailored advice. Would you like help with that?";
      }
      
      const assistantMessage = { role: "assistant", content: responseContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Sorry, I couldn't process your request right now.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <Card className="shadow-md w-full glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Health Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="overflow-y-auto max-h-80 mb-2">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div className={`flex max-w-[80%] ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`flex items-start p-1.5 ${msg.role === "assistant" ? "mr-2" : "ml-2"}`}>
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <div 
                  className={`p-3 rounded-lg ${
                    msg.role === "assistant" 
                      ? "bg-muted text-left" 
                      : "bg-primary text-primary-foreground text-right"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%]">
                <div className="flex items-start p-1.5 mr-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <div className="px-4 py-2 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => handleQuickQuestion("What affects my health score?")}
          >
            <Activity className="h-3 w-3 mr-1" />
            Health Score
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => handleQuickQuestion("How can I improve my cholesterol?")}
          >
            <Heart className="h-3 w-3 mr-1" />
            Cholesterol
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => handleQuickQuestion("When should I take my next blood test?")}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Next Test
          </Button>
        </div>
      </div>
      
      <CardFooter className="pt-0">
        <div className="flex items-center w-full gap-2">
          <Textarea 
            placeholder="Ask me anything about your health..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-10 flex-1"
            maxLength={280}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping} size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
