
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Brain, PlusCircle, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const DashboardChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👨‍⚕️ Hello! I'm your AI health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = "";
      const userQuestion = input.toLowerCase();
      
      if (userQuestion.includes("health score") || userQuestion.includes("score")) {
        response = "💯 Your health score is calculated based on your blood test results compared to standard reference ranges. It provides a general indication of your overall health status.\n\nThe score ranges from 0-100, with higher scores indicating better health. Factors that can lower your score include elevated or low levels of important biomarkers.\n\nTo improve your score, focus on the specific recommendations provided in your latest blood test analysis.";
      } 
      else if (userQuestion.includes("next test") || userQuestion.includes("should i test")) {
        response = "🔄 Based on general health guidelines, it's recommended to get a comprehensive blood panel at least once a year for preventive screening.\n\nHowever, given your previous results, you might benefit from a follow-up test in 3-6 months to monitor any parameters that were outside the normal range.\n\nConsider discussing with your healthcare provider about testing specifically for:\n• A complete blood count (CBC)\n• Comprehensive metabolic panel\n• Lipid profile\n• Hemoglobin A1c (if previous glucose was elevated)";
      }
      else if (userQuestion.includes("improve") || userQuestion.includes("better")) {
        response = "🌱 To improve your health metrics:\n\n1. Focus on a balanced diet rich in whole foods, lean proteins, and plenty of vegetables\n2. Engage in regular physical activity (150+ minutes per week)\n3. Ensure adequate sleep (7-8 hours nightly)\n4. Manage stress through mindfulness, meditation, or other relaxation techniques\n5. Stay hydrated with plenty of water\n6. Limit alcohol and avoid smoking\n\nFor more personalized recommendations, review the analysis of your specific blood test results.";
      }
      else if (userQuestion.includes("vitamin") || userQuestion.includes("supplement")) {
        response = "💊 Supplement recommendations should be based on your specific deficiencies and medical history. Common supplements that may benefit many people include:\n\n• Vitamin D (especially if you have limited sun exposure)\n• Omega-3 fatty acids (for heart and brain health)\n• Magnesium (for various biochemical reactions)\n• B-complex vitamins (for energy metabolism)\n\nBefore starting any supplement regimen, please consult with your healthcare provider and consider getting tested for specific deficiencies.";
      }
      else {
        response = "Thank you for your question. To give you the most accurate advice, I'd need to see your specific blood test results. Please upload your blood tests or view your existing reports for personalized insights.\n\nFor more detailed analysis, you can also chat with me directly from any of your blood test report pages.";
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { text: "How is my health score calculated?", icon: <Brain className="h-3 w-3 mr-1" /> },
    { text: "What tests should I take next?", icon: <PlusCircle className="h-3 w-3 mr-1" /> },
    { text: "How can I improve my health?", icon: <CalendarClock className="h-3 w-3 mr-1" /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-4 overflow-hidden"
    >
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        Quick Health Assistant
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3 h-48 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div 
              className={`
                max-w-[85%] p-2 rounded-lg text-sm
                ${message.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"}
              `}
            >
              <div className="whitespace-pre-line">{message.content}</div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg rounded-tl-none text-gray-800 dark:text-gray-200 text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce mx-1" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
          disabled={isLoading}
          className="flex-1 text-sm"
          size="sm"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q, idx) => (
          <Button 
            key={idx}
            variant="outline" 
            size="sm" 
            className="text-xs flex-1"
            onClick={() => {
              setInput(q.text);
              setTimeout(() => handleSendMessage(), 100);
            }}
          >
            {q.icon} {q.text}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
