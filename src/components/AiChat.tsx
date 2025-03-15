
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BloodTestMetric } from "@/types/BloodTest";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  initialAnalysis: string;
  recommendations: string[];
  metrics?: BloodTestMetric[];
}

export const AiChat = ({ initialAnalysis, recommendations, metrics = [] }: AiChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initialAnalysis },
    { role: "assistant", content: "Here are my recommendations:\n" + recommendations.map(rec => `• ${rec}`).join("\n") },
    { role: "assistant", content: "Feel free to ask me any questions about your results!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getMetricReferenceRange = (name: string): string => {
    // Common reference ranges for blood tests (simplified for demonstration)
    const referenceRanges: Record<string, string> = {
      "Hemoglobin": "Men: 13.5-17.5 g/dL, Women: 12.0-15.5 g/dL",
      "Glucose": "Fasting: 70-100 mg/dL",
      "Cholesterol": "Total: <200 mg/dL",
      "LDL": "<130 mg/dL (lower is better)",
      "HDL": ">40 mg/dL for men, >50 mg/dL for women (higher is better)",
      "Triglycerides": "<150 mg/dL",
      "Creatinine": "Men: 0.7-1.3 mg/dL, Women: 0.6-1.1 mg/dL",
      "Platelets": "150,000-450,000 cells/μL",
      "White Blood Cells": "4,500-11,000 cells/μL",
      "Red Blood Cells": "Men: 4.5-5.9 million cells/μL, Women: 4.1-5.1 million cells/μL"
    };

    // Return the reference range if it exists, otherwise a generic message
    return referenceRanges[name] || "Reference range varies by lab and patient factors";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a detailed response based on the message and available metrics
      let response = "";
      const userQuestion = input.toLowerCase();
      
      // Check if asking about a specific metric
      const metricQueries = [
        { terms: ["cholesterol", "ldl", "hdl"], metric: "Cholesterol" },
        { terms: ["glucose", "sugar", "diabetes"], metric: "Glucose" },
        { terms: ["platelets", "clotting"], metric: "Platelets" },
        { terms: ["hemoglobin", "iron", "anemia"], metric: "Hemoglobin" },
        { terms: ["triglycerides", "lipids", "fat"], metric: "Triglycerides" },
        { terms: ["creatinine", "kidney"], metric: "Creatinine" },
        { terms: ["white blood", "wbc", "immune"], metric: "White Blood Cells" }
      ];
      
      // Find if question matches any metric
      const matchedQuery = metricQueries.find(query => 
        query.terms.some(term => userQuestion.includes(term))
      );
      
      if (matchedQuery) {
        const metricName = matchedQuery.metric;
        const matchedMetric = metrics.find(m => m.name === metricName);
        
        if (matchedMetric) {
          response = `Your ${metricName} level is ${matchedMetric.value} ${matchedMetric.unit}, which is ${matchedMetric.status}.

Reference range: ${getMetricReferenceRange(metricName)}

${getMetricExplanation(metricName, matchedMetric.status)}`;
        } else {
          response = `${metricName} is an important health marker. 

${getMetricExplanation(metricName, "normal")}

Reference range: ${getMetricReferenceRange(metricName)}

Your test results don't appear to include this specific measurement. If you're concerned about this value, I recommend discussing it with your healthcare provider.`;
        }
      } else if (userQuestion.includes("all") || userQuestion.includes("overview") || userQuestion.includes("summary")) {
        // Generate overall summary
        response = "Here's a summary of your key blood test results:\n\n";
        
        if (metrics.length > 0) {
          metrics.forEach(metric => {
            response += `• ${metric.name}: ${metric.value} ${metric.unit} (${metric.status})\n`;
          });
          
          response += "\nAny values marked as 'elevated' or 'low' may require attention. I recommend discussing these results with your healthcare provider.";
        } else {
          response = "I don't have complete information about your blood test results. Please consult your full report or ask about specific metrics.";
        }
      } else if (userQuestion.includes("thank")) {
        response = "You're welcome! I'm here to help with any other questions about your blood test results. Remember that this analysis is for informational purposes only and doesn't replace professional medical advice.";
      } else {
        response = "That's a great question. Based on your results, I'd recommend discussing this with your healthcare provider for personalized advice. Is there a specific blood marker or health concern you'd like me to explain further?";
      }
      
      // Always add medical disclaimer
      response += "\n\n*This analysis is for informational purposes only and does not constitute professional medical advice. Please consult a healthcare provider for an accurate diagnosis.*";
      
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

  const getMetricExplanation = (name: string, status: string): string => {
    const explanations: Record<string, Record<string, string>> = {
      "Hemoglobin": {
        "elevated": "Elevated hemoglobin can be caused by dehydration, lung disease, or certain genetic disorders. It may also occur at high altitudes or in smokers.",
        "low": "Low hemoglobin may indicate anemia, which can be caused by iron deficiency, chronic diseases, or blood loss. Common symptoms include fatigue and weakness.",
        "normal": "Hemoglobin is a protein in red blood cells that carries oxygen throughout your body. Normal levels indicate good oxygen-carrying capacity."
      },
      "Glucose": {
        "elevated": "Elevated glucose levels may indicate prediabetes or diabetes. It can also temporarily rise after eating carbohydrate-rich foods.",
        "low": "Low blood glucose (hypoglycemia) can cause symptoms like shakiness, confusion, and fatigue. It's more common in people with diabetes who take insulin.",
        "normal": "Glucose is your body's main energy source. Normal levels indicate your body is properly regulating blood sugar."
      },
      "Cholesterol": {
        "elevated": "Elevated total cholesterol may increase your risk of heart disease and stroke. It can be influenced by diet, exercise, genetics, and other factors.",
        "low": "Very low cholesterol is rare but may be associated with certain health conditions, malnutrition, or genetic factors.",
        "normal": "Cholesterol is essential for building cells and producing hormones. Normal levels indicate a balanced lipid profile."
      },
      "LDL": {
        "elevated": "Elevated LDL cholesterol ('bad' cholesterol) increases risk of heart disease. Lifestyle changes and sometimes medication can help reduce it.",
        "low": "Low LDL cholesterol is generally considered beneficial for heart health.",
        "normal": "LDL cholesterol is often called 'bad' cholesterol because high levels can lead to plaque buildup in arteries."
      },
      "HDL": {
        "elevated": "High HDL cholesterol is generally protective against heart disease.",
        "low": "Low HDL cholesterol may increase risk of heart disease. Regular exercise can help increase HDL levels.",
        "normal": "HDL cholesterol is often called 'good' cholesterol as it helps remove other forms of cholesterol from your bloodstream."
      },
      "Triglycerides": {
        "elevated": "Elevated triglycerides may be caused by obesity, physical inactivity, excessive alcohol consumption, or a high-carbohydrate diet.",
        "low": "Low triglycerides are generally not a cause for concern.",
        "normal": "Triglycerides are a type of fat in your blood. Normal levels suggest your body is processing fats efficiently."
      },
      "Creatinine": {
        "elevated": "Elevated creatinine may indicate kidney dysfunction. It can also be affected by muscle mass, certain medications, and dehydration.",
        "low": "Low creatinine is less common but might be related to decreased muscle mass or certain health conditions.",
        "normal": "Creatinine is a waste product from muscle metabolism that's filtered by your kidneys. Normal levels suggest good kidney function."
      },
      "Platelets": {
        "elevated": "Elevated platelets (thrombocytosis) can be caused by infections, inflammation, certain cancers, or after significant blood loss.",
        "low": "Low platelets (thrombocytopenia) may increase bleeding risk and can be caused by certain medications, autoimmune disorders, or bone marrow problems.",
        "normal": "Platelets are blood cells that help your blood clot. Normal levels indicate proper clotting function."
      }
    };
    
    return explanations[name]?.[status] || 
      `${name} is an important health marker that provides insights into your overall health. Your healthcare provider can explain the significance of this value in the context of your complete health profile.`;
  };

  return (
    <div className="glass-card rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        Chat with Bloodwork AI
      </h3>
      
      <Alert variant="destructive" className="mb-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This analysis is for informational purposes only and does not constitute professional medical advice. 
          Please consult a healthcare provider for an accurate diagnosis.
        </AlertDescription>
      </Alert>
      
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
          placeholder="Ask about your blood test results..."
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
