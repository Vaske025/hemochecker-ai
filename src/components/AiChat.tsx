
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, AlertCircle, Heart, Pill, Activity, Coffee, Apple, Dumbbell, Upload, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BloodTestMetric } from "@/types/BloodTest";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { sendAiRequest, analyzeFileWithAi } from "@/services/aiService";

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: string;
}

interface AiChatProps {
  initialAnalysis: string;
  recommendations: string[];
  metrics?: BloodTestMetric[];
  rawContent?: string;
}

export const AiChat = ({ initialAnalysis, recommendations, metrics = [], rawContent = "" }: AiChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👨‍⚕️ " + initialAnalysis },
    { role: "assistant", content: "💡 Here are my recommendations:\n" + recommendations.map(rec => `• ${rec}`).join("\n") },
    { role: "assistant", content: "❓ Feel free to ask me any questions about your results or upload a new blood test file for direct analysis!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfData, setPdfData] = useState({ metrics, rawContent });
  const { toast } = useToast();
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setPdfData({ metrics, rawContent });
  }, [metrics, rawContent]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !fileUpload)) return;
    
    const userMessage: Message = { 
      role: "user", 
      content: input || (fileUpload ? `I'm uploading a file: ${fileUpload.name}` : ""),
      file: fileUpload ? fileUpload.name : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      if (fileUpload) {
        await handleFileAnalysis(fileUpload);
        setFileUpload(null);
        setShowUpload(false);
      } else {
        await handleTextQuery(input);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAnalysis = async (file: File) => {
    const loadingMessage: Message = { 
      role: "assistant", 
      content: `Analyzing your file: ${file.name}. This may take a moment...` 
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Use external AI service to analyze the file
      const instructions = `This is a blood test file. Please analyze it and provide insights on the main health metrics.
        If you identify any abnormal values, highlight them and provide recommendations.
        Current context: ${pdfData.metrics.length} metrics available, ${pdfData.metrics.filter(m => m.status !== "normal").length} abnormal.`;
      
      const response = await analyzeFileWithAi(file, instructions);
      
      // Replace loading message with the response
      setMessages(prev => 
        prev.slice(0, -1).concat({ role: "assistant", content: response })
      );
    } catch (error) {
      console.error("Error analyzing file:", error);
      setMessages(prev => 
        prev.slice(0, -1).concat({ 
          role: "assistant", 
          content: "I'm sorry, I encountered an error analyzing this file. Please try again or upload a different file format." 
        })
      );
    }
  };

  const handleTextQuery = async (userQuery: string) => {
    try {
      // Construct context from available metrics
      let systemPrompt = "You are a helpful medical assistant analyzing blood test results. ";
      
      if (pdfData.metrics.length > 0) {
        systemPrompt += "Here are the current blood test metrics: " + 
          pdfData.metrics.map(m => `${m.name}: ${m.value} ${m.unit} (${m.status})`).join(", ") + ". ";
      }
      
      if (pdfData.metrics.filter(m => m.status !== "normal").length > 0) {
        systemPrompt += "Please pay special attention to abnormal values. ";
      }
      
      systemPrompt += "Provide helpful, educational responses but clarify you're not giving medical advice.";
      
      // Send request to AI service
      const aiResponse = await sendAiRequest({
        model: "default",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ 
            role: m.role as "user" | "assistant", 
            content: m.content 
          })),
          { role: "user", content: userQuery }
        ]
      });
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment." 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border-t border-border">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index % 3) }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                } p-3 rounded-lg`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {message.role === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="whitespace-pre-line text-sm">
                    {message.file && (
                      <div className="text-xs font-medium mb-1 opacity-80">
                        📎 {message.file}
                      </div>
                    )}
                    {message.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <div className="flex space-x-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="border-t p-4 bg-background/50">
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              <AlertDescription className="flex flex-col gap-3">
                <p className="text-sm">
                  Upload a blood test or lab report file. The AI assistant will analyze it and provide insights based on the data.
                </p>
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png,.txt,.csv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  
                  <Button 
                    variant="outline" 
                    className="bg-white dark:bg-blue-900/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fileUpload ? fileUpload.name : "Select file"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="bg-white dark:bg-blue-900/50"
                    onClick={() => setShowUpload(false)}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
                
                {fileUpload && (
                  <Card className="p-2 bg-white dark:bg-gray-800 text-xs flex items-center justify-between">
                    <span className="truncate">{fileUpload.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => setFileUpload(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </Card>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowUpload(!showUpload)}
            className={showUpload ? "text-primary" : ""}
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Input
            placeholder="Ask about your blood test results..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />

          <Button disabled={isLoading || (!input.trim() && !fileUpload)} onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-muted/50" 
            onClick={() => setInput("What do my triglyceride levels mean?")}
          >
            <Heart className="h-3 w-3 mr-1" />
            Lipids?
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-muted/50" 
            onClick={() => setInput("Tell me about my testosterone levels")}
          >
            <Activity className="h-3 w-3 mr-1" />
            Hormones?
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-muted/50" 
            onClick={() => setInput("What diet recommendations do you have?")}
          >
            <Apple className="h-3 w-3 mr-1" />
            Diet Tips?
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-muted/50" 
            onClick={() => setInput("Exercise recommendations for my results?")}
          >
            <Dumbbell className="h-3 w-3 mr-1" />
            Exercise?
          </Button>
        </div>
      </div>
    </div>
  );
};
