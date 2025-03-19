
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
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: payload.messages,
        temperature: payload.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
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
    
    // For file analysis, we'll extract text and send it to Claude
    const fileContent = await readFileAsText(file);
    
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
    console.error("Error analyzing file:", error);
    throw new Error("Failed to analyze file");
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
      reject(new Error("Failed to read file"));
    };
    
    if (file.type.includes("text") || file.type.includes("csv") || file.type.includes("json") || file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else {
      // For non-text files like PDFs, we can only simulate this
      // In a real app, you'd need PDF extraction services
      resolve(`[Content of ${file.name} - In a production environment, we would use a PDF extraction service]`);
    }
  });
};
