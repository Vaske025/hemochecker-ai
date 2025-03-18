
import { toast } from "sonner";
import { BloodTestMetric } from "@/types/BloodTest";

const QWEN_API_KEY = "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";

export interface BloodTestData {
  metrics: BloodTestMetric[];
  rawContent?: string; // Added to store the raw text extracted from the PDF
}

export interface QwenResponse {
  analysis: string;
  recommendations: string[];
}

export const analyzeBloodTest = async (data: BloodTestData): Promise<QwenResponse> => {
  try {
    console.log("Analyzing blood test with API", data);
    
    // In a production app, this would call a more sophisticated AI model via an edge function
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if metrics are available
    if (!data.metrics || data.metrics.length === 0) {
      return {
        analysis: "No blood test metrics were found to analyze. Please ensure your test results include measurable parameters.",
        recommendations: ["Upload a complete blood test with readable metrics."]
      };
    }
    
    // Advanced AI prompt for blood test analysis using actual extracted data
    const systemPrompt = `
      You are a highly skilled medical analyst specializing in blood test interpretation. 
      When a user uploads a blood test PDF, extract and analyze all the key metrics and values 
      (such as hemoglobin, glucose, cholesterol, etc.) from the document. 
      Base your responses strictly on the information provided in the blood test. 
      Your analysis should be accurate, detailed, and context-aware, including clinical 
      interpretations and recommendations when needed. If the data is incomplete or unclear, 
      indicate that clearly. Your goal is to ensure that every answer is precise and medically reliable.
      Use emojis appropriately to make your response engaging.
    `;
    
    // Dynamically generate analysis based on available metrics
    const elevatedMetrics = data.metrics.filter(m => m.status === "elevated");
    const lowMetrics = data.metrics.filter(m => m.status === "low");
    const normalMetrics = data.metrics.filter(m => m.status === "normal");
    
    // Generate more dynamic analysis that doesn't rely on predefined metrics
    let analysis = "🔬 Based on your comprehensive blood test results: ";
    
    if (elevatedMetrics.length > 0) {
      analysis += `You have elevated levels of ${elevatedMetrics.map(m => m.name).join(", ")}. `;
      
      // Add more specific analysis for each elevated metric
      elevatedMetrics.forEach(metric => {
        analysis += `Your ${metric.name} of ${metric.value} ${metric.unit} is above the reference range. `;
        
        // Analyze based on metric type - handles any type of test including hormones
        if (metric.name.toLowerCase().includes("glucose")) {
          analysis += "Elevated glucose may indicate prediabetes or diabetes. ";
        } else if (metric.name.toLowerCase().includes("cholesterol") || metric.name.toLowerCase().includes("ldl")) {
          analysis += "High cholesterol levels increase risk of cardiovascular disease. ";
        } else if (metric.name.toLowerCase().includes("tsh") || metric.name.toLowerCase().includes("thyroid")) {
          analysis += "Elevated thyroid hormones may indicate hyperthyroidism. ";
        } else if (metric.name.toLowerCase().includes("cortisol")) {
          analysis += "High cortisol may indicate stress, Cushing's syndrome, or adrenal issues. ";
        } else if (metric.name.toLowerCase().includes("estrogen") || metric.name.toLowerCase().includes("estradiol")) {
          analysis += "Elevated estrogen can affect various bodily systems. ";
        } else if (metric.name.toLowerCase().includes("testosterone")) {
          analysis += "High testosterone may have various causes depending on your biological sex. ";
        } else {
          analysis += "This elevation should be evaluated in the context of your symptoms and medical history. ";
        }
      });
    }
    
    if (lowMetrics.length > 0) {
      analysis += `You have low levels of ${lowMetrics.map(m => m.name).join(", ")}. `;
      
      // Add specific analysis for each low metric
      lowMetrics.forEach(metric => {
        analysis += `Your ${metric.name} of ${metric.value} ${metric.unit} is below the reference range. `;
        
        // Analyze based on metric type - handles any type of test including hormones
        if (metric.name.toLowerCase().includes("hemoglobin") || metric.name.toLowerCase().includes("hgb")) {
          analysis += "Low hemoglobin may indicate anemia. ";
        } else if (metric.name.toLowerCase().includes("vitamin") && metric.name.toLowerCase().includes("d")) {
          analysis += "Low vitamin D is common and may affect bone health and immune function. ";
        } else if (metric.name.toLowerCase().includes("tsh")) {
          analysis += "Low TSH may indicate hyperthyroidism or thyroid medication effects. ";
        } else if (metric.name.toLowerCase().includes("testosterone")) {
          analysis += "Low testosterone may affect energy, mood, and other aspects of health. ";
        } else if (metric.name.toLowerCase().includes("estrogen")) {
          analysis += "Low estrogen levels can affect various bodily systems. ";
        } else if (metric.name.toLowerCase().includes("cortisol")) {
          analysis += "Low cortisol may indicate adrenal insufficiency. ";
        } else {
          analysis += "This deficiency should be evaluated by a healthcare provider. ";
        }
      });
    }
    
    if (normalMetrics.length > 0) {
      analysis += `Your ${normalMetrics.length} other tested parameters are within normal range, which is positive. `;
    }
    
    // General conclusion
    if (elevatedMetrics.length === 0 && lowMetrics.length === 0) {
      analysis += "All your values are within normal range, which is excellent! Your overall health indicators suggest you're maintaining good health. 👍 ";
    } else {
      analysis += "Remember that blood test results should be interpreted alongside other clinical findings by a healthcare professional. ";
    }
    
    // Generate dynamic recommendations based on the actual test results
    const recommendations: string[] = [];
    
    // Add personalized recommendations based on actual test results
    if (elevatedMetrics.some(m => m.name.toLowerCase().includes("glucose"))) {
      recommendations.push("🍎 Monitor your carbohydrate intake and consider a balanced diet plan with more complex carbohydrates.");
    }
    
    if (elevatedMetrics.some(m => m.name.toLowerCase().includes("cholesterol") || m.name.toLowerCase().includes("ldl"))) {
      recommendations.push("🥑 Consider reducing saturated fat intake and increasing exercise to help manage cholesterol levels.");
    }
    
    if (lowMetrics.some(m => m.name.toLowerCase().includes("hemoglobin") || m.name.toLowerCase().includes("iron"))) {
      recommendations.push("🥩 Consider iron-rich foods or supplements after consulting with your doctor to address potential anemia.");
    }
    
    if (lowMetrics.some(m => m.name.toLowerCase().includes("vitamin d") || m.name.toLowerCase().includes("calcium"))) {
      recommendations.push("☀️ Increase sunlight exposure (safely) and consider vitamin D supplementation after medical consultation.");
    }
    
    // Add hormone-specific recommendations
    if (data.metrics.some(m => m.name.toLowerCase().includes("tsh") || m.name.toLowerCase().includes("thyroid"))) {
      recommendations.push("⚖️ For thyroid health, consider discussing appropriate dietary adjustments and potential medication with your endocrinologist.");
    }
    
    if (data.metrics.some(m => m.name.toLowerCase().includes("testosterone") || m.name.toLowerCase().includes("estrogen"))) {
      recommendations.push("💤 Hormone levels can be affected by many factors including diet, exercise, sleep quality, and stress levels.");
    }
    
    // Add general recommendations
    recommendations.push("👩‍⚕️ Schedule a follow-up with your healthcare provider to discuss these results in detail.");
    recommendations.push("🥗 Maintain a balanced diet rich in vegetables, fruits, lean proteins, and whole grains.");
    recommendations.push("💧 Stay hydrated and aim for at least 7-8 hours of quality sleep each night.");
    recommendations.push("🏃‍♀️ Regular exercise (150+ minutes per week) can help improve many health markers.");
    
    // Return only 5 most relevant recommendations
    return {
      analysis,
      recommendations: recommendations.slice(0, 5)
    };
  } catch (error) {
    console.error("Error analyzing blood test:", error);
    toast.error("Failed to analyze blood test. Please try again.");
    throw error;
  }
};

// Calculate health score based on the blood test results
export const calculateHealthScore = (metrics: BloodTestMetric[]): number => {
  if (!metrics || metrics.length === 0) return 70; // Default score
  
  // Start with baseline score
  let score = 85;
  
  // Count abnormal metrics
  const elevatedCount = metrics.filter(m => m.status === "elevated").length;
  const lowCount = metrics.filter(m => m.status === "low").length;
  
  // Adjust score based on abnormal metrics
  // More sophisticated algorithm would weight different metrics differently
  score -= (elevatedCount * 3);
  score -= (lowCount * 3);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};
