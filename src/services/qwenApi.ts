import { toast } from "sonner";
import { BloodTestMetric } from "@/types/BloodTest";

const QWEN_API_KEY = "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";

export interface BloodTestData {
  metrics: BloodTestMetric[];
  rawContent?: string; // Raw text extracted from the PDF
}

export interface QwenResponse {
  analysis: string;
  recommendations: string[];
}

export const analyzeBloodTest = async (data: BloodTestData): Promise<QwenResponse> => {
  try {
    console.log("Analyzing blood test with API", data);
    
    // Check if metrics are available
    if (!data.metrics || data.metrics.length === 0) {
      // If no metrics but we have raw content, try to extract hormone-specific data
      if (data.rawContent) {
        return analyzeRawContent(data.rawContent);
      }
      
      return {
        analysis: "No blood test metrics were found to analyze. Please ensure your test results include measurable parameters.",
        recommendations: ["Upload a complete blood test with readable metrics."]
      };
    }
    
    // Check for hormone tests in the metrics
    const testosteroneMetrics = data.metrics.filter(m => 
      m.name.toLowerCase().includes("testosterone") || 
      m.name.toLowerCase().includes("testo"));
    
    const estrogenMetrics = data.metrics.filter(m => 
      m.name.toLowerCase().includes("estrogen") || 
      m.name.toLowerCase().includes("estradiol"));
    
    const thyroidMetrics = data.metrics.filter(m => 
      m.name.toLowerCase().includes("tsh") || 
      m.name.toLowerCase().includes("thyroid") ||
      m.name.toLowerCase().includes("t3") ||
      m.name.toLowerCase().includes("t4"));
      
    const hormoneMetrics = [...testosteroneMetrics, ...estrogenMetrics, ...thyroidMetrics];
    
    // If we have hormone metrics, prioritize analyzing those
    if (hormoneMetrics.length > 0) {
      return analyzeHormoneMetrics(hormoneMetrics, data.rawContent || "");
    }
    
    // Fall back to raw content analysis if available
    if (data.rawContent && data.rawContent.toLowerCase().includes("testosterone")) {
      return analyzeRawContent(data.rawContent);
    }
    
    // Otherwise analyze using standard metrics
    return analyzeStandardMetrics(data.metrics);
  } catch (error) {
    console.error("Error analyzing blood test:", error);
    toast.error("Failed to analyze blood test. Please try again.");
    throw error;
  }
};

// Function to analyze testosterone and other hormone metrics
const analyzeHormoneMetrics = (hormones: BloodTestMetric[], rawContent: string): QwenResponse => {
  let analysis = "🧪 Based on your hormone test results: ";
  const recommendations: string[] = [];
  
  // Analyze testosterone
  const testosteroneMetrics = hormones.filter(m => 
    m.name.toLowerCase().includes("testosterone") || 
    m.name.toLowerCase().includes("testo"));
  
  if (testosteroneMetrics.length > 0) {
    testosteroneMetrics.forEach(metric => {
      analysis += `Your ${metric.name} level is ${metric.value} ${metric.unit} which is ${metric.status}. `;
      
      if (metric.status === "elevated") {
        analysis += "Elevated testosterone can be normal in certain contexts but may also be associated with conditions like PCOS in women or certain adrenal/testicular conditions in men. ";
        recommendations.push("🩸 Consider follow-up testing to confirm testosterone levels and investigate potential causes of elevation.");
      } else if (metric.status === "low") {
        analysis += "Low testosterone may be associated with symptoms like reduced energy, mood changes, decreased muscle mass, or changes in sexual function. ";
        recommendations.push("🥩 Foods rich in zinc (oysters, meat, legumes) and vitamin D may support hormone production.");
        recommendations.push("💪 Resistance training and adequate sleep can naturally support hormone balance.");
      } else {
        analysis += "This is within the normal reference range, which is good. ";
      }
    });
  } else if (rawContent.toLowerCase().includes("testosterone")) {
    // Extract testosterone values from raw content
    const testPattern = /testosterone[:\s]+([0-9.]+)\s*([a-z/]+)?/i;
    const match = rawContent.match(testPattern);
    
    if (match) {
      const value = match[1];
      const unit = match[2] || 'ng/dL';
      analysis += `Your testosterone level appears to be ${value} ${unit}. Without reference ranges, I cannot determine if this is high, low, or normal. `;
      recommendations.push("📊 Compare your testosterone value against the reference ranges provided on your lab report.");
    } else {
      analysis += "I see your test includes testosterone measurements, but I couldn't determine the exact values. ";
    }
    
    recommendations.push("👨‍⚕️ Discuss your testosterone results with your healthcare provider for proper interpretation.");
  }
  
  // Analyze other hormones if present
  const otherHormones = hormones.filter(m => !m.name.toLowerCase().includes("testosterone"));
  if (otherHormones.length > 0) {
    analysis += "Your test also includes other hormone measurements: ";
    otherHormones.forEach(hormone => {
      analysis += `${hormone.name} (${hormone.value} ${hormone.unit}, ${hormone.status}), `;
    });
    analysis = analysis.slice(0, -2) + ". ";
    
    // Add related recommendations
    if (otherHormones.some(h => h.status !== "normal")) {
      recommendations.push("🧠 Hormone levels can be affected by many factors including stress, diet, sleep, and medications.");
    }
  }
  
  analysis += "Hormone levels should always be interpreted in clinical context with your age, sex, symptoms, and medical history. ";
  
  // Add standard recommendations if we don't have enough specific ones
  if (recommendations.length < 3) {
    recommendations.push("🛌 Prioritize quality sleep (7-9 hours) which is essential for hormone regulation.");
    recommendations.push("🧘‍♀️ Stress management techniques like meditation can help balance hormone levels.");
    recommendations.push("👩‍⚕️ Follow up with an endocrinologist or specialist for comprehensive hormone evaluation.");
  }
  
  return {
    analysis,
    recommendations: recommendations.slice(0, 5) // Return only 5 most relevant recommendations
  };
};

// Function to analyze raw content for hormone tests
const analyzeRawContent = (content: string): QwenResponse => {
  const lowerContent = content.toLowerCase();
  let analysis = "";
  const recommendations: string[] = [];
  
  // Check if content mentions testosterone
  if (lowerContent.includes("testosterone")) {
    analysis = "🔬 Your uploaded document appears to be a testosterone test. ";
    
    // Try to extract the testosterone value using regex
    const testPattern = /testosterone[:\s]+([0-9.]+)\s*([a-z/]+)?/i;
    const match = content.match(testPattern);
    
    if (match) {
      const value = match[1];
      const unit = match[2] || 'ng/dL';
      analysis += `I detected a testosterone value of ${value} ${unit}. `;
      
      // Add basic interpretive information
      analysis += "Testosterone is an important hormone that affects muscle mass, fat distribution, bone density, red blood cell production, and sexual function. ";
      analysis += "Normal ranges vary significantly by age, sex, and the laboratory performing the test. ";
      
      recommendations.push("📊 Compare your result with the reference ranges provided on your lab report.");
      recommendations.push("👨‍⚕️ Consult with a healthcare provider to properly interpret your testosterone levels.");
      recommendations.push("🔄 Consider testing at the same time of day for future comparisons, as levels fluctuate throughout the day.");
      
      // Add lifestyle recommendations
      recommendations.push("💪 Regular resistance training can help support healthy testosterone levels.");
      recommendations.push("🥦 A balanced diet with adequate zinc, vitamin D, and healthy fats supports hormone production.");
      recommendations.push("🛌 Prioritize quality sleep as poor sleep can negatively impact hormone levels.");
    } else {
      analysis += "However, I couldn't extract specific values from the document. ";
      analysis += "Testosterone results should be interpreted by a healthcare professional in the context of your age, sex, symptoms, and medical history.";
      
      recommendations.push("📋 If you received numerical values with your test, please ensure they're included in your upload.");
      recommendations.push("👨‍⚕️ Schedule a follow-up with your healthcare provider to discuss your results.");
    }
  } else {
    // Fall back to general analysis if no hormone-specific content is found
    return analyzeGeneralContent(content);
  }
  
  return {
    analysis,
    recommendations: recommendations.slice(0, 5)
  };
};

// Function to analyze generic content
const analyzeGeneralContent = (content: string): QwenResponse => {
  let analysis = "📄 I've reviewed your uploaded document, but couldn't identify specific blood test metrics with confidence. ";
  analysis += "The document may contain free-form text or a format that's difficult to parse automatically. ";
  analysis += "For the most accurate analysis, I recommend uploading structured blood test results or consulting with a healthcare professional.";
  
  const recommendations = [
    "👨‍⚕️ Consult with a healthcare provider to review and interpret your test results.",
    "📋 Consider uploading a different format of your test results if available.",
    "📝 If you have specific questions about values in your test, you can ask directly.",
    "🔍 For future uploads, PDF formats directly from lab providers typically work best.",
    "📊 Ensure your document contains numerical values and reference ranges for best analysis."
  ];
  
  return { analysis, recommendations };
};

// Analyze standard blood test metrics
const analyzeStandardMetrics = (metrics: BloodTestMetric[]): QwenResponse => {
  // This is the original analysis function for standard blood test metrics
  
  // Dynamically generate analysis based on available metrics
  const elevatedMetrics = metrics.filter(m => m.status === "elevated");
  const lowMetrics = metrics.filter(m => m.status === "low");
  const normalMetrics = metrics.filter(m => m.status === "normal");
  
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
  if (metrics.some(m => m.name.toLowerCase().includes("tsh") || m.name.toLowerCase().includes("thyroid"))) {
    recommendations.push("⚖️ For thyroid health, consider discussing appropriate dietary adjustments and potential medication with your endocrinologist.");
  }
  
  if (metrics.some(m => m.name.toLowerCase().includes("testosterone") || m.name.toLowerCase().includes("estrogen"))) {
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
