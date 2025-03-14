
import { toast } from "sonner";

const QWEN_API_KEY = "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";

export interface BloodTestData {
  metrics: {
    name: string;
    value: number;
    unit: string;
    status: "normal" | "elevated" | "low";
  }[];
}

export interface QwenResponse {
  analysis: string;
  recommendations: string[];
}

export const analyzeBloodTest = async (data: BloodTestData): Promise<QwenResponse> => {
  try {
    // In a production app, this would be a server-side call to protect the API key
    // This is just for demonstration purposes
    
    // For now, we'll simulate a response since we don't have the actual Qwen API endpoint
    // In a real implementation, you would make a fetch call to the Qwen API
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Generate a response based on the provided data
    const elevatedMetrics = data.metrics.filter(m => m.status === "elevated");
    const lowMetrics = data.metrics.filter(m => m.status === "low");
    
    let analysis = "Based on your blood test results: ";
    
    if (elevatedMetrics.length > 0) {
      analysis += `You have elevated levels of ${elevatedMetrics.map(m => m.name).join(", ")}. `;
    }
    
    if (lowMetrics.length > 0) {
      analysis += `You have low levels of ${lowMetrics.map(m => m.name).join(", ")}. `;
    }
    
    if (elevatedMetrics.length === 0 && lowMetrics.length === 0) {
      analysis += "All your values are within normal range, which is excellent! ";
    }
    
    const recommendations = [];
    
    if (elevatedMetrics.some(m => m.name.includes("Cholesterol") || m.name.includes("LDL"))) {
      recommendations.push("Consider reducing saturated fat intake and increasing exercise.");
    }
    
    if (elevatedMetrics.some(m => m.name.includes("Glucose"))) {
      recommendations.push("Monitor your carbohydrate intake and consider speaking with a nutritionist.");
    }
    
    if (lowMetrics.some(m => m.name.includes("Hemoglobin"))) {
      recommendations.push("Consider iron supplements after consulting with your doctor.");
    }
    
    // Add a general recommendation
    recommendations.push("Schedule a follow-up with your healthcare provider to discuss these results in detail.");
    
    return {
      analysis,
      recommendations
    };
  } catch (error) {
    console.error("Error analyzing blood test:", error);
    toast.error("Failed to analyze blood test. Please try again.");
    throw error;
  }
};
