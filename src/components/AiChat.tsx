import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, AlertCircle, Heart, Pill, Activity, Coffee, Apple, Dumbbell, Upload, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BloodTestMetric } from "@/types/BloodTest";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

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
  
  const getMetricReferenceRange = (name: string): string => {
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

    return referenceRanges[name] || "Reference range varies by lab and patient factors";
  };

  const findMetricInRawContent = (metricName: string): string | null => {
    if (!rawContent) return null;
    
    const pattern = new RegExp(`${metricName}[:\\s]+(\\d+\\.?\\d*)\\s*([a-zA-Z/]+)?`, 'i');
    const match = rawContent.match(pattern);
    
    if (match) {
      const value = match[1];
      const unit = match[2] || '';
      return `${value} ${unit}`.trim();
    }
    
    return null;
  };

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
    const loadingMessage = { 
      role: "assistant", 
      content: `Analyzing your file: ${file.name}. This may take a moment...` 
    };
    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileContent = await readFileAsText(file);
    const fileType = file.type;
    
    let analysisResponse = ""; 
    
    if (fileType.includes("pdf") || fileType.includes("image")) {
      analysisResponse = await analyzeLabReport(fileContent, file.name);
    } else if (fileType.includes("text") || fileType.includes("csv") || fileType.includes("json")) {
      analysisResponse = await analyzeTextData(fileContent, file.name);
    } else {
      analysisResponse = "I'm unable to analyze this file type. Please upload a PDF lab report, image, CSV, or text file containing your lab results.";
    }

    setMessages(prev => 
      prev.slice(0, -1).concat({ role: "assistant", content: analysisResponse })
    );
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || "");
      };
      reader.readAsText(file);
    });
  };

  const analyzeLabReport = async (content: string, fileName: string): Promise<string> => {
    const isHormoneTest = content.toLowerCase().includes("testosterone") || 
                          content.toLowerCase().includes("estrogen") ||
                          content.toLowerCase().includes("hormone") ||
                          content.toLowerCase().includes("thyroid") ||
                          content.toLowerCase().includes("tsh");

    const dateMatch = content.match(/date:?\s*([a-z0-9\s,]+\d{4})/i);
    const testDate = dateMatch ? dateMatch[1].trim() : "recent";

    if (isHormoneTest) {
      const testosteroneMatch = content.match(/testosterone:?\s*(\d+\.?\d*)\s*([a-z/]+)?/i);
      let testValue = "not specified";
      let unit = "ng/dL";
      
      if (testosteroneMatch) {
        testValue = testosteroneMatch[1];
        unit = testosteroneMatch[2] || "ng/dL";
      }

      return `📊 **Hormone Test Analysis (${fileName})**

Based on my analysis of your ${testDate} lab report, this appears to be a hormone test that includes testosterone measurements.

${testosteroneMatch ? `Your testosterone level is **${testValue} ${unit}**.` : "I couldn't precisely locate your testosterone values in the document."}

**Interpretation:**
Testosterone is a key hormone that affects muscle mass, bone density, fat distribution, red blood cell production, and sexual function. Optimal levels vary significantly based on age, sex, and time of day the test was taken.

**Normal reference ranges:**
- For men: Generally 300-1000 ng/dL (10.4-34.7 nmol/L)
- For women: Typically 15-70 ng/dL (0.52-2.4 nmol/L)

**What might affect your levels:**
- Age (levels naturally decline with age)
- Time of day (highest in morning)
- Medications
- Chronic health conditions
- Stress levels
- Sleep quality
- Diet and exercise habits

**Recommendations:**
- Discuss these results with your healthcare provider for proper interpretation
- Consider lifestyle factors that might influence hormone levels
- If levels are outside normal range, follow up with an endocrinologist or specialist

Would you like me to explain any specific aspects of your hormone test in more detail?`;
    } else {
      return `📋 **Lab Report Analysis (${fileName})**

I've reviewed your ${testDate} lab report and found the following information:

The document appears to be a standard blood test that includes several biomarkers. To provide a more accurate analysis, could you:

1. Tell me specifically which markers you're most interested in?
2. Share what prompted this blood test?
3. Mention any symptoms or health concerns you're experiencing?

I can see various test results in the document, but without knowing your specific concerns, I can only provide general information. Common blood tests measure:

- Complete Blood Count (red cells, white cells, platelets)
- Metabolic panels (electrolytes, kidney and liver function)
- Lipid profiles (cholesterol, triglycerides)
- Glucose levels
- Various specific markers depending on your doctor's concerns

Would you like me to focus on a particular aspect of your results?`;
    }
  };

  const analyzeTextData = async (content: string, fileName: string): Promise<string> => {
    const lines = content.split('\n');
    const potentialTestNames = [
      "testosterone", "estrogen", "glucose", "cholesterol", "ldl", "hdl", 
      "hemoglobin", "wbc", "rbc", "platelet", "thyroid", "tsh", "t3", "t4",
      "creatinine", "vitamin"
    ];
    
    const foundTests = potentialTestNames.filter(test => 
      content.toLowerCase().includes(test)
    );
    
    if (foundTests.length > 0) {
      return `📊 **Blood Test Data Analysis (${fileName})**

I've analyzed your data file and identified the following biomarkers: ${foundTests.join(', ')}.

Based on the content, this appears to be a ${foundTests.includes("testosterone") ? "hormone test" : "standard blood panel"}.

To get a complete analysis:
- What specific health concerns do you have?
- When was this test taken?
- Have you had previous tests to compare with these results?
- Are you currently taking any medications?

I can provide more specific insights if you share what aspect of these results you're most interested in understanding.`;
    } else {
      return `📝 **Text Document Analysis (${fileName})**

I've reviewed the document you uploaded, but I'm not seeing clear blood test markers or medical data. 

If this contains your health information:
- Could you highlight the specific sections related to your blood test?
- What type of analysis are you looking for?
- Are there particular health concerns you want me to address?

I'm here to help interpret your health data, but need some guidance on what you're looking for in this document.`;
    }
  };

  const handleTextQuery = async (userQuestion: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = "";
    userQuestion = userQuestion.toLowerCase();
    
    let relevantContent = "";
    if (rawContent) {
      const keywords = userQuestion.split(' ').filter(word => 
        word.length > 3 && !['what', 'when', 'where', 'which', 'about', 'tell', 'explain'].includes(word)
      );
      
      for (const keyword of keywords) {
        const pattern = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'gi');
        const matches = rawContent.match(pattern);
        
        if (matches) {
          relevantContent += matches.join(' ');
        }
      }
    }

    const metricQueries = [
      { terms: ["cholesterol", "ldl", "hdl"], metric: "Cholesterol", emoji: "🫀" },
      { terms: ["glucose", "sugar", "diabetes"], metric: "Glucose", emoji: "🍬" },
      { terms: ["platelets", "clotting"], metric: "Platelets", emoji: "🩸" },
      { terms: ["hemoglobin", "iron", "anemia"], metric: "Hemoglobin", emoji: "⚡" },
      { terms: ["triglycerides", "lipids", "fat"], metric: "Triglycerides", emoji: "🧈" },
      { terms: ["creatinine", "kidney"], metric: "Creatinine", emoji: "🧪" },
      { terms: ["white blood", "wbc", "immune"], metric: "White Blood Cells", emoji: "🛡️" },
      { terms: ["testosterone", "testo", "hormone"], metric: "Testosterone", emoji: "💪" },
      { terms: ["estrogen", "estradiol"], metric: "Estrogen", emoji: "🧬" },
      { terms: ["thyroid", "tsh", "t3", "t4"], metric: "Thyroid", emoji: "🦋" }
    ];
    
    const matchedQuery = metricQueries.find(query => 
      query.terms.some(term => userQuestion.includes(term))
    );
    
    if (matchedQuery) {
      const metricName = matchedQuery.metric;
      const emoji = matchedQuery.emoji;
      const matchedMetric = pdfData.metrics.find(m => m.name === metricName);
      
      if (matchedMetric) {
        response = `${emoji} **${metricName} Analysis**\n\n${generateDoctorResponse(matchedMetric, metricName)}`;
      } else if (findMetricInRawContent(metricName)) {
        response = `${emoji} **About ${metricName}**\n\nI found a ${metricName} value of ${findMetricInRawContent(metricName)} in your lab results. 
          
The standard reference range is: ${getMetricReferenceRange(metricName)}

Since I don't have the reference ranges from your specific lab, I can't determine if this value is normal, high, or low. I recommend comparing this value with the reference range provided on your lab report.`;
      } else if (relevantContent) {
        response = `${emoji} **About ${metricName}**\n\nFrom your uploaded document, I found this information related to ${metricName}:\n\n"${relevantContent.trim()}"\n\nThe standard reference range is generally: ${getMetricReferenceRange(metricName)}`;
      } else {
        response = `${emoji} **About ${metricName}**\n\nFrom a medical perspective, ${metricName} is an important biomarker that helps us assess your health status.

${getMetricExplanation(metricName, "normal")}

📊 The standard reference range is: ${getMetricReferenceRange(metricName)}

Based on the available data, I don't see this specific measurement in your current test results. If you're experiencing symptoms that might be related to this marker, I would suggest including this test in your next health check-up.`;
      }
    } else if (userQuestion.includes("all") || userQuestion.includes("overview") || userQuestion.includes("summary")) {
      response = "🔍 **Complete Analysis of Your Blood Test Results**\n\n";
        
      if (pdfData.metrics.length > 0) {
        const abnormalMetrics = pdfData.metrics.filter(m => m.status !== "normal");
        
        if (abnormalMetrics.length > 0) {
          response += "⚠️ **Key findings that require attention:**\n\n";
          abnormalMetrics.forEach(metric => {
            let statusEmoji = metric.status === "elevated" ? "⬆️" : "⬇️";
            response += `• ${statusEmoji} ${metric.name}: ${metric.value} ${metric.unit} (${metric.status.toUpperCase()}) - ${getMetricStatus(metric.status, metric.name)}\n`;
          });
          response += "\n";
        }
        
        const normalMetrics = pdfData.metrics.filter(m => m.status === "normal");
        if (normalMetrics.length > 0) {
          response += "✅ **Values within normal range:**\n\n";
          normalMetrics.forEach(metric => {
            response += `• ${metric.name}: ${metric.value} ${metric.unit} (NORMAL)\n`;
          });
        }
        
        response += "\n📋 **Based on these findings, I recommend:**\n\n";
        
        if (abnormalMetrics.length > 0) {
          response += "Focusing on addressing the abnormal values through appropriate lifestyle changes and possibly medication, depending on severity.";
        } else {
          response += "Maintaining your current health practices as they seem to be working well. Your results indicate good overall health.";
        }
      } else if (relevantContent) {
        response = "🔍 **Analysis Based on Your Document**\n\n";
        response += "I found the following relevant information in your document:\n\n";
        response += `"${relevantContent.trim()}"\n\n";
        response += "For a more detailed analysis, I would need to see structured lab values with their reference ranges.";
      } else {
        response = "I don't have complete information about your blood test results. To provide a comprehensive assessment, I would need to see all relevant biomarkers and their values.";
      }
    } else if (userQuestion.includes("thank")) {
      response = "😊 You're welcome. As a medical professional, my goal is to help you understand your test results and their implications for your health. If you have any other questions about specific markers or health concerns, please don't hesitate to ask.";
    } else if (userQuestion.includes("diet") || userQuestion.includes("food") || userQuestion.includes("eat")) {
      const elevatedCholesterol = pdfData.metrics?.some(m => (m.name.includes("Cholesterol") || m.name.includes("LDL")) && m.status === "elevated");
      const elevatedGlucose = pdfData.metrics?.some(m => m.name.includes("Glucose") && m.status === "elevated");
      
      response = "🍽️ **Dietary Recommendations Based on Your Blood Work**\n\n";
      
      if (elevatedCholesterol) {
        response += "🫀 **For your lipid profile:**\n\n";
        response += "• 🥩 Reduce saturated fats (limit red meat, full-fat dairy)\n";
        response += "• 🐟 Increase omega-3 fatty acids (fatty fish like salmon, walnuts, flaxseeds)\n";
        response += "• 🥣 Add more soluble fiber (oats, beans, fruits) which helps lower cholesterol\n";
        response += "• 🥗 Incorporate plant sterols/stanols found in specialized margarines and supplements\n\n";
      }
      
      if (elevatedGlucose) {
        response += "🍬 **For your glucose levels:**\n\n";
        response += "• 🍭 Limit refined carbohydrates and added sugars\n";
        response += "• 🌾 Choose complex carbohydrates with lower glycemic index\n";
        response += "• 🥚 Eat balanced meals with protein, healthy fats, and fiber\n";
        response += "• ⏰ Space meals throughout the day to avoid blood sugar spikes\n\n";
      }
      
      if (!elevatedCholesterol && !elevatedGlucose) {
        response += "🌱 **For overall health maintenance:**\n\n";
        response += "• 🥦 Abundant fruits and vegetables (aim for half your plate)\n";
        response += "• 🌾 Whole grains as your main carbohydrate source\n";
        response += "• 🐟 Lean proteins like fish, poultry, beans, and nuts\n";
        response += "• 🫒 Healthy fats from olive oil, avocados, and nuts\n";
        response += "• 🚫 Limited processed foods, added sugars, and sodium\n\n";
      }
      
      response += "Remember that individual nutrition needs vary, and these recommendations are based solely on your blood work results.";
    } else if (userQuestion.includes("exercise") || userQuestion.includes("workout") || userQuestion.includes("activity")) {
      const hasCardiovascularRiskFactors = pdfData.metrics?.some(m => 
        (m.name.includes("Cholesterol") && m.status === "elevated") || 
        (m.name.includes("Glucose") && m.status === "elevated") ||
        (m.name.includes("Triglycerides") && m.status === "elevated")
      );
      
      response = "🏃‍♂️ **Physical Activity Recommendations**\n\n";
      
      if (hasCardiovascularRiskFactors) {
        response += "🫀 **For your cardiovascular risk factors:**\n\n";
        response += "• ⏱️ Aim for at least 150 minutes of moderate-intensity aerobic activity weekly\n";
        response += "• 🚶‍♀️ Include activities like brisk walking, swimming, or cycling\n";
        response += "• 💪 Add 2-3 sessions of strength training per week\n";
        response += "• 📈 Consider starting with shorter sessions and gradually increasing\n\n";
        response += "Regular exercise can significantly improve cholesterol profiles, glucose metabolism, and overall cardiovascular health.";
      } else {
        response += "✅ **For maintaining your healthy markers:**\n\n";
        response += "• 🚶‍♂️ Continue with or establish 150+ minutes of moderate exercise weekly\n";
        response += "• 🏊‍♀️ Include both cardiovascular exercise and strength training\n";
        response += "• 🧘‍♀️ Add flexibility and balance exercises for complete fitness\n";
        response += "• 🪑 Stay active throughout the day by taking breaks from sitting\n\n";
        response += "Regular exercise contributes to maintaining optimal blood markers and overall health.";
      }
    } else if (userQuestion.includes("upload") || userQuestion.includes("file") || userQuestion.includes("document")) {
      response = "📎 You can upload a blood test or lab report file by clicking the upload button next to the chat input. I can analyze PDFs, images, CSV files, or text files containing your lab results. Once uploaded, I'll review the file and provide an analysis based on the data I find.";
    } else if (relevantContent) {
      response = "📄 **Based on Your Uploaded Document**\n\n";
      response += `I found this relevant information in your test results:\n\n"${relevantContent.trim()}"\n\n`;
      response += "Is there something specific about this you'd like me to explain further?";
    } else {
      response = "👨‍⚕️ **Medical Insight Based on Your Blood Work**\n\n";
        
      const abnormalMetrics = pdfData.metrics?.filter(m => m.status !== "normal") || [];
      
      if (abnormalMetrics.length > 0) {
        response += "Your blood work shows some values that deserve attention. In particular, ";
        response += abnormalMetrics.map(m => `your ${m.name} level of ${m.value} ${m.unit} is ${m.status}`).join(", ") + ". ";
        response += "These findings could be relevant to your question.\n\n";
      } else if (pdfData.metrics.length > 0) {
        response += "Your blood work values appear to be within normal ranges, which is reassuring from a clinical perspective.\n\n";
      } else if (rawContent) {
        response += "I've analyzed your uploaded document but couldn't find specific lab values in a structured format. For the most accurate analysis, I'd need to see clear lab values with their reference ranges.\n\n";
      } else {
        response += "I don't have enough information about your blood test results to provide a detailed analysis. If you've uploaded a blood test, it may still be processing.\n\n";
      }
      
      response += "To give you a more specific answer about your question, could you provide more details about any particular symptoms or health concerns you're experiencing? This would help me contextualize your results more precisely.";
    }
    
    response += "\n\n*Note: This analysis is for informational purposes only and does not replace consultation with your healthcare provider.*";
    
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
  };

  const generateDoctorResponse = (metric: BloodTestMetric, metricName: string): string => {
    const refRange = getMetricReferenceRange(metricName);
    let statusEmoji = metric.status === "normal" ? "✅" : metric.status === "elevated" ? "⬆️" : "⬇️";
    let response = `Your ${metricName} level is ${metric.value} ${metric.unit}. ${statusEmoji} `;
    
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
    
    if (metric.status !== "normal") {
      response += `📊 **Clinical interpretation:** ${getMetricStatus(metric.status, metricName)}\n\n`;
      response += `💡 **Recommendation:** ${getMetricRecommendation(metricName, metric.status)}`;
    } else {
      response += "📊 Your value is within the expected range, suggesting normal physiological function for this parameter.";
    }
    
    return response;
  };

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
        "low": "Very low cholesterol may be associated with malnutrition, liver disease, or genetic conditions."
      },
      "LDL": {
        "elevated": "Elevated LDL cholesterol is a primary risk factor for atherosclerosis and cardiovascular disease.",
        "low": "Low LDL is generally favorable from a cardiovascular perspective."
      },
      "HDL": {
        "elevated": "High HDL is considered cardioprotective.",
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
      },
      "Testosterone": {
        "elevated": "Elevated testosterone may be caused by certain endocrine disorders, tumors, or anabolic steroid use. In women, it can cause symptoms like excessive hair growth.",
        "low": "Low testosterone in men may cause reduced libido, erectile dysfunction, fatigue, and muscle loss. In women, low levels may affect mood and energy.",
        "normal": "Testosterone is a hormone that affects sexual development, muscle mass, and bone density. Normal levels indicate proper hormone balance."
      }
    };
    
    return statusExplanations[name]?.[status] || 
      `${name} is an important biomarker for health assessment. The clinical significance varies depending on your overall health picture and other test results.`;
  };

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
      },
      "Testosterone": {
        "elevated": "Elevated testosterone may be caused by certain endocrine disorders, tumors, or anabolic steroid use. In women, it can cause symptoms like excessive hair growth.",
        "low": "Low testosterone in men may cause reduced libido, erectile dysfunction, fatigue, and muscle loss. In women, low levels may affect mood and energy.",
        "normal": "Testosterone is a hormone that affects sexual development, muscle mass, and bone density. Normal levels indicate proper hormone balance."
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
        "elevated": "High HDL cholesterol is considered cardioprotective and associated with lower cardiovascular risk. It helps remove excess cholesterol from your bloodstream.",
        "low": "Low HDL cholesterol may increase risk of heart disease as it reduces the body's ability to remove excess cholesterol from the bloodstream.",
        "normal": "HDL cholesterol is often called 'good' cholesterol because it helps remove other forms of cholesterol from your bloodstream."
      },
      "Triglycerides": {
        "elevated": "Elevated triglycerides may be caused by obesity, excessive alcohol consumption, uncontrolled diabetes, or genetic factors. High levels increase risk of heart disease.",
        "low": "Low triglyceride levels are generally not a medical concern and might indicate a diet low in fats or carbohydrates.",
        "normal": "Triglycerides are a type of fat in your blood that your body uses for energy. Normal levels indicate balanced fat metabolism."
      },
      "Creatinine": {
        "elevated": "Elevated creatinine may indicate reduced kidney function, potentially due to kidney disease, dehydration, or muscle damage.",
        "low": "Low creatinine may be associated with decreased muscle mass, liver disease, or pregnancy.",
        "normal": "Creatinine is a waste product from muscle metabolism that's filtered by your kidneys. Normal levels suggest proper kidney function."
      },
      "Platelets": {
        "elevated": "Elevated platelets may be due to inflammation, infection, iron deficiency, or certain blood disorders. It can increase risk of blood clots.",
        "low": "Low platelets may increase bleeding risk and can be caused by autoimmune disorders, medication side effects, or bone marrow problems.",
        "normal": "Platelets are blood cells that help your blood clot. Normal levels indicate good clot-forming ability without excess risk."
      },
      "White Blood Cells": {
        "elevated": "Elevated white blood cells typically indicate your body is fighting an infection, inflammation, or potentially certain types of leukemia.",
        "low": "Low white blood cells may increase infection risk and can be caused by certain medications, autoimmune disorders, or bone marrow issues.",
        "normal": "White blood cells are part of your immune system that fight infection. Normal levels suggest good immune function."
      },
      "Testosterone": {
        "elevated": "Elevated testosterone may be caused by certain endocrine disorders, tumors, or anabolic steroid use. In women, it can cause symptoms like excessive hair growth.",
        "low": "Low testosterone in men may cause reduced libido, erectile dysfunction, fatigue, and muscle loss. In women, low levels may affect mood and energy.",
        "normal": "Testosterone is a hormone that affects sexual development, muscle mass, and bone density. Normal levels indicate proper hormone balance."
      }
    };
    
    return explanations[name]?.[status] || 
      `${name} is an important biomarker for health assessment. The clinical significance varies depending on your overall health picture and other test results.`;
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

