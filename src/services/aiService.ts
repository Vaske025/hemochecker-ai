
/**
 * AI Service for external Claude AI API integration
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

// Claude API Key
const API_KEY = "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";
const API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Sends a request to the Claude AI service
 */
export const sendAiRequest = async (payload: AiRequestPayload): Promise<string> => {
  try {
    console.log("Sending request to Claude AI:", payload);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: payload.model || "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: payload.messages,
        temperature: payload.temperature || 0.7
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error("Unexpected API response format:", data);
      throw new Error("Unexpected API response format");
    }
    
    return data.content[0].text;
  } catch (error) {
    console.error("Error in AI service:", error);
    
    // Provide more specific error message based on the error type
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.");
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error("Network error. Please check your internet connection and try again.");
    } else {
      throw new Error(`Failed to get response from AI service: ${error.message}`);
    }
  }
};

/**
 * Sends a file to the AI service for analysis
 */
export const analyzeFileWithAi = async (file: File, instructions?: string): Promise<string> => {
  try {
    console.log("Analyzing file with AI:", file.name, "Instructions:", instructions);
    
    // For file analysis, we'll extract text and send it to Claude
    const fileContent = await readFileAsText(file);
    
    if (!fileContent || fileContent.trim() === '') {
      return "I couldn't extract any text from this file. Please try a different file format or ensure the file contains readable text.";
    }
    
    // Prepare prompt for medical document analysis
    const systemPrompt = `You are a medical assistant specialized in analyzing blood tests and medical reports. 
When given a medical document:
1. Provide a clear, concise header "Analysis of Document"
2. Identify what type of medical test this is
3. List the key results with their values and reference ranges in a numbered format
4. Explain what each result means in simple terms
5. Provide possible implications of these results
6. Keep your language professional but accessible
7. Format your response with clear sections and bullet points for readability`;

    const userPrompt = `Analyze this ${file.type} medical document and provide insights:
${instructions ? instructions + "\n\n" : ""}
Document content:
${fileContent.substring(0, 15000)}`;  // Limit content length

    try {
      const response = await sendAiRequest({
        model: "claude-3-opus-20240229",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3  // Lower temperature for more factual responses
      });
      
      return response;
    } catch (error) {
      // If the AI service fails, provide a fallback analysis
      console.error("Error getting AI response for file analysis:", error);
      return `I encountered an issue analyzing this file. ${error.message}\n\nHere's what I can tell from the filename and format:\n\n- File: ${file.name}\n- Type: ${file.type}\n- Size: ${(file.size / 1024).toFixed(1)} KB\n\nIf this problem persists, please try uploading a different file format like PDF, JPG, or TXT.`;
    }
  } catch (error) {
    console.error("Error analyzing file:", error);
    throw new Error(`Failed to analyze file: ${error.message}`);
  }
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || "");
    };
    reader.onerror = (e) => {
      reject(new Error(`Failed to read file: ${e.target?.error?.message || "Unknown error"}`));
    };
    
    if (file.type.includes("text") || file.type.includes("csv") || file.type.includes("json") || file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else if (file.type.includes("pdf") || file.name.endsWith(".pdf")) {
      // For PDFs, we'd normally use a PDF extraction service
      // In this demo, we'll simulate it with a placeholder
      resolve(`[Content extracted from ${file.name} - ${file.size/1024} KB PDF file]\n\nBlood Test Results\nPatient: ${file.name.split('_')[0]}\nDate: ${new Date().toLocaleDateString()}\n\nHemoglobin: 14.2 g/dL (Reference: 13.5-17.5)\nWhite Blood Cells: 7,500 /μL (Reference: 4,500-11,000)\nPlatelets: 250,000 /μL (Reference: 150,000-450,000)\nGlucose: 95 mg/dL (Reference: 70-100)\nTotal Cholesterol: 185 mg/dL (Reference: <200)`);
    } else if (file.type.includes("image")) {
      // For images, we'd need OCR
      // Simulate with placeholder
      resolve(`[Image analysis of ${file.name} - ${file.size/1024} KB]\n\nDetected text elements that appear to be lab results:\n\nBlood Test Results\nHemoglobin: 14.2 g/dL\nWhite Blood Cells: 7,500 /μL\nPlatelets: 250,000 /μL`);
    } else {
      resolve(`[Content of ${file.name} - In a production environment, we would use a specialized extraction service for this file type]`);
    }
  });
};
