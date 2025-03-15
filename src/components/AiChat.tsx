
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
          response = generateDoctorResponse(matchedMetric, metricName);
        } else {
          response = `From a medical perspective, ${metricName} is an important biomarker that helps us assess your health status.

${getMetricExplanation(metricName, "normal")}

The standard reference range is: ${getMetricReferenceRange(metricName)}

Based on the available data, I don't see this specific measurement in your current test results. If you're experiencing symptoms that might be related to this marker, I would suggest including this test in your next health check-up.`;
        }
      } else if (userQuestion.includes("all") || userQuestion.includes("overview") || userQuestion.includes("summary")) {
        // Generate overall summary with doctor-like language
        response = "After reviewing your blood test results, here's my medical assessment:\n\n";
        
        if (metrics.length > 0) {
          const abnormalMetrics = metrics.filter(m => m.status !== "normal");
          
          if (abnormalMetrics.length > 0) {
            response += "Key findings that require attention:\n\n";
            abnormalMetrics.forEach(metric => {
              response += `• ${metric.name}: ${metric.value} ${metric.unit} (${metric.status.toUpperCase()}) - ${getMetricStatus(metric.status, metric.name)}\n`;
            });
            response += "\n";
          }
          
          const normalMetrics = metrics.filter(m => m.status === "normal");
          if (normalMetrics.length > 0) {
            response += "Values within normal range:\n\n";
            normalMetrics.forEach(metric => {
              response += `• ${metric.name}: ${metric.value} ${metric.unit} (NORMAL)\n`;
            });
          }
          
          response += "\nBased on these findings, I would recommend focusing on ";
          
          if (abnormalMetrics.length > 0) {
            response += "addressing the abnormal values through appropriate lifestyle changes and possibly medication, depending on severity.";
          } else {
            response += "maintaining your current health practices as they seem to be working well.";
          }
        } else {
          response = "I don't have complete information about your blood test results. To provide a comprehensive assessment, I would need to see all relevant biomarkers and their values.";
        }
      } else if (userQuestion.includes("thank")) {
        response = "You're welcome. As a medical professional, my goal is to help you understand your test results and their implications for your health. If you have any other questions about specific markers or health concerns, please don't hesitate to ask.";
      } else if (userQuestion.includes("diet") || userQuestion.includes("food") || userQuestion.includes("eat")) {
        // Diet-related response
        const elevatedCholesterol = metrics?.some(m => (m.name.includes("Cholesterol") || m.name.includes("LDL")) && m.status === "elevated");
        const elevatedGlucose = metrics?.some(m => m.name.includes("Glucose") && m.status === "elevated");
        
        response = "Regarding dietary recommendations based on your blood work:\n\n";
        
        if (elevatedCholesterol) {
          response += "Your lipid profile suggests a need to focus on heart-healthy eating. I recommend:\n\n";
          response += "• Reducing saturated fats (limit red meat, full-fat dairy)\n";
          response += "• Increasing omega-3 fatty acids (fatty fish like salmon, walnuts, flaxseeds)\n";
          response += "• Adding more soluble fiber (oats, beans, fruits) which helps lower cholesterol\n";
          response += "• Incorporating plant sterols/stanols found in specialized margarines and supplements\n\n";
        }
        
        if (elevatedGlucose) {
          response += "Your glucose levels indicate a need to stabilize blood sugar. Consider:\n\n";
          response += "• Limiting refined carbohydrates and added sugars\n";
          response += "• Choosing complex carbohydrates with lower glycemic index\n";
          response += "• Eating balanced meals with protein, healthy fats, and fiber\n";
          response += "• Spacing meals throughout the day to avoid blood sugar spikes\n\n";
        }
        
        if (!elevatedCholesterol && !elevatedGlucose) {
          response += "Based on your current results, I recommend a balanced Mediterranean-style diet which includes:\n\n";
          response += "• Abundant fruits and vegetables (aim for half your plate)\n";
          response += "• Whole grains as your main carbohydrate source\n";
          response += "• Lean proteins like fish, poultry, beans, and nuts\n";
          response += "• Healthy fats from olive oil, avocados, and nuts\n";
          response += "• Limited processed foods, added sugars, and sodium\n\n";
        }
        
        response += "Remember that individual nutrition needs vary, and these recommendations are based solely on your blood work results.";
      } else if (userQuestion.includes("exercise") || userQuestion.includes("workout") || userQuestion.includes("activity")) {
        // Exercise-related response
        response = "Regarding physical activity recommendations based on your blood work profile:\n\n";
        
        const hasCardiovascularRiskFactors = metrics?.some(m => 
          (m.name.includes("Cholesterol") && m.status === "elevated") || 
          (m.name.includes("Glucose") && m.status === "elevated") ||
          (m.name.includes("Triglycerides") && m.status === "elevated")
        );
        
        if (hasCardiovascularRiskFactors) {
          response += "Your results show some cardiovascular risk factors that can be improved with regular exercise:\n\n";
          response += "• Aim for at least 150 minutes of moderate-intensity aerobic activity weekly\n";
          response += "• Include activities like brisk walking, swimming, or cycling\n";
          response += "• Add 2-3 sessions of strength training per week\n";
          response += "• Consider starting with shorter sessions and gradually increasing\n\n";
          response += "Regular exercise can significantly improve cholesterol profiles, glucose metabolism, and overall cardiovascular health.";
        } else {
          response += "Your current results are favorable, and regular physical activity will help maintain these healthy markers:\n\n";
          response += "• Continue with or establish 150+ minutes of moderate exercise weekly\n";
          response += "• Include both cardiovascular exercise and strength training\n";
          response += "• Add flexibility and balance exercises for complete fitness\n";
          response += "• Stay active throughout the day by taking breaks from sitting\n\n";
          response += "Regular exercise contributes to maintaining optimal blood markers and overall health.";
        }
      } else {
        // Generic response with more doctor-like language
        response = "Based on your question and the blood test results before me, I can provide some medical insight.\n\n";
        
        // Check for any abnormal values
        const abnormalMetrics = metrics?.filter(m => m.status !== "normal") || [];
        
        if (abnormalMetrics.length > 0) {
          response += "Your blood work shows some values that deserve attention. In particular, ";
          response += abnormalMetrics.map(m => `your ${m.name} level of ${m.value} ${m.unit} is ${m.status}`).join(", ") + ". ";
          response += "These findings could be relevant to your question.\n\n";
        } else {
          response += "Your blood work values appear to be within normal ranges, which is reassuring from a clinical perspective.\n\n";
        }
        
        response += "To give you a more specific answer about your question, could you provide more details about any particular symptoms or health concerns you're experiencing? This would help me contextualize your results more precisely.";
      }
      
      // Small disclaimer at the bottom
      response += "\n\n*Note: This analysis is for informational purposes only and does not replace consultation with your healthcare provider.*";
      
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

  // Helper function to generate doctor-like responses for specific metrics
  const generateDoctorResponse = (metric: BloodTestMetric, metricName: string): string => {
    const refRange = getMetricReferenceRange(metricName);
    let response = `I've examined your ${metricName} level, which is ${metric.value} ${metric.unit}. `;
    
    switch (metric.status) {
      case "elevated":
        response += `This is above the typical reference range (${refRange}).\n\n`;
        break;
      case "low":
        response += `This is below the typical reference range (${refRange}).\n\n`;
        break;
      case "normal":
        response += `This falls within the normal reference range (${refRange}), which is good news.\n\n`;
        break;
    }
    
    response += `${getMetricExplanation(metricName, metric.status)}\n\n`;
    
    // Add clinical interpretation
    if (metric.status !== "normal") {
      response += `Clinical interpretation: ${getMetricStatus(metric.status, metricName)}\n\n`;
      response += `Recommendation: ${getMetricRecommendation(metricName, metric.status)}`;
    } else {
      response += "Your value is within the expected range, suggesting normal physiological function for this parameter.";
    }
    
    return response;
  };

  // Get status explanation from doctor's perspective
  const getMetricStatus = (status: string, name: string): string => {
    const statusExplanations: Record<string, Record<string, string>> = {
      "Hemoglobin": {
        "elevated": "Elevated hemoglobin may indicate polycythemia, dehydration, or conditions that cause increased red blood cell production.",
        "low": "Low hemoglobin indicates anemia, which can result from iron deficiency, chronic disease, blood loss, or nutritional deficiencies."
      },
      "Glucose": {
        "elevated": "Elevated glucose suggests impaired glucose metabolism, possibly prediabetes or diabetes mellitus if consistently high.",
        "low": "Low glucose (hypoglycemia) can cause acute symptoms and may be related to medication effects, hormonal imbalances, or fasting."
      },
      "Cholesterol": {
        "elevated": "Elevated total cholesterol increases cardiovascular risk and may require lifestyle modification or pharmacological intervention.",
        "low": "Unusually low cholesterol may be associated with malnutrition, liver disease, or genetic conditions."
      },
      "LDL": {
        "elevated": "Elevated LDL cholesterol is a primary risk factor for atherosclerosis and cardiovascular disease.",
        "low": "Low LDL is generally favorable from a cardiovascular perspective."
      },
      "HDL": {
        "elevated": "Elevated HDL is considered cardioprotective.",
        "low": "Low HDL reduces the body's ability to remove excess cholesterol and is associated with increased cardiovascular risk."
      },
      "Triglycerides": {
        "elevated": "Elevated triglycerides indicate dyslipidemia and may be associated with metabolic syndrome, diabetes, or genetic factors.",
        "low": "Low triglycerides are generally not clinically significant."
      },
      "Creatinine": {
        "elevated": "Elevated creatinine suggests decreased kidney function, potentially due to acute or chronic kidney disease.",
        "low": "Low creatinine may indicate decreased muscle mass or sometimes severe liver disease."
      },
      "Platelets": {
        "elevated": "Elevated platelets (thrombocytosis) may be reactive due to inflammation or infection, or primary due to bone marrow disorders.",
        "low": "Low platelets (thrombocytopenia) increase bleeding risk and may result from immune disorders, medications, or bone marrow conditions."
      },
      "White Blood Cells": {
        "elevated": "Elevated WBC count (leukocytosis) typically indicates infection, inflammation, or sometimes leukemia.",
        "low": "Low WBC count (leukopenia) suggests impaired immune function, possibly due to bone marrow suppression, certain medications, or viral infections."
      }
    };
    
    return statusExplanations[name]?.[status] || 
      `This ${status} ${name} value requires clinical correlation with your symptoms and medical history.`;
  };

  // Get recommendations for abnormal values
  const getMetricRecommendation = (name: string, status: string): string => {
    if (status === "normal") return "Continue with your current health practices.";
    
    const recommendations: Record<string, Record<string, string>> = {
      "Hemoglobin": {
        "elevated": "Consider evaluation for potential causes of elevated hemoglobin. Staying well-hydrated and avoiding smoking can help manage some cases.",
        "low": "Iron-rich foods, vitamin C to improve iron absorption, and exploring potential causes of blood loss would be appropriate steps."
      },
      "Glucose": {
        "elevated": "Focus on regular physical activity, reducing refined carbohydrates and sugars, and maintaining a healthy weight. Monitoring for diabetes may be warranted.",
        "low": "Regular, balanced meals with complex carbohydrates and protein can help stabilize blood sugar levels."
      },
      "Cholesterol": {
        "elevated": "Dietary changes focusing on reducing saturated fats, increasing fiber, regular exercise, and potentially medication based on your overall cardiovascular risk profile.",
        "low": "Evaluation for underlying causes if accompanied by other symptoms or abnormalities."
      },
      "LDL": {
        "elevated": "Dietary adjustments (less saturated fat, more soluble fiber), regular exercise, weight management if needed, and possibly medication depending on your overall risk.",
        "low": "Generally favorable and requires no specific intervention."
      },
      "HDL": {
        "elevated": "Continue with healthy lifestyle practices that maintain this favorable level.",
        "low": "Regular aerobic exercise, stopping smoking if applicable, moderate alcohol consumption if appropriate, and dietary adjustments."
      },
      "Triglycerides": {
        "elevated": "Limit simple carbohydrates and sugars, reduce alcohol consumption, increase omega-3 fatty acids, and address any metabolic conditions.",
        "low": "No specific intervention needed."
      },
      "Creatinine": {
        "elevated": "Ensure adequate hydration, evaluate medication effects, and possibly further kidney function testing.",
        "low": "Usually no specific intervention needed unless severely abnormal or symptomatic."
      },
      "Platelets": {
        "elevated": "Evaluation for underlying causes if persistently elevated; aspirin therapy may be considered in some cases.",
        "low": "Avoiding activities with high bleeding risk, monitoring for spontaneous bleeding, and investigating underlying causes."
      },
      "White Blood Cells": {
        "elevated": "Evaluation for infection or inflammation; usually resolves when underlying cause is addressed.",
        "low": "Precautions against infection if severely low, and investigation of potential causes."
      }
    };
    
    return recommendations[name]?.[status] || 
      "Further evaluation is recommended to determine the cause and appropriate management strategy.";
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
      `${name} is an important biomarker that provides valuable diagnostic information about your health status. The current value should be interpreted in context with your other test results and clinical presentation.`;
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
