
/**
 * AI Service for external AI API integration
 */

export interface AiRequestPayload {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  temperature?: number;
  file?: File;
}

// This key should be moved to a secure environment variable in production
const API_KEY = "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";

/**
 * Sends a request to the AI service
 */
export const sendAiRequest = async (payload: AiRequestPayload): Promise<string> => {
  try {
    console.log("Sending request to AI service:", payload);
    
    // For now, we're simulating the API call
    // In a production environment, you would make an actual fetch call to the API
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // This is a placeholder. In a real implementation, you would:
    // 1. Format the data correctly for your specific AI API
    // 2. Make a fetch call to the API endpoint
    // 3. Parse and return the response
    
    const response = `I've analyzed your request about ${payload.messages[payload.messages.length - 1].content.substring(0, 30)}... 
    
As an AI assistant trained on medical data, I can help interpret this information, but please note that this should not be considered medical advice.

Let me know if you'd like me to focus on any specific aspect of these results.`;
    
    return response;
  } catch (error) {
    console.error("Error in AI service:", error);
    throw new Error("Failed to get response from AI service");
  }
};

/**
 * Sends a file to the AI service for analysis
 */
export const analyzeFileWithAi = async (file: File, instructions?: string): Promise<string> => {
  try {
    console.log("Analyzing file with AI:", file.name, "Instructions:", instructions);
    
    // In a real implementation, you would:
    // 1. Create a FormData object and append the file
    // 2. Add any instructions to the request
    // 3. Make a POST request to the file analysis endpoint
    // 4. Parse and return the response
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return `I've analyzed the file "${file.name}" and found several interesting insights.
    
This appears to be a medical report containing various health metrics. To provide more specific analysis, I'd need to know what aspects you're most interested in.

Would you like me to focus on any particular section or health indicator?`;
  } catch (error) {
    console.error("Error analyzing file:", error);
    throw new Error("Failed to analyze file");
  }
};
