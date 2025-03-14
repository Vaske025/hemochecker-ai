
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  initialAnalysis: string;
  recommendations: string[];
}

export const AiChat = ({ initialAnalysis, recommendations }: AiChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initialAnalysis },
    { role: "assistant", content: "Here are my recommendations:\n" + recommendations.map(rec => `• ${rec}`).join("\n") },
    { role: "assistant", content: "Feel free to ask me any questions about your results!" }
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
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a simple response based on the message
      let response = "";
      const userQuestion = input.toLowerCase();
      
      if (userQuestion.includes("cholesterol") || userQuestion.includes("ldl") || userQuestion.includes("hdl")) {
        response = "Cholesterol is a fatty substance found in your blood. High levels can increase your risk of heart disease. LDL is often called 'bad' cholesterol, while HDL is 'good' cholesterol. Regular exercise and a healthy diet can help manage your cholesterol levels.";
      } else if (userQuestion.includes("glucose") || userQuestion.includes("sugar")) {
        response = "Blood glucose refers to sugar in your bloodstream. Elevated levels might indicate prediabetes or diabetes. Maintaining a healthy weight, regular exercise, and limiting refined carbohydrates can help manage blood glucose levels.";
      } else if (userQuestion.includes("platelets")) {
        response = "Platelets are blood cells that help your blood clot. High platelet counts might increase your risk of clots, while low counts might cause excessive bleeding. If your levels are concerning, I'd recommend discussing with your doctor.";
      } else if (userQuestion.includes("hemoglobin") || userQuestion.includes("iron")) {
        response = "Hemoglobin carries oxygen in your red blood cells. Low levels might indicate anemia. Iron-rich foods like lean meats, beans, and leafy greens can help boost hemoglobin levels, but always consult your doctor first.";
      } else if (userQuestion.includes("thank")) {
        response = "You're welcome! I'm here to help with any other questions about your blood test results.";
      } else {
        response = "That's a great question. Based on your results, I'd recommend discussing this with your healthcare provider for personalized advice. Is there anything specific about your results that concerns you?";
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

  return (
    <div className="glass-card rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        Chat with BloodWork AI
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4 h-80 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
          >
            <div 
              className={`
                max-w-[80%] p-3 rounded-lg 
                ${message.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"}
              `}
            >
              <div className="flex items-start">
                {message.role === "assistant" && (
                  <Bot className="h-5 w-5 mt-1 mr-2 flex-shrink-0" />
                )}
                <div className="whitespace-pre-line">{message.content}</div>
                {message.role === "user" && (
                  <User className="h-5 w-5 mt-1 ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg rounded-tl-none text-gray-800 dark:text-gray-200">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce mx-1" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your results..."
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
