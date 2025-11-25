import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketAnalysis, Slide } from "../types";

const getAI = (): GoogleGenAI => {
  // Use process.env.API_KEY directly as per guidelines.
  // The key's availability is handled externally.
  let apiKey;
  try {
    apiKey = process.env.API_KEY;
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

/**
 * Retry utility for transient API errors
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const msg = error.message || '';
    const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted");
    const isAuth = msg.includes("API key") || msg.includes("403") || error.status === 403;

    // If it's an auth error, don't retry.
    if (isAuth) {
      throw error;
    }

    // If it's a quota error, we might want to retry once with a longer delay, 
    // but generally this means we should stop. However, for 429 (rate limit), 
    // backoff often helps.
    if (isQuota && retries > 1) {
       console.warn(`Quota/Rate limit hit. Waiting longer... (${retries} attempts left).`);
       // Wait significantly longer for quota errors (e.g. 2s, 4s...)
       await new Promise(resolve => setTimeout(resolve, delay * 2));
       return retryOperation(operation, retries - 1, delay * 3);
    }

    if (retries <= 0) throw error;
    
    // Log retry attempt for standard errors
    console.warn(`Operation failed, retrying... (${retries} attempts left). Error: ${msg}`);
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

/**
 * Analyzes a raw startup idea to extract structured market insights.
 */
export const analyzeStartupIdea = async (idea: string): Promise<MarketAnalysis> => {
  // Switching to Flash model for higher quota limits and faster response times
  // while maintaining excellent JSON structuring capabilities.
  const modelId = "gemini-2.5-flash";
  const ai = getAI();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tagline: { type: Type.STRING, description: "A punchy 5-10 word slogan." },
      problemSummary: { type: Type.STRING, description: "Clear definition of the pain point." },
      solutionSummary: { type: Type.STRING, description: "How the product solves the problem." },
      targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
      competitors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            weakness: { type: Type.STRING, description: "Why this competitor is vulnerable." }
          }
        }
      },
      marketSize: {
        type: Type.OBJECT,
        properties: {
          tam: { type: Type.NUMBER, description: "Total Addressable Market value" },
          sam: { type: Type.NUMBER, description: "Serviceable Available Market value" },
          som: { type: Type.NUMBER, description: "Serviceable Obtainable Market value" },
          currency: { type: Type.STRING, description: "Currency symbol, e.g., $" },
          unit: { type: Type.STRING, description: "Scale unit, e.g., 'Billion', 'Million'" }
        },
        required: ["tam", "sam", "som", "currency", "unit"]
      },
      swot: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Internal positive factors" },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Internal negative factors" },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External positive factors" },
          threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External negative factors" }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"]
      },
      valueProposition: { type: Type.STRING, description: "The unique selling point." },
      revenueModel: { type: Type.STRING, description: "How the business makes money." },
      goToAction: { type: Type.STRING, description: "Immediate next strategic step." }
    },
    required: ["tagline", "problemSummary", "solutionSummary", "targetAudience", "competitors", "marketSize", "swot", "valueProposition"]
  };

  const prompt = `
    Analyze the following startup idea acting as a top-tier venture capitalist and strategist.
    Provide a structured market analysis including a SWOT analysis. Be realistic, critical, yet constructive.
    Estimate market sizes (TAM/SAM/SOM) based on the industry sector.
    
    Startup Idea: "${idea}"
  `;

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as MarketAnalysis;
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error; // Re-throw for retry
    }
  });
};

/**
 * Generates a pitch deck structure based on the market analysis.
 */
export const generatePitchDeck = async (analysis: MarketAnalysis): Promise<Slide[]> => {
  // Using Flash model for speed and efficiency
  const modelId = "gemini-2.5-flash";
  const ai = getAI();

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['title', 'problem', 'solution', 'market', 'business_model', 'team', 'generic'] },
        content: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 bullet points for the slide" },
        visualPrompt: { type: Type.STRING, description: "Description of a visual to accompany the slide" },
        speakerNotes: { type: Type.STRING, description: "Script for the presenter" }
      },
      required: ["id", "title", "type", "content", "speakerNotes"]
    }
  };

  const prompt = `
    Create a professional 8-10 slide pitch deck based on this market analysis.
    The tone should be persuasive, clear, and investor-ready.
    Keep content concise, impactful, and avoid 'walls of text'.
    
    Market Analysis Context:
    ${JSON.stringify(analysis)}
  `;

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsedSlides = JSON.parse(text) as Omit<Slide, 'layout'>[];
      
      // Add default layout to each slide
      return parsedSlides.map(slide => ({
        ...slide,
        layout: 'default'
      })) as Slide[];
    } catch (error) {
      console.error("Gemini Pitch Gen Error:", error);
      throw error;
    }
  });
};

/**
 * Generates an image for a slide based on a visual description.
 */
export const generateSlideImage = async (visualPrompt: string): Promise<string> => {
  // Using Pro Image model for high-resolution, production-quality assets
  // Note: This model is more expensive/rate-limited than text models.
  const modelId = "gemini-3-pro-image-preview";
  const ai = getAI();

  const enhancedPrompt = `
    Create a professional, high-quality, modern flat-vector illustration suitable for a startup pitch deck.
    The image should visualize: "${visualPrompt}".
    Style: Corporate Memphis, minimalist, clean lines, flat design, vibrant but professional colors, white background, high definition, vector graphics, abstract geometric shapes.
    Do not include text or words in the image.
  `.trim();

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [{ text: enhancedPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K" // Ensuring high resolution
          }
        }
      });

      if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
        // Log if we got content but no image (e.g. model refusal or text response)
        const textPart = response.candidates[0].content.parts.find(p => p.text);
        if (textPart) {
          console.warn("Gemini returned text instead of image:", textPart.text);
        }
      }
      
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      throw error;
    }
  });
};