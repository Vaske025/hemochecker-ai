
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
    console.log("Analyzing blood test with Qwen API", data);
    
    // In a production app, this would be a server-side call to protect the API key
    // Since we're simulating the API response, we'll make it more responsive
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Reduced delay for better UX
    
    // Generate a more detailed response based on the provided data
    const elevatedMetrics = data.metrics.filter(m => m.status === "elevated");
    const lowMetrics = data.metrics.filter(m => m.status === "low");
    const normalMetrics = data.metrics.filter(m => m.status === "normal");
    
    let analysis = "Based on your comprehensive blood test results: ";
    
    if (elevatedMetrics.length > 0) {
      analysis += `You have elevated levels of ${elevatedMetrics.map(m => m.name).join(", ")}. This may indicate potential areas of concern that should be monitored. `;
    }
    
    if (lowMetrics.length > 0) {
      analysis += `You have low levels of ${lowMetrics.map(m => m.name).join(", ")}. These deficiencies might require attention and possibly supplementation. `;
    }
    
    if (normalMetrics.length > 0) {
      analysis += `Your ${normalMetrics.map(m => m.name).join(", ")} values are within normal range, which is positive. `;
    }
    
    if (elevatedMetrics.length === 0 && lowMetrics.length === 0) {
      analysis += "All your values are within normal range, which is excellent! Your overall health indicators suggest you're maintaining good health. ";
    } else {
      analysis += "Remember that blood test results are just one part of your health picture and should be interpreted alongside other clinical findings by a healthcare professional. ";
    }
    
    const recommendations = [];
    
    // Add more specific recommendations based on actual metrics
    if (elevatedMetrics.some(m => m.name.includes("Cholesterol") || m.name.includes("LDL"))) {
      recommendations.push("Consider reducing saturated fat intake and increasing exercise to help manage cholesterol levels.");
    }
    
    if (elevatedMetrics.some(m => m.name.includes("Glucose") || m.name.includes("HbA1c"))) {
      recommendations.push("Monitor your carbohydrate intake and consider speaking with a nutritionist about a balanced diet plan.");
    }
    
    if (lowMetrics.some(m => m.name.includes("Hemoglobin") || m.name.includes("Iron"))) {
      recommendations.push("Consider iron-rich foods or supplements after consulting with your doctor to address potential anemia.");
    }
    
    if (lowMetrics.some(m => m.name.includes("Vitamin D") || m.name.includes("Calcium"))) {
      recommendations.push("Increase sunlight exposure (safely) and consider vitamin D supplementation after medical consultation.");
    }
    
    // Add general recommendations
    recommendations.push("Schedule a follow-up with your healthcare provider to discuss these results in detail.");
    recommendations.push("Maintain a balanced diet rich in vegetables, fruits, lean proteins, and whole grains.");
    recommendations.push("Stay hydrated and aim for at least 7-8 hours of quality sleep each night.");
    recommendations.push("Regular exercise (150+ minutes per week) can help improve many health markers.");
    
    return {
      analysis,
      recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations for clarity
    };
  } catch (error) {
    console.error("Error analyzing blood test:", error);
    toast.error("Failed to analyze blood test. Please try again.");
    throw error;
  }
};
