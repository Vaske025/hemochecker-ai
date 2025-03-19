import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, AlertCircle, Heart, Pill, Activity, Coffee, Apple, Dumbbell, Upload, XCircle, FileText } from "lucide-react";
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
    { role: "assistant", content: initialAnalysis },
    { role: "assistant", content: "💡 Recommendations:\n" + recommendations.map(rec => `• ${rec}`).join("\n") },
    { role: "assistant", content: "❓ Ask me about your results or upload a new test file for analysis." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfData, setPdfData] = useState({ metrics, rawContent });
  const { toast } = useToast();
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setPdfData({ metrics, rawContent });
  }, [metrics, rawContent]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !fileUpload)) return;
    
    const userContent = input.trim() || (fileUpload ? `Analyze this file: ${fileUpload.name}` : "");
    
    const userMessage: Message = { 
      role: "user", 
      content: userContent,
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
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error processing your request. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAnalysis = async (file: File) => {
    try {
      const loadingMessage: Message = { 
        role: "assistant", 
        content: `Analyzing your file: ${file.name}...` 
      };
      setMessages(prev => [...prev, loadingMessage]);

      const analysisResult = await analyzeFileWithAi(
        file, 
        "Please analyze this medical document and provide insights in a clear, structured format. Include the key findings, reference ranges, and what they mean."
      );
      
      setMessages(prev => 
        prev.slice(0, -1).concat({ role: "assistant", content: analysisResult })
      );
    } catch (error) {
      console.error("Error analyzing file:", error);
      
      const errorMessage = error.message || "I encountered an error analyzing this file.";
      setMessages(prev => 
        prev.slice(0, -1).concat({ 
          role: "assistant", 
          content: `${errorMessage} Would you like to try again with a different file format? PDF, JPG, and TXT formats work best.` 
        })
      );
      
      setRetryCount(prev => prev + 1);
    }
  };

  const handleTextQuery = async (userQuery: string) => {
    try {
      let contextPrompt = "";
      
      if (pdfData.metrics.length > 0) {
        contextPrompt += "Current blood test metrics: " + 
          pdfData.metrics.map(m => `${m.name}: ${m.value} ${m.unit} (${m.status})`).join(", ") + ".\n\n";
      }
      
      if (pdfData.rawContent) {
        contextPrompt += "Raw report content excerpt: " + pdfData.rawContent.substring(0, 500) + "...\n\n";
      }
      
      const systemPrompt = `You are a medical assistant that analyzes blood tests and health data.
Provide clear, direct responses to questions about medical test results. Format your responses in this style:
- Use headers for main sections
- Use numbered lists for key results
- Use bullet points for explanations and recommendations
- Be direct and factual in your assessments
- If you identify abnormal values, clearly explain their significance
- Always structure your response in a organized way with clear sections`;

      const aiResponse = await sendAiRequest({
        model: "claude-3-opus-20240229",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `${contextPrompt}User question: ${userQuery}` 
          }
        ],
        temperature: 0.4
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      let errorMessage = "I apologize, but I'm having trouble connecting to my knowledge base right now.";
      
      if (error.message.includes("Network error") || error.message.includes("Failed to fetch")) {
        errorMessage += " There seems to be a network issue. Please check your internet connection and try again.";
      } else if (error.message.includes("timed out")) {
        errorMessage += " The request took too long to process. Please try a shorter question.";
      }
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: errorMessage
      }]);
    }
  };

  const renderFileUpload = () => (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4"
    >
      <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
        <AlertDescription className="flex flex-col gap-3">
          <p className="text-sm">
            Upload a blood test or lab report file for AI analysis.
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
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
          
          {fileUpload && (
            <Card className="p-2 bg-white dark:bg-gray-800 text-xs flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                <span className="truncate">{fileUpload.name}</span>
              </div>
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
  );

  const renderMessage = (message: Message, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * Math.min(index % 3, 0.3) }}
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
  );

  const renderLoadingIndicator = () => (
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
  );

  const quickQuestions = [
    { icon: <Heart className="h-3 w-3 mr-1" />, text: "Cholesterol levels?", query: "What do my cholesterol levels mean?" },
    { icon: <Activity className="h-3 w-3 mr-1" />, text: "Hormone levels?", query: "Explain my hormone levels" },
    { icon: <Apple className="h-3 w-3 mr-1" />, text: "Diet Tips?", query: "What diet recommendations do you have based on my results?" },
    { icon: <Dumbbell className="h-3 w-3 mr-1" />, text: "Exercise?", query: "What exercise is best for my health profile?" }
  ];

  const handleRetry = () => {
    if (fileUpload) {
      handleFileAnalysis(fileUpload);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border-t border-border">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          {isLoading && renderLoadingIndicator()}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4 bg-background/50">
        {showUpload && renderFileUpload()}
        
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
            placeholder="Ask about your test results or upload a medical document..."
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
          {quickQuestions.map((question, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm" 
              className="text-xs bg-muted/50" 
              onClick={() => setInput(question.query)}
            >
              {question.icon}
              {question.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
